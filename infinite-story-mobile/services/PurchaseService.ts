import Purchases from 'react-native-purchases';
import MainStore from '../mobx/mainStore';
let _mainStore: MainStore;

const init = (mainStore: MainStore) => {
  Purchases.setDebugLogsEnabled(true);
  Purchases.setup('bIPfHyKbJhuxaJbJMOIsNUCWHxphVcuF', mainStore.userId);
  _mainStore = mainStore;
};

const getProducts = async () => {
  const offerings = await Purchases.getOfferings();
  const { availablePackages = [] } = offerings?.current || {};
  console.log('Offerings', offerings);
  return availablePackages;
};

const getProduct = async id => {
  console.log(id);
  const products = await getProducts();
  console.log('Products', products);
  const product = products.find(p => p.product && p.product.identifier === id);
  return product;
};

const purchase = async pkg => {
  try {
    const {
      purchaserInfo,
      productIdentifier
    } = await Purchases.purchasePackage(pkg);
    _mainStore.setRevCatUser(purchaserInfo);
    console.log('PurchaserInfo', purchaserInfo);
    console.log('productID', productIdentifier);
    return true;
  } catch (e) {
    if (!e.userCancelled) {
      console.log(e);
      throw e;
    } else {
      console.log('Purchase cancelled by user');
      return false;
    }
  }
};

const restore = async () => {
  try {
    const purchaserInfo = await Purchases.restoreTransactions();
    _mainStore.setRevCatUser(purchaserInfo);
  } catch (e) {
    if (!e.userCancelled) {
      console.log(e);
      throw e;
    } else {
      console.log('Purchase cancelled by user');
    }
  }
};

const getUserData = async () => {
  try {
    const purchaserInfo = await Purchases.getPurchaserInfo();
    return purchaserInfo;
  } catch (e) {
    console.log(e);
  }
};

export default {
  getProducts,
  getProduct,
  init,
  purchase,
  getUserData,
  restore
};
