import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { colors, fonts } from '../theme';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationContext } from 'react-navigation';
import { observer, inject } from 'mobx-react';
import MainStore from '../mobx/mainStore';

interface Props {
  author: string;
  title: string;
  context: string;
  public: boolean;
  mainStore?: MainStore;
  uid: number;
}

const styles = StyleSheet.create({
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular
  },
  box: {
    flex: 1,
    marginTop: 30
  },
  author: {
    color: colors.lightgray
  },
  private: {
    color: colors.actDo
  },
  public: {
    color: colors.actSay
  },
  title: {
    fontSize: 16
  }
});

const PromptOverview: React.SFC<Props> = ({
  author,
  title,
  public: publ,
  context,
  mainStore,
  uid
}) => {
  const navigation = useContext(NavigationContext);
  const onOpenPrompt = () => {
    mainStore.setCurrentPromptTitle(title);
    mainStore.setCurrentPromptContext(context);
    mainStore.setCurrentPromptUid(uid);
    mainStore.setPromptButtonActivated(true);
    navigation.navigate('PromptModal');
  };
  return (
    <TouchableOpacity style={styles.box} onPress={onOpenPrompt}>
      <Text style={[styles.text, styles.author]}>
        {author} |{' '}
        {publ ? (
          <Text style={styles.public}>public</Text>
        ) : (
          <Text style={styles.private}>private</Text>
        )}
      </Text>
      <Text style={[styles.text, styles.title]}>{title}</Text>
      <Text style={[styles.text]}>
        {context && context.length > 150
          ? context.substr(0, 150) + '...'
          : context}
      </Text>
    </TouchableOpacity>
  );
};

PromptOverview.propTypes = {
  author: PropTypes.string,
  title: PropTypes.string,
  context: PropTypes.string,
  public: PropTypes.bool,
  mainStore: PropTypes.any,
  uid: PropTypes.any
};

export default inject('mainStore')(observer(PromptOverview));
