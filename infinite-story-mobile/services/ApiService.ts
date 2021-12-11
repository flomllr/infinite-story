/* eslint-disable @typescript-eslint/camelcase */
import {
  StoryBit,
  StorySmall,
  MarketplaceItem,
  AdvancedPrompt
} from '../types';
import { Platform } from 'react-native';
import fetch from 'isomorphic-unfetch';
import MainStore from '../mobx/mainStore';
import ErrorService from './ErrorService';
import Constants from 'expo-constants';
import { Prompt } from '../types';
import { PartyModeState } from '../components/PartyMode/types';

let _mainStore: MainStore;

const address =
  Constants.appOwnership === 'expo' && Platform.OS !== 'web'
    ? 'https://api.infinitestory.app'
    : 'https://api.infinitestory.app';

const setMainStore = (mainStore: MainStore) => {
  _mainStore = mainStore;
};

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeout = 15000
): Promise<Response> {
  return Promise.race([
    fetch(input, init),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    )
  ]);
}

const post: (
  endpoint: string,
  body: Record<string, any>
) => Promise<any> = async (endpoint, body) => {
  try {
    const response = await fetchWithTimeout(address + endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: _mainStore && _mainStore.userId
      },
      body: JSON.stringify(body)
    });
    if (response.status >= 300) {
      ErrorService.log({ error: response.status });
      console.log(JSON.stringify(response));
      return { error: (await response.json()).error };
    } else {
      const responseJson = await response.json();
      return await responseJson;
    }
  } catch (e) {
    ErrorService.log({ error: e });
    return { error: e, location: 'ApiService.post exception' };
  }
};

const put: (
  endpoint: string,
  body: Record<string, any>
) => Promise<any> = async (endpoint, body) => {
  try {
    const response = await fetch(address + endpoint, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: _mainStore && _mainStore.userId
      },
      body: JSON.stringify(body)
    });
    if (response.status >= 300) {
      ErrorService.log({ error: response.status });
      console.log(JSON.stringify(response));
      return { error: 'Error ' + response.status };
    } else {
      const responseJson = await response.json();
      return await responseJson;
    }
  } catch (e) {
    ErrorService.log({ error: e });
    return { error: e, location: 'ApiService.put exception' };
  }
};

const del: (endpoint: string) => Promise<any> = async endpoint => {
  try {
    const response = await fetch(address + endpoint, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: _mainStore && _mainStore.userId
      }
    });
    if (response.status >= 300) {
      ErrorService.log({ error: response.status });
      console.log(JSON.stringify(response));
      return { error: 'Error ' + response.status };
    } else {
      const responseJson = await response.json();
      return await responseJson;
    }
  } catch (e) {
    ErrorService.log({ error: e });
    return { error: e, location: 'ApiService.delete exception' };
  }
};

const get: (endpoint: string, raw?: boolean) => Promise<any> = async (
  endpoint,
  raw
) => {
  try {
    const response = await fetch(address + endpoint, {
      method: 'GET',
      headers: {
        Authorization: _mainStore && _mainStore.userId
      }
    });
    if (raw) return response;
    if (response.status >= 300) {
      ErrorService.log({ error: response.status });
      console.log(JSON.stringify(response));
      return { error: (await response.json()).error };
    } else {
      const responseJson = await response.json();
      return await responseJson;
    }
  } catch (e) {
    ErrorService.log({ error: e });
    return { error: e };
  }
};

const startStory: (
  userId: string,
  playerClass?: string,
  name?: string,
  promptId?: number,
  marketplaceItemId?: number
) => Promise<{
  uid?: string;
  storyBits?: StoryBit[];
  error?: any;
  title?: string;
}> = async (userId, playerClass, name, promptId, marketplaceItemId) => {
  const response = (await post('/start_story', {
    playerClass,
    name,
    deviceId: userId,
    promptId,
    marketplaceItemId
  })) as any;
  console.log('new story', response);
  return response;
};

const act: (
  payload: string,
  type: string,
  storyId: string
) => Promise<{ newStoryBits: StoryBit[]; error?: any }> = async (
  payload,
  type,
  storyId
) => {
  const response = (await post('/act', {
    uid: storyId,
    type,
    payload
  })) as any;
  return response;
};

const getStory: (
  uid: string
) => Promise<{ storyBits: StoryBit[]; error: any }> = async uid => {
  const response = (await get('/story/' + uid)) as any;
  return response;
};

const getStories: (
  deviceId: string
) => Promise<{ stories: StorySmall[]; error: any }> = async deviceId => {
  const response = (await get('/stories/' + deviceId)) as any;
  return response;
};

const signup: (deviceId: string) => Promise<any> = async deviceId => {
  const result = await post('/signup', { deviceId, platform: Platform.OS });
  return result.error;
};

const getProfile: (deviceId: string) => Promise<any> = async deviceId => {
  return await get('/user/' + deviceId);
};

const updateStory: (
  storyId: string,
  makePublic: boolean
) => Promise<any> = async (storyId, makePublic) => {
  return await put('/story/' + storyId, { public: makePublic });
};

const checkAvailability: () => Promise<boolean> = async () => {
  const response = await get('', true);
  if (!response || response.status !== 200) {
    return false;
  } else {
    return true;
  }
};

const rollback: (
  storyId: string,
  bitId: number
) => Promise<{ storyBits?: StoryBit[]; error?: any }> = async (
  storyId,
  bitId
) => {
  const response = await post('/rollback', { uid: storyId, index: bitId });
  return response;
};

const useDiscordCode: (
  code: string,
  userId: string
) => Promise<{ ok?: 'ok'; error?: any }> = async (code, userId) => {
  const response = await post('/use_discord_code', { code, device_id: userId });
  return response;
};

