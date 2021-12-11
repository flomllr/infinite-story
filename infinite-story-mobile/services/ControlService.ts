import {
  Location,
  Prompt,
  JitsiMeetStatus,
  MarketplaceItem,
  BuyerMarketplaceItem,
  AdvancedPrompt
} from '../types';
import MainStore from '../mobx/mainStore';
import ApiService, { PartyGameAction } from './ApiService';

import Constants from 'expo-constants';
import CodePush from 'react-native-code-push';
import ErrorService from './ErrorService';
import { ReactChild } from 'react';
import AnalyticsService from './AnalyticsService';
import { PartyModeState } from '../components/PartyMode/types';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';
import debounce from 'debounce';
import { observable } from 'mobx';
import Swiper from 'react-native-swiper';

const IOS_CODEPUSH_STAGING = 'ICet8XU5cjQ8tRyafDB-tNOiRFfrsSoMiyoUr';
const ANDROID_CODEPUSH_STAGING = 'IDCg6dZTxsPOeEyUJwtmeSOc9QoV22bYv1Iem';

const IOS_CODEPUSH_PROD = 'GK15KRGu1hg_g-1Q35azapcPdqsgPdjayGZyP';
const ANDROID_CODEPUSH_PROD = 'LkA864xpehGTJP0kjT_pDzDN4_ozAmpjQ5x-T';

let _mainStore: MainStore;

const setMainStore = store => {
  _mainStore = store;
};

let _navigation: any;
const setNavigation = navigation => {
  _navigation = navigation;
};

let _swiper: Swiper;
const setSwiper = swiper => {
  _swiper = swiper;
};

const requestReview = () => {
  if (Platform.OS === 'ios') {
    StoreReview.requestReview();
  }
};

const createStory: () => void = () => {
  _mainStore.setCreatingStoryState(true);
};

const abortStoryCreation: () => void = () => {
  _mainStore.setCreatingStoryState(false);
};

const startStory: (
  playerClass?: string,
  name?: string,
  promptId?: number,
  marketplaceItemId?: number
) => void = async (playerClass, name, promptId, marketplaceItemId) => {
  console.log('Starting story', playerClass, name, promptId, marketplaceItemId);
  try {
    _mainStore.setStoryLoadingState(true);
    _mainStore.setCreatingStoryState(false);
    const userId = _mainStore.userId;
    const { error, uid, storyBits, title } = await ApiService.startStory(
      userId,
      playerClass,
      name,
      promptId,
      marketplaceItemId
    );
    if (error) {
      ErrorService.handleError(error);
    } else {
      _mainStore.setStoryId(uid);
      _mainStore.setStory(storyBits);
      _mainStore.setLastActStory(uid);
      _mainStore.addStoryToHistory(uid, storyBits, title);
    }
    _mainStore.setStoryLoadingState(false);
  } catch (e) {
    ErrorService.log({ error: e });
  }
};

interface UpsertCreativeClassProps {
  uid?: number;
  title: string;
  context: string;
  advanced?: AdvancedPrompt['advanced'];
}

const upsertCreativeClass: (
  props: UpsertCreativeClassProps
) => Promise<Prompt | AdvancedPrompt | null> = async props => {
  _mainStore.setPromptButtonActivated(false);

  const deviceId = _mainStore.userId;

  const response = await ApiService.upsertCreativeClass({ deviceId, ...props });

  if (response.error) {
    ErrorService.uncriticalError('Could not save creative class');
    _mainStore.setPromptButtonActivated(true);
    return null;
  }

  const newPrompt: AdvancedPrompt | Prompt = response;

  const { prompts = [] } = _mainStore;
  const existingPrompt = prompts.find(p => p.uid === newPrompt.uid) != null;

  if (existingPrompt) {
    _mainStore.setPrompts(
      prompts.map(p => (p.uid === newPrompt.uid ? newPrompt : p))
    );
  } else {
    _mainStore.setPrompts([newPrompt, ...prompts]);
  }

  _mainStore.setCurrentPromptUid(newPrompt.uid);
  _mainStore.setPromptButtonActivated(true);
  return newPrompt;
};

