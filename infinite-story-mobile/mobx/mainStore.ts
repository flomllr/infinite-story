import { action, observable, reaction } from "mobx";
import {
  StoryBit,
  StorySmall,
  Prompt,
  PlayerStatus,
  JitsiMeetStatus,
  BuyerMarketplaceItem,
  SellerMarketplaceItem,
  CreateStoryState,
  AdvancedPrompt
} from "../types";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JitsiMeet from "react-native-jitsi-meet";
import uuid from "uuid/v4";
import ControlService from "../services/ControlService";
import ApiService from "../services/ApiService";
import { Origin } from "../types";
import { ReactChild } from "react";
import Constants from "expo-constants";
import { PurchaserInfo } from "react-native-purchases";
import { PartyModeState } from "../components/PartyMode/types";
import { Keyboard } from "react-native";
import { debounce } from "debounce";
import CodePush from "react-native-code-push";
import AppCenter from "appcenter";
import Push from "appcenter-push";
import { AppState, Alert } from "react-native";

let amp;
const ampEnabled = Constants.appOwnership !== "expo";
if (ampEnabled) {
  amp = require("amplitude-js");
}

const WEBSOCKET_API = (userId: string) => {
  console.log(userId);
  if (userId) {
    return `wss://api-ws-prod.infinitestory.app/subscribe?key=${userId}`;
  } else {
    return "wss://api-ws-prod.infinitestory.app/subscribe/";
  }
};

const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem("@" + key, "" + value);
  } catch (e) {
    // saving error
  }
};

const storeObjectData = async (key: string, value: any) => {
  return storeData(key, JSON.stringify(value));
};

const getData = async (key: string) => {
  try {
    return await AsyncStorage.getItem("@" + key);
  } catch (e) {
    // error reading value
  }
};

const deleteData = async (key: string) => {
  try {
    return await AsyncStorage.removeItem(key);
  } catch (e) {
    // Delete error
  }
};

const createJitsiMeetUserInfo = nickname => ({
  displayName: nickname,
  email: nickname + "@infinitestory.app",
  avatar: "https:/gravatar.com/avatar/" + nickname
});

export default class MainStore {
  hideIllegalFeaturesFromApple = false;
  @observable appLoading = true;
  @observable appLoadingInfoArray: string[] = [];

  @observable userId: string;

  @observable storyId: string;
  @observable creatingStory = false;
  @observable story: StoryBit[];
  @observable loadingStory = false;
  @observable stories: { [uid: string]: StorySmall };
  @observable lastActStoryId: string;
  @observable storyError: string;
  @observable achievements: string[] = [];
  @observable multiplayerAchievements: { [key: string]: number } = {};

  @observable error: any;
  @observable uncriticalError: string;
  @observable infering = false;
  @observable actionType: "ACT_SAY" | "ACT_DO" = "ACT_DO"; // Move to chatbox
  @observable tutorialDone: boolean;
  @observable partyGameTutorialDone: boolean;

  @observable log = "";
  @observable apiAvailable = true;

  @observable modalVisible: boolean;
  @observable.shallow modalContent: ReactChild;
  @observable modalClosable = true;

  @observable prompts: Prompt[];

  @observable currentPromptTitle: string;
  @observable currentPromptContext: string;
  @observable currentPromptUid: number;
  @observable promptButtonActivated = true;

  @observable amplitude: any;

  @observable revCatUser: PurchaserInfo | undefined;
  @observable entitlements: string[] = [];

  @observable gameId: string | null;

  @observable unconfirmedGameId: string | null;

  @observable websocket: WebSocket;

  @observable websocketHandler: { [channel: string]: (data: any) => void } = {};

  @observable websocketSubscribeQueue: (() => void)[] = [];

  @observable jitsiMeet: any;

  @observable jitsiMeetStatus: JitsiMeetStatus;

  @observable jitsiMeetRoom: string;

  @observable partyGameToast: string;

