import React, { Component } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { inject, observer } from 'mobx-react';
import MainStore from '../mobx/mainStore';
import StorySmallComponent from '../components/StorySmall';
import { colors, fonts, size } from '../theme';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../components/Header';
import { PageTitle, MarginWrapper, Space } from '../components/shared';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  textBox: {
    marginHorizontal: 25,
    marginTop: 25,
    color: colors.lightgray
  },
  flex: {
    flex: 1,
    width: '100%'
  },
  buttonContainer: {
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
    width: 20,
    marginLeft: 10
  },
  buttonText: {
    fontSize: 13
  }
});

class History extends Component<any, any> {
  static defaultProps = {};

  state = { id: Math.random() };

  render() {
    const { slideRight } = this.props;
    const mainStore: MainStore = this.props.mainStore;
    const { stories } = mainStore;
    const sortedStories = Object.values(stories || {}).sort((a, b) =>
      new Date(a.updatedAt) < new Date(b.updatedAt) ? 1 : -1
    );
    return (
      <SafeAreaView style={styles.container}>
        <Header
          leftButton={<View></View>}
          rightButtons={[
            <TouchableOpacity
              key={Math.random()}
              style={styles.flex}
              onPress={() => slideRight()}
            >
              <View style={styles.buttonContainer}>
                <Text style={[styles.text, styles.buttonText]}>Start</Text>
                <Text style={[styles.text, styles.button]}>&gt;</Text>
              </View>
            </TouchableOpacity>
          ]}
        />
        <MarginWrapper>
          <PageTitle>History</PageTitle>
        </MarginWrapper>
        <ScrollView style={{ padding: 20 }}>
          {sortedStories && sortedStories.length > 0 ? (
            sortedStories.map(item => (
              <View key={item.uid}>
                <StorySmallComponent {...item} />
                <Space h={size.defaultSpaceBetween + 'px'} />
              </View>
            ))
          ) : (
            <Text style={[styles.text, styles.textBox]}>
              Once you start your first adventure, it will show up here
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default inject('mainStore')(observer(History));
