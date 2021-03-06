import { AppRegistry, Platform } from 'react-native';
import App from './App';
import 'react-native-root-siblings';

AppRegistry.registerComponent('infinitestory', () => App);

if (Platform.OS === 'web') {
  const rootTag =
    document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('infinitestory', { rootTag });
}
