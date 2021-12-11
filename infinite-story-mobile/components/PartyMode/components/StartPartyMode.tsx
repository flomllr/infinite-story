import React, { useState } from 'react';
import PixelButton from '../../PixelButton';
import ControlService from '../../../services/ControlService';
import ErrorService from '../../../services/ErrorService';
import {
  Space,
  SubHeadline,
  DefaultText,
  PageTitle,
  MarginWrapper
} from '../../shared';
import styled from 'styled-components/native';
import { colors, fonts } from '../../../theme';
import { CreateStory } from '../../CreateStory';
import { PlayerStatus, MarketplaceItem, Prompt } from '../../../types';
import { ScrollView, FlatList } from 'react-native';
import { PurchaseModal } from '../../../modals/PurchaseModal';
import { observer } from 'mobx-react';
import AnalyticsService from '../../../services/AnalyticsService';
import { Tabs } from '../../Tabs';
import { useMainStore } from '../../../hooks/useMainStore';
import { useEffect } from 'react';

const Wrapper = styled(MarginWrapper)`
  background-color: ${colors.background};
  flex: 1;
  align-content: flex-start;
`;

const Headline = styled.Text`
  font-family: ${fonts.regular};
  color: ${colors.defaultText};
  font-size: 23px;
  text-align: center;
  margin-bottom: 15px;
`;

const ExpandingView = styled.View`
  flex: 1;
`;

const ExplainationText = styled(DefaultText)`
  font-size: 16px;
  padding-horizontal: 20px
  padding-vertical: 8px
`;

const GoldText = styled(DefaultText)`
  font-size: 16px;
  padding-horizontal: 20px
  padding-vertical: 8px
  color: ${colors.gold}
`;

const FloatBottom = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const CodeContainer = styled.View``;

const Code = styled(DefaultText)`
  font-size: 50px;
  color: ${p => (p.complete ? colors.gold : colors.lightgray)};
  text-align: center;
  font-family: ${fonts.bold};
  letter-spacing: 17px;
`;

const DialButtonContainer = styled.View`
  flex: 1;
  padding: 5px;
`;

const DialContainer = styled.View`
  flex: 4;
  padding: 5px;
  margin-top: 25px;
`;
interface Props {
  createGame: (props: {
    protagonistClass?: string;
    protagonistName?: string;
    profilePic: string;
    marketplaceItemId?: number;
    promptId?: number;
  }) => Promise<void>;
  joinGame: (gameId: string) => void;
  navigation?: any;
  nickname: string;
  status: PlayerStatus;
}

