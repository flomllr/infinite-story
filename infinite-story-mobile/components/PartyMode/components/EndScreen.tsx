import React from 'react';
import styled from 'styled-components/native';
import {
  DefaultText,
  ContentWrapper,
  Content,
  Headline,
  Space,
  SubHeadline,
  SubHeadlineLightGray
} from '../../shared';
import { Image } from 'react-native';
import { Achievements, Players } from '../types';
import { FlatList } from 'react-native-gesture-handler';
import PixelButton from '../../PixelButton';
import { colors, fonts } from '../../../theme';
import { Nickname } from '../../Nickname';
import { withNavigation } from 'react-navigation';
import ControlService from '../../../services/ControlService';
import { portraits } from '../../../assets/portraits';
import { useNavigation } from '../../../hooks/useNavigation';

interface Props {
  achievements: Achievements;
  players: Players;
  navigation?: { goBack: () => void };
}

const FloatBottom = styled.View`
  flex-direction: row;
  align-items: flex-end;
  padding-bottom: 20px;
  justify-content: center;
  padding-top: 20px;
`;

export const ACHIEVEMENTS = {
  MOST_LOVED: {
    title: 'The Most Loved',
    image: require('../../../assets/party_game_achievements/most_loved.png')
  },
  WHO_ACTS: {
    title: 'The One Who Acts',
    image: require('../../../assets/party_game_achievements/act.png')
  },
  WHO_TALKS: {
    title: 'The One Who Talks',
    image: require('../../../assets/party_game_achievements/talk.png')
  },
  NEVER_SUCCEEDED: {
    title: 'The Loser',
    image: require('../../../assets/party_game_achievements/never_succeeded.png')
  },
  PASSIVITY_PRICE: {
    title: 'Passivity Price',
    image: require('../../../assets/party_game_achievements/passivity.png')
  },
  WRITER: {
    title: 'The Writer',
    image: require('../../../assets/party_game_achievements/writer.png')
  },
  PROVOCATIVE: {
    title: 'Provocative',
    image: require('../../../assets/party_game_achievements/provocative.png')
  },
  LUCKY: {
    title: 'The Lucky One',
    image: require('../../../assets/party_game_achievements/lucky.png')
  }
};

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
const AchievementContainer = styled.View`
  margin: 5px;
  margin-right: 10%;
  margin-left: 10%;
  flex-direction: row;
  justify-content: space-between;
`;

const AchievementTextContainer = styled.View`
  flex: 1;
  margin-left: 10px;
  flex-direction: column;
`;

export const AchievementDescription = styled(DefaultText)`
  color: ${colors.greyed};
`;
export const EndScreen = ({ achievements, players }: Props) => {
  const { navigation } = useNavigation();
  const filteredAchievements = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(achievements).filter(([_, v]) => v.length > 0)
  );

  return (
    <ContentWrapper>
      <Content>
        <Headline>End of the Game!</Headline>
        <SubHeadlineLightGray>Here are your achievements</SubHeadlineLightGray>
        <Space h={'15px'} />
        <SubHeadline>
          This story has been saved in your history so you can revisit it later
        </SubHeadline>
        <Space h={'10px'} />
        {Object.entries(filteredAchievements).length === 0 && (
          <Headline>
            Game ended early, no achievements... Or you might be playing alone?
          </Headline>
        )}
        <FlatList
          data={Object.keys(filteredAchievements)}
          renderItem={({ index, item: key }) => {
            const player = players[key];
            const playerAchievements = achievements[key];
            return (
              <>
                <PlayerProfile key={index}>
                  <Image
                    style={{ width: 70, height: 70 }}
                    source={portraits[player.profilePic]}
                  />
                  <PlayerClassTextContainer>
                    <Nickname
                      status={player.status}
                      nickname={player.nickname}
                    />
                    <PlayerDescription>
                      {playerAchievements.length} achievemen
                      {playerAchievements.length > 1 ? 'ts' : 't'}
                    </PlayerDescription>
                  </PlayerClassTextContainer>
                </PlayerProfile>
                {playerAchievements.map((a, i) => (
                  <AchievementContainer key={i}>
                    <Image
                      style={{ width: 30, height: 30 }}
                      source={ACHIEVEMENTS[a.type].image}
                    />
                    <AchievementTextContainer>
                      <DefaultText>{a.title}</DefaultText>
                      <AchievementDescription>
                        {a.description}
                      </AchievementDescription>
                    </AchievementTextContainer>
                  </AchievementContainer>
                ))}
              </>
            );
          }}
          keyExtractor={a => a}
        />
        <FloatBottom>
          <PixelButton
            label={'Go back to main menu'}
            primary
            onPress={() => {
              ControlService.dropJitsiMeetCall();
              ControlService.leavePartyGame();
              ControlService.requestReview();
              navigation.goBack();
            }}
          />
        </FloatBottom>
      </Content>
    </ContentWrapper>
  );
};
