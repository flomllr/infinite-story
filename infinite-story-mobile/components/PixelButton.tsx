import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import PixelBorderBox from './PixelBorderBox';
import { colors, fonts } from '../theme';
import { ReactChildren } from 'react';
import { ReactChild } from 'react';

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignContent: 'center' },
  text: {
    color: colors.defaultText,
    padding: 10,
    fontFamily: fonts.semiBold,
    textAlign: 'center'
  },
  textDeactivated: {
    color: colors.lightgray
  }
});

interface Props {
  onPress?: () => any;
  label?: string;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  outerColor?: string;
  innerColor?: string;
  backgroundColor?: string;
  children?: ReactChild | ReactChildren;
  primary?: boolean;
}
const PixelButton = ({
  onPress,
  label,
  style,
  textStyle,
  disabled,
  outerColor,
  innerColor,
  backgroundColor,
  children,
  primary
}: Props) => (
  <TouchableOpacity
    disabled={disabled}
    onPress={() => {
      !disabled && onPress && onPress();
    }}
    style={[styles.container, style]}
  >
    <PixelBorderBox
      innerColor={primary ? 'rgba(244,111,111,1.0)' : innerColor}
      outerColor={primary ? 'rgba(244,111,111,0.5)' : outerColor}
      backgroundColor={backgroundColor}
      flex={false}
    >
      {label ? (
        <Text
          style={[
            styles.text,
            disabled ? styles.textDeactivated : undefined,
            textStyle
          ]}
        >
          {label}
        </Text>
      ) : (
        children
      )}
    </PixelBorderBox>
  </TouchableOpacity>
);

export default PixelButton;
