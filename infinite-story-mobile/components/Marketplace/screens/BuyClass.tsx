import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../../../theme';
import { FullscreenModal } from '../../FullscreenModal';
import { MarginWrapper, DefaultText, Space } from '../../../components/shared';
import MainStore from '../../../mobx/mainStore';
import { inject, observer } from 'mobx-react';
import { PlayerClass } from '../../PlayerClass';
import PixelButton from '../../PixelButton';
import { AnimatedGoldAmount, GoldAmount } from '../../GoldAmount';
import { Nickname } from '../../Nickname';
import { OrnamentBox } from '../../PartyMode/components/OrnamentBox';
import ControlService from '../../../services/ControlService';
import { renderTags } from './MyShop';
import { GoldPurchaseModal } from '../../../modals/GoldPurchaseModal';
import { Coin } from '../../Coin';
import { useStartStory } from '../../../hooks/useStartStory';
import { NAMETAG } from '../../../types';
import { RandomName } from '../../RandomName';
import AnalyticsService from '../../../services/AnalyticsService';

interface Props {
  mainStore?: MainStore;
}

const Wrapper = styled.View`
  flex: 1;
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

const Tags = styled(DefaultText)`
  padding-top: 5px;
`;

export const BuyClass = inject('mainStore')(
  observer(({ mainStore }: Props) => {
    const startStory = useStartStory(mainStore);

    if (mainStore.previewClass == null) {
      return (
        <FullscreenModal>
          <></>
        </FullscreenModal>
      );
    }
    const {
      item: { item: classItem },
      price,
      usedAllTime,
      usedLastWeek,
      boughtAllTime,
      author,
      id,
      tags
    } = mainStore.previewClass;

    const handleClose = () => {
      mainStore.setPreviewClass(null);
    };

    const handleBuy = async () => {
      await ControlService.buyMarketplaceItem(id);
      AnalyticsService.boughtMarketplaceClass(price);
    };

    const owned =
      mainStore.boughtClasses.includes(id) ||
      mainStore.userId === author.deviceId;

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
            <BuyInfo>You own this class</BuyInfo>
            <PixelButton
              primary
              onPress={() => startStory(mainStore.previewClass)}
            >
              <ButtonRow>
                <DefaultText>Start a story</DefaultText>
              </ButtonRow>
            </PixelButton>
          </>
        );
      }

      if (mainStore.gold < price) {
        return (
          <>
            <BuyInfo>
              You need {price - mainStore.gold} more Gold to buy this class
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
    const description =
      (classItem.location !== '???'
        ? classItem.context + '\n\n' + classItem.prompts[0]
        : classItem.context + classItem.prompts[0]) + (owned ? '' : '...');
    const indexOfNameTag = description.indexOf(NAMETAG);
    const getDescriptionContent = () => {
      if (indexOfNameTag === -1) {
        return (
          <DescriptionContent numberOfLines={owned ? null : 9}>
            {description}
          </DescriptionContent>
        );
      }

      return (
        <DescriptionContent numberOfLines={owned ? null : 9}>
          {description.slice(0, indexOfNameTag)}
          <RandomName
            Wrapper={DescriptionContent}
            nickname={mainStore.nickname}
            playerStatus={mainStore.playerStatus}
            tag={tags[0]}
          />
          {description.slice(
            indexOfNameTag + NAMETAG.length,
            description.length
          )}
        </DescriptionContent>
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
                  nickname={author.nickname}
                  status={author.status}
                  fontSize={17}
                />
              </AuthorRow>
              <Space h={'40px'} />
              <PlayerClass
                portrait={classItem.portrait}
                name={classItem.name}
                description={classItem.description}
              />
              <Description>
                <Headline>Preview</Headline>
                {getDescriptionContent()}
                <Space h={'40px'} />
                <FeatureRow>
                  * Includes {classItem.prompts.length} unique story beginning
                  {classItem.prompts.length != 1 ? 's' : ''}
                  {'\n'}* Played {usedAllTime} time
                  {usedAllTime != 1 ? 's' : ''} by {boughtAllTime} player
                  {boughtAllTime != 1 ? 's' : ''}
                  {indexOfNameTag !== -1 &&
                    '\n* Includes the ability to choose your name'}
                </FeatureRow>
                <Tags>Tags: {renderTags(tags)}</Tags>
              </Description>

              {getButton()}
            </Wrapper>
          </OrnamentBox>
        </MarginWrapper>
      </FullscreenModal>
    );
  })
);
