import React from 'react';
import styled from 'styled-components/native';
import { Image, Text } from 'react-native';
import { DefaultText } from '../../shared';
import { colors } from '../../../theme';
import { JitsiMeetStatus } from '../../../types';
import { VoiceCallStatus } from '../types';
import { JitsiMeetView } from 'react-native-jitsi-meet';
import PixelBorderBox from '../../PixelBorderBox';

const Wrapper = styled.SafeAreaView`
  flex: 1;
  flex-direction: row;
  background-color: ${colors.background};
`;

const VoiceCallButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 2px 5px;
`;

interface Props {
  voiceCallStatus: VoiceCallStatus;
  jitsiMeetStatus: JitsiMeetStatus;
  setConferenceStatus: (status: JitsiMeetStatus) => void;
  joinJitsiMeetCall: () => void;
  dropJitsiMeetCall: () => void;
  onJitsiMeetJoin: () => void;
}

interface VoiceCallButtonProps {
  voiceCallStatus: VoiceCallStatus;
  jitsiMeetStatus: JitsiMeetStatus;
  joinJitsiMeetCall: () => void;
  dropJitsiMeetCall: () => void;
  onJitsiMeetJoin: () => void;
}

const VoiceCallButton = ({
  voiceCallStatus,
  jitsiMeetStatus,
  joinJitsiMeetCall,
  dropJitsiMeetCall,
  onJitsiMeetJoin
}: VoiceCallButtonProps) => {
  return (
    <PixelBorderBox flex={false}>
      <VoiceCallButtonContainer
        onPress={() => {
          if (jitsiMeetStatus === JitsiMeetStatus.JOINING) {
            return;
          }
          const join = () => {
            joinJitsiMeetCall();
            onJitsiMeetJoin();
          };
          jitsiMeetStatus === JitsiMeetStatus.IN_CALL
            ? dropJitsiMeetCall()
            : join();
        }}
      >
        <Image
          source={require('../../../assets/icons/adventurer.png')}
          style={{
            width: 8 * 1.2,
            height: 11 * 1.2,
            marginRight: 3,
            marginTop: 2
          }}
        />
        <DefaultText style={{ marginRight: 6 }}>
          {voiceCallStatus.playersInCall.length}
        </DefaultText>
        <DefaultText
          style={{
            fontSize: 11,
            color:
              jitsiMeetStatus === JitsiMeetStatus.IN_CALL
                ? colors.primary
                : colors.greyed
          }}
        >
          {jitsiMeetStatus === JitsiMeetStatus.IN_CALL
            ? 'End call'
            : jitsiMeetStatus === JitsiMeetStatus.JOINING
            ? 'Connecting'
            : 'Join call'}
        </DefaultText>
      </VoiceCallButtonContainer>
    </PixelBorderBox>
  );
};

export const VoiceCallWidget = ({
  voiceCallStatus,
  jitsiMeetStatus,
  setConferenceStatus,
  joinJitsiMeetCall,
  dropJitsiMeetCall,
  onJitsiMeetJoin
}: Props) => {
  if (!voiceCallStatus) {
    return <Text></Text>;
  }
  return (
    <Wrapper>
      <VoiceCallButton
        voiceCallStatus={voiceCallStatus}
        jitsiMeetStatus={jitsiMeetStatus}
        joinJitsiMeetCall={joinJitsiMeetCall}
        dropJitsiMeetCall={dropJitsiMeetCall}
        onJitsiMeetJoin={onJitsiMeetJoin}
      />
      <JitsiMeetView
        onConferenceTerminated={() =>
          setConferenceStatus(JitsiMeetStatus.NOT_JOINED)
        }
        onConferenceJoined={() => setConferenceStatus(JitsiMeetStatus.IN_CALL)}
        onConferenceWillJoin={() =>
          setConferenceStatus(JitsiMeetStatus.JOINING)
        }
        style={{
          flex: 1,
          height: '1%',
          width: '1%',
          opacity: 0
        }}
      />
    </Wrapper>
  );
};
