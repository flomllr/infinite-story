import React, { useState } from 'react';
import {
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  View
} from 'react-native';
import PixelButton from '../components/PixelButton';
import ControlService from '../services/ControlService';
import PurchaseService from '../services/PurchaseService';
import { CenteredText } from '../components/shared';
import styled from 'styled-components/native';
import { fonts, colors } from '../theme';
import MainStore from '../mobx/mainStore';
import { useEffect } from 'react';
import ErrorService from '../services/ErrorService';
import { PurchaseId } from '../types';
import AnalyticsService from '../services/AnalyticsService';

const ImageContainer = styled.View`
  height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
`;

const Title = styled(CenteredText)`
  font-family: ${fonts.semiBold};
  font-size: 18px;
  padding-bottom: 10px;
`;

const GoldenTitle = styled(Title)`
  color: ${colors.gold};
`;

const GrayText = styled(CenteredText)`
  color: ${colors.lightgray};
`;

const noPadding = {
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0
};

interface Props {
  purchaseId: PurchaseId;
  onPurchased: () => void;
  portrait?: ImageSourcePropType;
  mainStore?: MainStore;
}

export const PurchaseModal = ({ purchaseId, portrait, onPurchased }: Props) => {
  const [product, setProduct] = useState();

  useEffect(() => {
    PurchaseService.getProduct(purchaseId)
      .then(product => setProduct(product))
      .catch(() => {
        ErrorService.uncriticalError('Error loading products');
        ControlService.closeModal();
      });
  }, [purchaseId]);

  console.log('Product:', purchaseId, product, 'END');

  const handlePurchase = async () => {
    AnalyticsService.clickPurchase(purchaseId);
    ControlService.openModal(
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
      </Title>,
      { closable: false }
    );
    try {
      await PurchaseService.purchase(product);
    } catch (error) {
      ErrorService.uncriticalError('Purchase failed. Please try again.');
    }
    console.log('Done purchasing');
    onPurchased();
    ControlService.closeModal();
  };

  const getContent = () => {
    if (purchaseId === 'unlock_shadow_class') {
      return (
        <>
          {portrait && (
            <ImageContainer>
              <Image style={{ width: 70, height: 70 }} source={portrait} />
            </ImageContainer>
          )}
          <Title>You&apos;ve discovered a premium feature!</Title>
          <GoldenTitle>
            The Shadow - A brand new class with multiple unique story beginnings
            that let you experience a wide range of different playthroughs.
          </GoldenTitle>
          <Title>
            Your purchase will help us keep the servers running and develop new
            features!
          </Title>
        </>
      );
    }

    if (purchaseId === 'partymode') {
      return (
        <>
          <ImageContainer>
            <Image
              style={{ width: 70, height: 70 }}
              source={require('../assets/party.png')}
            />
          </ImageContainer>
          <Title>You&apos;ve discovered a premium feature!</Title>
          <GoldenTitle>
            Become Party Mode Host - host unlimited party games for you and your
            friends. Your friends can join your party games for free.
          </GoldenTitle>
          <Title>
            Your purchase will help us keep the servers running and develop new
            features!
          </Title>
        </>
      );
    }
  };

  return product == null ? (
    <></>
  ) : (
    <View style={{ padding: 20 }}>
      {getContent()}
      <PixelButton
        label={'Unlock for ' + product.product.price_string}
        style={{ marginVertical: 10 }}
        onPress={handlePurchase}
      />
      <TouchableOpacity
        onPress={async () => {
          ControlService.openModal(
            <Title style={noPadding}>Restoring purchase...</Title>,
            { closable: false }
          );
          await PurchaseService.restore();
          console.log('Done restoring');
          onPurchased();
          ControlService.closeModal();
        }}
      >
        <GrayText>Restore purchase</GrayText>
      </TouchableOpacity>
    </View>
  );
};
