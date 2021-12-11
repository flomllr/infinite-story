import React from 'react';
import { Proposal as ProposalData, Players } from '../types';
import { ContentWrapper, Content, Headline, Space } from '../../shared';
import { Timer } from './Timer';
import { Proposal } from './Proposal';

interface Props {
  proposals: ProposalData[];
  players: Players;
}

export const Tie = ({ proposals, players }: Props) => {
  console.log('Winning proposals', proposals);

  return (
    <ContentWrapper>
      <Timer overtimeText={'Waiting'} />
      <Content>
        <Headline>Let the coin decide...</Headline>
        <Space h={'20px'} />
        {proposals.map((proposal, index) => (
          <>
            <Proposal key={index} proposal={proposal} players={players} />
            <Space h={'20px'} />
          </>
        ))}
      </Content>
    </ContentWrapper>
  );
};
