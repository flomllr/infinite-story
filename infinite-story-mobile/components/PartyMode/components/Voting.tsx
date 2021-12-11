import React from 'react';
import { ContentWrapper, Headline, Space, Content } from '../../shared';
import { Timer } from './Timer';
import { Proposal as ProposalData, Players } from '../types';
import styled from 'styled-components/native';
import { Proposal } from './Proposal';
import { ScrollView, View } from 'react-native';

interface Props {
  proposals: ProposalData[];
  players: Players;
  vote?: (index: number) => void;
}

const ProposalList = styled.View`
  display: flex;
  justify-content: center;
`;

export const Voting = ({ proposals, vote, players }: Props) => {
  const proposalItems = proposals.map((proposal, index) => {
    return (
      <View
        key={index}
        style={{ flex: 1, flexDirection: 'row', marginBottom: 18 }}
      >
        <Proposal
          key={index}
          players={players}
          proposal={proposal}
          anonymous={true}
          vote={vote ? () => vote(index) : null}
        />
      </View>
    );
  });

  return (
    <ContentWrapper>
      <Timer overtimeText={'Waiting'} />
      <Content>
        <Headline>
          {vote ? 'Choose your favorite' : 'Waiting for proposals...'}
        </Headline>
        <Space h={'5px'} />
        <ScrollView>
          <Space h={'15px'} />
          <ProposalList>{proposalItems}</ProposalList>
        </ScrollView>
      </Content>
    </ContentWrapper>
  );
};
