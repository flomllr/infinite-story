import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular
  }
});

const Loading: React.SFC<{}> = props => (
  <View style={styles.container}>
    <Text>Loading...</Text>
  </View>
);

Loading.defaultProps = {};

export default Loading;
