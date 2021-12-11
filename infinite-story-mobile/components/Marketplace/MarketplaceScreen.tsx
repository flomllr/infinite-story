import React from 'react';
import { TouchableOpacity } from 'react-native';
import {
  HeaderButtonContainer,
  HeaderSymbolText,
  HeaderButtonText,
  PageTitle,
  MarginWrapper,
  DefaultText
} from '../shared';
import styled from 'styled-components/native';
import Header from '../Header';
import { Tabs } from '../Tabs';
import { ClassMarket } from './screens/ClassMarket';
import { MyShop } from './screens/MyShop';
import { colors } from '../../theme';
import MainStore from '../../mobx/mainStore';
import { inject, observer } from 'mobx-react';
import { AnimatedGoldAmount } from '../GoldAmount';
import ControlService from '../../services/ControlService';
import { GoldPurchaseModal } from '../../modals/GoldPurchaseModal';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${colors.background};
`;

const TitleWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const GoldText = styled(DefaultText)`
  color: ${colors.gold};
  font-size: 14px;
  text-align: right;
`;

const BalanceText = styled(DefaultText)`
  font-size: 11px;
  text-align: right;
  margin-top: -7px;
`;

const BuyGoldButton = styled.TouchableOpacity`
  align-items: flex-end;
`;

interface Props {
  close?: () => void;
  mainStore?: MainStore;
}

export const MarketplaceScreen = inject('mainStore')(
  observer(({ mainStore, close }: Props) => {
    const handleBuyGold = () => {
      ControlService.openModal(
        <GoldPurchaseModal
          onPurchased={amount => {
            ControlService.getGold(amount);
          }}
        />
      );
    };

    return (
      <Container>
        <Header
          leftButton={[
            <TouchableOpacity key={'button'} onPress={close}>
              <HeaderButtonContainer>
                <HeaderSymbolText>&lt;</HeaderSymbolText>
                <HeaderButtonText>Start</HeaderButtonText>
              </HeaderButtonContainer>
            </TouchableOpacity>
          ]}
        ></Header>
        <MarginWrapper flexon>
          <TitleWrapper>
            <PageTitle>Market</PageTitle>
            <BuyGoldButton onPress={handleBuyGold}>
              <BalanceText>Balance:</BalanceText>
              <AnimatedGoldAmount size={30} amount={mainStore.gold} />
              <GoldText>Get Gold</GoldText>
            </BuyGoldButton>
          </TitleWrapper>
          <Tabs
            tabs={[
              { name: 'Buy Classes', content: <ClassMarket /> },
              { name: 'My Shop', content: <MyShop /> }
            ]}
          />
        </MarginWrapper>
      </Container>
    );
  })
);
