import React from 'react';
import PixelBorderBox from './PixelBorderBox';
import styled from 'styled-components/native';
import { colors, fonts } from '../theme';

const StyledTextInput = styled.TextInput`
  color: ${colors.defaultText};
  font-family: ${fonts.regular};
  margin: 0 10px;
`;

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  keyboardType?: 'number-pad' | 'default';
  style?: any;
  focus?: boolean;
}

export const PixelInput = ({
  placeholder,
  value,
  onChangeText,
  onSubmit,
  style,
  focus
}: Props) => (
  <PixelBorderBox flex={false}>
    <StyledTextInput
      style={style}
      placeholder={placeholder}
      placeholderTextColor={colors.lightgray}
      value={value}
      onChangeText={onChangeText}
      underlineColorAndroid="transparent"
      blurOnSubmit={false}
      onSubmitEditing={onSubmit}
      focus={focus}
    />
  </PixelBorderBox>
);
