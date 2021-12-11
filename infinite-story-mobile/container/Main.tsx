import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import Welcome from '../screens/Welcome';
import { inject, observer } from 'mobx-react';
import Header from '../components/Header';
import { colors, fonts } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  flex: {
    flex: 1,
    width: '100%'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  buttonContainerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular
  },
  button: {
    fontSize: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30
  },
  buttonRight: {
    marginLeft: 10,
    fontSize: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30
  },
  buttonText: {
    fontSize: 13
  }
});

class Main extends Component<any, any> {
  static defaultProps = {};
  render() {
    const { slideLeft, slideRight, mainStore } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        {mainStore.apiAvailable && mainStore.tutorialDone && (
          <Header
            leftButton={
              <TouchableOpacity style={styles.flex} onPress={() => slideLeft()}>
                <View style={styles.buttonContainer}>
                  <Text style={[styles.text, styles.button]}>&lt;</Text>
                  <Text style={[styles.text, styles.buttonText]}>History</Text>
                </View>
              </TouchableOpacity>
            }
            rightButtons={[
              <TouchableOpacity
                key={'button1'}
                style={styles.flex}
                onPress={() => slideRight()}
              >
                <View style={styles.buttonContainerRight}>
                  <Text style={[styles.text, styles.buttonText]}>Market</Text>
                  <Text style={[styles.text, styles.buttonRight]}>&gt;</Text>
                </View>
              </TouchableOpacity>
            ]}
          />
        )}

        <Welcome />
      </SafeAreaView>
    );
  }
}

export default inject('mainStore')(observer(Main));
