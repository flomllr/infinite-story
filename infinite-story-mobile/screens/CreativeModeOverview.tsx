import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { inject, observer } from 'mobx-react';
import { colors, fonts, size } from '../theme';
import Header from '../components/Header';
import { ScrollView } from 'react-native-gesture-handler';
import PixelButton from '../components/PixelButton';
import MainStore from '../mobx/mainStore';
import { PlayerClass } from '../components/PlayerClass';
import { Space } from '../components/shared';
import { isAdvancedPrompt, PlayerStatus } from '../types';
import AnalyticsService from '../services/AnalyticsService';
import { useNavigation } from '../hooks/useNavigation';

interface Props {
  mainStore?: MainStore;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  title: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 18,
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'center'
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 20
  },
  buttons: {
    height: 50,
    marginVertical: 30,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  button: {
    height: 50,
    marginHorizontal: 10
  },
  startButtonText: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    padding: 10,
    textAlign: 'center'
  },
  placeholder: {
    color: colors.lightgray,
    fontFamily: fonts.regular,
    marginTop: 30,
    textAlign: 'center'
  },
  heading: {
    fontFamily: fonts.regular,
    color: colors.defaultText,
    fontSize: 23,
    textAlign: 'center',
    marginBottom: 15
  }
});

const CreativeModeOverview = ({ mainStore }: Props) => {
  const { prompts } = mainStore;
  const { navigation } = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Text style={styles.heading}>Creative Studio</Text>
      <View style={styles.innerContainer}>
        <ScrollView style={{ flex: 1 }}>
          {prompts && prompts.length > 0 ? (
            prompts.map((p, index) => (
              <View key={p.uid}>
                <PlayerClass
                  portrait={
                    isAdvancedPrompt(p) ? p.advanced.portrait : 'creative'
                  }
                  name={p.title}
                  description={
                    isAdvancedPrompt(p)
                      ? p.advanced.description
                      : 'Not created with advanced mode'
                  }
                  author={{
                    nickname: isAdvancedPrompt(p) ? 'Advanced' : 'Simple',
                    status: isAdvancedPrompt(p)
                      ? PlayerStatus.INFINITE
                      : PlayerStatus.PEASANT
                  }}
                  onPress={() => {
                    if (isAdvancedPrompt(p)) {
                      mainStore.setEditCreativeClass(p);
                      navigation.navigate('CreateAdvancedClassModal');
                    } else {
                      mainStore.setCurrentPromptTitle(p.title);
                      mainStore.setCurrentPromptContext(p.context);
                      mainStore.setCurrentPromptUid(p.uid);
                      mainStore.setPromptButtonActivated(true);
                      navigation.navigate('PromptModal');
                    }
                  }}
                  nopad
                />
                <Space h={size.defaultSpaceBetween + 'px'} />
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>
              Once you create your own custom classes, they will show up here.
            </Text>
          )}
        </ScrollView>

        <PixelButton
          primary
          onPress={() => {
            mainStore.setEditCreativeClass({
              context: '',
              title: '',
              uid: 0,
              advanced: {
                description: '',
                location: '',
                name: '',
                portrait: 'creative',
                prompts: [''],
                tags: []
              }
            });
            mainStore.setPromptButtonActivated(true);
            navigation.navigate('CreateAdvancedClassModal');
            AnalyticsService.createdAdvancedClass();
          }}
          label={'Create - Advanced Mode'}
        />
        <Space h={'10px'} />
        <PixelButton
          onPress={() => {
            mainStore.setCurrentPromptTitle('');
            mainStore.setCurrentPromptContext('');
            mainStore.setCurrentPromptUid(undefined);
            mainStore.setPromptButtonActivated(true);
            navigation.navigate('PromptModal');
            AnalyticsService.createdSimpleClass();
          }}
          label={'Create - Simple Mode'}
        />
      </View>
    </SafeAreaView>
  );
};

export default inject('mainStore')(observer(CreativeModeOverview));
