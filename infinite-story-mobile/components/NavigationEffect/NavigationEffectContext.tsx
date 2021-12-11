import React, {
  createContext,
  useRef,
  MutableRefObject,
  useState
} from 'react';
import debounce from 'debounce';

interface NavigationEffectContextValue {
  currentRoute?: string;
  setCurrentRoute: (route: string) => void;
}

export const NavigationEffectContext = createContext<
  NavigationEffectContextValue
>({
  currentRoute: undefined,
  setCurrentRoute: () => null
});

// eslint-disable-next-line react/prop-types
export const NavigationEffectContextProvider = ({ children }) => {
  const [currentRoute, _setCurrentRoute] = useState<string>();
  const previousRoute = useRef('');

  const setCurrentRoute = debounce((route: string) => {
    console.log('New route', route);
    if (route != currentRoute) {
      console.log('Reset');
      previousRoute.current = currentRoute;
      _setCurrentRoute(route);
    }
  }, 1000);

  return (
    <NavigationEffectContext.Provider value={{ currentRoute, setCurrentRoute }}>
      {children}
    </NavigationEffectContext.Provider>
  );
};
