import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import ControlService from '../services/ControlService';
import { inject, observer } from 'mobx-react';
import { fonts, colors } from '../theme';
import MainStore from '../mobx/mainStore';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontFamily: fonts.regular,
    color: colors.lightgray,
    fontSize: 14,
    padding: 5,
    marginTop: 0
  },
  textDisabled: {
    fontFamily: fonts.regular,
    color: colors.greyed,
    fontSize: 14,
    padding: 5,
    marginTop: 0
  }
});

interface Props {
  mainStore?: MainStore;
}

const TellMeMore = ({ mainStore }: Props) => (
  <TouchableOpacity
    style={styles.container}
    onPress={() => ControlService.act('')}
    disabled={mainStore.infering}
  >
    <Text style={mainStore.infering ? styles.textDisabled : styles.text}>
      Tell me more
    </Text>
  </TouchableOpacity>
);
export default inject('mainStore')(observer(TellMeMore));