  @observable profilePicture: string;

  @observable nickname: string;

  @observable playerStatus: PlayerStatus = PlayerStatus.PEASANT;

  @observable partyModeState: PartyModeState = null;

  @observable nextStateRequested: string;

  @observable lastPartyModeStateUpdate: number;

  @observable keyboardVisible: boolean;

  @observable actPartyGameError = false;

  @observable gold = 0;

  @observable inAppNotification = "";

  @observable marketplaceItems: BuyerMarketplaceItem[] = [];

  @observable myMarketplaceItems: SellerMarketplaceItem[] = [];

  @observable previewClass: BuyerMarketplaceItem | null;

  @observable previewProfilePicture: string | null;

  @observable boughtClasses: number[] = [];

  @observable boughtClassItems: BuyerMarketplaceItem[];

  @observable marketplacePurchaseInProgress = false;

  @observable marketplaceItemsLoading = false;

  @observable editCreativeClass: AdvancedPrompt | null = null;

  @observable.shallow createStoryState: CreateStoryState = {
    step: 0,
    playerClass: "",
    marketClass: null,
    creativeClass: null,
    name: ""
  };

  @observable shouldShowWelcomeModal = false;

  @action setShouldShowWelcomeModal = (should: boolean) => {
    this.shouldShowWelcomeModal = should;
  };

  @action setInAppNotification = (notification: string) => {
    this.inAppNotification = notification;
  };

  @action setEditCreativeClass = (creativeClass: AdvancedPrompt) => {
    this.editCreativeClass = creativeClass;
  };

  @action resetCreateStoryState() {
    this.createStoryState = {
      step: 0,
      playerClass: "",
      marketClass: null,
      creativeClass: null,
      name: ""
    };
  }

  @action setCreateStoryState(newState: Partial<CreateStoryState>) {
    this.createStoryState = { ...this.createStoryState, ...newState };
  }

  @action setMarketplacePurchaseInProgress(inProgress: boolean) {
    this.marketplacePurchaseInProgress = inProgress;
  }

  @action setMarketplaceItemsLoading(loading: boolean) {
    this.marketplaceItemsLoading = loading;
  }

  @action setBoughtClassItems = (boughtClassItems: BuyerMarketplaceItem[]) => {
    this.boughtClassItems = boughtClassItems;
  };

  @action setBoughtClasses = (boughtClasses: number[]) => {
    this.boughtClasses = boughtClasses;
  };

  @action setPreviewClass(previewClass: BuyerMarketplaceItem) {
    this.previewClass = previewClass;
  }

  @action setPreviewProfilePicture(profilePicture: string) {
    this.previewProfilePicture = profilePicture;
  }

  @action setMarketplaceItems = (items: BuyerMarketplaceItem[]) => {
    this.marketplaceItems = items;
  };

  @action setMyMarketplaceItems = (items: SellerMarketplaceItem[]) => {
    this.myMarketplaceItems = items;
  };

  @action setGold(amount: number) {
    this.gold = amount;
  }

  @action setKeyboardVisibility(visible: boolean) {
    this.keyboardVisible = visible;
  }

  @action setNextStateRequested(requested: string) {
    console.log("Setting next state requested", requested);
    this.nextStateRequested = requested;
  }

  @action setNickname(nickname: string) {
    this.nickname = nickname;
  }

  @action setPlayerStatus(status: PlayerStatus) {
    this.playerStatus = status;
  }

  @action setProfilePicture(pic: string) {
    this.profilePicture = pic;
    storeData("profilePicture", pic);
  }

  @action setPartyGameToast(toast: string) {
    this.partyGameToast = toast;

    setTimeout(() => {
      this.partyGameToast = null;
    }, 3000);
  }

  @action addWebsocketHandler(channel: string, handler: (data: any) => void) {
    this.websocketHandler[channel] = handler;
  }

  @action removeWebsocketHandler(channel: string) {
    this.websocketHandler[channel] = null;
  }