const act: (payload: string) => void = async payload => {
  if (_mainStore.infering) {
    return;
  }

  _mainStore.setInfering(true);
  const type = _mainStore.actionType;
  const storyId = _mainStore.storyId;
  _mainStore.setLastActStory(storyId);
  if (type && storyId) {
    const { newStoryBits, error } = await ApiService.act(
      payload,
      type,
      storyId
    );
    _mainStore.addStoryBits(newStoryBits);
    _mainStore.storyUpdatedAt(storyId);

    // Update achievements
    newStoryBits &&
      newStoryBits.forEach(s => {
        if (s.type === 'LOCATION') {
          const location = (s.payload as unknown) as Location;
          if (location && location.firstVisit) {
            _mainStore.addAchievement('visited:' + location.location);
          }
        }
      });

    if (error) {
      ErrorService.storyError(
        'The AI is confused by your input. Try something else.',
        5000
      );
    }
  }
  _mainStore.setInfering(false);
  AnalyticsService.logAct();
};

const loadStory: (
  storyId: string
) => Promise<{ error: any }> = async storyId => {
  const { storyBits, error } = await ApiService.getStory(storyId);
  if (error) {
    ErrorService.handleError(error);
  } else {
    _mainStore.setStory(storyBits);
  }
  return { error };
};

const setStory: (storyId: string) => void = async storyId => {
  _mainStore.setStoryLoadingState(true);
  const { error } = await loadStory(storyId);
  if (!error) {
    _mainStore.setStoryId(storyId);
  }
  _mainStore.setStoryLoadingState(false);
};

const resumeStory: () => void = async () => {
  console.log('Resuming story');
  _mainStore.setStoryLoadingState(true);
  const { lastActStoryId } = _mainStore;
  console.log('lastAct', lastActStoryId);
  _mainStore.setStoryId(lastActStoryId);
  await loadStory(lastActStoryId);
  _mainStore.setStoryLoadingState(false);
};

const loadStories: () => void = async () => {
  if (!_mainStore) return;
  const deviceId = _mainStore.userId;
  if (deviceId) {
    const { stories, error } = await ApiService.getStories(deviceId);
    if (error) {
      ErrorService.uncriticalError('Could not load stories');
      _mainStore.checkAvailability();
    } else {
      const storiesDict = {};
      stories.forEach(s => {
        storiesDict[s.uid] = s;
      });
      _mainStore.setStories(storiesDict);
      stories.length > 0 && _mainStore.setLastActStory(stories[0].uid);
    }
  }
};

const restartApp: () => void = async () => {
  if (Constants.appOwnership !== 'expo') {
    CodePush.restartApp();
  }
};

const checkAvailabilityAndLoadAllData: () => void = async () => {
  _mainStore.setAppLoading(true);
  await _mainStore.checkAvailability(true);
  setTimeout(() => _mainStore.setAppLoading(false), 1000);
};
const setTutorialDone: () => void = async () => {
  _mainStore.setTutorialDone();
};

const setPartyGameTutorialDone: () => void = async () => {
  _mainStore.setPartyGameTutorialDone();
};

const openModal: (
  content: ReactChild,
  opts?: { closable?: boolean }
) => void = (content, opts) => {
  _mainStore.setModalVisibility(true);
  _mainStore.setModalContent(content);
  opts &&
    opts.closable != null &&
    _mainStore.setModalClosability(opts.closable);
};

const closeModal: () => void = async () => {
  _mainStore.setModalVisibility(false);
  _mainStore.setModalClosability(true);
};

const wipeData: () => void = async () => {
  restartApp();
};

const loadProfile = async () => {
  if (_mainStore.userId) {
    const {
      achievements,
      multiplayerAchievements,
      nickname,
      status,
      error,
      gold
    } = await ApiService.getProfile(_mainStore.userId);
    if (error) {
      _mainStore.checkAvailability();
      ErrorService.uncriticalError('Could not load player profile');
    }
    if (gold != null) {
      _mainStore.setGold(gold);
    }
    if (achievements) {
      _mainStore.setAchievements(achievements);
      _mainStore.setMultiplayerAchievements(multiplayerAchievements);
      _mainStore.setPlayerStatus(status);
      _mainStore.setNickname(nickname);
      if (achievements.find(a => a === '_staging')) {
        CodePush.sync({
          deploymentKey:
            Platform.OS === 'ios'
              ? IOS_CODEPUSH_STAGING
              : ANDROID_CODEPUSH_STAGING,
          installMode: CodePush.InstallMode.IMMEDIATE
        });
      } else {
        CodePush.sync({
          deploymentKey:
            Platform.OS === 'ios' ? IOS_CODEPUSH_PROD : ANDROID_CODEPUSH_PROD,
          installMode: CodePush.InstallMode.IMMEDIATE
        });
      }
    }
  } else {
    // Don't know who this guy is
    CodePush.sync({
      deploymentKey:
        Platform.OS === 'ios' ? IOS_CODEPUSH_PROD : ANDROID_CODEPUSH_PROD,
      installMode: CodePush.InstallMode.IMMEDIATE
    });
  }
};

