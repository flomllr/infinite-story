import MainStore from '../mobx/mainStore';

let _mainStore: MainStore;
let _navigation: any;

const setMainStore = store => {
  _mainStore = store;
};

const setNavigation = nav => {
  _navigation = nav;
};

const criticalError = (error: any) => {
  _mainStore.setError(error);
};

const uncriticalError = (message: string, duration?: number) => {
  _mainStore.setUncriticalError(message);
  console.log('Uncritical error', message);
  setTimeout(() => _mainStore.setUncriticalError(undefined), duration || 2000);
};

const storyError = (message: string, duration?: number) => {
  _mainStore.setStoryError(message);
  setTimeout(() => _mainStore.setStoryError(undefined), duration || 2000);
};

const log = obj => {
  const logObj = { log: obj };
  _mainStore.log += JSON.stringify(logObj);
};

const handleError = (error: string | { error: string }) => {
  const errorObj = typeof error === 'string' ? { error } : error;

  if (errorObj.error === 'MODEL_LOOPING') {
    uncriticalError(
      'The AI is confused by this prompt. Try with a longer prompt.'
    );
    console.log('Navigation', _navigation);
    _navigation.navigate('Navigation');
    return;
  }

  if (errorObj.error === 'STORY_DOES_NOT_EXIST') {
    _mainStore.clearStoryIdInStore();
    return;
  }

  if (_mainStore.apiAvailable) {
    criticalError({ ...errorObj, code: 5000 });
  }
};

export default {
  setMainStore,
  criticalError,
  uncriticalError,
  log,
  storyError,
  setNavigation,
  handleError
};
