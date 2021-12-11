import React from 'react';
import { inject, observer } from 'mobx-react';
import styled from 'styled-components/native';
import { Proposal as ProposalData, Players } from '../types';
import {
  ContentWrapper,
  Content,
  Headline,
  Space,
  DefaultText
} from '../../shared';
import { Timer } from './Timer';
import { Proposal } from './Proposal';
import { Image, ScrollView } from 'react-native';
import { Nickname } from '../../Nickname';
import { colors, fonts } from '../../../theme';
import { useTimeLeft } from '../hooks/useTimeLeft';
import MainStore from '../../../mobx/mainStore';
import PixelButton from '../../PixelButton';
import ControlService from '../../../services/ControlService';
import { portraits } from '../../../assets/portraits';

interface Props {
  proposal: ProposalData;
  players: Players;
  mainStore?: MainStore;
  votingStats: {
    [key: string]: number;
  };
}
const WinnerContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StatContainer = styled.View`
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

const WinningProposalText = styled(DefaultText)`
  font-size: 18px;
`;
const WinningProposalContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;
const LoadingOuter = styled.View`
  margin-left: 10px;
  flex: 1;
  flex-direction: row;
  border-color: white;
  border-width: 2px;
`;

const LoadingInner = styled.View`
  height: 10px;
  width: ${p => p.progress}%;
  background-color: ${colors.primary};
`;

const ErrorBox = styled.Text`
  font-family: ${fonts.regular};
  color: ${colors.primary};
  font-size: 14px;
  padding-bottom: 10px;
  align-self: center;
`;

export const Result = inject('mainStore')(
  observer(({ proposal, players, votingStats, mainStore }: Props) => {
    const timeLeft = useTimeLeft();

    const rankedPlayers = Object.entries(players)
      .map(([k, player]) => ({
        ...player,
        winningProposals: votingStats[k]
      }))
      .sort((a, b) => (a.winningProposals > b.winningProposals ? -1 : 1));

    const totalProposals = rankedPlayers.reduce(
      (acc, r) => acc + r.winningProposals,
      0
    );

    console.log('PARTY GAME ERROR STATE', mainStore.actPartyGameError);

    return (
      <ContentWrapper>
        <Timer overtimeText={'Generating the story...'} />
        {mainStore.actPartyGameError && (
          <>
            <Space h={'30px'} />
            <ErrorBox>There was an error when generating the story</ErrorBox>
            <PixelButton
              primary
              label={'Retry'}
              onPress={ControlService.actPartyGame}
            />
          </>
        )}
        <Content>
          {timeLeft > 0 ? (
            <>
              <WinnerContainer>
                <Image
                  source={require('../../../assets/icons/trophy.png')}
                  style={{
                    width: 40,
                    height: 40
                  }}
                />
                <Headline style={{ marginLeft: 15 }}>Winner</Headline>
              </WinnerContainer>

              <Proposal proposal={proposal} players={players} isWinner />
            </>
          ) : (
            <>
              <Headline>Winning Proposals:</Headline>
              <Space h={'10px'} />
              <ScrollView>
                {rankedPlayers.map((r, i) => (
                  <StatContainer key={i}>
                    <Image
                      style={{ width: 70, height: 70 }}
                      source={portraits[r.profilePic]}
                    />
                    <PlayerClassTextContainer>
                      <Nickname
                        nickname={r.nickname}
                        status={r.status}
                        fontSize={19}
                      />
                      <WinningProposalContainer>
                        <WinningProposalText>
                          {r.winningProposals}/{totalProposals}
                        </WinningProposalText>
                        <LoadingOuter>
                          <LoadingInner
                            progress={
                              (r.winningProposals / totalProposals) * 100
                            }
                          />
                        </LoadingOuter>
                      </WinningProposalContainer>
                    </PlayerClassTextContainer>
                  </StatContainer>
                ))}
              </ScrollView>
            </>
          )}
        </Content>
      </ContentWrapper>
    );
  })
);