  @action setPrompts(prompts: Prompt[]) {
    this.prompts = prompts;
  }

  @action addPrompt(prompt: Prompt) {
    this.prompts.unshift(prompt);
  }

  @action setCurrentPromptTitle(title: string) {
    this.currentPromptTitle = title;
  }

  @action setCurrentPromptContext(context: string) {
    this.currentPromptContext = context;
  }

  @action setCurrentPromptUid(uid: number) {
    this.currentPromptUid = uid;
  }

  @action setPromptButtonActivated(activated: boolean) {
    this.promptButtonActivated = activated;
  }

  @action deletePrompt(promptId: number) {
    this.prompts = this.prompts.filter(p => p.uid !== promptId);
    this.currentPromptContext = "";
    this.currentPromptContext = "";
    this.currentPromptUid = undefined;
    this.promptButtonActivated = true;
  }

  @action setStoryId(storyId: string) {
    this.storyId = storyId;
    storeData("storyId", storyId);
  }

  @action clearStoryIdInStore() {
    this.storyId = null;
    deleteData("storyId");
  }

  @action setUserId(userId: string) {
    this.userId = userId;
    storeData("userId", userId);
  }

  @action setCreatingStoryState(state: boolean) {
    this.creatingStory = state;
  }

  @action setStoryLoadingState(state: boolean) {
    this.loadingStory = state;
  }

  @action setLastActStory(storyId: string) {
    this.lastActStoryId = storyId;
  }

  @action setApiAvailability(available: boolean) {
    this.apiAvailable = available;
  }

  @action setError(error: any) {
    this.error = error;
  }

  @action setAppLoading(loading: boolean) {
    this.appLoading = loading;
  }

  @action setAppLoadingInfoArray(infoArray: string[]) {
    this.appLoadingInfoArray = infoArray;
  }

  @action setUncriticalError(error: string) {
    this.uncriticalError = error;
  }

  @action setStoryError(error: string) {
    this.storyError = error;
  }

  @action clearError() {
    this.error = undefined;
  }

  @action setStory(story: StoryBit[]) {
    this.story = story.reverse();
  }

  @action setStories(stories: { [uid: string]: StorySmall }) {
    this.stories = stories;
  }

  @action addStoryBits(storyBits: StoryBit[]) {
    if (!storyBits) {
      return;
    }
    const newStoryBits = storyBits.reverse();
    this.story = newStoryBits.concat(this.story);
  }

  @action setInfering(status: boolean) {
    this.infering = status;
  }

  @action toggleActionType() {
    this.actionType = this.actionType === "ACT_DO" ? "ACT_SAY" : "ACT_DO";
  }

  @action setPartyModeState(state: PartyModeState) {
    // console.log('Setting partymode state', state);
    this.lastPartyModeStateUpdate = Date.now();
    this.partyModeState = state;
  }

