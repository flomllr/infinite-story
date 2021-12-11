import React from 'react';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { colors, fonts } from '../../../theme';
import { observer } from 'mobx-react';
import moment from 'moment';
import { MarketplaceTransaction, SellerMarketplaceItem } from '../../../types';
import { PlayerClass } from '../../PlayerClass';
import { DefaultText, HeadlineGold, Space } from '../../shared';
import PixelButton from '../../PixelButton';
import { Nickname } from '../../Nickname';
import { PriceSelector } from './AddItem';
import ControlService from '../../../services/ControlService';
import { GoldAmount } from '../../GoldAmount';
import { ReactNode } from 'react';
import { useMainStore } from '../../../hooks/useMainStore';
import { useNavigation } from '../../../hooks/useNavigation';

const Container = styled.View`
  flex-direction: column;
  flex: 1;
`;

const ExplainationText = styled(DefaultText)`
  font-size: 18px;
  padding: 10px;
`;

const PrimaryText = styled(DefaultText)`
  font-size: 18px;
  padding: 10px;
  color: ${colors.primary};
`;

const DashboardContainer = styled.View`
  margin-bottom: 25px;
`;

const StatsAndTransactionContainer = styled.View`
  flex-direction: row;
  padding-top: 10px;
`;

const StatsContainer = styled.View`
  flex: 3;
`;

const StatRow = styled.View`
  flex-direction: row
  justify-content: space-between;
  align-items: center;
`;

const StatHeading = styled(DefaultText)`
  font-size: 11px;
  color: ${colors.lightgray};
`;

const StatValue = styled(DefaultText)`
  font-family: ${fonts.bold};
`;

const TransactionsContainer = styled.View`
  flex: 4;
  margin-left: 10px;
`;

const NoTransactionContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TransactionText = styled(DefaultText)`
  font-size: 11px;
`;

const ControlContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const GreyButton = styled.Text`
  font-family: ${fonts.bold};
  font-size: 20px;
  color: ${colors.greyed};
`;

const Tags = styled(DefaultText)`
  padding-top: 10px;
`;

const ModalView = styled.View`
  padding: 20px;
`;

const ModalText = styled(DefaultText)`
  text-align: center;
`;

export const renderTags = (tags: string[]): string => {
  if (tags.length === 0) {
    return '';
  }
  return tags
    .map(t => t && t[0].toUpperCase() + t.slice(1).toLowerCase())
    .join(', ');
};

const Stat = ({ heading, value }: { heading: string; value: ReactNode }) => (
  <StatRow>
    <StatHeading>{heading}</StatHeading>
    {typeof value === 'string' ? <StatValue>{value}</StatValue> : value}
  </StatRow>
);

const Transaction = ({
  t: {
    amount,
    buyer: { nickname, status },
    date
  },
  name
}: {
  t: MarketplaceTransaction;
  name: string;
}) => (
  <TransactionText>
    {moment(date).fromNow()}:{' '}
    <Nickname status={status} nickname={nickname} fontSize={11} /> bought {name}{' '}
    for {amount}g
  </TransactionText>
);

export const MyShop = observer(() => {
  const mainStore = useMainStore();
  const { navigation } = useNavigation();
  const renderMyMarketplaceItems = ({
    item: i
  }: {
    item: SellerMarketplaceItem;
  }) => {
    const {
      price,
      id,
      item: {
        item: { name, description, portrait }
      },
      usedLastWeek,
      usedAllTime,
      boughtAllTime,
      revenueAllTime,
      transactions,
      softDelete,
      tags
    } = i;

    const handleDelete = () => {
      ControlService.openModal(
        <ModalView>
          <ModalText>
            Do you really want to unpublish? You will lose analytics and
            purchase history for this class.
          </ModalText>
          <Space h={20} />
          <PixelButton
            primary
            label={'Unpublish'}
            onPress={() => {
              ControlService.deactivateMarketplaceItem(id);
              ControlService.closeModal();
            }}
          />
          <Space h={10} />
          <PixelButton label={'Cancel'} onPress={ControlService.closeModal} />
        </ModalView>
      );
    };

    return (
      <DashboardContainer>
        <PlayerClass
          nopad={true}
          clickable={false}
          portrait={portrait}
          name={name}
          description={description}
          author={{
            nickname: mainStore.nickname,
            status: mainStore.playerStatus
          }}
        />
        <Tags>Tags: {renderTags(tags)}</Tags>
        <ControlContainer>
          <TouchableOpacity onPress={handleDelete}>
            <GreyButton>{softDelete ? 'publish' : 'unpublish'}</GreyButton>
          </TouchableOpacity>
          <PriceSelector
            price={price}
            onChange={p => ControlService.updateMarketplaceItem(id, p)}
          />
        </ControlContainer>
        <StatsAndTransactionContainer>
          <StatsContainer>
            <Stat heading={'Played this week'} value={String(usedLastWeek)} />
            <Stat heading={'Played all time'} value={String(usedAllTime)} />
            <Stat heading={'Bought all time'} value={String(boughtAllTime)} />
            <Stat
              heading={'Total revenue'}
              value={<GoldAmount size={13} amount={revenueAllTime} />}
            />
          </StatsContainer>
          <TransactionsContainer>
            {transactions.length === 0 ? (
              <NoTransactionContainer>
                <DefaultText>No transactions</DefaultText>
              </NoTransactionContainer>
            ) : (
              transactions.map(t => (
                <Transaction t={t} key={t.date} name={name} />
              ))
            )}
          </TransactionsContainer>
        </StatsAndTransactionContainer>
      </DashboardContainer>
    );
  };
  return (
    <Container>
      {mainStore.myMarketplaceItems.filter(item => !item.softDelete).length ===
      0 ? (
        <>
          <ScrollView>
            <Space h={'10px'} />
            <HeadlineGold>Become a Merchant!</HeadlineGold>
            <Space h={'15px'} />
            <ExplainationText>
              Open your shop and sell your classes designed in Creative Mode to
              other <PrimaryText>Infinite Adventurers!</PrimaryText>
            </ExplainationText>
            <ExplainationText>
              You set your own price in gold, keep 100% of the revenue, and
              share your writing talents with the rest of the community.
            </ExplainationText>
            <ExplainationText>
              Add your first item to open your shop.
            </ExplainationText>
            <Space h={'10px'} />
            <Space h={'10px'} />
            <PixelButton
              onPress={() => {
                navigation.navigate('AddItemModal');
              }}
              primary
              label={'Add First Item'}
            />
          </ScrollView>
        </>
      ) : (
        <>
          <FlatList
            style={{ flex: 1 }}
            data={mainStore.myMarketplaceItems
              .filter(i => !i.softDelete)
              .slice()
              .sort((a, b) => {
                if (a.softDelete && b.softDelete) {
                  return new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1;
                } else if (!a.softDelete && !b.softDelete) {
                  return new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1;
                } else {
                  return a.softDelete ? -1 : 1;
                }
              })
              .reverse()}
            renderItem={renderMyMarketplaceItems}
          />
          <PixelButton
            onPress={() => {
              navigation.navigate('AddItemModal');
            }}
            label={'Add New Item To Shop'}
          />
        </>
      )}
    </Container>
  );
});
