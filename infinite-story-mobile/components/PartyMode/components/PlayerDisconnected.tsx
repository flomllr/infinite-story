import React from 'react';
import styled from 'styled-components/native';
import { Headline, Space } from '../../shared';
import { colors } from '../../../theme';
import { OrnamentBox } from './OrnamentBox';
import PixelButton from '../../PixelButton';
import ControlService from '../../../services/ControlService';
import { useNavigation } from '../../../hooks/useNavigation';

const Wrapper = styled.SafeAreaView`
  background-color: ${colors.background};
  flex: 1;
`;

const Inner = styled.View`
  background-color: ${colors.background};
  flex: 1;
  padding: 20px;
  justify-content: center;
  align-items: center;
`;

interface Props {
  rejoin: () => void;
  banned: boolean;
}

export const PlayerDisconnected = ({ rejoin, banned }: Props) => {
  const { navigation } = useNavigation();
  return (
    <Wrapper>
      <OrnamentBox>
        <Inner>
          <Headline>
            {banned
              ? 'You have been banned from this game'
              : 'You have been disconnected'}
          </Headline>
          <Space h={'20px'}></Space>
          {!banned ? (
            <PixelButton label="Rejoin" onPress={() => rejoin()} />
          ) : (
            <PixelButton
              label="Go back to main menu"
              onPress={() => {
                ControlService.dropJitsiMeetCall();
                ControlService.leavePartyGame();
                navigation.goBack();
              }}
            />
          )}
        </Inner>
      </OrnamentBox>
    </Wrapper>
  );
};
