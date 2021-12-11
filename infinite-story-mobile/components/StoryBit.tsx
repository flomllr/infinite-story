import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { StoryBit, Origin, Location } from '../types';
import { colors, fonts } from '../theme';
import PropTypes from 'prop-types';
import AutoHeightImage from '../components/AutoHeightImage';
import { Nickname } from './Nickname';
import { portraits } from '../assets/portraits';

const screenWidth = Math.round(Dimensions.get('window').width);

interface Props {
  bit: StoryBit;
  width?: number;
  popoverVisible?: boolean;
  popoverText?: string;
  onLongPress?: () => void;
  onPopoverPress?: () => void;
  onPress?: () => void;
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    flex: 1
  },
  rowText: {
    flex: 1,
    flexDirection: 'row'
  },
  message: {
    fontSize: 18,
    color: colors.messageText,
    fontFamily: fonts.regular
  },
  prompt: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: fonts.regular
  },
  promptContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  superPromptContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  promtContainerMargin: {
    marginVertical: 25
  },
  semiBold: {
    fontFamily: fonts.semiBold
  },
  sayPrompt: {
    color: colors.actSay
  },
  bold: {
    fontFamily: fonts.semiBold
  },
  location: {
    color: colors.lightgray,
    marginVertical: 10,
    fontSize: 15
  },
  origin: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 25
  },
  system: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 5
  },
  originPortrait: {
    width: 150,
    height: 150
  },
  systemPortrait: {
    width: 60,
    height: 79
  },
  originText: {
    marginHorizontal: 10,
    flex: 1,
    justifyContent: 'center'
  },
  systemText: {
    marginHorizontal: 10,
    flex: 1,
    justifyContent: 'center'
  },
  originName: {
    fontSize: 20
  },
  originSubtitle: {
    color: colors.lightgray
  },
  image: {
    flex: 1
  },
  locationbox: {
    flex: 1,
    marginVertical: 25
  },
  popover: {
    backgroundColor: colors.verydarkgray,
    padding: 20,
    flex: 1,
    marginVertical: 10
  },
  popoverText: {
    fontFamily: fonts.semiBold,
    color: colors.defaultText
  }
});

