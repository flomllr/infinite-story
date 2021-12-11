export const NAMETAG = '<NAME>';

export interface StoryBit {
  type:
    | 'TEXT'
    | 'ACT_SAY'
    | 'ACT_DO'
    | 'IMAGE'
    | 'ORIGIN'
    | 'LOCATION'
    | 'SYSTEM';
  payload: string | Origin | Location;
  metadata?: any;
}

export interface Origin {
  name?: string;
  class:
    | 'noble'
    | 'knight'
    | 'squire'
    | 'wizard'
    | 'ranger'
    | 'peasant'
    | 'rogue';
  location: string;
  portrait?: string;
}

export interface Location {
  location:
    | 'forest'
    | 'jail'
    | 'castle'
    | 'keep'
    | 'lake'
    | 'mountain'
    | 'town'
    | 'village';
  firstVisit: boolean;
  seed: number;
}

export interface PlayerClass {
  name: string;
  value: string;
  description?: string;
  requiresAchievement?: string;
  requiresEntitlement?: string;
  available: boolean;
  canBeBought?: boolean;
  rarity?: 'ultra' | 'super' | 'rare' | 'common';
}

export interface ProfilePicture {
  name: string;
  value: string;
  requiresEntitlement?: string;
  requiresAchievement?: string;
}

export interface StoryMetadata {
  party_game?: boolean;
  updated_date?: number;
  code?: number;
  profile_picture?: string;
}

export interface StorySmall {
  title: string;
  createdAt: string;
  origin: Origin;
  uid: string;
  updatedAt: string;
  metadata: StoryMetadata;
}

export interface Prompt {
  uid: number;
  title: string;
  context: string;
  advanced?: {};
}

export type AdvancedPrompt = Prompt & {
  advanced: {
    description: string;
    location: string;
    name: string;
    portrait: string;
    prompts: string[];
    tags: string[];
    grammar?: null;
    keywordInjecter?: null;
  };
};

export function isPrompt(item: any): item is Prompt {
  if (!item || typeof item !== 'object') {
    return false;
  }

  return (
    'uid' in item && 'title' in item && 'context' in item && 'author' in item
  );
}

export function isAdvancedPrompt(item: any): item is AdvancedPrompt {
  return (
    isPrompt(item) &&
    'advanced' in item &&
    Object.keys(item.advanced).length > 0
  );
}

export function containsNameTag({
  context,
  prompts
}: {
  context: string;
  prompts?: string[];
}) {
  return (
    context.includes(NAMETAG) || prompts?.find(p => p.includes(NAMETAG)) != null
  );
}

export type PurchaseId = 'unlock_shadow_class' | 'partymode';

export enum PlayerStatus {
  PEASANT = 'PEASANT',
  EARLY = 'EARLY',
  VIP = 'VIP',
  INFINITE = 'INFINITE'
}

export enum JitsiMeetStatus {
  NOT_JOINED = 'NOT_JOINED',
  IN_CALL = 'IN_CALL',
  JOINING = 'JOINING'
}

export interface MarketplaceItem {
  createdAt: string;
  id: number;
  item: {
    item: {
      context: string;
      description: string;
      grammar: null;
      keywordInjecter: null;
      location: string;
      name: string;
      portrait: string;
      prompts: string[];
    };
    type: 'CLASS';
  };
  price: number;
  usedAllTime: number;
  usedLastWeek: number;
  boughtAllTime: number;
  tags: string[];
}

export function isMarketplaceClassItem(item: any): item is MarketplaceItem {
  return item?.item?.type === 'CLASS';
}

export type BuyerMarketplaceItem = MarketplaceItem & {
  author: { nickname?: string; status: PlayerStatus; deviceId: string };
};

export type SellerMarketplaceItem = MarketplaceItem & {
  revenueAllTime: number;
  softDelete: boolean;
  transactions: MarketplaceTransaction[];
};

export interface MarketplaceTransaction {
  amount: number;
  buyer: { nickname?: string; status: PlayerStatus };
  date: string;
}

export enum CREATE_STORY_STEPS {
  SELECT_CLASS,
  SELECT_NAME
}

export interface CreateStoryState {
  playerClass: string;
  marketClass: MarketplaceItem | null;
  creativeClass: Prompt | null;
  name: string;
  step: CREATE_STORY_STEPS;
}

export enum MarketplaceTags {
  FANTASY = 'FANTASY',
  SIMPLE = 'SIMPLE',
  ROMANCE = 'ROMANCE',
  SCI_FI = 'SCI_FI',
  ANIME = 'ANIME',
  WEIRD = 'WEIRD',
  OTHER = 'OTHER',
  NSFW = 'NSFW'
}
