import React, { useState, ReactNode } from 'react';
import PixelButton from '../components/PixelButton';
import ControlService from '../services/ControlService';
import PurchaseService from '../services/PurchaseService';
import { CenteredText, Space, DefaultText } from '../components/shared';
import styled from 'styled-components/native';
import { fonts, colors } from '../theme';
import MainStore from '../mobx/mainStore';
import { useEffect } from 'react';
import ErrorService from '../services/ErrorService';
import AnalyticsService from '../services/AnalyticsService';
import { GoldAmount } from '../components/GoldAmount';
import { Coin } from '../components/Coin';
import { inject, observer } from 'mobx-react';
import { View } from 'react-native';

const Container = styled.View`
  padding: 20px 5px;
`;

const BoldText = styled(CenteredText)`
  font-family: ${fonts.semiBold};
  font-size: 18px;
  margin: 10px 0;
`;

const GoldenTitle = styled(BoldText)`
  color: ${colors.gold};
`;

const InfoText = styled(CenteredText)`
  color: ${colors.lightgray};
  padding: 0 20px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const OfferTitle = styled(DefaultText)`
  text-transform: uppercase;
  font-family: ${fonts.bold};
  font-size: 12px;
  color: ${colors.lightgray};
`;

const OfferTitleBox = styled.View`
  height: 25px;
`;

const OfferWrapper = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${p =>
    p.selected ? colors.darkgray : colors.evendarkergray};
  margin: 0 5px;
  padding: 20px 0;
  align-items: center;
  flex: 1;
`;

const OfferAmount = styled(DefaultText)`
  font-family: ${fonts.bold};
  font-size: 20px;
`;

const Title = styled(CenteredText)`
  font-family: ${fonts.semiBold};
  font-size: 18px;
  padding-bottom: 10px;
`;

interface Props {
  onPurchased: (amount: number) => void;
  mainStore?: MainStore;
}

interface Offer {
  title?: ReactNode;
  gold: number;
  purchaseId: string;
  promotion?: ReactNode;
}

const offers: Offer[] = [
  { gold: 100, purchaseId: 'coins_100' },
  {
    gold: 600,
    purchaseId: 'coins_600',
    title: <OfferTitle style={{ color: colors.actSay }}>Popular</OfferTitle>,
    promotion: (
      <OfferTitle style={{ color: colors.actSay }}>Save 20%</OfferTitle>
    )
  },
  {
    gold: 3600,
    purchaseId: 'coins_3600',
    promotion: <OfferTitle style={{ color: colors.gold }}>Save 30%</OfferTitle>,
    title: <OfferTitle style={{ color: colors.gold }}>Best price</OfferTitle>
  }
];

const OfferComponent = ({
  selected,
  purchaseId,
  offer,
  onPress
}: {
  selected: boolean;
  offer: Offer;
  purchaseId: string;
  onPress?: () => void;
}) => {
  const [priceString, setPriceString] = useState('...');

  useEffect(() => {
    PurchaseService.getProduct(purchaseId)
      .then(product => setPriceString(product.product.price_string))
      .catch(e => {
        console.error(e);
        ErrorService.uncriticalError('Error loading products');
        ControlService.closeModal();
      });
  }, [purchaseId]);
  return (
    <OfferWrapper onPress={onPress} selected={selected}>
      <OfferTitleBox>{offer.title}</OfferTitleBox>
      <Coin size={40} />
      <OfferAmount>{offer.gold}</OfferAmount>
      <OfferTitle>{priceString}</OfferTitle>
      <OfferTitleBox>{offer.promotion}</OfferTitleBox>
      {selected && <OfferTitle>selected</OfferTitle>}
    </OfferWrapper>
  );
};
export const GoldPurchaseModal = inject('mainStore')(
  observer(({ onPurchased, mainStore }: Props) => {
    const [selected, setSelected] = useState(1);
    const [product, setProduct] = useState();
    useEffect(() => {
      AnalyticsService.openedGoldPurchaseModal();
      PurchaseService.getProduct(offers[selected].purchaseId)
        .then(product => setProduct(product))
        .catch(e => {
          console.error(e);
          ErrorService.uncriticalError('Error loading products');
          ControlService.closeModal();
        });
    }, [selected]);

    return (
      <Container>
        <Row>
          <BoldText>Current balance:</BoldText>
          <Space w={'10px'} />
          <GoldAmount amount={mainStore.gold} size={18} />
        </Row>
        <GoldenTitle>How much Gold do you want?</GoldenTitle>
        <Row>
          {offers.map((offer, index) => (
            <OfferComponent
              key={index}
              purchaseId={offer.purchaseId}
              selected={selected === index}
              offer={offer}
              onPress={() => setSelected(index)}
            />
          ))}
        </Row>
        <Space h={'20px'} />
        <Row>
          <BoldText>Balance after:</BoldText>
          <Space w={'10px'} />
          <GoldAmount
            amount={mainStore.gold + offers[selected].gold}
            size={18}
          />
        </Row>
        <Space h={'20px'} />
        <PixelButton
          primary
          backgroundColor={colors.modalBackground}
          onPress={async () => {
            AnalyticsService.clickPurchase(offers[selected].purchaseId);
            ControlService.openModal(
              <View style={{ padding: 20 }}>
                <Title
                  style={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    marginRight: 0
                  }}
                >
                  Purchase in progress...
                </Title>
              </View>,
              { closable: false }
            );
            try {
              const purchaseCompleted = await PurchaseService.purchase(product);
              if (purchaseCompleted) {
                onPurchased(offers[selected].gold);
              }
            } catch (error) {
              ErrorService.uncriticalError(
                'Purchase failed. Please try again.'
              );
              console.error(error);
            }
            ControlService.closeModal();
          }}
        >
          <Row>
            <BoldText>Buy </BoldText>
            <GoldAmount amount={offers[selected].gold} size={18} />
            <BoldText>
              {' '}
              for {product ? product.product.price_string : '...'}
            </BoldText>
          </Row>
        </PixelButton>
        <Space h={'40px'} />
        <InfoText>
          You can use Gold to unlock features and buy new classes on the market.
          You can also earn Gold by selling your classes on the market.
        </InfoText>
      </Container>
    );
  })
);
