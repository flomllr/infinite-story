import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { colors, fonts } from '../theme';
import { inject, observer } from 'mobx-react';
import ControlService from '../services/ControlService';
import AutoHeightImage from '../components/AutoHeightImage';

const screenWidth = Math.round(Dimensions.get('window').width);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center'
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular
  },
  headline: {
    fontSize: 23,
    marginTop: 30,
    marginBottom: 50
  },
  closeButton: {
    fontSize: 30,
    paddingHorizontal: 10
  },
  textContainer: {
    paddingVertical: 50
  },
  textButton: {
    fontSize: 15,
    marginVertical: 10
  },
  collapse: {
    flex: 1,
    alignItems: 'center'
  },
  collapseHeader: {
    paddingVertical: 20
  },
  collapseBody: {
    borderColor: colors.defaultText,
    borderWidth: 1,
    padding: 10
  }
});

class Error extends Component<any, any> {
  static defaultProps = {};
  render() {
    const { mainStore } = this.props;
    const { error } = mainStore;
    console.log(error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.textContainer]}>
          <Text style={[styles.text, styles.headline]}>
            Something went wrong
          </Text>
          <TouchableOpacity onPress={() => ControlService.wipeData()}>
            <Text style={[styles.text, styles.textButton]}>Restart</Text>
          </TouchableOpacity>
        </View>
        <AutoHeightImage
          uri={require('../assets/skeleton_dead.gif')}
          width={screenWidth * 0.9}
        />
      </SafeAreaView>
    );
  }
}

export default inject('mainStore')(observer(Error));