export const StartPartyMode = observer(
  ({ createGame, joinGame, nickname, status }: Props) => {
    const mainStore = useMainStore();
    const [gameIdInput, setGameIdInput] = useState([
      null,
      null,
      null,
      null,
      null
    ]);
    const [readingInstruction, setReadingInstruction] = useState(false);
    const [creatingGame, setCreatingGame] = useState(false);
    const [protagonistClass, setProtagonistClass] = useState('');
    const [
      marketplaceGameClass,
      setMarketplaceGameClass
    ] = useState<MarketplaceItem | null>(null);
    const [protagonistName, setProtagonistName] = useState('');
    const [creativeGameClass, setCreativeGameClass] = useState<Prompt | null>(
      null
    );

    const handleJoinGame = async (
      protagonistClass?: string,
      protagonistName?: string,
      marketplaceItemId?: number,
      promptId?: number
    ) => {
      if (creatingGame) {
        createGame({
          protagonistClass,
          protagonistName,
          profilePic: mainStore.profilePicture,
          marketplaceItemId,
          promptId
        });
      } else {
        AnalyticsService.clickJoinPartyGame();
        joinGame(gameIdInput.join(''));
      }
    };

    const handleJoining = async () => {
      const { canJoin, reason } = await ControlService.testPartyGame(
        gameIdInput.join('')
      );

      if (!canJoin) {
        ErrorService.uncriticalError(reason);
        return;
      }

      handleJoinGame();
    };

    const handleStartPartyGame = () => {
      const isUserEntitled = () =>
        status === PlayerStatus.INFINITE ||
        status === PlayerStatus.VIP ||
        mainStore.entitlements.includes('partymode');
      const startPartyGame = () => setReadingInstruction(true);

      AnalyticsService.clickStartPartyGame();

      if (isUserEntitled()) {
        startPartyGame();
        return;
      }

      AnalyticsService.openPurchasePartyHostModal();

      ControlService.openModal(
        <PurchaseModal
          purchaseId="partymode"
          onPurchased={() => isUserEntitled() && startPartyGame()}
        />
      );
    };

    if (readingInstruction) {
      return (
        <Wrapper>
          <Headline>Instructions</Headline>
          <Space h={'10px'} />
          <ExpandingView>
            <ScrollView>
              <GoldText>
                Party Mode is in BETA. Please post the bugs you encounter in the
                #feedback channel of our Discord
              </GoldText>
              <SubHeadline>What is the Party mode?</SubHeadline>
              <ExplainationText>
                In the Infinite Story Party Mode, multiple Infinite Adventurers
                play together the same story.
              </ExplainationText>
              <ExplainationText>
                Every turn, each player submits a proposal, either to do
                something or say something. Following the submitting phase, each
                proposal is revealed while the identity of its writer is kept
                hidden. Each player can vote for their favorite proposal and the
                proposal with the most amount of votes will be chosen. The
                writer of that proposal will be revealed and he will win 1
                point.
              </ExplainationText>
              <ExplainationText>
                The goal of the game is to make a fun story together as well as
                competing for the funniest proposal. We hope you will like it!
              </ExplainationText>
              <ExplainationText>
                To begin a new game, you, the host, need to choose the class of
                the protagonist as well as his or her name. You will then choose
                a profile picture so other Infinite Adventurers can recognise
                you.
              </ExplainationText>
            </ScrollView>
          </ExpandingView>
          <PixelButton
            primary
            onPress={() => {
              setReadingInstruction(false);
              setCreatingGame(true);
            }}
            label={'Understood'}
          />
        </Wrapper>
      );
    }

    if (creatingGame) {
      return (
        <CreateStory
          partyMode={true}
          onStart={(gameClass, gameName) => {
            //setProtagonistClass(gameClass);
            //setProtagonistName(gameName);
            handleJoinGame(gameClass, gameName);
          }}
          onStartMarketClass={(marketplaceGameClass, gameName?) => {
            // setMarketplaceGameClass(marketplaceGameClass);
            // setProtagonistName(gameName);
            handleJoinGame(null, gameName, marketplaceGameClass.id);
          }}
          onStartCreativeClass={(creativeGameClass, gameName?) => {
            // setCreativeGameClass(creativeGameClass);
            // setProtagonistName(gameName);
            handleJoinGame(null, gameName, null, creativeGameClass.uid);
          }}
        />
      );
    }

    const joinWithCodeContent = (
      <>
        <CodeContainer>
          <Code complete={gameIdInput[4] !== null}>
            {gameIdInput.map(i => (i === null ? '_' : i)).join('')}
          </Code>
        </CodeContainer>
        <DialContainer>
          <FlatList
            data={[
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              'Del',
              '0',
              'Join'
            ]}
            renderItem={({ item }) => {
              return (
                <DialButtonContainer>
                  <PixelButton
                    label={item}
                    primary={item === 'Join'}
                    onPress={() => {
                      const firstNull = gameIdInput.reduce(
                        (acc, curr, i) =>
                          acc === -1 && curr === null ? i : acc,
                        -1
                      );
                      const newGameId = [...gameIdInput];
                      if (item.length === 1) {
                        if (firstNull !== -1) {
                          newGameId[firstNull] = item;
                          setGameIdInput(newGameId);
                        }
                      } else if (item === 'Del') {
                        if (firstNull !== 0) {
                          if (firstNull === -1) {
                            newGameId[4] = null;
                          } else {
                            newGameId[firstNull - 1] = null;
                          }
                          setGameIdInput(newGameId);
                        }
                      } else if (item === 'Join') {
                        if (newGameId[4] !== null) {
                          handleJoining();
                        } else {
                          ErrorService.uncriticalError(
                            'Please enter a valid code'
                          );
                        }
                      }
                    }}
                  />
                </DialButtonContainer>
              );
            }}
            //Setting the number of column
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
          />
        </DialContainer>
        <FloatBottom>
          <PixelButton
            primary
            onPress={handleStartPartyGame}
            label={'Start new game'}
          />
        </FloatBottom>
      </>
    );

    const publicGamesContent = (
      <>
        <Space v={'30px'} />
        <Headline>Soon</Headline>
      </>
    );

    return (
      <Wrapper>
        <PageTitle>Party Mode</PageTitle>
        <Tabs
          tabs={[
            { name: 'Join with code', content: joinWithCodeContent },
            { name: 'Public games', content: publicGamesContent }
          ]}
        />
      </Wrapper>
    );
  }
);
