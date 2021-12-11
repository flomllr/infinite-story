import React, { useState, useEffect } from 'react';
import { Headline, Space, CenteredContent } from '../../shared';
import { Timer } from './Timer';
import Chatbox from '../../Chatbox';
import PixelButton from '../../PixelButton';
import styled from 'styled-components/native';

const ButtonRow = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const ContentWrapper = styled.ScrollView`
  flex: 1;
`;

interface Props {
  onSubmit: (text: string) => void;
  onPass: () => void;
  actionType: string;
}

export const Proposing = ({ onSubmit, actionType, onPass }: Props) => {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const actDo = actionType === 'ACT_DO';

  const handleSubmit = () => (input ? onSubmit(input) : onPass());

  useEffect(() => {
    console.log('Remounting proposing');
  }, []);

  return (
    <ContentWrapper>
      <Timer
        overtimeText={'Waiting'}
        plain
        style={{
          justifyContent: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 10,
          paddingBottom: 10
        }}
      />
      <CenteredContent>
        <Headline>Propose an action</Headline>
        <Space h={'10px'} />
        <Chatbox
          value={input}
          onChangeText={text => setInput(text)}
          onSubmit={handleSubmit}
          hideSubmit
        />
        <Space h={'10px'} />
        <ButtonRow>
          <PixelButton
            onPress={() => {
              onPass();
              setSubmitted(true);
            }}
            label={'Pass'}
            innerColor={'rgba(255,255,255,0.8)'}
            outerColor={'rgba(255,255,255,0.4)'}
            disabled={submitted}
          />
          <Space w={'20px'} />
          <PixelButton
            onPress={() => {
              handleSubmit();
              setSubmitted(true);
            }}
            label={'Submit'}
            innerColor={
              actDo ? 'rgba(244,111,111,1.0)' : 'rgba(148, 206, 134, 1.0)'
            }
            outerColor={
              actDo ? 'rgba(244,111,111,0.5)' : 'rgba(148, 206, 134, 0.5)'
            }
            disabled={submitted}
          />
        </ButtonRow>
      </CenteredContent>
    </ContentWrapper>
  );
};
