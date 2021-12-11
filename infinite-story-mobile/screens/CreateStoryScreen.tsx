import React from 'react';
import { Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors, fonts } from '../theme';
import ControlService from '../services/ControlService';
import { observer } from 'mobx-react';
import Header from '../components/Header';
import { CreateStory } from '../components/CreateStory';
import { useNavigation } from '../hooks/useNavigation';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  button: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 30,
    paddingHorizontal: 20
  }
});

const CreateStoryScreen = () => {
  const { navigation } = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Header
        leftButton={
          <TouchableOpacity
            onPress={() => {
              ControlService.abortStoryCreation();
              navigation.goBack();
            }}
          >
            <Text style={styles.button}>&lt;</Text>
          </TouchableOpacity>
        }
      />
      <CreateStory
        onStart={ControlService.startStory}
        onStartMarketClass={(marketClass, name) => {
          ControlService.startStory(null, name, null, marketClass.id);
        }}
        onStartCreativeClass={(creativeClass, name) => {
          ControlService.startStory(null, name, creativeClass.uid, null);
        }}
      />
    </SafeAreaView>
  );
};

export default observer(CreateStoryScreen);
