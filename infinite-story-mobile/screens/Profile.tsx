import React from 'react';
import { Linking, ScrollView, Text, TextInput, View } from 'react-native';
import styled from 'styled-components/native';
import { observer } from 'mobx-react';
import { PageTitle, MarginWrapper } from '../components/shared';
import {
  DefaultText,
  Space,
  HeadlineFloatLeft,
  SubHeadlineFloatLeft
} from '../components/shared';
import { Nickname } from '../components/Nickname';
import { TouchableOpacity, Image } from 'react-native';
import ControlService from '../services/ControlService';
import { NicknameModal } from '../modals/NicknameModal';
import { ACHIEVEMENTS } from '../components/PartyMode/components/EndScreen';
import PixelButton from '../components/PixelButton';
import { RedeemOfferModal } from '../modals/RedeemOfferModal';
import { FullscreenModal } from '../components/FullscreenModal';
import { styles } from '../screens/Welcome';
import { AnimatedGoldAmount } from '../components/GoldAmount';
import { ProfileImage } from '../components/PartyMode/components/ProfileImage';
import { GoldPurchaseModal } from '../modals/GoldPurchaseModal';
import { useMainStore } from '../hooks/useMainStore';
import { colors } from '../theme';
import { useNavigation } from '../hooks/useNavigation';

const NicknameContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatusContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatusText = styled(DefaultText)`
  font-size: 18px;
  color: ${colors.greyed};
`;

const AchievementContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 7px;
`;

const AchievementText = styled(DefaultText)`
  font-size: 16px;
`;

const AchievementIcon = styled.Image`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

const ProfileImageContainer = styled.TouchableOpacity`
  margin-bottom: 10px;
`;

