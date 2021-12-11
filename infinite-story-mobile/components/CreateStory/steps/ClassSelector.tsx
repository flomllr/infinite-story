import React, { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import { MarginWrapper, DefaultText, PageTitle, Space } from '../../shared';
import styled from 'styled-components/native';
import {
  PlayerClass as PlayerClassInterface,
  MarketplaceItem,
  PlayerStatus,
  BuyerMarketplaceItem,
  isMarketplaceClassItem,
  PurchaseId,
  isPrompt,
  Prompt,
  isAdvancedPrompt
} from '../../../types';
import { colors, size } from '../../../theme';
import { OGClasses, PlayerClass } from '../../PlayerClass';
import MainStore from '../../../mobx/mainStore';
import { inject, observer } from 'mobx-react';
import AnalyticsService from '../../../services/AnalyticsService';
import { isOGClass } from '../../PlayerClass/constants';
import { portraits } from '../../../assets/portraits';
import { useNavigation } from '../../../hooks/useNavigation';
import { TouchableOpacity } from 'react-native-gesture-handler';

const PlayerClassContainer = styled.SafeAreaView`
  flex: 1;
  width: 100%;
`;

const Header = styled.View`
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
`;

const HeaderText = styled(PageTitle)`
  text-align: center;
  font-size: 20px;
`;

const ClassList = styled.FlatList`
  flex: 1;
  width: 100%;
`;

const ListSeparator = styled(DefaultText)`
  text-align: center;
  margin: 20px 0 10px 0;
  color: ${colors.actDo};
`;

const InfoText = styled(DefaultText)`
  color: ${colors.lightgray};
  text-align: center;
`;

interface Props {
  partyMode?: boolean;
  mainStore?: MainStore;
  marketClass: MarketplaceItem | null;
  playerClass: string;
  creativeClass: Prompt | null;
  setPlayerClass: (playerClass: string) => void;
  setMarketClass: (marketplaceItem: MarketplaceItem) => void;
  setCreativeClass: (prompt: Prompt) => void;
  openDiscordModal: () => void;
  openPurchaseModal: (
    purchaseId: PurchaseId,
    portrait?: ImageSourcePropType
  ) => void;
}

const spaceBetween = size.defaultSpaceBetween + 'px';

export const ClassSelector = inject('mainStore')(
  observer(
    ({
      partyMode,
      mainStore,
      playerClass,
      marketClass,
      creativeClass,
      openDiscordModal,
      openPurchaseModal,
      setPlayerClass,
      setMarketClass,
      setCreativeClass
    }: Props) => {
      const { navigation, swiper } = useNavigation();

      const handleNavigate = (path: 'creative' | 'market') => {
        if (path == 'market') {
          navigation.goBack();
          swiper.scrollTo(2);
        }

        if (path == 'creative') {
          navigation.navigate('CreativeModeModal');
        }
      };

      const marketItems =
        mainStore.boughtClassItems && mainStore.boughtClassItems.length > 0
          ? mainStore.boughtClassItems
          : [
              <TouchableOpacity
                key={Math.random()}
                onPress={() => handleNavigate('market')}
              >
                <InfoText>
                  It looks like you don&lsquo;t have any Market classes yet.
                  Press here to check it out.
                </InfoText>
              </TouchableOpacity>
            ];

      const creativeItems =
        mainStore.prompts && mainStore.prompts.length > 0
          ? mainStore.prompts
          : [
              <TouchableOpacity
                key={Math.random()}
                onPress={() => handleNavigate('creative')}
              >
                <InfoText>
                  It looks like you haven&lsquo;t have created your own classes
                  yet. Press here to open the Creative Studio.
                </InfoText>
              </TouchableOpacity>
            ];

      const listItems: (
        | PlayerClassInterface
        | MarketplaceItem
        | ReactNode
      )[] = [
        <ListSeparator key={Math.random()}>Market classes</ListSeparator>,
        <TouchableOpacity
          key={Math.random()}
          onPress={() => handleNavigate('creative')}
        ></TouchableOpacity>,
        ...marketItems,
        <ListSeparator key={Math.random()}>
          Creative Studio classes
        </ListSeparator>,
        ...creativeItems,
        <ListSeparator key={Math.random()}>Original classes</ListSeparator>,
        ...OGClasses
      ];

      // Filter out all the complicated stuff and all the paid classes
      const firstAdventureListItems = [
        ...OGClasses.filter(
          c => !c.requiresEntitlement && !c.requiresAchievement
        )
      ];

      const renderOGClassItem = (item: PlayerClassInterface) => {
        if (!item.available) {
          return;
        }

        const selected = item.value === playerClass;

        const isLocked =
          mainStore.playerStatus !== PlayerStatus.INFINITE &&
          mainStore.playerStatus !== PlayerStatus.VIP &&
          ((item.requiresEntitlement &&
            !mainStore.entitlements.includes(item.requiresEntitlement)) ||
            (item.requiresAchievement &&
              !mainStore.achievements.includes(item.requiresAchievement)));

        const onPress = () => {
          if (!isLocked) {
            setPlayerClass(item.value);
          } else {
            if (item.value == 'orc') {
              openDiscordModal();
              AnalyticsService.clickOrc();
            }
            if (item.value == 'shadow') {
              openPurchaseModal('unlock_shadow_class', portraits[item.value]);
              AnalyticsService.clickShadow();
            }
          }
        };

        return (
          <>
            <PlayerClass
              onPress={onPress}
              selected={selected}
              name={isLocked ? '???' : item.name}
              portrait={item.value}
              description={item.description}
            />
            <Space h={spaceBetween} />
          </>
        );
      };

      const renderMarketplaceItem = (item: MarketplaceItem) => {
        const {
          item: { item: classItem },
          id
        } = item;

        const onPress = () => {
          setMarketClass(item);
        };

        return (
          <>
            <PlayerClass
              portrait={classItem.portrait}
              name={classItem.name}
              description={classItem.description}
              selected={id === marketClass?.id}
              onPress={onPress}
            />
            <Space h={spaceBetween} />
          </>
        );
      };

      const renderCreativeClass = (item: Prompt) => (
        <>
          <PlayerClass
            portrait={
              isAdvancedPrompt(item) ? item.advanced.portrait : 'creative'
            }
            name={item.title}
            description={
              isAdvancedPrompt(item)
                ? item.advanced.description
                : 'Not created with advanced mode'
            }
            selected={item.uid === creativeClass?.uid}
            onPress={() => setCreativeClass(item)}
          />
          <Space h={spaceBetween} />
        </>
      );

      const renderItem = ({
        item
      }: {
        item: PlayerClassInterface | BuyerMarketplaceItem | ReactNode;
      }) => {
        if (React.isValidElement(item)) {
          return item;
        }

        if (isOGClass(item)) {
          return renderOGClassItem(item);
        }

        if (isMarketplaceClassItem(item)) {
          return renderMarketplaceItem(item);
        }

        if (isPrompt(item)) {
          return renderCreativeClass(item);
        }
      };

      return (
        <PlayerClassContainer>
          <MarginWrapper flexon>
            <Header>
              <HeaderText>
                {partyMode
                  ? 'Choose the class of the protagonist:'
                  : 'Choose your class:'}
              </HeaderText>
            </Header>
            <ClassList
              data={
                mainStore.tutorialDone ? listItems : firstAdventureListItems
              }
              renderItem={renderItem}
              keyExtractor={() => '' + Math.random()}
              extraData={{ playerClass }}
            />
          </MarginWrapper>
        </PlayerClassContainer>
      );
    }
  )
);