export const locations = {
  dungeon: [
    require('../assets/locations/dungeon/dungeon1.png'),
    require('../assets/locations/dungeon/dungeon2.png'),
    require('../assets/locations/dungeon/dungeon3.png'),
    require('../assets/locations/dungeon/dungeon4.png'),
    require('../assets/locations/dungeon/dungeon5.png')
  ],
  jail: [require('../assets/locations/jail/jail1.png')],
  forest: [
    require('../assets/locations/forest/forest1.png'),
    require('../assets/locations/forest/forest2.png'),
    require('../assets/locations/forest/forest3.png'),
    require('../assets/locations/forest/forest4.png')
  ],
  graveyard: [
    require('../assets/locations/graveyard/graveyard1.png'),
    require('../assets/locations/graveyard/graveyard2.png'),
    require('../assets/locations/graveyard/graveyard3.png')
  ],
  mountain: [
    require('../assets/locations/mountain/mountain1.png'),
    require('../assets/locations/mountain/mountain2.png'),
    require('../assets/locations/mountain/mountain3.png')
  ],
  observatory: [
    require('../assets/locations/observatory/observatory1.png'),
    require('../assets/locations/observatory/observatory2.png'),
    require('../assets/locations/observatory/observatory3.png'),
    require('../assets/locations/observatory/observatory4.png'),
    require('../assets/locations/observatory/observatory5.png')
  ],
  orchard: [
    require('../assets/locations/orchard/orchard1.png'),
    require('../assets/locations/orchard/orchard2.png'),
    require('../assets/locations/orchard/orchard3.png'),
    require('../assets/locations/orchard/orchard4.png')
  ],
  ruin: [
    require('../assets/locations/ruin/ruin1.png'),
    require('../assets/locations/ruin/ruin2.png'),
    require('../assets/locations/ruin/ruin3.png'),
    require('../assets/locations/ruin/ruin4.png'),
    require('../assets/locations/ruin/ruin5.png')
  ],
  plain: [require('../assets/locations/plain/plain1.png')],
  sanctuary: [
    require('../assets/locations/sanctuary/sanctuary1.png'),
    require('../assets/locations/sanctuary/sanctuary2.png'),
    require('../assets/locations/sanctuary/sanctuary3.png'),
    require('../assets/locations/sanctuary/sanctuary4.png')
  ],
  sewer: [
    require('../assets/locations/sewer/sewer1.png'),
    require('../assets/locations/sewer/sewer2.png'),
    require('../assets/locations/sewer/sewer3.png'),
    require('../assets/locations/sewer/sewer4.png'),
    require('../assets/locations/sewer/sewer5.png')
  ],
  moon: [require('../assets/locations/moon/moon1.png')],
  mars: [require('../assets/locations/mars/mars1.png')],
  star: [require('../assets/locations/star/star1.png')],
  swamp: [
    require('../assets/locations/swamp/swamp1.png'),
    require('../assets/locations/swamp/swamp2.png'),
    require('../assets/locations/swamp/swamp3.png'),
    require('../assets/locations/swamp/swamp4.png')
  ],
  valley: [require('../assets/locations/valley/valley1.png')],
  temple: [
    require('../assets/locations/temple/temple1.png'),
    require('../assets/locations/temple/temple2.png'),
    require('../assets/locations/temple/temple3.png'),
    require('../assets/locations/temple/temple4.png'),
    require('../assets/locations/temple/temple5.png')
  ],
  desert: [
    require('../assets/locations/desert/desert1.png'),
    require('../assets/locations/desert/desert2.png'),
    require('../assets/locations/desert/desert3.png'),
    require('../assets/locations/desert/desert4.png'),
    require('../assets/locations/desert/desert5.png')
  ],
  city: [
    require('../assets/locations/city/city1.png'),
    require('../assets/locations/city/city2.png')
  ],
  village: [require('../assets/locations/village/village1.png')],
  town: [require('../assets/locations/town/town1.png')],
  port: [
    require('../assets/locations/port/port1.png'),
    require('../assets/locations/port/port2.png')
  ],
  cave: [
    require('../assets/locations/cave/cave1.png'),
    require('../assets/locations/cave/cave2.png'),
    require('../assets/locations/cave/cave3.png'),
    require('../assets/locations/cave/cave4.png')
  ],
  catacomb: [
    require('../assets/locations/catacomb/catacomb1.png'),
    require('../assets/locations/catacomb/catacomb2.png'),
    require('../assets/locations/catacomb/catacomb3.png'),
    require('../assets/locations/catacomb/catacomb4.png'),
    require('../assets/locations/catacomb/catacomb5.png'),
    require('../assets/locations/catacomb/catacomb6.png')
  ],
  castle: [
    require('../assets/locations/castle/castle1.png'),
    require('../assets/locations/castle/castle2.png'),
    require('../assets/locations/castle/castle3.png'),
    require('../assets/locations/castle/castle4.png'),
    require('../assets/locations/castle/castle5.png')
  ],
  volcano: [
    require('../assets/locations/volcano/volcano1.png'),
    require('../assets/locations/volcano/volcano2.png'),
    require('../assets/locations/volcano/volcano3.png'),
    require('../assets/locations/volcano/volcano4.png'),
    require('../assets/locations/volcano/volcano5.png')
  ],
  tower: [require('../assets/locations/tower/tower1.png')],
  fortress: [
    require('../assets/locations/fortress/fortress1.png'),
    require('../assets/locations/fortress/fortress2.png')
  ]
};

const uppercase = (s: string) => {
  return s ? s[0].toUpperCase() + s.substr(1).toLowerCase() : s;
};