const EditProfileButton = styled(DefaultText)`
  text-align: center;
  color: ${colors.primary};
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

const TitleWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const capitalStr = (p: string) =>
  p ? p.toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '';

const Achievement = ({ achievement }: { achievement: string }) => {
  const DefaultIcon = (
    <AchievementIcon source={require('../assets/icons/chest.png')} />
  );
  const VisitedIcon = (
    <AchievementIcon source={require('../assets/icons/visited.png')} />
  );
  let Icon = DefaultIcon;
  let achievementText = achievement;
  if (achievement.startsWith('visited:')) {
    achievementText = `Visited a ${capitalStr(
      achievement.slice(8)
    )} (+20 gold)`;
    Icon = VisitedIcon;
  } else if (achievement.startsWith('unlocked:')) {
    achievementText = `Unlocked ${capitalStr(achievement.slice(9))}`;
    Icon = DefaultIcon;
  } else if (achievement.startsWith('boughtmarketplaceitem:')) {
    achievementText = `Bought "${capitalStr(achievement.split(':')[2])}"`;
    Icon = DefaultIcon;
  } else {
    achievementText = capitalStr(achievement);
  }
  return (
    <AchievementContainer>
      {Icon}
      <AchievementText>{achievementText}</AchievementText>
    </AchievementContainer>
  );
};

const MultiplayerAchievement = ({
  achievement,
  n
}: {
  achievement: string;
  n: number;
}) => {
  const Icon = <AchievementIcon source={ACHIEVEMENTS[achievement].image} />;
  const achievementText = ACHIEVEMENTS[achievement].title;
  return (
    <AchievementContainer>
      {Icon}
      <AchievementText>
        {achievementText} x{n}
      </AchievementText>
    </AchievementContainer>
  );
};

export const ProfileScreen = observer(() => {
  const mainStore = useMainStore();
  const { navigation } = useNavigation();

  const locationsFound = mainStore.achievements.filter(a =>
    a.startsWith('visited:')
  ).length;
  const onDiscordQuest = () => {
    let code;
    Linking.openURL('https://discord.gg/yXGmY6y');
    ControlService.openModal(
      <>
        <Text style={styles.modalTitle}>Enter your Discord code</Text>
        <TextInput
          style={[styles.text, styles.textInput]}
          onChangeText={text => (code = text)}
        />
        <View style={styles.tutorialButton}>
          <TouchableOpacity
            onPress={async () => {
              await ControlService.useDiscordCode('' + code);
              ControlService.closeModal();
            }}
          >
            <Text style={styles.textButton}>Verify</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const discordAchievement =
    mainStore.achievements && mainStore.achievements.find(e => e === 'discord');

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
    <FullscreenModal>
      <MarginWrapper flexon>
        <TitleWrapper>
          <PageTitle>Profile</PageTitle>
          <BuyGoldButton onPress={handleBuyGold} key={Math.random()}>
            <BalanceText>Balance:</BalanceText>
            <AnimatedGoldAmount size={30} amount={mainStore.gold} />
            <GoldText>Get Gold</GoldText>
          </BuyGoldButton>
        </TitleWrapper>
        <ScrollView>
          <NicknameContainer>
            <ProfileImageContainer
              onPress={() => {
                mainStore.setEditCreativeClass(null);
                navigation.navigate('SelectPortraitModal');
              }}
            >
              <ProfileImage
                type={mainStore.profilePicture}
                size={100}
                customMargin={'20px 0 5px 0'}
              />
              <EditProfileButton>Edit</EditProfileButton>
            </ProfileImageContainer>
            <Space w={20} />
            <Nickname
              nickname={mainStore.nickname}
              status={mainStore.playerStatus}
              fontSize={30}
            />
            <TouchableOpacity
              onPress={() =>
                ControlService.openModal(
                  <NicknameModal onSuccess={() => null} />
                )
              }
            >
              <Image
                source={require('../assets/icons/edit.png')}
                style={{
                  height: 30,
                  width: 30,
                  marginLeft: 10,
                  marginTop: 5
                }}
              />
            </TouchableOpacity>
          </NicknameContainer>
          <StatusContainer>
            <StatusText>Status: </StatusText>
            <Space h={'10px'} />
            <Nickname
              nickname={capitalStr(mainStore.playerStatus)}
              status={mainStore.playerStatus}
              fontSize={20}
            />
          </StatusContainer>
          <Space h={'30px'} />
          <HeadlineFloatLeft>Achievements:</HeadlineFloatLeft>
          <Space h={'30px'} />
          <SubHeadlineFloatLeft>Classic & Creative</SubHeadlineFloatLeft>
          <Space h={'10px'} />
          {mainStore.achievements
            .filter(a => a[0] !== '_')
            .map(a => (
              <Achievement key={a} achievement={a} />
            ))}
          {mainStore.achievements.filter(a => a[0] !== '_').length === 0 && (
            <DefaultText>
              No achievements so far! Explore the game to acquire them.
            </DefaultText>
          )}
          {locationsFound !== 28 && (
            <>
              <Space h={'10px'} />
              <DefaultText>
                Missing: {28 - locationsFound} more locations to find!
              </DefaultText>
            </>
          )}

          <Space h={'30px'} />
          <SubHeadlineFloatLeft>Party mode</SubHeadlineFloatLeft>
          <Space h={'10px'} />
          {Object.keys(mainStore.multiplayerAchievements).map(a => (
            <MultiplayerAchievement
              key={a}
              achievement={a}
              n={mainStore.multiplayerAchievements[a]}
            />
          ))}
          {Object.keys(mainStore.multiplayerAchievements).length === 0 && (
            <DefaultText>
              No Party mode achievements so far! Join a party mode game to
              receive some.
            </DefaultText>
          )}
          <Space h={'20px'} />
          <Text style={styles.questTitle}>Quests:</Text>
          <Space h={'20px'} />
          <Text
            style={mainStore.tutorialDone ? styles.questDone : styles.quest}
          >
            {mainStore.tutorialDone ? '▣' : '▢'} Start your first adventure!
          </Text>
          {!mainStore.hideIllegalFeaturesFromApple && (
            <Text
              style={discordAchievement ? styles.questDone : styles.quest}
              onPress={onDiscordQuest}
            >
              {discordAchievement ? '▣' : '▢'} Join our Discord to access the
              locked Orc class
            </Text>
          )}
          <Space h={'50px'} />
          {!mainStore.hideIllegalFeaturesFromApple && (
            <PixelButton
              primary
              label="Redeem offer"
              onPress={() =>
                ControlService.openModal(
                  <RedeemOfferModal
                    onSuccess={() => ControlService.loadProfile()}
                  />
                )
              }
            />
          )}
        </ScrollView>
      </MarginWrapper>
    </FullscreenModal>
  );
});
