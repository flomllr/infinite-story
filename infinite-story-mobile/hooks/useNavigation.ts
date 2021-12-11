import { useContext, useRef } from 'react';
import {
  NavigationContext,
  NavigationParams,
  NavigationAction,
  NavigationNavigateAction
} from 'react-navigation';
import Swiper from 'react-native-swiper';
import { NavigationEffectContext } from '../components/NavigationEffect/NavigationEffectContext';
import next from 'next';
import debounce from 'debounce';

let _swiper: { current: Swiper };

const setSwiper = (swiper: { current: Swiper }) => (_swiper = swiper);

type Navigate = {
  (options: {
    routeName:
      | string
      | {
          routeName: string;
          params?: NavigationParams;
          action?: NavigationNavigateAction;
          key?: string;
        };
    params?: NavigationParams;
    action?: NavigationAction;
    key?: string;
  }): boolean;
  (
    routeNameOrOptions: string,
    params?: NavigationParams,
    action?: NavigationAction
  ): boolean;
};

type GoBack = (routeKey?: string | null) => boolean;

export const useNavigation = () => {
  const navigation = useContext(NavigationContext);
  const { setCurrentRoute } = useContext(NavigationEffectContext);

  const patchedNavigate: (func: Navigate) => Navigate = func => {
    return function(...args) {
      setCurrentRoute(args[0]);
      return func.apply(this, args);
    };
  };

  const patchedGoBack: (func: GoBack) => GoBack = func => {
    return function(...args) {
      console.log('Go back');
      setCurrentRoute(args[0]);
      return func.apply(this, args);
    };
  };

  navigation.navigate = patchedNavigate(navigation.navigate);
  navigation.goBack = patchedGoBack(navigation.goBack);

  return { navigation, swiper: _swiper.current };
};

export default { setSwiper };
