import MainStore from "../mobx/mainStore";
let _mainStore: MainStore;

const setMainStore = store => {
  _mainStore = store;
};

const openApp = () => {
  _mainStore?.logEvent("open app");
};

const logAct = () => {
  _mainStore?.logEvent("act");
};

const clickShadow = () => {
  _mainStore?.logEvent("click_shadow");
};

const clickOrc = () => {
  _mainStore?.logEvent("click_orc");
};

const clickStartPartyGame = () => {
  _mainStore?.logEvent("click_start_party_game");
};

const openPurchasePartyHostModal = () => {
  _mainStore?.logEvent("open_purchase_party_host_modal");
};

const clickJoinPartyGame = () => {
  _mainStore?.logEvent("click_join_party_game");
};

const clickPurchase = (purchaseId: string) => {
  _mainStore?.logEvent(`click_purchase_${purchaseId}`);
};

const boughtMarketplaceClass = (price: number) => {
  _mainStore?.logEvent("bought_marketplace_class", { price });
};

const boughtProfilePicture = (price: number, profilePicture: string) => {
  _mainStore?.logEvent("bought_marketplace_class", { price, profilePicture });
};

const addedMarketplaceClassToShop = (price: number) => {
  _mainStore?.logEvent("added_marketplace_class_to_shop", { price });
};

const openedGoldPurchaseModal = () => {
  _mainStore?.logEvent("opened_gold_purchase_modal");
};

const selectedTagFilter = (tag: string) => {
  _mainStore?.logEvent(`selected_tag_filter_${tag}`);
};

const createdAdvancedClass = () => {
  _mainStore?.logEvent("created_advanced_class");
};

const createdSimpleClass = () => {
  _mainStore?.logEvent("created_simple_class");
};

export default {
  setMainStore,
  openApp,
  logAct,
  clickShadow,
  clickOrc,
  clickStartPartyGame,
  clickJoinPartyGame,
  openPurchasePartyHostModal,
  clickPurchase,
  boughtMarketplaceClass,
  boughtProfilePicture,
  addedMarketplaceClassToShop,
  openedGoldPurchaseModal,
  selectedTagFilter,
  createdAdvancedClass,
  createdSimpleClass
};
