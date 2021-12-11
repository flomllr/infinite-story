import { PlayerClass } from '../../types';

export const OGClasses: PlayerClass[] = [
  {
    name: 'Pirate',
    description: 'You are serving on a pirate ship on the great sea.',
    value: 'pirate',
    available: true
  },
  {
    name: 'Cleric',
    description: 'You convert people to your religion and fight demons.',
    value: 'cleric',
    available: true
  },
  {
    name: 'Squire',
    description: 'You are the shield bearer of a well respected knight.',
    value: 'squire',
    available: true
  },
  {
    name: 'Rogue',
    description: 'You live from stealing rare artifacts.',
    value: 'rogue',
    available: true
  },
  {
    name: 'Knight',
    description: 'You are brave and strong. Life is dangerous for you.',
    value: 'knight',
    available: true
  },
  {
    name: 'Noble',
    description: 'You must balance a life of luxury and reign.',
    value: 'noble',
    available: true
  },
  {
    name: 'Peasant',
    description: 'You started from nothing and you still have nothing.',
    value: 'peasant',
    available: true
  },
  {
    name: 'Ranger',
    description: 'You live in the forest and hunt your own food.',
    value: 'ranger',
    available: true
  },
  {
    name: 'Wizard',
    description: 'Magic!',
    value: 'wizard',
    available: true
  },
  {
    name: 'Orc',
    value: 'orc',
    requiresAchievement: 'discord',
    available: true,
    description: 'You are a filthy creature with a taste for human flesh.'
  },
  {
    name: 'Shadow',
    value: 'shadow',
    requiresEntitlement: 'shadow_class',
    available: true,
    description: 'You are an immortal necromancer.'
  },
  {
    name: 'Blood Elf',
    value: 'blood_elf',
    requiresAchievement: 'unlocked:blood_elf',
    available: false,
    canBeBought: true
  },
  {
    name: 'Elf',
    value: 'elf',
    requiresAchievement: 'unlocked:elf',
    available: false,
    canBeBought: true
  },
  {
    name: 'Priest',
    value: 'priest',
    requiresAchievement: 'unlocked:priest',
    available: false,
    canBeBought: true
  },
  {
    name: 'Vampire',
    value: 'vampire',
    requiresAchievement: 'unlocked:vampire',
    available: false,
    canBeBought: true
  },
  {
    name: 'Femme Fatale',
    value: 'femme_fatale',
    requiresAchievement: 'unlocked:femme_fatale',
    available: false,
    canBeBought: true
  },
  {
    name: 'Dark Elf',
    value: 'dark_elf',
    requiresAchievement: 'unlocked:dark_elf',
    available: false,
    canBeBought: true
  },
  {
    name: 'Gambler',
    value: 'gambler',
    requiresAchievement: 'unlocked:gambler',
    available: false,
    canBeBought: true
  },
  {
    name: 'Servitor',
    value: 'servitor',
    requiresAchievement: 'unlocked:servitor',
    available: false,
    canBeBought: true,
    rarity: 'rare'
  },
  {
    name: 'Invoker',
    value: 'invoker',
    requiresAchievement: 'unlocked:invoker',
    available: false,
    canBeBought: true,
    rarity: 'rare'
  },
  {
    name: 'Monk',
    value: 'monk',
    requiresAchievement: 'unlocked:monk',
    available: false,
    canBeBought: true,
    rarity: 'rare'
  },
  {
    name: 'Herbalist',
    value: 'herbalist',
    requiresAchievement: 'unlocked:herbalist',
    available: false,
    canBeBought: true,
    rarity: 'rare'
  },
  {
    name: 'Warrior',
    value: 'warrior',
    requiresAchievement: 'unlocked:warrior',
    available: false,
    canBeBought: true,
    rarity: 'super'
  },
  {
    name: 'Liche',
    value: 'liche',
    requiresAchievement: 'unlocked:liche',
    available: false,
    canBeBought: true,
    rarity: 'super'
  },
  {
    name: 'Dark Knight',
    value: 'dark_knight',
    requiresAchievement: 'unlocked:dark_knight',
    available: false,
    canBeBought: true,
    rarity: 'super'
  },
  {
    name: 'Worshipper',
    value: 'worshipper',
    requiresAchievement: 'unlocked:worshipper',
    available: false,
    canBeBought: true,
    rarity: 'super'
  },
  {
    name: 'Elfling',
    value: 'elfling',
    requiresAchievement: 'unlocked:elfling',
    available: false,
    canBeBought: true,
    rarity: 'ultra'
  },
  {
    name: 'Alchemist',
    value: 'alchemist',
    requiresAchievement: 'unlocked:alchemist',
    available: false,
    canBeBought: true,
    rarity: 'ultra'
  }
];

export function isOGClass(classItem: any): classItem is PlayerClass {
  return (
    OGClasses.find(
      OGClass => JSON.stringify(OGClass) === JSON.stringify(classItem)
    ) != null
  );
}