const rollback: (bitId: number) => void = async bitId => {
  _mainStore.setInfering(true);
  const { storyId, story } = _mainStore;
  const { error, storyBits } = await ApiService.rollback(
    storyId,
    story.length - bitId
  );
  if (error || !storyBits) {
    ErrorService.uncriticalError('Rollback failed');
  } else {
    _mainStore.setStory(storyBits);
  }
  _mainStore.setInfering(false);
};

const useDiscordCode: (code: string) => void = async code => {
  const { userId } = _mainStore;
  if (userId && code) {
    const { ok, error } = await ApiService.useDiscordCode(code, userId);
    if (error || !ok) {
      ErrorService.uncriticalError('Please enter a valid code');
    } else {
      _mainStore.addAchievement('discord');
    }
  } else {
    ErrorService.uncriticalError('UserID not found');
  }
};

const deleteStory: (storyId: string) => void = async storyId => {
  const { ok, error } = await ApiService.deleteStory(storyId);
  if (ok && !error) {
    _mainStore.deleteStory(storyId);
  } else {
    ErrorService.uncriticalError('Could not delete the story');
  }
};

const deletePrompt: (promptId: number) => void = async promptId => {
  _mainStore.setPromptButtonActivated(false);
  const { ok, error } = await ApiService.deletePrompt(promptId);
  if (ok && !error) {
    _mainStore.deletePrompt(promptId);
  } else {
    ErrorService.uncriticalError('Could not delete the story opening');
  }
  _mainStore.setPromptButtonActivated(true);
};

const loadPrompts: () => void = async () => {
  const { userId } = _mainStore;
  console.log('UserId', userId);
  if (userId) {
    const { prompts } = await ApiService.getPrompts(userId);
    console.log('setting Prompts', prompts, 'thatsit');
    _mainStore.setPrompts(prompts);
  }
};

const createPartyGame: (props: {
  playerClass?: string;
  playerName?: string;
  marketplaceItemId?: number;
  promptId?: number;
}) => Promise<{ code: string; error?: string }> = async ({
  playerClass,
  playerName,

  marketplaceItemId,
  promptId
}) => {
  const { userId: deviceId } = _mainStore;

  const { code, error } = await ApiService.createPartyGame({
    deviceId,
    playerClass,
    playerName,
    marketplaceItemId,
    promptId
  });

  console.log('CREATING PARTY GAME CODE', code, error);

  return { code, error };
};

const joinPartyGame = async (gameId: string, profilePicture: string) => {
  console.log('joining party game');
  const { userId } = _mainStore;
  _mainStore.joinGame(gameId, (state: PartyModeState) => {
    _mainStore.setPartyModeState(state);
  });

  const initialState = await ApiService.joinPartyGame(
    userId,
    profilePicture,
    gameId
  );

  console.log('Initial state', initialState);

  _mainStore.setPartyModeState(initialState);
};

const dispatchPartyGameAction = (action: PartyGameAction) => {
  const { userId, gameId } = _mainStore;
  console.log('ACTION', action);
  const response = ApiService.partyGameAction(userId, gameId, action);
  // console.log('RESPONSE:', response);
};

const leavePartyGame = async () => {
  const { gameId } = _mainStore;
  if (_mainStore.jitsiMeetStatus === JitsiMeetStatus.IN_CALL) {
    await dispatchPartyGameAction({ type: 'DROP_CALL' });
  }
  await dispatchPartyGameAction({ type: 'LEAVE' });
  _mainStore.leaveGame(gameId);
  _mainStore.dropJitsiMeetCall();
  _mainStore.setJitsiMeetStatus(JitsiMeetStatus.NOT_JOINED);
  loadStories();
  loadProfile();
};

const startPartyGame = () => {
  return dispatchPartyGameAction({ type: 'START' }) as any;
};

const voteForProposal = (index: number) =>
  dispatchPartyGameAction({ type: 'VOTE', payload: index });

const submitProposal = (text: string) => {
  const { actionType } = _mainStore;
  dispatchPartyGameAction({
    type: 'PROPOSE',
    payload: { type: actionType, payload: text }
  });
};

const passProposal = () => {
  return dispatchPartyGameAction({ type: 'PASS' });
};

