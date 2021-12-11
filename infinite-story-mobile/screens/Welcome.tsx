import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Animated,
  Linking,
  TextInput
} from 'react-native';
import styled from 'styled-components/native';
import PropTypes from 'prop-types';
import { colors, fonts, size } from '../theme';
import ControlService from '../services/ControlService';
import { inject, observer } from 'mobx-react';
import { withNavigation } from 'react-navigation';
import { portraits } from '../assets/portraits';
import AutoHeightImage from '../components/AutoHeightImage';
import { Platform } from '@unimodules/core';
import ModeButton from '../components/ModeButton';
import { ScrollView } from 'react-native-gesture-handler';
import MainStore from '../mobx/mainStore';
import { NicknameModal } from '../modals/NicknameModal';
import {
  Headline,
  Space,
  SubHeadline,
  DefaultText
} from '../components/shared';
import { NavigationEffectContext } from '../components/NavigationEffect/NavigationEffectContext';
import { NavigationEffect } from '../components/NavigationEffect';
import { useNavigation } from '../hooks/useNavigation';
import { useMainStore } from '../hooks/useMainStore';
import PixelButton from '../components/PixelButton';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%'
  },
  scrollContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    flex: 1
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 18
  },
  setupRow: {
    flexDirection: 'row',
    marginTop: 30
  },
  underline: {
    textDecorationLine: 'underline'
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: colors.defaultText,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
    minWidth: 200
  },
  startButton: {
    marginTop: 50
  },
  android: {
    width: 50,
    height: 20
  },
  selectIcon: {
    position: 'absolute',
    left: -20,
    zIndex: 999
  },
  resumeView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '90%',
    marginLeft: '5%'
  },
  resumeButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: colors.transparentBlack
  },
  bold: {
    fontFamily: fonts.bold
  },
  quests: {
    marginVertical: 40,
    marginHorizontal: 20
  },
  questTitle: {
    color: colors.defaultText,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    marginBottom: 8
  },
  quest: {
    color: colors.greyed,
    fontFamily: fonts.regular,
    fontSize: 13
  },
  questDone: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: colors.greyed,
    fontFamily: fonts.regular,
    fontSize: 13
  },
  logo: {
    marginTop: '5%'
  },
  warning: {
    color: colors.defaultText,
    margin: 20,
    padding: 10,
    fontSize: 15,
    backgroundColor: colors.primary
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    color: colors.defaultText,
    fontSize: 18,
    paddingBottom: 10,
    alignSelf: 'center'
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
    width: '100%'
  },
  textButton: {
    fontFamily: fonts.regular,
    color: colors.defaultText,
    fontSize: 18
  }
});

const MovingCursor = props => {
  const [left] = useState(new Animated.Value(3)); // Initial value for left: 3

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(left, {
          toValue: -3,
          duration: 500
        }),
        Animated.timing(left, {
          toValue: 3,
          duration: 500
        })
      ]),
      {}
    ).start();
  }, []);

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
        left: left // Bind left to animated value
      }}
    >
      {props.children}
    </Animated.View>
  );
};

const ModalView = styled.View`
  flex-direction: column;
  padding: 20px;
`;

const ImportantText = styled(DefaultText)`
  color: ${colors.primary};
`;

MovingCursor.propTypes = {
  style: PropTypes.any,
  children: PropTypes.any
};

const REMOVE_PARTYMODE_WALL = true;

