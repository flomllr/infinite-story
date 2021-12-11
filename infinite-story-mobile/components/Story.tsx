import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { StoryBit } from '../types';
import StoryBitComponent from './StoryBit';
import { Platform } from '@unimodules/core';
import ControlService from '../services/ControlService';
import { styles } from '../screens/Story';
import { useMainStore } from '../hooks/useMainStore';

interface Props {
  items: StoryBit[];
  extraData?: object;
  width?: number;
  inverted?: boolean;
  own?: boolean;
}

const Story = ({ items, extraData, width, inverted, own }: Props) => {
  const [popoverIndex, setPopoverIndex] = useState();
  const mainStore = useMainStore();
  let ref;
  const renderItem = element => {
    const { item, index } = element;
    return (
      <StoryBitComponent
        bit={item}
        width={width}
        onLongPress={() => {
          own && setPopoverIndex(index);
        }}
        onPress={() => own && setPopoverIndex(undefined)}
        popoverVisible={popoverIndex === index}
        popoverText={'↺ Rollback to this point'}
        onPopoverPress={() => {
          if (own) {
            setPopoverIndex(undefined);
            ControlService.rollback(index);
          }
        }}
      />
    );
  };
  useEffect(() => {
    try {
      ref.scrollToIndex({ animated: true, index: 0, viewPosition: 0 });
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    if (own && !mainStore.tutorialDone) {
      ControlService.openModal(
        <View style={{ padding: 20 }}>
          <Text style={styles.modalTitle}>Stay Awhile and Listen</Text>
          <Text style={styles.modalText}>
            The Infinite Story is a text adventure game whose story is generated
            by an AI. You progress through the story by using{' '}
            <Text style={styles.modalRed}>Actions</Text> and{' '}
            <Text style={styles.modalGreen}>Speech</Text>.
          </Text>
          <Text style={{ ...styles.modalText, paddingTop: 10 }}>
            You can <Text style={styles.modalBold}>do</Text> something by
            clicking on the bottom left button until it says{' '}
            <Text style={styles.modalRed}>Do:</Text>
          </Text>
          <Text style={styles.modalText}>
            Then, type an action like{' '}
            <Text style={styles.modalBold}>You go to the tavern</Text> or{' '}
            <Text style={styles.modalBold}>You prepare your magic sword</Text>.
            Actions must start with a pronoun (like You or We) and be in the
            second person!
          </Text>

          <Text style={{ ...styles.modalText, paddingTop: 10 }}>
            You can <Text style={styles.modalBold}>say</Text> something by
            clicking on the button until it says{' '}
            <Text style={styles.modalGreen}>Say:</Text>
          </Text>
          <View style={styles.tutorialButton}>
            <TouchableOpacity
              onPress={() => {
                ControlService.setTutorialDone();
                ControlService.closeModal();
                mainStore.setShouldShowWelcomeModal(true);
              }}
            >
              <Text style={styles.textButton}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }, []);

  return (
    <FlatList
      inverted={inverted == null ? Platform.OS !== 'web' : inverted}
      data={items}
      renderItem={renderItem}
      extraData={extraData}
      keyExtractor={() => '' + Math.random() * 1000}
      ref={r => (ref = r)}
    />
  );
};

export default React.memo(Story, (prev, next) => {
  const eq = JSON.stringify(prev.items) === JSON.stringify(next.items);
  return eq;
});
