import React from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';
import { Proposal as ProposalData, Players } from '../types';
import { colors } from '../../../theme';
import { DefaultText } from '../../shared';
import { inject, observer } from 'mobx-react';
import MainStore from '../../../mobx/mainStore';
import { ProfileImage } from './ProfileImage';
import { Nickname } from '../../Nickname';
import { PlayerStatus } from '../../../types';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface Props {
  proposal: ProposalData;
  players: Players;
  vote?: () => void;
  anonymous?: boolean;
  mainStore?: MainStore;
  isWinner?: boolean;
}
const TextColumn = styled.View``;

const Value = styled(DefaultText)<{ isWinner }>`
  ${p => (p.isWinner ? 'font-size: 20px;' : '')}
`;

const Votes = styled(DefaultText)``;

const FinalVotes = styled(DefaultText)`
  font-size: 20px;
  text-align: center;
`;

const Do = styled(DefaultText)`
  color: ${colors.actDo};
`;

const Say = styled(DefaultText)`
  color: ${colors.actSay};
`;

const VoteButton = styled.TouchableOpacity<{ isOwnVote?: boolean }>`
  padding: 10px;
  margin-right: 10px;
  margin-top: -7px;
  max-height: 36px;
`;

const Winner = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
`;

const VoteContainer = styled.View`
  height: 43px;
  width: 48px;
  margin-left: 40px;
`;
const CenteringImage = styled.ImageBackground`
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`;

const ValueIconContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ModifiedScrollView = styled.ScrollView`
  flex: 1;
`;

const ModifiedView = styled.View`
  flex: 1;
`;

export const Proposal = inject('mainStore')(
  observer(
    ({
      proposal: { user, proposal, votes },
      players,
      vote,
      anonymous,
      mainStore,
      isWinner
    }: Props) => {
      const systemValues = {
        TELL_ME_MORE: 'Tell me more',
        ROLLBACK: 'Rollback'
      };

      const actionPrefix = {
        ACT_DO: <Do>Do: </Do>,
        ACT_SAY: <Say>Say: </Say>
      };

      const isOwnProposal = user === mainStore.userId;

      const isOwnVote = votes.includes(mainStore.userId);

      const value =
        user === 'SYSTEM' ? (
          systemValues[proposal.type]
        ) : (
          <>
            {actionPrefix[proposal.type]}
            {proposal.payload}
          </>
        );

      const getAuthor = () => {
        if (user === 'SYSTEM') return 'Infinite DM';
        if (isOwnProposal) return 'You';
        return anonymous ? 'Anonymous' : players[user].nickname;
      };

      const getStatus = () => {
        if (user === 'SYSTEM') return PlayerStatus.INFINITE;
        if (isOwnProposal) return players[user].status;
        return anonymous ? PlayerStatus.PEASANT : players[user].status;
      };

      const Container = isWinner ? ModifiedScrollView : ModifiedView;

      return (
        <>
          {vote && !isWinner && (
            <VoteButton onPress={vote}>
              {isOwnVote ? (
                <CenteringImage
                  source={require('../../../assets/icons/heart-primary.png')}
                  style={{
                    width: 40,
                    height: 36
                  }}
                >
                  <Votes>{votes.length}</Votes>
                </CenteringImage>
              ) : (
                <CenteringImage
                  source={require('../../../assets/icons/heart.png')}
                  style={{
                    width: 40,
                    height: 36
                  }}
                >
                  <Votes>{votes.length}</Votes>
                </CenteringImage>
              )}
            </VoteButton>
          )}
          {isWinner && (
            <Winner>
              <ProfileImage type={players[user]?.profilePic} size={60} />
              <VoteContainer>
                <CenteringImage
                  source={require('../../../assets/icons/heart-primary.png')}
                  style={{
                    width: 48,
                    height: 43
                  }}
                >
                  <FinalVotes>{votes.length}</FinalVotes>
                </CenteringImage>
              </VoteContainer>
            </Winner>
          )}
          <Container>
            <TouchableOpacity onPress={() => vote && vote()}>
              <TextColumn>
                <Nickname
                  fontSize={isWinner ? 20 : 16}
                  nickname={getAuthor()}
                  status={getStatus()}
                />
                {user === 'SYSTEM' ? (
                  <ValueIconContainer>
                    {proposal.type === 'TELL_ME_MORE' ? (
                      <Image
                        source={require('../../../assets/icons/tell_me_more.png')}
                        style={{ width: 20, height: 20 }}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/icons/rollback.png')}
                        style={{ width: 20, height: 20 }}
                      />
                    )}
                    <Value isWinner={isWinner} style={{ marginLeft: 6 }}>
                      {value}
                    </Value>
                  </ValueIconContainer>
                ) : (
                  <Value isWinner={isWinner}>{value}</Value>
                )}
              </TextColumn>
            </TouchableOpacity>
          </Container>
        </>
      );
    }
  )
);
