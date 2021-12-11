import React from 'react';
import styled from 'styled-components/native';
import { DefaultText } from '../../shared';
import { Image } from 'react-native';
import { useTimeLeft } from '../hooks/useTimeLeft';

const TimerContainer = styled.View<{ plain?: boolean }>`
  ${p =>
    p.plain
      ? ''
      : `
  justify-content: center;
  flex-direction: row;
  align-items: center;
  padding-top: 10px;
  margin-bottom: -20px;`}
`;

interface Props {
  overtimeText: string;
  plain?: boolean;
  style?: any;
}

export const Timer = ({ overtimeText, plain, style }: Props) => {
  const timeLeft = useTimeLeft();

  return (
    <TimerContainer plain={plain} style={style}>
      <Image
        source={require('../../../assets/icons/timer.png')}
        style={{ height: 28, width: 22, marginRight: 10 }}
      />
      <DefaultText>{timeLeft > 0 ? timeLeft + 's' : overtimeText}</DefaultText>
    </TimerContainer>
  );
};
