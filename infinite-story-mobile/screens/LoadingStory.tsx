import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, fonts } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: colors.defaultText,
    fontSize: 20,
    width: '80%',
    fontFamily: fonts.regular
  },
  bold: {
    fontFamily: fonts.semiBold
  },
  hint: {
    color: colors.lightgray,
    fontSize: 16
  },
  fire: {
    width: 350,
    height: 350
  }
});

interface Props {
  partyMode?: boolean;
}

const LoadingStory = ({ partyMode }: Props) => (
  <View style={styles.container}>
    <Text style={[styles.text, styles.bold]}>
      We are creating the adventure...
    </Text>
    <Text style={[styles.text]}>Meanwhile, rest next to the camp fire.</Text>
    <Image style={styles.fire} source={require('../assets/fire.gif')} />
    {!partyMode && (
      <Text style={[styles.text, styles.hint]}>
        Hint: rollback to any point in your story by long-pressing the text
        passage
      </Text>
    )}
  </View>
);

export default LoadingStory;