const Welcome = () => {
  const { navigation } = useNavigation();
  const mainStore = useMainStore();
  const onStart = () => {
    ControlService.createStory();
    navigation.navigate('MainStoryModal');
  };

  const onStartCreative = () => {
    navigation.navigate('CreativeModeModal');
  };

  const onStartPartyMode = () => {
    console.log('Starting');
    if (!mainStore.nickname) {
      ControlService.openModal(
        <NicknameModal
          onSuccess={() => navigation.navigate('PartyModeModal')}
        />
      );
      return;
    }
    navigation.navigate('PartyModeModal');
  };

  const onOpenProfile = () => {
    navigation.navigate('ProfileModal');
  };

  const { stories, lastActStoryId: storyId } = mainStore;
  const {
    origin: { name, class: playerClass, portrait, location },
    title,
    metadata
  } = (storyId && stories && stories[storyId]) || {
    origin: {},
    title: ''
  };

  const isValidPartyGame = async () =>
    metadata?.party_game &&
    metadata?.code &&
    metadata?.updated_date &&
    metadata?.profile_picture &&
    Date.now() - metadata?.updated_date < 1000 * 60 * 60 * 10 &&
    (await ControlService.testPartyGame(String(metadata?.code))).canJoin;

  const onResume = async () => {
    console.log('Sotry', stories[storyId]);
    const validPartyGame = await isValidPartyGame();

    if (validPartyGame) {
      ControlService.joinPartyGame(
        String(metadata.code),
        metadata.profile_picture
      );
      navigation.navigate('PartyModeModal');
    } else {
      ControlService.resumeStory();
      navigation.navigate('MainStoryModal');
    }
  };

  const handleWelcomeModal = (prev?: string, current?: string) => {
    if (
      prev === 'MainStoryModal' &&
      current === undefined &&
      mainStore.shouldShowWelcomeModal
    ) {
      mainStore.setShouldShowWelcomeModal(false);
      ControlService.openModal(
        <ModalView>
          <ScrollView>
            <Headline>Welcome!</Headline>
            <Space h={'15px'} />
            <Space h={'10px'} />
            <DefaultText>
              You did it Padawan! All the app is now unlocked
            </DefaultText>
            <Space h={'15px'} />
            <DefaultText>
              You can now create your own classes with the{' '}
              <ImportantText>Creative Studio</ImportantText>, buy classes that
              other players have written (and sell yours) in the{' '}
              <ImportantText>Market</ImportantText>, and go check out your{' '}
              <ImportantText>Profile</ImportantText> (You can choose a nickname
              and a portrait that are shown in the marketplace and when you play
              in the <ImportantText>Party Mode</ImportantText>)
            </DefaultText>
            <Space h={'10px'} />
            <DefaultText>
              Speaking of the <ImportantText>Party Mode</ImportantText>, we
              think this is one of the coolest feature of this app. It lets you
              play the same story together with your friends. Go check it out!
            </DefaultText>
            <Space h={'10px'} />
            <DefaultText>
              We put a lot of time and effort into this game and we hope you
              will like it. There are some minor paid features whose revenue
              cover our server costs (which are non negligible due to the need
              of running an AI for hundreds of thousands of players). Hopefully
              that&apos;s alright for you :)
            </DefaultText>
            <Space h={'10px'} />
            <DefaultText>
              Thanks, <ImportantText>Justin</ImportantText> &{' '}
              <ImportantText>Florian</ImportantText>.
            </DefaultText>
            <Space h={'10px'} />
            <PixelButton
              onPress={() => {
                ControlService.closeModal();
              }}
              label={'Ok!'}
            />
          </ScrollView>
        </ModalView>
      );
    }
  };

  return (
    <View style={[styles.container, { flex: 1 }]}>
      <NavigationEffect effect={handleWelcomeModal} />
      <ScrollView style={{ width: '100%' }}>
        <View style={styles.scrollContainer}>
          <AutoHeightImage
            style={styles.logo}
            uri={require('../assets/title.png')}
            width={250}
          />
          {mainStore.achievements.find(a => a === '_staging') && (
            <Headline>-Staging 3.8-</Headline>
          )}
          {!mainStore.apiAvailable ? (
            <Text style={[styles.text, styles.warning]}>
              Warning: you&apos;re offline. Try restarting the app. Or maybe
              we&apos;re on maintenance? Join the{' '}
              <Text
                onPress={() => Linking.openURL('https://discord.gg/yXGmY6y')}
                style={styles.underline}
              >
                Discord
              </Text>{' '}
              to get all the important information.
            </Text>
          ) : !mainStore.tutorialDone ? (
            <View
              style={{
                marginBottom: 150,
                width: '100%',
                paddingHorizontal: '7%'
              }}
            >
              <TouchableOpacity style={styles.startButton} onPress={onStart}>
                <SubHeadline>
                  Play your first story to unlock the rest of the app!
                </SubHeadline>
                <Space h={'30px'} />
                <ModeButton
                  icon={require('../assets/classic.png')}
                  title={'Start your first Adventure'}
                >
                  Play in a rich fantasy world as one of the many different
                  classes.
                </ModeButton>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View
                style={{
                  marginBottom: 150,
                  width: '100%',
                  paddingHorizontal: '7%'
                }}
              >
                <TouchableOpacity style={styles.startButton} onPress={onStart}>
                  <ModeButton
                    icon={require('../assets/classic.png')}
                    title={'Start Adventure'}
                  >
                    Play in a rich fantasy world as one of the many different
                    classes.
                  </ModeButton>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginTop: size.defaultSpaceBetween }}
                  onPress={onStartCreative}
                >
                  <ModeButton
                    icon={require('../assets/creative.png')}
                    title={'Creative Studio'}
                  >
                    Create your own classes from scratch.
                  </ModeButton>
                </TouchableOpacity>
                {(REMOVE_PARTYMODE_WALL ||
                  mainStore.achievements?.find(a => a === '_partymode')) && (
                  <TouchableOpacity
                    style={{ marginTop: size.defaultSpaceBetween }}
                    onPress={onStartPartyMode}
                  >
                    <ModeButton
                      icon={require('../assets/party.png')}
                      title={'Party Mode'}
                    >
                      Play with your friends.
                    </ModeButton>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={{ marginTop: size.defaultSpaceBetween }}
                  onPress={onOpenProfile}
                >
                  <ModeButton
                    icon={require('../assets/profile.png')}
                    title={'Profile'}
                  >
                    See your achievements and manage your identity.
                  </ModeButton>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {mainStore.apiAvailable &&
      ((name && playerClass && location) || title) ? (
        <TouchableOpacity
          style={[styles.startButton, styles.resumeButton]}
          onPress={onResume}
        >
          <View style={styles.resumeView}>
            <Image
              style={{ width: 70, height: 70 }}
              source={
                playerClass
                  ? portraits[portrait || playerClass]
                  : require('../assets/portraits/creative.png')
              }
            />
            {playerClass && location && name ? (
              <Text style={[styles.text, { paddingLeft: 15, width: '80%' }]}>
                Resume your adventure with{' '}
                <Text style={styles.bold}>{name}</Text> the{' '}
                <Text style={styles.bold}>{playerClass}</Text> from{' '}
                <Text style={styles.bold}>{location}</Text>.
              </Text>
            ) : (
              <Text style={[styles.text, { paddingLeft: 15, width: '80%' }]}>
                Resume &quot;<Text style={styles.bold}>{title}</Text>
                &quot;
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default observer(Welcome);
