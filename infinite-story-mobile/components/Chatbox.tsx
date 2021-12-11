import React from 'react';
import { colors, fonts } from '../theme';

import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { Platform } from '@unimodules/core';
import MainStore from '../mobx/mainStore';
import PixelBorderBox from './PixelBorderBox';
import PixelButton from './PixelButton';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.chatboxBackground,
    margin: 5
  },
  input: {
    paddingRight: 20,
    paddingLeft: 10,
    fontSize: 15,
    flex: 1,
    color: colors.chatboxText,
    fontFamily: fonts.regular
  },
  sendIcon: {
    color: colors.chatboxSendIcon,
    fontSize: 20,
    fontFamily: fonts.bold,
    paddingHorizontal: 7
  },
  actDo: {
    color: colors.actDo
  },
  actSay: {
    color: colors.actSay
  },
  toggleButton: {
    borderRadius: 50,
    alignSelf: 'center',
    padding: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toggleButtonText: {
    position: 'absolute',
    color: colors.chatboxSendIcon,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    paddingLeft: 35
  },
  sendButtonSay: {
    backgroundColor: colors.actSay
  },
  outerMargin: {
    marginVertical: 10,
    marginHorizontal: 20
  }
});

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  inputDisabled?: boolean;
  hideSubmit?: boolean;
  mainStore?: MainStore;
}

const Chatbox = ({
  value,
  onChangeText,
  onSubmit,
  inputDisabled,
  hideSubmit,
  mainStore
}: Props) => {
  const actionDo = mainStore?.actionType === 'ACT_DO';

  const buttonColor = inputDisabled
    ? colors.buttonDisabled
    : actionDo
    ? colors.actDo
    : colors.actSay;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.outerMargin}>
        <PixelBorderBox flex={false}>
          <View style={styles.container}>
            <TouchableOpacity
              style={[styles.toggleButton]}
              onPress={() => mainStore?.toggleActionType()}
              disabled={inputDisabled}
            >
              <Text
                style={[
                  styles.input,
                  styles.toggleButtonText,
                  actionDo ? styles.actDo : styles.actSay
                ]}
              >
                {actionDo ? 'Do:' : 'Say:'}
              </Text>
            </TouchableOpacity>
            <TextInput
              editable={!inputDisabled}
              value={value}
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholder={
                inputDisabled
                  ? 'Action being executed...'
                  : actionDo
                  ? 'Next action?'
                  : 'What do you say?'
              }
              placeholderTextColor={colors.chatboxPlaceholder}
              onChangeText={onChangeText}
              blurOnSubmit={false}
              onSubmitEditing={onSubmit}
            />
            {!hideSubmit && (
              <PixelButton
                onPress={onSubmit}
                disabled={inputDisabled}
                innerColor={buttonColor}
                outerColor={buttonColor}
                backgroundColor={buttonColor}
              >
                <Text style={[styles.sendIcon]}>&gt;</Text>
              </PixelButton>
            )}
          </View>
        </PixelBorderBox>
      </View>
    </KeyboardAvoidingView>
  );
};

export default inject('mainStore')(observer(Chatbox));
