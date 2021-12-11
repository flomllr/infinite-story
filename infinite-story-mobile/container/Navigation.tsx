import React, { useRef } from 'react';
import Swiper from 'react-native-swiper';
import MainScreen from './Main';
import History from '../screens/History';
import ControlService from '../services/ControlService';
import { inject, observer } from 'mobx-react';
import MainStore from '../mobx/mainStore';
import { MarketplaceScreen } from '../components/Marketplace';
import navigationHook, { useNavigation } from '../hooks/useNavigation';
import ErrorService from '../services/ErrorService';

const Navigation = ({ mainStore }: { mainStore?: MainStore }) => {
  const swiper = useRef<Swiper>();
  navigationHook.setSwiper(swiper);
  ControlService.setSwiper(swiper);
  const { navigation } = useNavigation();
  ControlService.setNavigation(navigation);
  ErrorService.setNavigation(navigation);

  const slideLeft = () => {
    swiper.current && swiper.current.scrollBy(-1);
  };

  const slideRight = () => {
    swiper.current && swiper.current.scrollBy(1);
  };

  return (
    <Swiper
      ref={swiper}
      scrollEnabled={mainStore.tutorialDone}
      loop={false}
      showsPagination={false}
      index={mainStore.apiAvailable ? 1 : 0}
      onIndexChanged={s => {
        if (mainStore.apiAvailable) {
          mainStore.stories || ControlService.loadStories();
          ControlService.loadMyMarketplaceItems();
          ControlService.loadProfile();
        }
      }}
    >
      {mainStore.apiAvailable && <History slideRight={slideRight} />}
      <MainScreen slideLeft={slideLeft} slideRight={slideRight} />
      {mainStore.apiAvailable && <MarketplaceScreen close={slideLeft} />}
    </Swiper>
  );
};

export default inject('mainStore')(observer(Navigation));
