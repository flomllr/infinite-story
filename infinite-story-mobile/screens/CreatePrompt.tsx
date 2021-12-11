import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import styled from 'styled-components/native';
import { inject, observer } from 'mobx-react';
import { colors, fonts } from '../theme';
import Header from '../components/Header';
import PropTypes from 'prop-types';
import PixelBorderBox from '../components/PixelBorderBox';
import ControlService from '../services/ControlService';
import { NavigationContext } from 'react-navigation';
import PixelButton from '../components/PixelButton';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { containsNameTag, CREATE_STORY_STEPS } from '../types';
import MainStore from '../mobx/mainStore';
import { DefaultText } from '../components/shared';

interface Props {
  mainStore?: MainStore;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  title: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center'
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 20
  },
  keyboardAvoidingView: {
    flex: 1
  },
  textInput: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    marginHorizontal: 10,
    textAlignVertical: 'top',
    paddingVertical: 10
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular
  },
  borderTop: {
    height: 3,
    backgroundColor: colors.borderBoxOuter,
    marginHorizontal: 3
  },
  borderBottom: {
    height: 3,
    backgroundColor: colors.borderBoxOuter,
    marginHorizontal: 3
  },
  createStoryBox: {
    marginBottom: 30
  },
  buttons: {
    height: 50,
    marginVertical: 30,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  button: {
    height: 50,
    marginHorizontal: 10,
    width: 130
  },
  startButtonText: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    padding: 10,
    textAlign: 'center'
  },
  titleBox: {
    minHeight: 120
  },
  shareButton: {
    color: colors.defaultText,
    fontFamily: fonts.regular
  },
  contextInput: {
    minHeight: 300
  }
});

const ErrorText = styled(DefaultText)`
  margin-top: 10px;
  color: ${colors.primary};
`;

const atLeastOneSentence = (text: string): boolean => {
  const dotIndex = text.lastIndexOf('.');
  const questionMarkIndex = text.lastIndexOf('?');
  const excalamtionPointIndex = text.lastIndexOf('!');
  return dotIndex > -1 || questionMarkIndex > -1 || excalamtionPointIndex > -1;
};

const CreatePrompt: React.SFC<Props> = ({ mainStore }) => {
  const navigation = useContext(NavigationContext);

  const {
    currentPromptTitle: title,
    currentPromptContext: context,
    currentPromptUid: promptId,
    promptButtonActivated
  } = mainStore;

  const buttonsDisabled =
    !promptButtonActivated ||
    !(title && context && atLeastOneSentence(context));

  const onStart = async () => {
    const { uid } =
      (await ControlService.upsertCreativeClass({
        title,
        context,
        uid: promptId
      })) || {};

    if (containsNameTag({ context })) {
      ControlService.createStory();
      mainStore.setCreateStoryState({
        creativeClass: mainStore.prompts.find(p => p.uid === uid),
        step: CREATE_STORY_STEPS.SELECT_NAME
      });
    } else {
      ControlService.startStory(undefined, undefined, uid);
    }
    navigation.navigate('MainStoryModal');
  };
  const onSave = async () => {
    await ControlService.upsertCreativeClass({ uid: promptId, title, context });
    navigation.goBack();
  };

  const onDeletePrompt = async () => {
    if (mainStore.currentPromptUid) {
      await ControlService.deletePrompt(promptId);
    }
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header
        rightButtons={[
          <TouchableOpacity key={Math.random()} onPress={onDeletePrompt}>
            <Text style={styles.text}>Delete</Text>
          </TouchableOpacity>
        ]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.innerContainer}>
          <View style={{ height: 90 }}>
            <Text style={styles.title}>Class name</Text>
            <PixelBorderBox>
              <TextInput
                style={styles.textInput}
                placeholder="Insert the title of your story..."
                placeholderTextColor={colors.lightgray}
                value={title}
                onChangeText={text => mainStore.setCurrentPromptTitle(text)}
              />
            </PixelBorderBox>
          </View>
          <View style={{ flex: 3, marginTop: 30 }}>
            <Text style={styles.title}>Opening</Text>
            <PixelBorderBox>
              <TextInput
                multiline
                style={[styles.textInput, styles.contextInput]}
                placeholder="Insert background information and the opening of your story in this box..."
                placeholderTextColor={colors.lightgray}
                value={context}
                onChangeText={text => mainStore.setCurrentPromptContext(text)}
              />
            </PixelBorderBox>
          </View>
          {buttonsDisabled && (
            <ErrorText>
              Both &apos;Class name&apos; and &apos;Opening&apos; must be
              filled. You also need at least one sentence in the opening (with a
              punctuation sign at the end)
            </ErrorText>
          )}
          <View style={styles.buttons}>
            <PixelButton
              onPress={onSave}
              label={'Save'}
              style={{ marginRight: 15, flex: 1 }}
              disabled={buttonsDisabled}
            />
            <PixelButton
              onPress={onStart}
              label={'Start'}
              style={{ marginLeft: 15, flex: 1 }}
              disabled={buttonsDisabled}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

CreatePrompt.propTypes = {
  mainStore: PropTypes.any
};

export default inject('mainStore')(observer(CreatePrompt));
