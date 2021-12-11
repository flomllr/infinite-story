import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  Linking,
  ImageSourcePropType
} from 'react-native';
import { colors, fonts } from '../../theme';
import ControlService from '../../services/ControlService';
import { inject, observer } from 'mobx-react';
import {
  PurchaseId,
  MarketplaceItem,
  containsNameTag,
  Prompt,
  CREATE_STORY_STEPS,
  isAdvancedPrompt
} from '../../types';
import { Platform } from '@unimodules/core';
import MainStore from '../../mobx/mainStore';
import { PixelInput } from '../PixelInput';
import { Space } from '../shared';
import { PurchaseModal } from '../../modals/PurchaseModal';
import { portraits } from '../../assets/portraits';
import { ClassSelector } from './steps/ClassSelector';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 18
  },
  textGreyedOut: {
    color: colors.greyed,
    fontFamily: fonts.regular,
    fontSize: 18
  },
  headLine: {
    fontSize: 30
  },
  setupRow: {
    marginTop: 30
  },
  underline: {
    textDecorationLine: 'underline'
  },
  textInput: {
    minWidth: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.defaultText
  },
  textInputModal: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 18
  },
  startButton: {
    marginTop: 50
  },
  primaryColor: {
    color: colors.primary
  },
  name: {
    marginBottom: 30,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerClass: {
    margin: 5,
    marginLeft: '10%',
    marginRight: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  playerClassTextContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'column'
    // justifyContent: "space-between"
  },
  playerClassName: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 19
  },
  playerClassDescription: {
    color: colors.greyed,
    fontFamily: fonts.regular,
    fontSize: 13
  },
  playerClassContainer: {
    flex: 1,
    width: '100%'
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  headerText: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    textAlign: 'center',
    fontSize: 23
  },
  buttonContainer: {
    marginTop: -40
  },
  android: {
    width: 50,
    height: 20
  },
  list: {
    flex: 1,
    width: '100%'
  },
  selectIcon: {
    position: 'absolute',
    left: -20,
    top: 22,
    zIndex: 999
  },
  nextButton: {
    paddingBottom: 20
  },
  button: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 30,
    paddingHorizontal: 20
  },
  flex: {
    flex: 1
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    color: colors.defaultText,
    fontSize: 18,
    paddingBottom: 10,
    alignSelf: 'center'
  },
  textCenter: {
    textAlign: 'center'
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  textButton: {
    fontFamily: fonts.regular,
    color: colors.defaultText,
    fontSize: 18
  },
  buyButton: {
    marginVertical: 10
  },
  modalText: {
    fontFamily: fonts.regular,
    color: colors.lightgray,
    fontSize: 16,
    marginBottom: 20
  },
  gold: {
    color: colors.gold
  },
  restoreButton: {
    fontFamily: fonts.regular,
    color: colors.lightgray
  },
  noPadding: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0
  }
});

interface Props {
  onStart: (playerClass: string, name: string) => void;
  onStartMarketClass: (marketClass: MarketplaceItem, name?: string) => void;
  onStartCreativeClass: (creativeClass: Prompt, name?: string) => void;
  mainStore?: MainStore;
  partyMode?: true;
}

class CreateStoryComponent extends Component<Props, null> {
  componentWillUnmount() {
    console.log('Unmounting create story');
    this.props.mainStore.resetCreateStoryState();
  }