const setPlayerReady = () => dispatchPartyGameAction({ type: 'READY' });

const nextGameState = () => dispatchPartyGameAction({ type: 'NEXT_STATE' });

const kickPlayer = (playerId: string) =>
  dispatchPartyGameAction({ type: 'KICK', payload: playerId });

const banPlayer = (playerId: string) =>
  dispatchPartyGameAction({ type: 'BAN', payload: playerId });

const actPartyGame = async () => {
  const { gameId } = _mainStore;
  _mainStore.setActPartyGameError(false);
  try {
    const result = await ApiService.actPartyGame(gameId);
    if (result.error) {
      _mainStore.setActPartyGameError(true);
    } else {
      _mainStore.setActPartyGameError(false);
    }
    return result;
  } catch (error) {
    _mainStore.setActPartyGameError(true);
  }
};

const endPartyGame = () => {
  dispatchPartyGameAction({ type: 'END' });
};

const joinJitsiMeetCall = async (roomUrl: string) => {
  _mainStore.joinJitsiMeetCall(roomUrl, _mainStore.nickname);
  dispatchPartyGameAction({ type: 'JOIN_CALL' });
};

const dropJitsiMeetCall = () => {
  if (
    _mainStore.jitsiMeetStatus === JitsiMeetStatus.IN_CALL ||
    _mainStore.jitsiMeetStatus === JitsiMeetStatus.JOINING
  ) {
    dispatchPartyGameAction({ type: 'DROP_CALL' });
  }
  _mainStore.dropJitsiMeetCall();
};

const setJitsiMeetStatus = (status: JitsiMeetStatus) => {
  _mainStore.setJitsiMeetStatus(status);
};

const testPartyGame = async (
  gameId: string
): Promise<{ canJoin: boolean; reason: string }> => {
  const { exists, bannedPlayers, full } = await ApiService.testPartyGame(
    gameId
  );
  if (!exists) {
    return { canJoin: false, reason: 'This game does not exist' };
  } else if (exists && full) {
    return { canJoin: false, reason: 'This game is full' };
  } else if (exists && bannedPlayers.includes(_mainStore.userId)) {
    return { canJoin: false, reason: 'You have been banned from this game' };
  } else {
    return { canJoin: true, reason: '' };
  }
};

const setNickname = async (nickname: string) => {
  const { userId } = _mainStore;

  const { error } = await ApiService.setNickname(userId, nickname);

  if (!error) {
    _mainStore.setNickname(nickname);
  }

  return { error };
};

const redeemOffer = async (code: string) => {
  const { userId } = _mainStore;

  const { error } = await ApiService.redeemOffer(userId, code);
  console.log(error);
  return { error };
};

const sendPing = () => {
  dispatchPartyGameAction({ type: 'PING' });
};

const loadMarketplaceItems = async (tag = 'all') => {
  _mainStore.setMarketplaceItemsLoading(true);
  const response = await ApiService.getAllMarketplaceItems(tag);
  if (!response || response.error) {
    ErrorService.uncriticalError('Could not load marketplace items');
    return;
  }

  _mainStore.setMarketplaceItems(response.marketplaceItems);
  _mainStore.setMarketplaceItemsLoading(false);
};

const reloadMarketplaceItem = async (id: number) => {
  const response = await ApiService.getMarketplaceItems([id]);

  if (!response || response.error) {
    ErrorService.uncriticalError('Could not load updated marketplace item');
    return;
  }

  const updatedMarketplaceItem = response
    .marketplaceItems[0] as BuyerMarketplaceItem;

  _mainStore.marketplaceItems = _mainStore.marketplaceItems.map(item =>
    item.id === updatedMarketplaceItem.id ? updatedMarketplaceItem : item
  );

  return updatedMarketplaceItem;
};

const loadBoughtClassItems = async () => {
  const response = await ApiService.getMarketplaceItems(
    _mainStore.boughtClasses
  );
  if (!response || response.error) {
    ErrorService.uncriticalError('Could not load marketplace items');
    return;
  }
  _mainStore.setBoughtClassItems(response.marketplaceItems);
};

const loadMyMarketplaceItems = async () => {
  const response = await ApiService.getMyMarketplaceItems();
  if (!response || response.error) {
    ErrorService.uncriticalError('Could not load my marketplace items');
    return;
  }

  _mainStore.setMyMarketplaceItems(response.myMarketplaceItems);
};

