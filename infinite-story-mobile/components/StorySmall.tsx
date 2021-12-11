/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Origin, StoryMetadata } from '../types';
import { colors, fonts } from '../theme';
import { withNavigation } from 'react-navigation';
import { portraits } from '../assets/portraits';
import DateTime from 'luxon/src/datetime.js';
import ControlService from '../services/ControlService';
import { useNavigation } from '../hooks/useNavigation';

interface Props {
  createdAt: string;
  updatedAt: string;
  origin?: Origin;
  uid: string | number;
  title?: string;
  metadata: StoryMetadata;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    fontSize: 20
  },
  subText: {
    color: colors.lightgray,
    fontSize: 14
  },
  multiplayerLabel: {
    color: colors.actSay,
    fontFamily: fonts.regular,
    fontSize: 14
  }
});

const StorySmall = ({
  createdAt,
  updatedAt,
  origin,
  uid,
  title,
  metadata
}: Props) => {
  const { navigation } = useNavigation();
  const dateJs = new Date(updatedAt);
  const dateLuxon = DateTime.fromJSDate(dateJs);
  const template = DateTime.DATETIME_MED;
  delete template.year;
  const displayDate = dateLuxon.toLocaleString(template);

  const handleResumeStory = async () => {
    const { party_game, updated_date, code, profile_picture } = metadata;

    const validPartyGame =
      party_game &&
      code &&
      updated_date &&
      profile_picture &&
      Date.now() - updated_date < 1000 * 60 * 60 * 10 &&
      (await ControlService.testPartyGame(String(code))).canJoin;

    if (validPartyGame) {
      ControlService.joinPartyGame(String(code), profile_picture);
      navigation.navigate('PartyModeModal');
    } else {
      navigation.navigate('StoryModal', { storyId: uid });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleResumeStory}>
      <Image
        style={{ width: 70, height: 70 }}
        source={
          origin && origin.class
            ? portraits[origin.portrait || origin.class]
            : require('../assets/portraits/creative.png')
        }
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.text}>
          {title || `${origin.name || origin.class} from ${origin.location}`}
        </Text>
        <Text style={[styles.text, styles.subText]}>{displayDate}</Text>
        {metadata?.party_game && (
          <Text style={styles.multiplayerLabel}>Party game</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default StorySmall;
