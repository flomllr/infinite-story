import React from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
`;

interface Props {
  children?: any;
}

export const Fullscreen = ({ children }: Props) => {
  return <Container>{children}</Container>;
};