const addClassToMyShop = async (
  promptId: number,
  price: number,
  tags: string[]
) => {
  console.log('Add class');
  const response = await ApiService.addClassToMyShop(promptId, price, tags);
  console.log('Response', response);
  if (!response || response.error) {
    ErrorService.uncriticalError('Could not add class to my shop');
    return;
  }
  loadMyMarketplaceItems();
  loadMarketplaceItems();
};

const buyMarketplaceItem = async (classId: number) => {
  _mainStore.setMarketplacePurchaseInProgress(true);
  const response = await ApiService.buyMarketplaceItem(classId);
  loadMarketplaceItems();
  await loadProfile();
  loadBoughtClassItems();
  _mainStore.setMarketplacePurchaseInProgress(false);
  console.log('response', response);
};

const buyAchievement = async (achievement: string, price: number) => {
  _mainStore.setMarketplacePurchaseInProgress(true);
  const response = await ApiService.buyAchievement(achievement, price);
  console.log(achievement, price);
  await loadProfile();
  _mainStore.setMarketplacePurchaseInProgress(false);
  console.log('response', response);
};

const updateMarketplaceItem = async (id: number, price: number) => {
  const oldMarketplaceItems = Array(..._mainStore.myMarketplaceItems);
  _mainStore.setMyMarketplaceItems(
    oldMarketplaceItems.map(m => (m.id === id ? { ...m, price } : m))
  );

  const commitUpdate = debounce(
    () => ApiService.updateMarketplaceItem(id, price),
    500
  );
  const response = await commitUpdate();
  console.log('Response:', response);
  if (!response) {
    return;
  }

  if (response?.error) {
    ErrorService.uncriticalError('Could not update the marketplace item');
    return;
  }
  loadMyMarketplaceItems();
  loadMarketplaceItems();
};

const deactivateMarketplaceItem = async (id: number) => {
  const oldMarketplaceItems = Array(..._mainStore.myMarketplaceItems);
  _mainStore.setMyMarketplaceItems(
    oldMarketplaceItems.map(m => (m.id === id ? { ...m, softDelete: true } : m))
  );
  const response = await ApiService.deactivateMarketplaceItem(id);
  if (!response || response.error) {
    ErrorService.uncriticalError('Could not unpublish the marketplace item');
    return;
  }
  loadMyMarketplaceItems();
  loadMarketplaceItems();
};

const restoreMarketplaceItem = async (id: number) => {
  const oldMarketplaceItems = Array(..._mainStore.myMarketplaceItems);
  _mainStore.setMyMarketplaceItems(
    oldMarketplaceItems.map(m =>
      m.id === id ? { ...m, softDelete: false } : m
    )
  );
  const response = await ApiService.restoreMarketplaceItem(id);
  if (!response || response.error) {
    ErrorService.uncriticalError('Could not restore the marketplace item');
    return;
  }
  loadMyMarketplaceItems();
  loadMarketplaceItems();
};

const getGold = async (amount: number) => {
  const { userId } = _mainStore;

  const { error } = await ApiService.getGold(userId, amount);

  if (!error) {
    loadProfile();
  }

  return { error };
};

export default {
  setMainStore,
  startStory,
  act,
  loadStory,
  createStory,
  loadStories,
  resumeStory,
  setStory,
  wipeData,
  checkAvailabilityAndLoadAllData,
  setTutorialDone,
  setPartyGameTutorialDone,
  openModal,
  closeModal,
  abortStoryCreation,
  loadProfile,
  rollback,
  useDiscordCode,
  deleteStory,
  loadPrompts,
  deletePrompt,
  joinPartyGame,
  voteForProposal,
  submitProposal,
  setPlayerReady,
  createPartyGame,
  nextGameState,
  kickPlayer,
  banPlayer,
  startPartyGame,
  actPartyGame,
  passProposal,
  leavePartyGame,
  endPartyGame,
  joinJitsiMeetCall,
  dropJitsiMeetCall,
  setJitsiMeetStatus,
  testPartyGame,
  setNickname,
  redeemOffer,
  sendPing,
  requestReview,
  loadMarketplaceItems,
  loadMyMarketplaceItems,
  addClassToMyShop,
  updateMarketplaceItem,
  deactivateMarketplaceItem,
  restoreMarketplaceItem,
  buyMarketplaceItem,
  loadBoughtClassItems,
  getGold,
  reloadMarketplaceItem,
  upsertCreativeClass,
  buyAchievement,
  setNavigation,
  setSwiper
};
