/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect, useState, useMemo } from 'react';
import { View, Platform } from 'react-native';
import { PartyModeDashboard } from './components/PartyModeDashboard';
import Story from '../Story';
import styled from 'styled-components/native';
import { colors } from '../../theme';
import { PartyModeState } from './types';
import { inject, observer } from 'mobx-react';
import MainStore from '../../mobx/mainStore';
import ControlService from '../../services/ControlService';
import { StartPartyMode } from './components/StartPartyMode';
import PixelButton from '../PixelButton';
import { StatusBar } from './components/StatusBar';
import Header from '../Header';
import Toast from 'react-native-root-toast';
import { DefaultText, Headline, Space, MarginWrapper } from '../shared';
import { withNavigation } from 'react-navigation';
import LoadingStory from '../../screens/LoadingStory';
import { PlayerStatus } from '../../types';
import { HostDisconnected } from './components/HostDisconnected';
import ErrorService from '../../services/ErrorService';
import { PlayerDisconnected } from './components/PlayerDisconnected';
import { useContext } from 'react';
import { TimerContext, TimerProvider } from './components/TimerContext';
import { Heartbeat } from './components/Heartbeat';
import { useNavigation } from '../../hooks/useNavigation';

const state: PartyModeState = {
  currentState: 'JOINING', //'PROPOSING',
  owner: 'c33e870a-2968-4f6e-ae4c-610255bca031',
  joinCode: 'HGJK',
  bannedPlayers: [],
  voiceCallStatus: {
    playersInCall: [],
    roomUrl: 'https://meet.jit.si/MunicipalElectionsCriticizeBelow'
  },
  storyBits: [
    {
      payload: {
        class: 'noble',
        location: 'Larion',
        name: 'Jon'
      },
      type: 'ORIGIN'
    },
    {
      payload:
        'You are Jon, a noble living in the kingdom of Larion. You have a pouch of gold and a small dagger. You are awakened by one of your servants who tells you that your keep is under attack. You look out the window and see a horde of orcs charging towards your door.\n\n"Run!" you shout to your servant. "I\'ll hold them off".\n\nThe next morning, you wake up with a heavy heart. Your servant has been killed, along with several other soldiers.',
      type: 'TEXT'
    },
    {
      payload: 'Go to the forest',
      type: 'ACT_DO'
    },
    {
      payload:
        "You rush back to the forest where you find the orcs attacking. They are so numerous that it's almost impossible to fight them all. You can't even hope to win if they don't stop attacking you immediately.",
      type: 'TEXT'
    },
    {
      payload: {
        firstVisit: true,
        location: 'forest',
        seed: 3
      },
      type: 'LOCATION'
    }
  ],
  untilNextState: Date.now(),
  players: {
    'c33e870a-2968-4f6e-ae4c-610255bca031': {
      nickname: 'justing',
      profilePic: 'elf',
      status: PlayerStatus.INFINITE,
      lastPing: Date.now()
    },
    '1212112': {
      nickname: 'flo',
      profilePic: 'peasant',
      status: PlayerStatus.VIP,
      lastPing: Date.now()
    },
    '1212132': {
      nickname: 'flo',
      profilePic: 'peasant',
      status: PlayerStatus.VIP,
      lastPing: Date.now()
    },
    '1212114': {
      nickname: 'flo',
      profilePic: 'peasant',
      status: PlayerStatus.VIP,
      lastPing: Date.now()
    },
    '1212s112': {
      nickname: 'flo',
      profilePic: 'peasant',
      status: PlayerStatus.VIP,
      lastPing: Date.now()
    },
    '12122112': {
      nickname: 'flo',
      profilePic: 'peasant',
      status: PlayerStatus.VIP,
      lastPing: Date.now()
    },
    '12121212': {
      nickname: 'flo',
      profilePic: 'peasant',
      status: PlayerStatus.VIP,
      lastPing: Date.now()
    },
    '12121312': {
      nickname: 'flo',
      profilePic: 'peasant',
      status: PlayerStatus.VIP,
      lastPing: Date.now()
    }
  },
  // players: {},
  playersReady: ['121212', '121212', '121212', '121212', '121212'], //Players are ready in three screens: Vote, Propose, Read
  proposals: [
    {
      user: 'SYSTEM',
      proposal: {
        type: 'TELL_ME_MORE'
      },
      votes: [
        '121212',
        '232323' //add an extra empty vote with id "TIE" when we tie stuff. The winning action is rendered on screen based on how many vote it has
      ]
    },
    {
      user: 'SYSTEM',
      proposal: {
        type: 'ROLLBACK'
      },
      votes: ['121212']
    },
    {
      user: '121212',
      proposal: {
        type: 'ACT_DO',
        payload:
          'Start a rebellion Start a rebellion Start a rebellion Start a rebellion Start a rebellion Start a rebellion'
      },
      votes: []
    }
  ],
  achievements: {},
  votingStats: {
    '121212': 3,
    '1212112': 1
  }
};

interface Props {
  mainStore?: MainStore;
}