const Bit: React.SFC<Props> = ({
  bit,
  width,
  popoverVisible,
  onLongPress,
  popoverText,
  onPopoverPress,
  onPress
}) => {
  const { type, payload, metadata } = bit;
  let content;
  if (type === 'ACT_SAY' || type === 'ACT_DO') {
    content = payload ? (
      <View style={styles.superPromptContainer}>
        {metadata && metadata.proposer && (
          <Nickname
            nickname={metadata.proposer.nickname}
            status={metadata.proposer.status}
            fontSize={15}
          />
        )}
        <View style={styles.promptContainer}>
          <Text
            style={[
              styles.prompt,
              styles.semiBold,
              type === 'ACT_SAY' && styles.sayPrompt
            ]}
          >
            &gt;{' '}
          </Text>
          <Text style={[styles.message, styles.semiBold]}>{payload}</Text>
        </View>
      </View>
    ) : (
      undefined
    );
  } else if (type === 'IMAGE') {
    content = (
      <AutoHeightImage width={screenWidth * 0.9} uri={payload as string} />
    );
  } else if (type === 'ORIGIN') {
    const { name, class: playerClass, portrait, location } = payload as Origin;
    if (!name && !playerClass && !portrait && !location) {
      content = (
        <View style={styles.origin}>
          <Image
            source={require('../assets/creative.png')}
            style={styles.originPortrait}
          />
          <View style={styles.originText}>
            <Text style={[styles.message, styles.originName]}>
              Creative mode
            </Text>
          </View>
        </View>
      );
    } else {
      content = (
        <View style={styles.origin}>
          <Image
            source={portraits[portrait || playerClass]}
            style={styles.originPortrait}
          />
          <View style={styles.originText}>
            <Text style={[styles.message, styles.originName]}>
              {name || playerClass}
            </Text>
            {name && (
              <Text style={[styles.message, styles.originSubtitle]}>
                {uppercase(playerClass)}
              </Text>
            )}
            <Text style={[styles.message, styles.originSubtitle]}>
              from {location}
            </Text>
          </View>
        </View>
      );
    }
  } else if (type === 'LOCATION') {
    const { location, firstVisit, seed } = payload as Location;
    const backgrounds = locations[location];
    const source = backgrounds[seed % backgrounds.length];
    content = (
      <View style={styles.locationbox}>
        <AutoHeightImage width={width || screenWidth * 0.9} uri={source} />
        <Text style={[styles.message, styles.location]}>
          {firstVisit ? (
            <Text>
              ★ New location discovered (+20 gold):{' '}
              <Text style={styles.bold}>{uppercase(location)}</Text>
            </Text>
          ) : (
            uppercase(location)
          )}
        </Text>
      </View>
    );
  } else if (type === 'SYSTEM') {
    content = (
      <View style={styles.system}>
        <Image
          source={require('../assets/entities/gandalf.png')}
          style={styles.systemPortrait}
        />
        <View style={styles.systemText}>
          <Text style={[styles.message, styles.originSubtitle]}>{payload}</Text>
        </View>
      </View>
    );
  } else {
    content = <Text style={styles.message}>{bit.payload}</Text>;
  }

  const prompt = type === 'ACT_DO' || type === 'ACT_SAY';
  return content ? (
    <View style={[styles.row, prompt && styles.promtContainerMargin]}>
      {popoverVisible && (
        <TouchableOpacity
          onPress={onPopoverPress}
          style={{ flex: 1 }}
          activeOpacity={0.6}
        >
          <View style={styles.popover}>
            <Text style={styles.popoverText}>{popoverText}</Text>
          </View>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onLongPress={onLongPress}
        onPress={onPress}
        style={{ flex: 1 }}
        activeOpacity={0.8}
      >
        <View style={styles.rowText}>{content}</View>
      </TouchableOpacity>
    </View>
  ) : (
    <></>
  );
};

Bit.defaultProps = {};

Bit.propTypes = {
  bit: PropTypes.any,
  width: PropTypes.number,
  onLongPress: PropTypes.any,
  onPopoverPress: PropTypes.any,
  popoverText: PropTypes.string,
  popoverVisible: PropTypes.bool,
  onPress: PropTypes.any
};

export default Bit;
