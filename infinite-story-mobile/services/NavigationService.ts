import { NavigationActions, StackActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params?) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  );
}

function replace(routeName, params?) {
  _navigator.dispatch(
    StackActions.replace({
      routeName,
      params
    })
  );
}

// add other navigation functions that you need and export them

export default {
  navigate,
  replace,
  setTopLevelNavigator
};
