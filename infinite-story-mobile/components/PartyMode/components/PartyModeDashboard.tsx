import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../../../theme';
import { inject, observer } from 'mobx-react';
import MainStore from '../../../mobx/mainStore';
import { Proposing } from './Proposing';
import { Voting } from './Voting';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PartyModeState, Proposal as ProposalData, GameState } from '../types';
import ControlService from '../../../services/ControlService';
import { Result } from './Result';
import { Tie } from './Tie';
import { Reading } from './Reading';
import { Joining } from './Joining';
import { EndScreen } from './EndScreen';
import { OrnamentBox } from './OrnamentBox';
import { useEffect } from 'react';

interface Props {
  screen: GameState;
  mainStore?: MainStore;
  state: PartyModeState;
}

export const Wrapper = styled.View<{ screen: string }>`
  flex-grow: 1;
  ${p => (p.screen === 'PROPOSING' ? 'flex-basis: 70px;' : '')};
  background-color: ${colors.background};
  padding: 5px;
`;

export const Inner = styled.View<{ screen: string }>`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const MainContent = styled.View<{ screen: string }>`
  flex: 1;
  width: ${p => (p.screen === 'READING' ? '100%' : '80%')};
`;

const SmallWrapper = styled.View`
  height: 60px;
  background-color: ${colors.background};
  padding: 5px;
`;

export const PartyModeDashboard = inject('mainStore')(
  observer(({ screen, mainStore, state }: Props) => {
    useEffect(() => {
      console.log('Remounting dashboard');
    }, []);

    // console.log('Rendering Dashboard');
    const ownProposalIsSubmitted = state?.playersReady.includes(
      mainStore.userId
    );

    const winningProposal = state.proposals?.reduce<ProposalData>(
      (best, current) =>
        !best || best.votes.length < current.votes.length ? current : best,
      null
    );

    const screens = {
      JOINING: (
        <Joining
          userId={mainStore.userId}
          onStart={ControlService.startPartyGame}
          players={state.players}
          joinCode={state.joinCode}
          isOwner={mainStore.userId === state?.owner}
          needTutorial={!mainStore.partyGameTutorialDone}
        />
      ),
      PROPOSING: !ownProposalIsSubmitted ? (
        <Proposing
          onSubmit={ControlService.submitProposal}
          onPass={ControlService.passProposal}
          actionType={mainStore?.actionType}
        />
      ) : (
        <Voting proposals={state.proposals} players={state.players} />
      ),
      VOTING: (
        <Voting
          vote={ControlService.voteForProposal}
          proposals={state.proposals}
          players={state.players}
        />
      ),
      TIE: <Tie proposals={state.proposals} players={state.players} />,
      RESULT: (
        <Result
          proposal={winningProposal}
          players={state.players}
          votingStats={state.votingStats}
        />
      ),
      READING: (
        <Reading
          players={state.players}
          playersReady={state?.playersReady}
          setReady={ControlService.setPlayerReady}
        />
      ),
      ENDING: (
        <EndScreen achievements={state.achievements} players={state.players} />
      )
    };

    return screen === 'READING' ? (
      <SmallWrapper>
        <Inner>
          <MainContent screen={screen}>{screens[screen]}</MainContent>
        </Inner>
      </SmallWrapper>
    ) : (
      <Wrapper screen={screen}>
        <OrnamentBox>
          <Inner>
            <MainContent screen={screen}>{screens[screen]}</MainContent>
          </Inner>
        </OrnamentBox>
      </Wrapper>
    );
  })
);
