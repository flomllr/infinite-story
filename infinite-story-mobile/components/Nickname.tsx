import React from 'react';
import styled from 'styled-components/native';
import { colors, fonts } from '../theme';
import { PlayerStatus } from '../types';

const PlayerNickName = styled.Text`
  color: ${props => {
    const s: PlayerStatus = props.status;
    switch (s) {
      case PlayerStatus.PEASANT:
        return colors.defaultText;
      case PlayerStatus.INFINITE:
        return colors.primary;
      case PlayerStatus.VIP:
        return colors.gold;
      default:
        return colors.defaultText;
    }
  }};
  font-family: ${fonts.regular};
  font-size: ${props => (props.fontSize ? props.fontSize : 19)}px;
`;

interface Props {
  status: PlayerStatus;
  nickname: string;
  fontSize?: number;
}

export const Nickname = ({ status, nickname, fontSize }: Props) => (
  <PlayerNickName numberOfLines={1} status={status} fontSize={fontSize}>
    {nickname ? nickname : 'Anonymous Player'}
  </PlayerNickName>
);
