import React, { useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, View, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CenteredContent, Headline, Space } from '../../components/shared';
import PixelButton from '../../components/PixelButton';
import { PlayerStatus } from '../../types';
import { colors, fonts } from '../../theme';
import { inject, observer } from 'mobx-react';
import MainStore from '../../mobx/mainStore';
import { withNavigation } from 'react-navigation';
import { Nickname } from '../../components/Nickname';
import { portraits } from '../../assets/portraits';
import { OGClasses } from '../../components/PlayerClass';
import { useNavigation } from '../../hooks/useNavigation';

interface Props {
  mainStore?: MainStore;
}

const Container = styled.SafeAreaView`
  flex: 1;
  padding: 10px;
  background-color: ${colors.background};
`;

const ButtonContainer = styled.View`
  padding-left: 10px;
  padding-right: 10px;
`;

const CenteringImage = styled.ImageBackground`
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  left: -2;
  top: -2;
`;

const ImageInner = styled.View`
  height: 80px;
  width: 80px;
  border-width: 2px;
  opacity: 1;
  overflow: hidden;
`;

const rarityColors = {
  ultra: colors.actDo,
  super: colors.pastelGold,
  rare: colors.pastelGreen
};
export const SelectPortrait = inject('mainStore')(
  observer(({ mainStore }: Props) => {
    const { achievements, entitlements } = mainStore;
    const status = mainStore.playerStatus;
    let currentPortrait;
    if (mainStore.editCreativeClass) {
      currentPortrait =
        mainStore.editCreativeClass.advanced.portrait === 'creative'
          ? ''
          : mainStore.editCreativeClass.advanced.portrait;
    } else {
      currentPortrait = mainStore.profilePicture;
    }
    const [profilePicture, setProfilePicture] = useState(currentPortrait);
    const { navigation } = useNavigation();
    return (
      <Container>
        <CenteredContent>
          <Headline>Choose a portrait</Headline>
          <Space h={'10px'} />
          <View style={{ width: 4 * 80 + 4 * 5, flex: 1, alignSelf: 'center' }}>
            <FlatList
              data={OGClasses}
              renderItem={({ item }) => {
                let available = true;
                if (
                  item.requiresAchievement &&
                  status !== PlayerStatus.INFINITE &&
                  status !== PlayerStatus.VIP &&
                  !achievements.includes(item.requiresAchievement)
                ) {
                  available = false;
                }
                if (
                  item.requiresEntitlement &&
                  status !== PlayerStatus.INFINITE &&
                  status !== PlayerStatus.VIP &&
                  !entitlements.includes(item.requiresEntitlement)
                ) {
                  available = false;
                }

                if (available) {
                  return (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        margin: 2
                      }}
                    >
                      <TouchableOpacity
                        key={item.name}
                        style={{ flex: 1 }}
                        onPress={() => {
                          setProfilePicture(item.value);
                        }}
                      >
                        <ImageInner
                          style={{
                            borderColor:
                              rarityColors[item.rarity] ||
                              'rgba(255,255,255,0.2)'
                          }}
                        >
                          <CenteringImage
                            style={{
                              width: 80,
                              height: 80,
                              opacity:
                                profilePicture === item.value ? 1.0 : 0.65
                            }}
                            source={portraits[item.value]}
                          ></CenteringImage>
                        </ImageInner>
                      </TouchableOpacity>
                    </View>
                  );
                } else {
                  return (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        margin: 2
                      }}
                    >
                      <TouchableOpacity
                        key={item.name}
                        style={{ flex: 1 }}
                        onPress={() => {
                          if (item.canBeBought) {
                            mainStore.setPreviewProfilePicture(item.value);
                            navigation.navigate('BuyProfilePicture');
                          }
                        }}
                      >
                        <ImageInner
                          style={{
                            borderColor:
                              rarityColors[item.rarity] ||
                              'rgba(255,255,255,0.2)'
                          }}
                        >
                          <CenteringImage
                            style={{
                              width: 80,
                              height: 80,
                              opacity: 0.3
                            }}
                            source={portraits[item.value]}
                          ></CenteringImage>
                        </ImageInner>
                      </TouchableOpacity>
                    </View>
                  );
                }
              }}
              //Setting the number of column
              numColumns={4}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
          <ButtonContainer>
            {profilePicture ? (
              <>
                <PixelButton
                  primary
                  label={'Confirm'}
                  onPress={() => {
                    if (mainStore.editCreativeClass) {
                      const newEditClass = { ...mainStore.editCreativeClass };
                      newEditClass.advanced.portrait = profilePicture;
                      mainStore.setEditCreativeClass(newEditClass);
                      navigation.goBack();
                    } else {
                      mainStore.setProfilePicture(profilePicture);
                      navigation.goBack();
                    }
                  }}
                />
                {mainStore.editCreativeClass && (
                  <>
                    <Space h={'10px'} />
                    <PixelButton
                      label={'Cancel'}
                      onPress={() => navigation.goBack()}
                    />
                  </>
                )}
              </>
            ) : (
              <PixelButton
                label={'Cancel'}
                onPress={() => navigation.goBack()}
              />
            )}
          </ButtonContainer>
        </CenteredContent>
      </Container>
    );
  })
);
