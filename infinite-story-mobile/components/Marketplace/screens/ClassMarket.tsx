import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import { observer, inject } from 'mobx-react';
import MainStore from '../../../mobx/mainStore';
import { BuyerMarketplaceItem } from '../../../types';
import { PlayerClass } from '../../PlayerClass';
import { colors, size } from '../../../theme';
import { SmallerSubHeadlineFloatLeft, Space } from '../../shared';
import ControlService from '../../../services/ControlService';
import { DefaultText } from '../../styled';
import { renderTags } from './MyShop';
import { TagsList } from '../../TagsList';
import AnalyticsService from '../../../services/AnalyticsService';
import { useNavigation } from '../../../hooks/useNavigation';

const Container = styled.View`
  flex: 1;
`;

const LoadingText = styled(DefaultText)`
  width: 100%;
  text-align: center;
  padding-top: 20px;
`;

interface Props {
  mainStore?: MainStore;
}

export const ClassMarket = inject('mainStore')(
  observer(({ mainStore }: Props) => {
    const { navigation } = useNavigation();
    const [selectedTag, setSelectedTag] = useState(null);
    const renderMarketplaceItem = ({
      item
    }: {
      item: BuyerMarketplaceItem;
    }) => {
      const onSelectClass = async () => {
        mainStore.setPreviewClass(item);
        navigation.navigate('BuyClassModal');
        const reloadedItem = await ControlService.reloadMarketplaceItem(
          item.id
        );
        mainStore.setPreviewClass(reloadedItem);
      };

      const {
        item: { item: classItem },
        price,
        usedAllTime,
        boughtAllTime,
        author,
        id
      } = item;

      console.log('id', id, 'own', mainStore.boughtClasses);
      return (
        <>
          <PlayerClass
            portrait={classItem.portrait}
            name={classItem.name}
            description={classItem.description}
            price={price}
            playedTimes={usedAllTime}
            boughtTimes={boughtAllTime}
            author={author}
            onPress={onSelectClass}
            owned={mainStore.boughtClasses.includes(id)}
            yours={author.deviceId === mainStore.userId}
          />
          <Space h={`${size.defaultSpaceBetween}px`} />
        </>
      );
    };

    return (
      <Container>
        <TagsList
          selectedTags={[selectedTag]}
          onPressTag={(t: string) => {
            if (selectedTag === t) {
              setSelectedTag(null);
              ControlService.loadMarketplaceItems();
            } else {
              setSelectedTag(t);
              ControlService.loadMarketplaceItems(t);
            }
            AnalyticsService.selectedTagFilter(t);
          }}
        />
        <SmallerSubHeadlineFloatLeft>
          {selectedTag === null
            ? 'Listing all classes in the market'
            : `Listing classes with tag '${renderTags([
                selectedTag
              ])}'. Press tag again to remove the filter.`}
        </SmallerSubHeadlineFloatLeft>
        <Space h={'12px'} />
        {mainStore.marketplaceItemsLoading ? (
          <LoadingText>Loading...</LoadingText>
        ) : mainStore.marketplaceItems.length === 0 ? (
          <LoadingText>{`There are currently no classes with tag '${renderTags([
            selectedTag
          ])}'`}</LoadingText>
        ) : (
          <FlatList
            data={mainStore.marketplaceItems}
            renderItem={renderMarketplaceItem}
            refreshControl={
              <RefreshControl
                refreshing={mainStore.marketplaceItemsLoading}
                tintColor={'white'}
                titleColor={'white'}
                colors={['white']}
                onRefresh={() => {
                  if (selectedTag) {
                    ControlService.loadMarketplaceItems(selectedTag);
                  } else {
                    ControlService.loadMarketplaceItems();
                  }
                }}
              />
            }
          />
        )}
      </Container>
    );
  })
);
