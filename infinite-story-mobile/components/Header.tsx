import React, { useContext } from 'react';
import { NavigationContext } from 'react-navigation';
import { colors, fonts } from '../theme';
import { Platform } from '@unimodules/core';
import styled from 'styled-components/native';

interface Props {
  leftButton?: any;
  rightButtons?: any[];
  leftAction?: () => void;
  flexRight?: number;
}

const Left = styled.View`
  flex: 1;
  justify-content: center;
  align-items: flex-start;
  padding-left: 20px;
`;

const Right = styled.View<{ flex?: number }>`
  flex: ${p => p.flex || 1};
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
`;

const Container = styled.View`
  display: flex;
  flex-direction: row;
  height: 50px;
  margin-top: ${Platform.OS === 'android' ? 25 : 0}px;
`;

const ButtonContainer = styled.TouchableOpacity`
  flex: 1;
  align-items: flex-end;
  justify-content: center;
`;

const ButtonText = styled.Text`
  color: ${colors.defaultText};
  font-family: ${fonts.regular};
  font-size: 30px;
`;

const Header = ({ leftButton, rightButtons, leftAction, flexRight }: Props) => {
  const navigation = useContext(NavigationContext);

  return (
    <Container>
      <Left>
        {leftButton || (
          <ButtonContainer
            onPress={() => {
              leftAction ? leftAction() : navigation.goBack();
            }}
          >
            <ButtonText>&lt;</ButtonText>
          </ButtonContainer>
        )}
      </Left>
      <Right flex={flexRight}>{rightButtons}</Right>
    </Container>
  );
};

export default Header;
