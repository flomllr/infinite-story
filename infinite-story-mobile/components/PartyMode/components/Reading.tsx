import React from 'react';
import { DefaultText } from '../../shared';
import { Player } from '../types';
import { ProfileImage } from './ProfileImage';
import { Timer } from './Timer';
import styled from 'styled-components/native';
import { colors } from '../../../theme';
import { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import MainStore from '../../../mobx/mainStore';

const Button = styled.TouchableOpacity`
  padding-left: 20px;
`;

const ButtonText = styled(DefaultText)`
  color: ${colors.actDo};
`;

const Wrapper = styled.View`
  flex-direction: row;
  padding: 0 20px;
  justify-content: flex-start;
  align-items: center;
`;

const TimerWrapper = styled.View``;

const ProfileImageWrapper = styled.View`
  flex-direction: row;
  flex: 1;
  justify-content: flex-start;
  align-items: center;
`;

interface Props {
  players: {
    [id: string]: Player;
  };
  playersReady: string[];
  setReady: () => void;
  mainStore?: MainStore;
}

export const Reading = inject('mainStore')(
  observer(({ players, playersReady, setReady, mainStore }: Props) => {
    useEffect(() => {
      mainStore.setActPartyGameError(false);
    }, []);

    return (
      <Wrapper>
        <TimerWrapper>
          <Timer overtimeText={'0s'} plain />
        </TimerWrapper>
        <ProfileImageWrapper>
          {playersReady.slice(0, 4).map((player, index) => (
            <ProfileImage
              key={index}
              type={players[player]?.profilePic}
              customMargin={'0px 5px 0px 0px'}
              size={40}
            />
          ))}
          {playersReady.length > 4 && (
            <DefaultText> +{playersReady.length - 4}</DefaultText>
          )}
        </ProfileImageWrapper>
        <Button
          onPress={setReady}
          disabled={playersReady.includes(mainStore.userId)}
        >
          <ButtonText>Done{'\n'}reading</ButtonText>
        </Button>
      </Wrapper>
    );
  })
);