  @action addStoryToHistory(
    uid: string,
    storyBits: StoryBit[],
    title?: string,
    partyGame?: boolean
  ) {
    try {
      const { payload } = storyBits.find(e => e.type === "ORIGIN");
      const { name, class: playerClass } = payload as Origin;
      if (!this.stories) this.stories = {};
      this.stories[uid] = {
        uid,
        origin: payload as Origin,
        createdAt: new Date().toISOString(),
        title: title || `${name}, the ${playerClass}`,
        updatedAt: new Date().toISOString(),
        metadata: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          party_game: !!partyGame
        }
      };
    } catch (e) {
      this.log += JSON.stringify({ error: e, location: "addStoryToHistory" });
    }
  }

  @action deleteStory(storyId: string) {
    this.stories && delete this.stories[storyId];
    deleteData("storyId");
  }

  @action storyUpdatedAt(storyId: string) {
    if (this.stories && this.stories[storyId]) {
      this.stories[storyId] = {
        ...this.stories[storyId],
        updatedAt: new Date().toISOString()
      };
    }
  }

  @action setTutorialDone() {
    this.tutorialDone = true;
    storeData("tutorialDone", "true");
  }

  @action setPartyGameTutorialDone() {
    this.partyGameTutorialDone = true;
    storeData("partyGameTutorialDone", "true");
  }

  @action setAchievements(achievements: string[]) {
    this.achievements = achievements;
    this.parseAchievements(achievements);
  }

  parseAchievements(achievements: string[]) {
    const boughtClasses: number[] = [];

    achievements.forEach(achievement => {
      if (achievement.startsWith("boughtmarketplaceitem")) {
        const id = Number(achievement.split(":")[1]);
        boughtClasses.push(id);
      }
    });

    console.log("achievements", achievements);
    console.log("boughtClasses", boughtClasses);

    this.setBoughtClasses(boughtClasses);
  }

  @action setMultiplayerAchievements(multiplayerAchievements: {
    [key: string]: number;
  }) {
    this.multiplayerAchievements = multiplayerAchievements;
  }

  @action addAchievement(achievement: string) {
    if (this.achievements) {
      this.achievements.push(achievement);
    } else {
      this.achievements = [achievement];
    }
  }

  @action setModalVisibility(visible: boolean) {
    this.modalVisible = visible;
  }

  @action setModalClosability(closable: boolean) {
    this.modalClosable = closable;
  }

  @action setModalContent(content: ReactChild) {
    this.modalContent = content;
  }

  @action logEvent(event, extraData = {}) {
    if (ampEnabled) {
      this.amplitude.logEvent(event, extraData);
    }
  }

  @action setRevCatUser(user: PurchaserInfo) {
    this.revCatUser = user;
    this.entitlements = Object.keys(user.entitlements.active);
  }

  @action setEntitlements(entitlements: string[]) {
    this.entitlements = entitlements;
  }

  @action addEntitlement(entitlement: string) {
    if (this.entitlements) {
      this.entitlements = [...this.entitlements, entitlement];
    } else {
      this.entitlements = [entitlement];
    }
  }

  @action subscribeWebsocket = <T>(
    channel: string,
    onMessage: (data: T) => void
  ) => {
    console.log("Called subscribeWebsocket");
    const init = () => {
      this.unsubscribeWebsocket(channel);

      console.log("subscribing");

      this.websocket.send(
        JSON.stringify({
          action: "subscribe",
          value: channel
        })
      );

      this.addWebsocketHandler(channel, data => {
        console.log("called", channel);
        onMessage(data);
      });
    };

    if (this.websocket.readyState === this.websocket.OPEN) {
      init();
    } else {
      this.websocketSubscribeQueue.push(init);

      if (this.websocket.readyState !== this.websocket.CONNECTING) {
        this.setupWebsocket(this.userId);
      }
    }
  };

  @action unsubscribeWebsocket = (channel: string) => {
    console.log("unsubscribing");
    this.websocket.send(
      JSON.stringify({
        action: "unsubscribe",
        value: channel
      })
    );
    this.removeWebsocketHandler(channel);
  };

  @action joinGame(gameId: string, onMessage: (state: PartyModeState) => void) {
    this.gameId = gameId;
    // TODO: onMessage - check if the gameId corresponds to our gameId
    console.log("Called joinGame in mainStore");
    this.subscribeWebsocket(`partygame/${gameId}`, onMessage);

    this.subscribeWebsocket(
      `partygame_message/${gameId}`,
      (message: string) => {
        this.setPartyGameToast(message);
      }
    );
  }

  @action leaveGame(gameId: string) {
    this.gameId = null;
    this.partyModeState = null;
    this.unsubscribeWebsocket(`partygame/${gameId}`);
    this.unsubscribeWebsocket(`partygame_message/${gameId}`);
  }

  @action setUnconfirmedGameId(gameId: string) {
    this.unconfirmedGameId = gameId;
  }

  @action joinJitsiMeetCall(roomUrl: string, nickname) {
    this.jitsiMeetRoom = roomUrl;
    const userInfo = createJitsiMeetUserInfo(nickname);
    console.log("Joining....", this.jitsiMeet, roomUrl, userInfo);
    const response = this.jitsiMeet.audioCall(roomUrl, userInfo);
    console.log("Response", response);
  }

  @action dropJitsiMeetCall() {
    this.jitsiMeetRoom = null;
    this.jitsiMeet.endCall();
  }

  @action setJitsiMeetStatus(callStatus: JitsiMeetStatus) {
    this.jitsiMeetStatus = callStatus;
  }

  @action setActPartyGameError(error: boolean) {
    // Only set the error state if we're in the result state
    if (this.partyModeState.currentState === "RESULT") {
      console.log("\n\nSetting party game error", error);
      this.actPartyGameError = error;
    }
  }

  clearAsyncStorage = async () => {
    const asyncStorageKeys = await AsyncStorage.getAllKeys();
    if (asyncStorageKeys.length > 0) {
      AsyncStorage.clear();
    }
  };

  clearUncriticalItems = async () => {
    Promise.all([
      new Promise(resolve =>
        AsyncStorage.removeItem("@storyId", () => resolve())
      ),
      new Promise(resolve => AsyncStorage.removeItem("@story", () => resolve()))
    ]);
  };

  signup = async () => {
    const userId = uuid();
    const signupError = err => {
      this.setError(JSON.stringify(err));
      reaction(
        () => this.error,
        (data, r) => {
          this.signup();
          r.dispose();
        }
      );
    };
    try {
      const err = await ApiService.signup(userId);
      if (!err) {
        this.userId = userId;
        storeData("userId", this.userId);
      } else {
        signupError({
          ...err,
          location: "mainStore.constructor signup api error" + err.location
        });
      }
    } catch (e) {
      signupError({
        ...e,
        location: "mainStore.constructor signup api exception" + e.location
      });
    }
  };
  // Web version
  manualSignup = () => {
    getData("userId").then(async userId => {
      if (userId) {
        this.userId = userId;
      } else {
        await this.signup();
      }
    });

    // Load storyId from device
    getData("storyId").then(storyId => {
      if (storyId) {
        this.storyId = storyId;
        ControlService.loadStory(storyId);
      }
    });

    // Check if tutorial is done
    getData("tutorialDone").then(tutorialDone => {
      if (tutorialDone) {
        this.tutorialDone = true;
      }
    });

    getData("partyGameTutorialDone").then(partyGameTutorialDone => {
      if (partyGameTutorialDone) {
        this.partyGameTutorialDone = true;
      }
    });

    getData("profilePicture").then(profilePicture => {
      if (profilePicture) {
        this.profilePicture = profilePicture;
      } else {
        this.profilePicture = "peasant";
      }
    });
  };

  checkAvailability = async (startAll = false) => {
    this.setAppLoadingInfoArray(["Checking server connection..."]);
    const available = await ApiService.checkAvailability();
    this.setApiAvailability(available);
    if (!available) {
      setTimeout(this.checkAvailability, 10000);
      return;
    } else {
      if (startAll) {
        this.setAppLoadingInfoArray([
          ...this.appLoadingInfoArray,
          "Loading stories..."
        ]);
        await ControlService.loadStories();
        this.setAppLoadingInfoArray([
          ...this.appLoadingInfoArray,
          "Loading prompts..."
        ]);
        await ControlService.loadPrompts();
        this.setAppLoadingInfoArray([
          ...this.appLoadingInfoArray,
          "Loading marketplace..."
        ]);
        await ControlService.loadMarketplaceItems();
        this.setAppLoadingInfoArray([
          ...this.appLoadingInfoArray,
          "Loading profile..."
        ]);
        await ControlService.loadProfile();
        this.setAppLoadingInfoArray([
          ...this.appLoadingInfoArray,
          "Loading the items you bought..."
        ]);
        await ControlService.loadBoughtClassItems();
      }
    }
  };

  @action reconnectWebsocket = () => {
    console.log("Called reconnecting websocket");
    this.setupWebsocket(this.userId);

    this.websocketSubscribeQueue = [];

    Object.entries({ ...this.websocketHandler }).forEach(
      ([channel, handler]) => {
        console.log("cannel", channel);
        this.subscribeWebsocket(channel, handler);
      }
    );
  };

  debouncedReconnectWebsocket = debounce(this.reconnectWebsocket, 1000);

  @action setupWebsocket = (userId: string) => {
    console.log("SETTING UP WEBSOCKET");
    this.websocket = new WebSocket(WEBSOCKET_API(userId));
    console.log("Ready state", this.websocket.readyState);

    this.websocket.onerror = error => {
      console.log("Websicket error: ", error);
    };

    this.websocket.onopen = () => {
      console.log("Onopen");
      const length = this.websocketSubscribeQueue.length;
      for (let i = 0; i < length; i++) {
        const init = this.websocketSubscribeQueue.pop();
        init();
      }
    };

    this.websocket.onmessage = ({ data }) => {
      const { payload, channel } = JSON.parse(data);

      // console.log('Received message', channel, payload);
      // console.log('Handlers', this.websocketHandler);

      const handler = this.websocketHandler[channel];

      if (handler) {
        // console.log('Calling with ', payload);
        handler(payload);
      }
    };

    this.websocket.onclose = this.debouncedReconnectWebsocket;
  };

  constructor() {
    if (Platform.OS !== "web") {
      // Load userId from device
      getData("userId").then(async userId => {
        if (userId) {
          this.userId = userId;
        } else {
          await this.signup(); // only signup in app
          CodePush.restartApp();
          // Generate user id
        }

        // setup analytics
        if (ampEnabled) {
          this.amplitude = amp.getInstance();
          this.amplitude.init("4bccfe413c519c04549cbed588017a81");
          this.amplitude.setUserId(this.userId);
        }
        if (Platform.OS !== "android") {
          AppCenter.setUserId(this.userId);
        }
        this.setupWebsocket(this.userId);
      });

      // Load storyId from device
      getData("storyId").then(storyId => {
        if (storyId) {
          this.storyId = storyId;
          ControlService.loadStory(storyId);
        }
      });

      // Check if tutorial is done
      getData("tutorialDone").then(tutorialDone => {
        if (tutorialDone) {
          this.tutorialDone = true;
        }
      });

      getData("partyGameTutorialDone").then(partyGameTutorialDone => {
        if (partyGameTutorialDone) {
          this.partyGameTutorialDone = true;
        }
      });

      getData("profilePicture").then(profilePicture => {
        if (profilePicture) {
          this.profilePicture = profilePicture;
        } else {
          this.profilePicture = "peasant";
        }
      });

      if (Platform.OS !== "android") {
        Push.setListener({
          onPushNotificationReceived: pushNotification => {
            const message = pushNotification.message;
            const title = pushNotification.title;

            if (message === null) {
              // Android messages received in the background don't include a message. On Android, that fact can be used to
              // check if the message was received in the background or foreground. For iOS the message is always present.
              return;
            }

            if (AppState.currentState === "active") {
              this.setInAppNotification(
                title + "\n" + message + "\n" + "Press to dismiss."
              );
              ControlService.loadProfile();
            }
          }
        });
      }
    }

    this.jitsiMeet = JitsiMeet;
    this.jitsiMeetStatus = JitsiMeetStatus.NOT_JOINED;

    Keyboard.addListener("keyboardDidHide", () =>
      this.setKeyboardVisibility(false)
    );

    Keyboard.addListener("keyboardDidShow", () =>
      this.setKeyboardVisibility(true)
    );
  }
}
