import React from 'react';
import Loading from './screens/Loading';
import AppLoading from './screens/AppLoading';
import ErrorScreen from './screens/Error';
import * as Font from 'expo-font';
import {
  View,
  StyleSheet,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Asset } from 'expo-asset';
import { Provider, observer } from 'mobx-react';
import MainStore from './mobx/mainStore';
import ControlService from './services/ControlService';
import ApiService from './services/ApiService';
import Navigation from './container/Navigation';
import Story from './screens/Story';
import MainStory from './container/MainStory';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { locations } from './components/StoryBit';
import Toast from 'react-native-root-toast';
import ErrorService from './services/ErrorService';
import Modal from 'react-native-modal';
import { PartyMode } from './components/PartyMode';
import CreatePrompt from './screens/CreatePrompt';
import codePush from 'react-native-code-push';
import { fonts, colors } from './theme';
import CreativeModeOverview from './screens/CreativeModeOverview';
import AnalyticsService from './services/AnalyticsService';
import PurchaseService from './services/PurchaseService';
import { SelectProfilePicture } from './screens/SelectProfilePicture';
import { SelectPortrait } from './components/CreateAdvancedClass/';
import { portraits } from './assets/portraits';
import { ProfileScreen } from './screens/Profile';
import { BuyClass } from './components/Marketplace/screens/BuyClass';
import { BuyProfilePicture } from './components/Marketplace/screens/BuyProfilePicture';
import { AddItem } from './components/Marketplace/screens/AddItem';
import { CreateAdvancedClass } from './components/CreateAdvancedClass';
import MainStoreHook from './hooks/useMainStore';
import { NavigationEffect } from './components/NavigationEffect';
import { NavigationEffectContextProvider } from './components/NavigationEffect/NavigationEffectContext';

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.IMMEDIATE
};

const prefix = 'infinitestory://';

/** Navigation */
const MainNavigator = createStackNavigator(
  {
    Navigation: { screen: Navigation, path: '' },
    StoryModal: { screen: Story, path: 'story/:storyId' },
    MainStoryModal: { screen: MainStory },
    PromptModal: { screen: CreatePrompt },
    CreativeModeModal: { screen: CreativeModeOverview },
    CreateAdvancedClassModal: { screen: CreateAdvancedClass },
    PartyModeModal: { screen: PartyMode },
    // SelectProfilePictureModal: { screen: SelectProfilePicture },
    SelectPortraitModal: { screen: SelectPortrait },
    ProfileModal: { screen: ProfileScreen },
    BuyClassModal: { screen: BuyClass },
    BuyProfilePicture: { screen: BuyProfilePicture },
    AddItemModal: { screen: AddItem }
  },
  {
    mode: 'modal',
    headerMode: 'none'
  }
);
const AppContainer = createAppContainer(MainNavigator);

/** Initialize mainStore */
const mainStore = new MainStore();
ControlService.setMainStore(mainStore);
ErrorService.setMainStore(mainStore);
ApiService.setMainStore(mainStore);
AnalyticsService.setMainStore(mainStore);
MainStoreHook.setMainStore(mainStore);

/** Initialize purchases */
//Set up purchases
PurchaseService.init(mainStore);

/** Prefetch images */
function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toast: {
    fontFamily: fonts.regular
  },
  modalContainer: {
    width: '100%'
  },
  modalInner: {
    backgroundColor: colors.modalBackground
  }
});

class App extends React.Component {
  state: {
    fontLoaded: boolean;
    activeStoryId: string | undefined;
    apiAvailable?: boolean;
  } = {
    fontLoaded: false,
    activeStoryId: undefined,
    apiAvailable: true
  };

  /** Fetch custom fonts */
  async componentDidMount() {
    const fontLoaders = Font.loadAsync({
      'SourceCodePro-Regular': require('./assets/fonts/SourceCodePro-Regular.ttf'),
      'SourceCodePro-SemiBold': require('./assets/fonts/SourceCodePro-SemiBold.ttf'),
      'SourceCodePro-Bold': require('./assets/fonts/SourceCodePro-Bold.ttf')
    });
    const p = Object.keys(portraits).map(k => portraits[k]);
    const l = Object.keys(locations)
      .map(k => locations[k])
      .reduce((prev, curr) => [...prev, ...curr], []);
    const imageLoaders = cacheImages([...p, ...l]);
    try {
      await Promise.all([...imageLoaders, fontLoaders]);
    } catch (e) {
      ErrorService.uncriticalError('Prefetching images failed');
    }
    this.setState({ fontLoaded: true });
    ControlService.checkAvailabilityAndLoadAllData();
    AnalyticsService.openApp();
    const purchaserData = await PurchaseService.getUserData();
    mainStore.setRevCatUser(purchaserData);
    console.log('User', purchaserData);
  }

  render() {
    const { fontLoaded } = this.state;
    return (
      <Provider mainStore={mainStore}>
        <NavigationEffectContextProvider>
          <View style={styles.container}>
            {fontLoaded ? (
              mainStore.error ? (
                <ErrorScreen />
              ) : mainStore.appLoading ? (
                <AppLoading />
              ) : (
                <AppContainer uriPrefix={prefix} />
              )
            ) : (
              <Loading />
            )}
          </View>
          {!!mainStore.uncriticalError && (
            <Toast visible={true} position={Toast.positions.TOP}>
              <Text style={styles.toast}>{mainStore.uncriticalError}</Text>
            </Toast>
          )}
          {!!mainStore.inAppNotification && (
            <Toast
              visible={true}
              position={Toast.positions.CENTER}
              backgroundColor={colors.gold}
              opacity={1}
            >
              <Text style={styles.toast}>{mainStore.inAppNotification}</Text>
            </Toast>
          )}

          <Modal
            isVisible={mainStore.modalVisible}
            onBackdropPress={() =>
              mainStore.modalClosable && ControlService.closeModal()
            }
            onBackButtonPress={() =>
              mainStore.modalClosable && ControlService.closeModal()
            }
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : null}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalInner}>{mainStore.modalContent}</View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </NavigationEffectContextProvider>
      </Provider>
    );
  }
}

//export default from './storybook';
export default codePush(codePushOptions)(observer(App));
