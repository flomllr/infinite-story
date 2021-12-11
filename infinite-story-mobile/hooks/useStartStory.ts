import { useContext } from 'react';
import {
  MarketplaceItem,
  Prompt,
  containsNameTag,
  isMarketplaceClassItem,
  isPrompt,
  CREATE_STORY_STEPS
} from '../types';
import ControlService from '../services/ControlService';
import MainStore from '../mobx/mainStore';
import { NavigationContext } from 'react-navigation';

export const useStartStory = (mainStore: MainStore) => {
  const navigation = useContext(NavigationContext);

  const handlePlay = (item: MarketplaceItem | Prompt | string) => {
    if (typeof item === 'string') {
      ControlService.createStory();
      mainStore.setCreateStoryState({
        playerClass: item,
        step: CREATE_STORY_STEPS.SELECT_NAME
      });
      navigation.navigate('MainStoryModal');
      return;
    }

    if (isMarketplaceClassItem(item)) {
      if (containsNameTag(item.item.item)) {
        ControlService.createStory();
        mainStore.setCreateStoryState({
          marketClass: item,
          step: CREATE_STORY_STEPS.SELECT_NAME
        });
      } else {
        ControlService.startStory(null, null, null, item.id);
      }
      navigation.navigate('MainStoryModal');
      return;
    }

    if (isPrompt(item)) {
      if (containsNameTag(item)) {
        ControlService.createStory();
        mainStore.setCreateStoryState({
          creativeClass: item,
          step: CREATE_STORY_STEPS.SELECT_NAME
        });
      } else {
        ControlService.startStory(null, null, item.uid);
      }
      navigation.navigate('MainStoryModal');
      return;
    }
  };

  return handlePlay;
};
