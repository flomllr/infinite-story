import MainStore from '../mobx/mainStore';

let _mainStore: MainStore;
const setMainStore = (mainStore: MainStore) => {
  _mainStore = mainStore;
};

export const useMainStore = () => _mainStore;

export default { setMainStore };
