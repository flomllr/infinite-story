import React from 'react';
import { PartyModeState } from '../types';
import { useEffect } from 'react';
import { useTimeLeft } from '../hooks/useTimeLeft';
import ControlService from '../../../services/ControlService';
import { inject, observer } from 'mobx-react';
import MainStore from '../../../mobx/mainStore';
import { JitsiMeetStatus } from '../../../types';

interface Props {
  state: PartyModeState;
  setInactiveHost: (inactive: boolean) => void;
  mainStore?: MainStore;
}

const PING_INTERVAL = 3;

export const Heartbeat = inject('mainStore')(
  observer(({ state, setInactiveHost, mainStore }: Props) => {
    useEffect(() => {
      console.log('Remounting heartbear');
    }, []);

    const { nextStateRequested } = mainStore;
    const timeLeft = useTimeLeft();

    const ping = () => {
      if (!Object.keys(state.players).includes(mainStore.userId)) {
        return;
      }

      const shouldSendPing = timeLeft % PING_INTERVAL === 0;

      if (shouldSendPing) {
        ControlService.sendPing();
      }
    };

    const isHostInactive = () => {
      if (state) {
        let hostIsInactive;

        Object.entries(state.players).forEach(([id, { lastPing }]) => {
          if (id != mainStore.userId && id === state.owner) {
            hostIsInactive = Date.now() - lastPing > 5000 * PING_INTERVAL;
          }
        });

        return hostIsInactive;
      }
    };

    const detectInactiveHost = () => {
      const hostIsInactive = isHostInactive();
      if (hostIsInactive != null) {
        setInactiveHost(hostIsInactive);
      }
    };

    const kickInactivePlayers = () => {
      const ownPing = state?.players[mainStore.userId]?.lastPing;
      const ownInactive = Date.now() - ownPing > 3000 * PING_INTERVAL;

      if (mainStore.userId === state?.owner && !ownInactive) {
        Object.entries(state.players).forEach(([id, { lastPing }]) => {
          if (
            id != mainStore.userId &&
            Date.now() - lastPing > 8000 * PING_INTERVAL
          ) {
            ControlService.kickPlayer(id);
          }
        });
      }
    };

    const requestNextState = async () => {
      console.log(
        'Websocket state',
        mainStore.websocket.readyState,
        mainStore.websocket.readyState === mainStore.websocket.OPEN,
        nextStateRequested != state.currentState,
        state?.owner === mainStore.userId
      );

      const shouldRequestNextState =
        nextStateRequested != state.currentState &&
        state?.owner === mainStore.userId &&
        mainStore.websocket.readyState === mainStore.websocket.OPEN;

      console.log('Should request next state', shouldRequestNextState);

      if (shouldRequestNextState) {
        mainStore.setNextStateRequested(state.currentState);
        if (state.currentState === 'RESULT') {
          await ControlService.actPartyGame();
        } else {
          ControlService.nextGameState();
        }
      }
    };

    useEffect(() => {
      // In the ENDING state, the game has already been cleaned so sending pings is useless.
      if (state && state.currentState !== 'ENDING') {
        ping();

        if (
          !Object.keys(state.players).includes(mainStore.userId) &&
          mainStore.jitsiMeetStatus === JitsiMeetStatus.IN_CALL
        ) {
          ControlService.dropJitsiMeetCall();
        }

        kickInactivePlayers();
        detectInactiveHost();

        if (timeLeft < 0) {
          requestNextState();
        }
      }
    }, [timeLeft]);

    return <></>;
  })
);
