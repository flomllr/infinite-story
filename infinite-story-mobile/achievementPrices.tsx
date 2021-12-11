export interface AchievementPurchaseData {
  [key: string]: {
    price: number;
    description: string;
  };
}
export const ACHIEVEMENT_PURCHASE_DATA: AchievementPurchaseData = {
  'unlocked:blood_elf': {
    price: 100,
    description: 'Unlock the Blood Elf profile picture'
  },
  'unlocked:elf': {
    price: 100,
    description: 'Unlock the Elf profile picture'
  },
  'unlocked:invoker': {
    price: 300,
    description: 'Unlock the Invoker profile picture'
  },
  'unlocked:liche': {
    price: 700,
    description: 'Unlock the Liche profile picture'
  },
  'unlocked:monk': {
    price: 300,
    description: 'Unlock the Monk profile picture'
  },
  'unlocked:priest': {
    price: 100,
    description: 'Unlock the Priest profile picture'
  },
  'unlocked:servitor': {
    price: 300,
    description: 'Unlock the Servitor profile picture'
  },
  'unlocked:gambler': {
    price: 100,
    description: 'Unlock the Gambler profile picture'
  },
  'unlocked:vampire': {
    price: 100,
    description: 'Unlock the Vampire profile picture'
  },
  'unlocked:warrior': {
    price: 700,
    description: 'Unlock the Warrior profile picture'
  },
  'unlocked:alchemist': {
    price: 2500,
    description: 'Unlock the Alchemist profile picture. This is the portrait Justin is using on Discord.'
  },
  'unlocked:dark_knight': {
    price: 700,
    description: 'Unlock the Dark Knight profile picture'
  },
  'unlocked:elfling': {
    price: 2500,
    description: 'Unlock the Elfling profile picture. This is the portrait Flo is using on Discord.'
  },
  'unlocked:worshipper': {
    price: 700,
    description: 'Unlock the Worshipper profile picture'
  },
  'unlocked:herbalist': {
    price: 300,
    description: 'Unlock the Herbalist profile picture'
  },
  'unlocked:femme_fatale': {
    price: 100,
    description: 'Unlock the Femme Fatale profile picture'
  },
  'unlocked:dark_elf': {
    price: 100,
    description: 'Unlock the Dark Elf profile picture'
  }
};
