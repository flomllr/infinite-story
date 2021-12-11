import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Coin } from './Coin';
import { DefaultText } from './shared';
import { fonts } from '../theme';
import { Animated, Easing } from 'react-native';
import { usePrevious } from '../hooks/usePrevious';

const Wrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PriceText = styled(DefaultText)<{ size: number }>`
  ${p => (p.size ? `font-size: ${p.size}px;` : '')}
  font-family: ${fonts.semiBold};
`;

interface Props {
  size: number;
  amount: number;
  style?: Record<string, any>;
  pad?: number;
}

export const AnimatedGoldAmount = ({ size, amount, style, pad }: Props) => {
  const prevGold = usePrevious(amount);
  const [currentGold] = useState(new Animated.Value(prevGold || amount)); // Initial value for left: 3

  React.useEffect(() => {
    Animated.timing(currentGold, {
      toValue: amount,
      easing: Easing.out(Easing.cubic),
      duration: 4000
    }).start();
  }, [amount]);
  return (
    <GoldAmountAnimation
      size={size}
      amount={currentGold}
      style={style}
      pad={pad}
    />
  );
};

export const GoldAmount = ({ size, amount, style, pad }: Props) => {
  const createPad = len => (len > 0 ? new Array(len + 1).join('') : '');

  const amountString = amount.toString();
  const padAmount = pad - amountString.length;

  return (
    <Wrapper style={style}>
      <Coin size={size * 1.1} />
      <PriceText size={size}>
        {createPad(padAmount)}
        {amountString}
      </PriceText>
    </Wrapper>
  );
};

class GoldAmountClass extends React.Component {
  render() {
    const p = { ...this.props } as Props;
    return (
      <GoldAmount
        size={p.size}
        style={p.style}
        amount={Math.floor(p.amount)}
        pad={p.pad}
      />
    );
  }
}

const GoldAmountAnimation = Animated.createAnimatedComponent(GoldAmountClass);