const PartyModeScreen = inject('mainStore')(
  observer(({ mainStore }: Props) => {
    const { navigation } = useNavigation();
    useEffect(() => {
      console.log('Remounting PartyModeScreen');
    }, []);

    const { partyModeState: state } = mainStore;
    const { setEndTime } = useContext(TimerContext);

    useEffect(() => {
      if (state?.untilNextState) {
        setEndTime(state.untilNextState);
      }
    }, [state?.untilNextState]);

    const [loading, setLoading] = useState(false);
    const [inactiveHost, setInactiveHost] = useState(false);

    const joinGame = async (gameId: string) => {
      setLoading(true);
      await ControlService.joinPartyGame(gameId, mainStore.profilePicture);
      setLoading(false);
    };

    const leaveGame = () => {
      ControlService.leavePartyGame();
    };

    const createGame = async ({
      protagonistClass,
      protagonistName,
      profilePic,
      marketplaceItemId,
      promptId
    }: {
      protagonistClass?: string;
      protagonistName?: string;
      profilePic: string;
      marketplaceItemId?: number;
      promptId?: number;
    }) => {
      console.log(
        'Create hame in party mode',
        protagonistClass,
        protagonistName,
        profilePic,
        marketplaceItemId,
        promptId
      );
      setLoading(true);
      const { code: gameId, error } = await ControlService.createPartyGame({
        playerClass: protagonistClass,
        playerName: protagonistName,
        marketplaceItemId,
        promptId
      });
      if (error) {
        setLoading(false);
        ErrorService.uncriticalError(
          'We could not create your Party Game. Please try again.',
          7000
        );
      } else {
        mainStore.setProfilePicture(profilePic);
        await ControlService.joinPartyGame(gameId, profilePic);
        setLoading(false);
      }
    };

    const statusBar = state && (
      <StatusBar
        onJitsiMeetJoin={() => null}
        ended={state.currentState === 'ENDING'}
        players={state.players}
        gameId={state.joinCode}
        banned={state.bannedPlayers?.includes(mainStore.userId)}
        onEnd={() => {
          ControlService.openModal(
            <ModalWrapper>
              <Headline>End the Game?</Headline>
              <Space h={'15px'} />
              <DefaultText>
                Ending the game will wrap up the story, compute and show the
                players&apos; achievements, and archive the story into the
                players&apos; history.
              </DefaultText>
              <Space h={'15px'} />
              <View>
                <PixelButton
                  primary
                  onPress={() => {
                    ControlService.endPartyGame();
                    ControlService.closeModal();
                  }}
                  label={'Understood'}
                />
                <Space h={'10px'} />
                <PixelButton
                  onPress={() => {
                    ControlService.closeModal();
                  }}
                  label={'Nevermind'}
                />
              </View>
            </ModalWrapper>
          );
        }}
        isOwner={state?.owner === mainStore.userId}
        voiceCallStatus={state.voiceCallStatus}
        dropJitsiMeetCall={() => ControlService.dropJitsiMeetCall()}
        joinJitsiMeetCall={() =>
          ControlService.joinJitsiMeetCall(state.voiceCallStatus.roomUrl)
        }
        jitsiMeetStatus={mainStore.jitsiMeetStatus}
        setConferenceStatus={s => ControlService.setJitsiMeetStatus(s)}
      />
    );

    const header = (
      <Header
        flexRight={10}
        leftAction={() => {
          ControlService.leavePartyGame();
          navigation.goBack();
        }}
        rightButtons={[statusBar]}
      />
    );

    const getContent = () => {
      if (!mainStore.gameId) {
        return (
          <StartPartyMode
            createGame={createGame}
            joinGame={joinGame}
            nickname={mainStore.nickname}
            status={mainStore.playerStatus}
          />
        );
      }

      if (inactiveHost) {
        return <HostDisconnected />;
      }

      if (state && state.players && !state.players[mainStore.userId]) {
        return (
          <PlayerDisconnected
            banned={state?.bannedPlayers.includes(mainStore.userId)}
            rejoin={() => joinGame(mainStore.gameId)}
          />
        );
      }

      return state ? (
        <>
          <Toast
            containerStyle={{ marginTop: 25, zIndex: 9999 }}
            visible={!!mainStore.partyGameToast}
            position={Toast.positions.TOP}
            backgroundColor={colors.toastBackground}
            opacity={1}
          >
            <DefaultText>{mainStore.partyGameToast}</DefaultText>
          </Toast>
          {state.currentState !== 'JOINING' && state.currentState !== 'ENDING' && (
            <Flex flex={1.3}>
              <Story items={state.storyBits} />
            </Flex>
          )}
          <PartyModeDashboard screen={state.currentState} state={state} />
        </>
      ) : (
        <>
          <PixelButton
            label="Rejoin"
            onPress={() => joinGame(mainStore.gameId)}
          />
          <PixelButton label="Leave" onPress={leaveGame} />
        </>
      );
    };

    if (loading) {
      return <LoadingStory partyMode />;
    }

    return (
      <Wrapper>
        <Heartbeat state={state} setInactiveHost={setInactiveHost} />
        {header}
        <KeyboardView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' && state ? 'padding' : null}
        >
          {getContent()}
        </KeyboardView>
      </Wrapper>
    );
  })
);

const KeyboardView = styled.KeyboardAvoidingView`
  flex: 1;
`;

const Wrapper = styled.SafeAreaView`
  flex: 1;
  background-color: ${colors.background};
`;

const Flex = styled.View<{ flex?: number }>`
  flex: ${p => p.flex || '1'};
`;

const ModalWrapper = styled.View`
  padding: 20px;
`;

export const PartyMode = (props: Props) => (
  <TimerProvider>
    <PartyModeScreen {...props} />
  </TimerProvider>
);
