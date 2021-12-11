import React from 'react';
import { Image } from 'react-native';
import { Players, VoiceCallStatus } from '../types';
import styled from 'styled-components/native';
import { colors } from '../../../theme';
import { DefaultText, Space } from '../../shared';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { VoiceCallWidget } from './VoiceCall';
import { JitsiMeetStatus } from '../../../types';
import PixelButton from '../../PixelButton';

interface Props {
  gameId: string;
  players: Players;
  toast?: string;
  onEnd: () => void;
  isOwner: boolean;
  banned: boolean;
  ended: boolean;
  onJitsiMeetJoin: () => void;
  voiceCallStatus: VoiceCallStatus;
  jitsiMeetStatus: JitsiMeetStatus;
  setConferenceStatus: (status: JitsiMeetStatus) => void;
  joinJitsiMeetCall: () => void;
  dropJitsiMeetCall: () => void;
}

const Wrapper = styled.View`
  background-color: ${colors.background};
  flex-direction: row;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
`;

const End = styled(DefaultText)`
  font-size: 11px;
  color: ${colors.defaultText};
  padding: 5px;
`;

const Title = styled(DefaultText)`
  color: ${colors.lightgray};
  font-size: 12px;
`;

export const StatusBar = ({
  gameId,
  players,
  onEnd,
  isOwner,
  banned,
  ended,
  ...voiceCallProps
}: Props) => {
  const numPlayers = players ? Object.values(players).length : 0;
  return (
    <Wrapper>
      {!banned && <VoiceCallWidget {...voiceCallProps} />}
      <Image
        source={require('../../../assets/icons/key.png')}
        style={{
          width: 12 * 1.4,
          height: 7 * 1.4,
          marginRight: 6
        }}
      />
      <DefaultText>{gameId}</DefaultText>
      <Space w={'10px'}></Space>
      <Image
        source={require('../../../assets/icons/players.png')}
        style={{
          width: 8 * 1.4,
          height: 11 * 1.4,
          marginRight: 6
        }}
      />
      <DefaultText>{numPlayers}</DefaultText>
      <Space w={'10px'}></Space>
      {isOwner && !ended && (
        <PixelButton onPress={onEnd} primary>
          <End>End</End>
        </PixelButton>
      )}
    </Wrapper>
  );
};
