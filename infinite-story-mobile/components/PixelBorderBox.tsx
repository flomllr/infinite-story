import React, { ReactChild } from 'react';
import { colors } from '../theme';
import styled from 'styled-components/native';
import { ReactChildren } from 'react';
import { View } from 'react-native';

interface Props {
  children: ReactChild | ReactChildren;
  innerColor?: string;
  outerColor?: string;
  backgroundColor?: string;
  primary?: boolean;
  flex?: boolean;
}

const Box = styled.View<{ color: string; flex: boolean }>`
  ${p => (p.flex ? 'flex: 1;' : '')}
  border-left-width: 3px;
  border-right-width: 3px;
  border-left-color: ${p => (p.color ? p.color : colors.borderBoxOuter)};
  border-right-color: ${p => (p.color ? p.color : colors.borderBoxOuter)};
`;

const BoxInner = styled.View<{
  color: string;
  flex: boolean;
  backgroundColor: string;
}>`
  border-color: ${p => (p.color ? p.color : colors.borderBoxInner)};
  border-width: 3px;
  ${p => (p.flex ? 'flex: 1;' : '')}
  background-color: ${p =>
    p.backgroundColor ? p.backgroundColor : colors.background};
`;

const BoxContainerFlex = styled.View`
  flex: 1;
`;

const BorderTopBottom = styled.View<{ color: string }>`
  height: 3px;
  background-color: ${p => (p.color ? p.color : colors.borderBoxOuter)};
  margin: 0 3px;
`;

const PixelBorderBox = ({
  children,
  innerColor,
  outerColor,
  flex = true,
  backgroundColor,
  primary
}: Props) => {
  const Outer = flex ? BoxContainerFlex : View;

  const inner = primary ? 'rgba(244,111,111,1.0)' : innerColor;
  const outer = primary ? 'rgba(244,111,111,0.5)' : outerColor;

  return (
    <Outer>
      <BorderTopBottom color={outer} />

      <Box color={outer}>
        <BoxInner color={inner} backgroundColor={backgroundColor}>
          {children}
        </BoxInner>
      </Box>

      <BorderTopBottom color={outerColor} />
    </Outer>
  );
};

export default PixelBorderBox;
