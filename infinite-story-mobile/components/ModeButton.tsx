import React, { ReactChild } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AutoHeightImage from './AutoHeightImage';
import { colors, fonts } from '../theme';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    maxWidth: '80%'
  },
  textContainer: {
    paddingLeft: 20
  },
  title: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 16
  },
  description: {
    color: colors.greyed,
    fontFamily: fonts.regular,
    fontSize: 12
  }
});

interface Props {
  icon: string;
  title: string;
  children: ReactChild;
}

const ModeButton = ({ icon, children, title }: Props) => {
  return (
    <View style={styles.container}>
      <View>
        <AutoHeightImage width={70} uri={icon} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{children}</Text>
      </View>
    </View>
  );
};

export default ModeButton;