  render() {
    const { playerClass, name, step, marketClass, creativeClass } =
      this.props.mainStore.createStoryState || {};

    const {
      mainStore,
      onStart,
      partyMode,
      onStartMarketClass,
      onStartCreativeClass
    } = this.props || {};

    const handleSubmit = () => {
      if (step === CREATE_STORY_STEPS.SELECT_CLASS) {
        if (marketClass && !containsNameTag(marketClass.item.item)) {
          onStartMarketClass(marketClass);
        } else if (creativeClass && !containsNameTag(creativeClass)) {
          onStartCreativeClass(creativeClass);
        } else {
          mainStore.setCreateStoryState({
            step: CREATE_STORY_STEPS.SELECT_NAME
          });
        }
      }

      if (step === CREATE_STORY_STEPS.SELECT_NAME) {
        if (marketClass) {
          onStartMarketClass(marketClass, name);
        } else if (creativeClass) {
          onStartCreativeClass(creativeClass, name);
        } else {
          onStart(playerClass, name);
        }
      }
    };

    const getPortrait = () => {
      if (playerClass) {
        return portraits[playerClass];
      }

      if (marketClass) {
        return portraits[marketClass.item.item.portrait];
      }

      if (creativeClass) {
        return portraits[
          isAdvancedPrompt(creativeClass)
            ? creativeClass.advanced.portrait
            : 'creative'
        ];
      }
    };

    const openDiscordModal = () => {
      let code;
      if (mainStore.hideIllegalFeaturesFromApple) {
        ControlService.openModal(
          <Text style={[styles.modalTitle, styles.noPadding]}>Coming soon</Text>
        );
        return;
      }
      ControlService.openModal(
        <>
          <Text style={styles.modalTitle}>
            Join our Discord to unlock the Orc!
          </Text>
          <Text style={styles.modalText}>
            After joining the Discord server, our bot will send you a secret
            code. Enter the code below to unlock the Orc class.
          </Text>
          <View style={styles.tutorialButton}>
            <TouchableOpacity
              onPress={async () => {
                Linking.openURL('https://discord.gg/yXGmY6y');
              }}
            >
              <Text style={styles.textButton}>1. Join Discord</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.text, styles.textInput, styles.textInputModal]}
            onChangeText={text => (code = text)}
            placeholder={'2. Enter code'}
            placeholderTextColor={colors.lightgray}
          />
          <View style={styles.tutorialButton}>
            <TouchableOpacity
              onPress={async () => {
                await ControlService.useDiscordCode('' + code);
                mainStore.achievements &&
                  mainStore.achievements.find(e => e === 'discord') &&
                  mainStore.setCreateStoryState({
                    playerClass: 'orc',
                    marketClass: null
                  });
                ControlService.closeModal();
              }}
            >
              <Text style={styles.textButton}>3. Verify code</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    };

    const openPurchaseModal = async (
      purchaseId: PurchaseId,
      portrait?: ImageSourcePropType
    ) => {
      ControlService.openModal(
        <PurchaseModal
          purchaseId={purchaseId}
          portrait={portrait}
          onPurchased={() =>
            mainStore.entitlements.includes('shadow_class') &&
            mainStore.setCreateStoryState({
              playerClass: 'shadow',
              marketClass: null
            })
          }
        />
      );
    };

    const buttonDisabled =
      (step === CREATE_STORY_STEPS.SELECT_CLASS &&
        !playerClass &&
        !marketClass &&
        !creativeClass) ||
      (step === CREATE_STORY_STEPS.SELECT_NAME && !name);

    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.center}
        >
          {step === 0 ? (
            <ClassSelector
              partyMode={partyMode}
              marketClass={marketClass}
              creativeClass={creativeClass}
              playerClass={playerClass}
              setPlayerClass={(playerClass: string) =>
                mainStore.setCreateStoryState({
                  playerClass,
                  marketClass: null,
                  creativeClass: null
                })
              }
              setMarketClass={(marketClass: MarketplaceItem) =>
                mainStore.setCreateStoryState({
                  marketClass,
                  playerClass: '',
                  creativeClass: null
                })
              }
              setCreativeClass={(creativeClass: Prompt) => {
                mainStore.setCreateStoryState({
                  creativeClass,
                  marketClass: null,
                  playerClass: ''
                });
              }}
              openDiscordModal={openDiscordModal}
              openPurchaseModal={openPurchaseModal}
            />
          ) : (
            undefined
          )}
          {step === 1 ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
              <View style={styles.name}>
                <Image
                  style={{ width: 80, height: 80 }}
                  source={getPortrait()}
                />
                <View style={styles.setupRow}>
                  <Text style={styles.text}>
                    {partyMode ? 'Choose a name:' : 'Choose your name:'}
                  </Text>
                  <Space h={'20px'} />
                  <PixelInput
                    placeholder="Name"
                    style={
                      Platform.OS == 'ios' ? { height: 35 } : { height: 40 }
                    }
                    onSubmit={handleSubmit}
                    value={name}
                    onChangeText={newName =>
                      mainStore.setCreateStoryState({ name: newName })
                    }
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          ) : (
            undefined
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleSubmit}
              disabled={buttonDisabled}
            >
              <Text
                style={[
                  buttonDisabled ? styles.textGreyedOut : styles.text,
                  styles.nextButton
                ]}
              >
                {step === 1 ? 'Start' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

export const CreateStory = inject('mainStore')(observer(CreateStoryComponent));
