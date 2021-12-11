import React, { useEffect } from 'react';
import {
  ContentWrapper,
  Content,
  Headline,
  Space,
  SubHeadline,
  DefaultText
} from '../../shared';
import PixelButton from '../../PixelButton';
import { Players } from '../types';
import styled from 'styled-components/native';
import { colors, fonts } from '../../../theme';
import { Image, FlatList, TouchableOpacity, View } from 'react-native';
import { Nickname } from '../../Nickname';
import ControlService from '../../../services/ControlService';
import { portraits } from '../../../assets/portraits';

interface Props {
  onStart: () => void;
  players: Players;
  isOwner: boolean;
  joinCode: string;
  needTutorial: boolean;
  userId: string;
}

const PlayerProfile = styled.View`
  margin: 5px;
  margin-right: 10%;
  flex-direction: row;
  justify-content: space-between;
`;
const PlayerClassTextContainer = styled.View`
  flex: 1;
  margin-left: 10px;
  flex-direction: column;
`;

const PlayerDescription = styled.Text`
  color: ${colors.defaultText};
  font-family: ${fonts.regular};
  font-size: 16px;
`;
const JoinCode = styled(DefaultText)`
  font-size: 50px;
  color: ${colors.gold};
  text-align: center;
  font-family: ${fonts.bold};
`;
const FloatBottom = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-end;
  padding-bottom: 20px;
  justify-content: center;
  min-height: 80px;
`;

const READY_TEXTS = [
  'Ready to rock',
  'Want his votes',
  'Only plays for the achievements',
  'Ready for action',
  'Apparently funny',
  'Real Infinite Adventurers',
  'Ready!',
  'One last game before dinner',
  'Actually 11 years old',
  'Cannot wait to start'
];

const ModalView = styled.View`
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ImportantText = styled(DefaultText)`
  color: ${colors.primary};
`;

const BannedButtonContainer = styled.View`
  flex: 1;
  padding-left: 3px;
  padding-right: 3px;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
`;

const GoldText = styled(DefaultText)`
  font-size: 16px;
  padding-horizontal: 20px
  padding-vertical: 8px
  color: ${colors.gold}
`;

const BannedButton = styled(DefaultText)`
  background-color: ${colors.primary};
  padding: 3px;
`;
const hashCode = (s, max) =>
  Math.abs(
    s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  ) % max;

export const Joining = ({
  onStart,
  players,
  isOwner,
  joinCode,
  needTutorial,
  userId
}: Props) => {
  useEffect(() => {
    needTutorial &&
      ControlService.openModal(
        <ModalView>
          <Headline>Stay Awhile and Listen</Headline>
          <Space h={'15px'} />
          <GoldText>
            Party Mode is in BETA. Please post the bugs you encounter in the
            #feedback channel of our Discord
          </GoldText>
          <Space h={'10px'} />
          <DefaultText>Excited for your first Party game?</DefaultText>
          <Space h={'15px'} />
          <DefaultText>
            Before you try to close this window without even reading the rest of
            this sentence, take note of those two tips:
          </DefaultText>
          <Space h={'10px'} />
          <DefaultText>
            1) There is a <ImportantText>group voice chat</ImportantText>! Click
            &quot;Join Call&quot; to join it (We&apos;ll need to have access to
            your microphone).
          </DefaultText>
          <Space h={'10px'} />
          <DefaultText>
            2) If you are the host, you can end the game at any time to wrap up
            the story and distribute achievements to all the players by clicking
            on <ImportantText>End</ImportantText> on the top right corner.
          </DefaultText>
          <Space h={'10px'} />
          <View>
            <PixelButton
              onPress={() => {
                ControlService.setPartyGameTutorialDone();
                ControlService.closeModal();
              }}
              label={'Understood'}
            />
          </View>
        </ModalView>
      );
    return () => null;
  }, []);
  return (
    <ContentWrapper>
      <Content>
        <Headline>Waiting for all players</Headline>
        <Space h={'10px'} />
        <SubHeadline>Join code:</SubHeadline>
        <JoinCode>{joinCode}</JoinCode>
        <Space h={'40px'} />
        <FlatList
          data={Object.entries(players).reverse()}
          renderItem={({ index, item: [k, player] }) => (
            <PlayerProfile key={index}>
              <Image
                style={{ width: 70, height: 70 }}
                source={portraits[player.profilePic]}
              />
              <PlayerClassTextContainer>
                <Nickname status={player.status} nickname={player.nickname} />
                <PlayerDescription>
                  {READY_TEXTS[hashCode(player.nickname + index, 10)]}
                </PlayerDescription>
              </PlayerClassTextContainer>
              {isOwner && k !== userId && (
                <TouchableOpacity onPress={() => ControlService.banPlayer(k)}>
                  <BannedButtonContainer>
                    <BannedButton>Ban</BannedButton>
                  </BannedButtonContainer>
                </TouchableOpacity>
              )}
            </PlayerProfile>
          )}
          keyExtractor={p => p[1].nickname}
        />
        <FloatBottom>
          {isOwner ? (
            <PixelButton
              onPress={onStart}
              label={'Start the Game!'}
              innerColor={'rgba(244,111,111,1.0)'}
              outerColor={'rgba(244,111,111,0.5)'}
            />
          ) : (
            <DefaultText>Waiting for the host to start...</DefaultText>
          )}
        </FloatBottom>
      </Content>
    </ContentWrapper>
  );
};