const deleteStory: (
  storyId: string
) => Promise<{ ok?: 'ok'; error?: any }> = async storyId => {
  const response = await del('/story/' + storyId);
  return response;
};

interface UpsertCreativeClassProps {
  deviceId: string;
  uid?: Prompt['uid'];
  title: string;
  context: string;
  advanced?: AdvancedPrompt['advanced'];
}

type UpsertCreativeClassReturnType = { error: true } | any;

const upsertCreativeClass: (
  props: UpsertCreativeClassProps
) => Promise<UpsertCreativeClassReturnType> = props => {
  console.log('Creative code', props);
  if (props.uid) {
    return put('/prompt/' + props.uid, props);
  } else {
    return post('/prompt', props);
  }
};

const getPrompts: (
  deviceId: string
) => Promise<{ prompts: Prompt[] }> = async deviceId => {
  const response = ((await get('/prompts/' + deviceId)) as unknown) as Promise<{
    prompts: Prompt[];
  }>;
  return response;
};

const deletePrompt: (
  promptId: number
) => Promise<{ ok?: 'ok'; error?: any }> = async promptId => {
  const response = await del('/prompt/' + promptId);
  return response;
};

const createPartyGame: (props: {
  deviceId: string;
  playerClass?: string;
  playerName?: string;
  marketplaceItemId?: number;
  promptId?: number;
}) => Promise<{ code: string; error?: string }> = async ({
  deviceId,
  playerClass,
  playerName,
  marketplaceItemId,
  promptId
}) => {
  console.log(
    'Start party game',
    deviceId,
    playerClass,
    playerName,
    marketplaceItemId,
    promptId
  );
  const response = await post('/start_party_game', {
    deviceId,
    playerClass,
    name: playerName,
    marketplaceItemId,
    promptId
  });
  console.log('START GAME RESPONSE: ', response);
  return response as any;
};

const joinPartyGame: (
  deviceId: string,
  profilePic: string,
  code: string
) => Promise<PartyModeState> = async (deviceId, profilePic, code) => {
  const response = ((await post('/join_party_game', {
    deviceId,
    profilePic,
    code
  })) as unknown) as PartyModeState;

  return response;
};

const actPartyGame = (gameId: string) => {
  return post('/act_party_game', { code: gameId });
};

type ActType = 'ACT_DO' | 'ACT_SAY' | 'ROLLBACK' | 'TELL_ME_MORE';

export type PartyGameAction =
  | { type: 'START' }
  | {
      type: 'PROPOSE';
      payload: {
        type: ActType;
        payload?: string;
      };
    }
  | { type: 'READY' }
  | { type: 'VOTE'; payload: number }
  | { type: 'NEXT_STATE' }
  | { type: 'KICK'; payload: string }
  | { type: 'PASS' }
  | { type: 'END' }
  | { type: 'PING' }
  | { type: 'JOIN_CALL' }
  | { type: 'DROP_CALL' }
  | { type: 'LEAVE' }
  | { type: 'BAN'; payload: string };

const partyGameAction = (
  deviceId: string,
  gameId: string,
  action: PartyGameAction
) => {
  return post('/action_party_game', {
    deviceId,
    action,
    code: gameId
  });
};

const testPartyGame: (
  gameId: string
) => Promise<{
  exists: boolean;
  bannedPlayers: string[];
  full: boolean;
}> = gameId => {
  return post('/test_party_game', { code: gameId }) as any;
};

const setNickname = (userId: string, nickname: string) => {
  return post('/user/' + userId, { nickname });
};

const redeemOffer = (userId: string, code: string) => {
  return post('/redeem_offer', { device_id: userId, code });
};

const getAllMarketplaceItems = (tag = 'all') => {
  if (tag === 'all') {
    return post('/get_all_marketplace_items', {});
  } else {
    return post('/get_all_marketplace_items', { tag });
  }
};

const getMyMarketplaceItems = () => {
  return get('/get_my_marketplace_items');
};

const addClassToMyShop = (promptId: number, price: number, tags: string[]) => {
  return post('/add_class_to_shop', { promptId, price, tags });
};

const deactivateMarketplaceItem = (id: number) => {
  return post('/deactivate_marketplace_item', { id });
};

const restoreMarketplaceItem = (id: number) => {
  return post('/restore_marketplace_item', { id });
};

const updateMarketplaceItem = (id: number, price: number) => {
  return post('/update_marketplace_item', { id, price });
};

const buyMarketplaceItem = (classId: number) => {
  return post('/buy_marketplace_item', { id: classId });
};

const buyAchievement = (achievement: string, price: number) => {
  return post('/buy_achievement', { achievement, price });
};

const getMarketplaceItems = (classIds: number[]) => {
  console.log('Getting market', classIds);
  return post('/get_marketplace_items', { ids: classIds });
};

const getGold = (userId: string, amount: number) => {
  return post('/user/' + userId + '/gold', { amount });
};

const getPos = (text: string) => {
  return post('/get_pos', { text });
};

export default {
  startStory,
  act,
  getStory,
  getStories,
  signup,
  getProfile,
  setMainStore,
  updateStory,
  checkAvailability,
  rollback,
  useDiscordCode,
  deleteStory,
  getPrompts,
  deletePrompt,
  joinPartyGame,
  partyGameAction,
  createPartyGame,
  actPartyGame,
  testPartyGame,
  setNickname,
  redeemOffer,
  getAllMarketplaceItems,
  getMyMarketplaceItems,
  addClassToMyShop,
  deactivateMarketplaceItem,
  restoreMarketplaceItem,
  updateMarketplaceItem,
  buyMarketplaceItem,
  getMarketplaceItems,
  getGold,
  getPos,
  upsertCreativeClass,
  buyAchievement
};
