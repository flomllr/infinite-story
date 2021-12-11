import React from 'react';
import styled from 'styled-components/native';
import { FlatList, View, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CenteredContent, Headline, Space } from '../components/shared';
import PixelButton from '../components/PixelButton';
import { PlayerStatus } from '../types';
import { colors, fonts } from '../theme';
import { inject, observer } from 'mobx-react';
import MainStore from '../mobx/mainStore';
import { Nickname } from '../components/Nickname';
import { portraits } from '../assets/portraits';
import { OGClasses } from '../components/PlayerClass';

interface Props {
  nickname: string;
  joinGame: () => void;
  onClose: () => void;
  mainStore?: MainStore;
  status: PlayerStatus;
  profilePicture: string;
  setProfilePicture: (picture: string) => void;
  isHost?: boolean;
}

const Container = styled.SafeAreaView`
  flex: 1;
  padding: 10px;
  background-color: ${colors.background};
`;

const PlayerProfile = styled.View`
  margin: 5px;
  margin-left: 10%;
  margin-right: 10%;
  flex-direction: row;
  justify-content: space-between;
`;
const PlayerClassTextContainer = styled.View`
  flex: 1;
  margin-left: 10px;
  flex-direction: column;
`;
const PlayerDescription = styled.Text`
  color: ${colors.greyed};
  font-family: ${fonts.regular};
  font-size: 13px;
`;

export const SelectProfilePicture = inject('mainStore')(
  observer(
    ({
      nickname,
      joinGame,
      mainStore,
      status,
      profilePicture,
      setProfilePicture,
      isHost
    }: Props) => {
      const { achievements, entitlements } = mainStore;

      return (
        <Container>
          <CenteredContent>
            <Headline>Choose your profile picture</Headline>
            <Space h={'10px'} />
            <View
              style={{ width: 4 * 80 + 4 * 5, flex: 1, alignSelf: 'center' }}
            >
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
                          <Image
                            style={{
                              width: 80,
                              height: 80,
                              opacity: profilePicture === item.value ? 1.0 : 0.6
                            }}
                            source={portraits[item.value]}
                          />
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
                        <Image
                          style={{ width: 80, height: 80, opacity: 0.2 }}
                          source={portraits[item.value]}
                        />
                      </View>
                    );
                  }
                }}
                //Setting the number of column
                numColumns={4}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
            {profilePicture ? (
              <>
                <Headline>You profile:</Headline>
                <Space h={'30px'} />
                <PlayerProfile>
                  <Image
                    style={{ width: 70, height: 70 }}
                    source={portraits[profilePicture]}
                  />
                  <PlayerClassTextContainer>
                    <Nickname status={status} nickname={nickname} />
                    <PlayerDescription>
                      You are joining with a{' '}
                      {OGClasses.find(c => c.value === profilePicture).name}{' '}
                      profile picture
                    </PlayerDescription>
                  </PlayerClassTextContainer>
                </PlayerProfile>
                <Space h={'30px'} />
                <PixelButton
                  label={isHost ? 'Create the game' : 'Join the game'}
                  primary
                  onPress={joinGame}
                  style={{ marginHorizontal: 20 }}
                />
              </>
            ) : (
              undefined
            )}
          </CenteredContent>
        </Container>
      );
    }
  )
);
