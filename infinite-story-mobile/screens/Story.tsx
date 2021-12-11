import React, { Component, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Share,
  TouchableOpacity
} from 'react-native';
import Chatbox from '../components/Chatbox';
import StoryComponent from '../components/Story';
import { colors, fonts } from '../theme';
import { inject, observer } from 'mobx-react';
import ControlService from '../services/ControlService';
import Header from '../components/Header';
import MainStore from '../mobx/mainStore';
import { withNavigation } from 'react-navigation';
import LoadingStory from './LoadingStory';
import { Platform } from '@unimodules/core';
import Toast from 'react-native-root-toast';
import TellMeMore from '../components/TellMeMore';
import Hint from '../components/Hint';
import ApiService from '../services/ApiService';
import { useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { useMainStore } from '../hooks/useMainStore';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  text: {
    fontFamily: fonts.regular,
    color: colors.defaultText
  },
  toast: {
    fontFamily: fonts.regular
  },
  toastContainer: {
    backgroundColor: colors.primary,
    padding: 10
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    color: colors.defaultText,
    fontSize: 18,
    paddingBottom: 10
  },
  modalText: {
    fontFamily: fonts.regular,
    color: colors.defaultText,
    fontSize: 16
  },
  modalBold: {
    fontFamily: fonts.semiBold,
    color: colors.defaultText,
    fontSize: 16
  },
  modalRed: {
    fontFamily: fonts.bold,
    color: colors.actDo,
    fontSize: 16
  },
  modalGreen: {
    fontFamily: fonts.semiBold,
    color: colors.actSay,
    fontSize: 16
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50
  },
  textButton: {
    fontFamily: fonts.regular,
    color: colors.defaultText,
    fontSize: 18
  },
  headerButton: {
    marginRight: 20
  },
  modalButton: {
    paddingTop: 20,
    fontSize: 18
  },
  modal: {
    alignItems: 'center'
  },
  red: {
    color: colors.primary
  }
});

const Story = () => {
  const [typing, setTyping] = useState('');
  const { navigation } = useNavigation();
  const mainStore = useMainStore();

  useEffect(() => {
    const storyId = navigation.getParam('storyId');
    if (storyId) {
      ControlService.setStory(storyId);
    }
  }, []);

  const sendMessage = async () => {
    ControlService.act(typing);
    setTyping('');
  };

  const share = async () => {
    const storyId = navigation.getParam('storyId') || mainStore.storyId;
    if (storyId) {
      await ApiService.updateStory(storyId, true);
      Platform.OS === 'ios'
        ? Share.share({
            url: 'https://infinitestory.app/story/' + storyId
          })
        : Share.share({
            message:
              'Check out my story: https://infinitestory.app/story/' +
              (storyId || mainStore.storyId)
          });
    }
  };

  const deleteStory = async () => {
    const storyId = mainStore.storyId;
    ControlService.openModal(
      <View style={[styles.modal]}>
        <Text style={styles.modalTitle}>Warning:</Text>
        <Text style={styles.text}>This action can not be undone</Text>
        <Text
          onPress={async () => {
            await ControlService.deleteStory(storyId);
            await ControlService.closeModal();
            navigation.goBack();
          }}
          style={[styles.text, styles.modalButton, styles.red]}
        >
          Delete story
        </Text>
        <Text
          style={[styles.text, styles.modalButton]}
          onPress={async () => await ControlService.closeModal()}
        >
          Cancel
        </Text>
      </View>
    );
  };

  const storyId = navigation.getParam('storyId');

  const ownStory =
    !storyId || (mainStore.stories && mainStore.stories[storyId]);

  return mainStore.loadingStory ? (
    <LoadingStory />
  ) : (
    <SafeAreaView style={styles.container}>
      {!!mainStore.storyError && (
        <Toast
          visible={true}
          position={Toast.positions.CENTER}
          backgroundColor={colors.primary}
          opacity={1}
        >
          <Text style={styles.toast}>{mainStore.storyError}</Text>
        </Toast>
      )}
      <Header
        rightButtons={[
          <TouchableOpacity
            key={0}
            onPress={deleteStory}
            style={styles.headerButton}
          >
            <Text style={styles.text}>Delete</Text>
          </TouchableOpacity>,
          <TouchableOpacity key={1} onPress={share}>
            <Text style={styles.text}>Share</Text>
          </TouchableOpacity>
        ]}
      />
      <StoryComponent
        items={mainStore.story}
        extraData={{ typing }}
        own={!!ownStory}
      />
      {ownStory && (
        <>
          <Hint
            infering={mainStore.infering}
            typing={typing}
            actionType={mainStore.actionType}
          />
          <Chatbox
            value={typing}
            onSubmit={sendMessage}
            onChangeText={setTyping}
            inputDisabled={mainStore.infering}
          />
          <TellMeMore />
        </>
      )}
    </SafeAreaView>
  );
};

export default observer(Story);
