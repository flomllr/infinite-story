import React, { ReactChild } from 'react';
import styled from 'styled-components/native';
import { Headline, Space, DefaultText } from '../../shared';
import { colors } from '../../../theme';
import { OrnamentBox } from './OrnamentBox';

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

export const HostDisconnected = () => (
  <Wrapper>
    <OrnamentBox>
      <Inner>
        <Headline>The host has disconnected</Headline>
        <Space h={'20px'}></Space>
        <DefaultText>Please wait for the host to come back.</DefaultText>
      </Inner>
    </OrnamentBox>
  </Wrapper>
);
