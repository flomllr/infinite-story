import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../../../theme';
import { FullscreenModal } from '../../FullscreenModal';
import { MarginWrapper, DefaultText, Space } from '../../shared';
import MainStore from '../../../mobx/mainStore';
import { inject, observer } from 'mobx-react';
import PixelButton from '../../PixelButton';
import { AnimatedGoldAmount, GoldAmount } from '../../GoldAmount';
import { Nickname } from '../../Nickname';
import { OrnamentBox } from '../../PartyMode/components/OrnamentBox';
import ControlService from '../../../services/ControlService';
import { withNavigation } from 'react-navigation';
import { GoldPurchaseModal } from '../../../modals/GoldPurchaseModal';
import { Coin } from '../../Coin';
import { ACHIEVEMENT_PURCHASE_DATA } from '../../../achievementPrices';
import { PlayerStatus } from '../../../types';
import { Image } from 'react-native';
import { portraits } from '../../../assets/portraits';
import { OGClasses } from '../../PlayerClass';
import AnalyticsService from '../../../services/AnalyticsService';
import { useNavigation } from '../../../hooks/useNavigation';

interface Props {
  mainStore?: MainStore;
}

const Wrapper = styled.View`
  flex: 1;
  padding: 20px;
`;

const ImageContainer = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const BalanceText = styled(DefaultText)`
  font-size: 16px;
  text-align: right;
  padding-right: 8px;
`;

const Description = styled.ScrollView`
  margin-top: 40px;
  flex: 1;
`;

const Headline = styled(DefaultText)`
  color: ${colors.greyed};
`;

const DescriptionContent = styled(DefaultText)`
  font-size: 17px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

const FeatureRow = styled(DefaultText)`
  color: ${colors.gold};
`;

const AuthorRow = styled.View`
  align-items: center;
`;

const GreyText = styled(DefaultText)`
  color: ${colors.lightgray};
`;

const BuyInfo = styled(DefaultText)`
  text-align: center;
  color: ${colors.lightgray};
  padding: 10px 0;
`;

const RarityText = styled(DefaultText)`
  color: ${colors.gold};
`;

const Tags = styled(DefaultText)`
  padding-top: 5px;
`;
const renderRarity = (rarity: string): string => {
  switch (rarity) {
    case 'rare':
      return 'Rare';
    case 'ultra':
      return 'Ultra Rare';
    case 'super':
      return 'Super Rare';
    default:
      break;
  }
};
export const BuyProfilePicture = inject('mainStore')(
  observer(({ mainStore }: Props) => {
    const { navigation } = useNavigation();
    if (mainStore.previewProfilePicture == null) {
      return (
        <FullscreenModal>
          <></>
        </FullscreenModal>
      );
    }
    const profilePicture = mainStore.previewProfilePicture;
    const achievement = `unlocked:${profilePicture}`;
    const price = ACHIEVEMENT_PURCHASE_DATA[achievement].price;
    const description = ACHIEVEMENT_PURCHASE_DATA[achievement].description;
    const rarity = OGClasses.find(c => c.value === profilePicture).rarity;
    const handleClose = () => {
      mainStore.setPreviewProfilePicture(null);
    };

    const handleBuy = async () => {
      await ControlService.buyAchievement(
        achievement,
        ACHIEVEMENT_PURCHASE_DATA[achievement].price
      );
      AnalyticsService.boughtProfilePicture(price, profilePicture);
    };

    const owned = mainStore.achievements.includes(achievement);

    const handleBuyGold = () => {
      ControlService.openModal(
        <GoldPurchaseModal
          onPurchased={amount => {
            ControlService.getGold(amount);
          }}
        />
      );
    };

    const getButton = () => {
      if (owned) {
        return (
          <>
            <BuyInfo>You own this profile picture</BuyInfo>
            <PixelButton
              primary
              onPress={() => {
                navigation.goBack();
              }}
            >
              <ButtonRow>
                <DefaultText>
                  Go back (Don&apos;t forget to select it)
                </DefaultText>
              </ButtonRow>
            </PixelButton>
          </>
        );
      }

      if (mainStore.gold < price) {
        return (
          <>
            <BuyInfo>
              You need {price - mainStore.gold} more Gold to buy this profile
              picture
            </BuyInfo>
            <PixelButton primary onPress={handleBuyGold}>
              <ButtonRow>
                <DefaultText> Get more Gold </DefaultText>
                <Coin size={15} />
              </ButtonRow>
            </PixelButton>
          </>
        );
      }

      if (mainStore.gold < price) {
        return (
          <>
            <BuyInfo>
              You need {price - mainStore.gold} more Gold to buy this profile
              picture
            </BuyInfo>
            <PixelButton primary onPress={handleBuyGold}>
              <ButtonRow>
                <DefaultText> Get more Gold </DefaultText>
                <Coin size={15} />
              </ButtonRow>
            </PixelButton>
          </>
        );
      }

      return (
        <PixelButton
          primary={!mainStore.marketplacePurchaseInProgress}
          onPress={handleBuy}
          disabled={mainStore.marketplacePurchaseInProgress}
        >
          <ButtonRow>
            {mainStore.marketplacePurchaseInProgress ? (
              <GreyText>Purchase in progress</GreyText>
            ) : (
              <>
                <DefaultText>Unlock for</DefaultText>
                <Space w={'6px'} />
                <GoldAmount amount={price} size={20} />
              </>
            )}
          </ButtonRow>
        </PixelButton>
      );
    };

    return (
      <FullscreenModal
        onClose={handleClose}
        open={mainStore.previewClass != null}
        rightButtons={[
          <BalanceText key={'balance'}>Balance:</BalanceText>,
          <AnimatedGoldAmount size={20} amount={mainStore.gold} key={'gold'} />
        ]}
      >
        <MarginWrapper marginset={5} flexon>
          <OrnamentBox>
            <Wrapper>
              <AuthorRow>
                <Headline>Made by </Headline>
                <Nickname
                  nickname={'Infinite Clan'}
                  status={PlayerStatus.INFINITE}
                  fontSize={17}
                />
                {rarity && <RarityText>- {renderRarity(rarity)} -</RarityText>}
              </AuthorRow>
              <Space h={'40px'} />
              <ImageContainer>
                <Image
                  style={{
                    width: 120,
                    height: 120
                  }}
                  source={portraits[profilePicture]}
                />
              </ImageContainer>
              <Description>
                <Headline>Preview</Headline>
                <DescriptionContent>{description}</DescriptionContent>
                <Space h={'40px'} />
                <FeatureRow>
                  * Allows you to use this portrait as a profile picture in
                  Party Mode and as a portrait for your class
                  {rarity &&
                    `\n* This is a ${renderRarity(rarity)} profile picture`}
                </FeatureRow>
              </Description>

              {getButton()}
            </Wrapper>
          </OrnamentBox>
        </MarginWrapper>
      </FullscreenModal>
    );
  })
);
