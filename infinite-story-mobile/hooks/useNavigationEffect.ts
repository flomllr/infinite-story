import { useContext, useEffect } from 'react';
import { NavigationEffectContext } from '../components/NavigationEffect/NavigationEffectContext';
import { usePrevious } from './usePrevious';

type NavigationEffect = (previousRoute: string, currentRoute: string) => void;

export const useNavigationEffect = (effect: NavigationEffect) => {
  const { currentRoute } = useContext(NavigationEffectContext);

  console.log('Got new current route');

  const previousRoute = usePrevious(currentRoute);

  useEffect(() => {
    effect(previousRoute, currentRoute);
  }, [currentRoute]);
};
