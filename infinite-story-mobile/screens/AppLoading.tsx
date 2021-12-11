import React, { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Linking
} from 'react-native';
import styled from 'styled-components/native';

import { colors, fonts, size } from '../theme';
import { inject, observer } from 'mobx-react';
import AutoHeightImage from '../components/AutoHeightImage';
import { Platform } from '@unimodules/core';
import MainStore from '../mobx/mainStore';
import { DefaultText, Headline, Space } from '../components/shared';
import { PlayerClass } from '../components/PlayerClass';

const Container = styled.View`
  background-color: ${colors.background};
  justify-content: flex-start;
  align-items: center;
  flex: 1;
  width: 100%;
  padding-left: 30px;
  padding-right: 30px;
`;

const LoadingTextContainer = styled.View`
  background-color: ${colors.background};
  width: 100%;
  align-items: flex-start;
  padding-left: 15px;
  padding-right: 15px;
`;

const LoadingText = styled(DefaultText)`
  font-size: 12px;
`;

const MainContainer = styled.SafeAreaView`
  background-color: ${colors.background};
  justify-content: flex-start;
  align-items: center;
  flex: 1;
  width: 100%;
`;

interface Props {
  mainStore?: MainStore;
}

const AppLoading = ({ mainStore }: Props) => {
  const [order, _] = useState(Math.random() > 0.5);
  const Justin = (
    <PlayerClass
      name={'Justin Glibert'}
      description={'Twitter: @justinglibert'}
      portrait={'alchemist'}
      onPress={() => Linking.openURL('https://www.twitter.com/justinglibert')}
    />
  );
  const Flo = (
    <PlayerClass
      name={'Florian Muller'}
      description={'Twitter: @florianmllr'}
      portrait={'elfling'}
      onPress={() => Linking.openURL('https://www.twitter.com/florianmllr')}
    />
  );
  return (
    <MainContainer>
      <ScrollView style={{ flex: 1, width: '100%' }}>
        <Container>
          <AutoHeightImage
            style={{
              marginTop: '20%'
            }}
            uri={require('../assets/title.png')}
            width={250}
          />
          <Headline>Made by:</Headline>
          <Space h={'20px'} />
          <View style={{ width: '100%' }}>
            {order ? (
              <>
                {Justin}
                <Space h={size.defaultSpaceBetween + 'px'} />
                {Flo}
              </>
            ) : (
              <>
                {Flo}
                <Space h={size.defaultSpaceBetween + 'px'} />
                {Justin}
              </>
            )}
          </View>
          <Space h={'30px'} />
          <LoadingTextContainer>
            {mainStore.appLoadingInfoArray.map(a => (
              <LoadingText key={Math.random()}>⎔ {a}</LoadingText>
            ))}
          </LoadingTextContainer>
        </Container>
      </ScrollView>
    </MainContainer>
  );
};

export default inject('mainStore')(observer(AppLoading));
