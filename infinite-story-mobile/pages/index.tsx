import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  Linking,
  TouchableOpacity,
  ScrollView,
  Share
} from "react-native";
import { colors, fonts } from "../theme";
import ControlService from "../services/ControlService";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import Story from "../components/Story";
import Chatbox from "../components/Chatbox";
import AutoHeightImage from "../components/AutoHeightImage";
import LoadingStory from "../screens/LoadingStory";
import { useMediaQuery } from "react-responsive";
import TellMeMore from "../components/TellMeMore";

const maxWidth = 500;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    height: "100vh"
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular,
    marginTop: 10
  },
  storyContainer: {
    flex: 1,
    maxWidth: maxWidth,
    borderLeftColor: colors.darkgray,
    borderLeftWidth: 1
  },
  shareContainer: {
    display: "flex",
    paddingHorizontal: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  divider: {
    borderTopColor: colors.darkgray,
    width: "100%",
    borderTopWidth: 1,
    marginTop: 40,
    marginBottom: 30
  },
  warning: {
    color: colors.defaultText,
    margin: 20,
    padding: 10,
    fontSize: 15,
    backgroundColor: colors.primary
  },
  underline: {
    textDecorationLine: "underline"
  }
});

const classes = [
  "noble",
  "knight",
  "squire",
  "wizard",
  "ranger",
  "peasant",
  "rogue",
  "wizard"
];

const names = [
  "Lydan",
  "Syrin",
  "Ptorik",
  "Joz",
  "Varog",
  "Gethrod",
  "Hezra",
  "Feron",
  "Ophni",
  "Colborn",
  "Fintis",
  "Gatlin",
  "Jinto",
  "Hagalbar",
  "Krinn",
  "Lenox",
  "Revvyn",
  "Hodus",
  "Dimian",
  "Paskel",
  "Kontas",
  "Weston",
  "Azamarr ",
  "Jather ",
  "Tekren ",
  "Jareth",
  "Adon",
  "Zaden",
  "Eune ",
  "Graff",
  "Tez",
  "Jessop",
  "Gunnar",
  "Pike",
  "Domnhar",
  "Baske",
  "Jerrick",
  "Mavrek",
  "Riordan",
  "Wulfe",
  "Straus",
  "Tyvrik ",
  "Henndar",
  "Favroe",
  "Whit",
  "Jaris",
  "Renham",
  "Kagran",
  "Lassrin ",
  "Vadim",
  "Arlo",
  "Quintis",
  "Vale",
  "Caelan",
  "Yorjan",
  "Khron",
  "Ishmael",
  "Jakrin",
  "Fangar",
  "Roux",
  "Baxar",
  "Hawke",
  "Gatlen",
  "Barak",
  "Nazim",
  "Kadric",
  "Paquin",
  "Kent",
  "Moki",
  "Rankar",
  "Lothe",
  "Ryven",
  "Clawsen",
  "Pakker",
  "Embre",
  "Cassian",
  "Verssek",
  "Dagfinn",
  "Ebraheim",
  "Nesso",
  "Eldermar",
  "Rivik",
  "Rourke",
  "Barton",
  "Hemm",
  "Sarkin",
  "Blaiz ",
  "Talon",
  "Agro",
  "Zagaroth",
  "Turrek",
  "Esdel",
  "Lustros",
  "Zenner",
  "Baashar ",
  "Dagrod ",
  "Gentar",
  "Feston",
  "Syrana",
  "Resha",
  "Varin",
  "Wren",
  "Yuni",
  "Talis",
  "Kessa",
  "Magaltie",
  "Aeris",
  "Desmina",
  "Krynna",
  "Asralyn ",
  "Herra",
  "Pret",
  "Kory",
  "Afia",
  "Tessel",
  "Rhiannon",
  "Zara",
  "Jesi",
  "Belen",
  "Rei",
  "Ciscra",
  "Temy",
  "Renalee ",
  "Estyn",
  "Maarika",
  "Lynorr",
  "Tiv",
  "Annihya",
  "Semet",
  "Tamrin",
  "Antia",
  "Reslyn",
  "Basak",
  "Vixra",
  "Pekka ",
  "Xavia",
  "Beatha ",
  "Yarri",
  "Liris",
  "Sonali",
  "Razra ",
  "Soko",
  "Maeve",
  "Everen",
  "Yelina",
  "Morwena",
  "Hagar",
  "Palra",
  "Elysa",
  "Sage",
  "Ketra",
  "Lynx",
  "Agama",
  "Thesra ",
  "Tezani",
  "Ralia",
  "Esmee",
  "Heron",
  "Naima",
  "Rydna ",
  "Sparrow",
  "Baakshi ",
  "Ibera",
  "Phlox",
  "Dessa",
  "Braithe",
  "Taewen",
  "Larke",
  "Silene",
  "Phressa",
  "Esther",
  "Anika",
  "Rasy ",
  "Harper",
  "Indie",
  "Vita",
  "Drusila",
  "Minha",
  "Surane",
  "Lassona",
  "Merula",
  "Kye",
  "Jonna",
  "Lyla",
  "Zet",
  "Orett",
  "Naphtalia",
  "Turi",
  "Rhays",
  "Shike",
  "Hartie",
  "Beela",
  "Leska",
  "Vemery ",
  "Lunex",
  "Fidess",
  "Tisette",
  "Partha"
];

const startStory = () => {
  const className = classes[Math.floor(Math.random() * classes.length - 1)];
  const playerName = names[Math.floor(Math.random() * names.length - 1)];
  ControlService.startStory(className, playerName);
};

const Play: React.SFC<any> = ({ mainStore }) => {
  const [typing, setTyping] = useState("");

  const sendMessage = async () => {
    ControlService.act(typing);
    setTyping("");
  };

  // Signup
  useEffect(() => {
    mainStore.manualSignup();
  }, []);

  const { story, loadingStory } = mainStore;
  const restartStory = () => {
    mainStore.story = undefined;
    mainStore.storyId = undefined;
    startStory();
  };

  const isTabletOrMobile = useMediaQuery({
    query: "(max-width: 640px)"
  });

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {!isTabletOrMobile || !(mainStore.storyId && mainStore.story) ? (
          <View style={styles.shareContainer}>
            <AutoHeightImage uri={require("../assets/title.png")} width={150} />
            <Text
              style={styles.text}
              onPress={() => Linking.openURL("https://discord.gg/yXGmY6y")}
            >
              Join the Discord
            </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.infinitestory"
                )
              }
            >
              <AutoHeightImage
                uri={require("../assets/googleplay.svg")}
                width={170}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://apps.apple.com/de/app/the-infinite-story/id1491164959?l=en"
                )
              }
            >
              <AutoHeightImage
                uri={require("../assets/appstore.svg")}
                width={150}
              />
            </TouchableOpacity>
            <View style={styles.divider}></View>
            {mainStore.storyId && mainStore.story ? (
              <>
                <Text
                  style={styles.text}
                  onPress={() =>
                    Linking.openURL(
                      "https://infinitestory.app/story/" + mainStore.storyId
                    )
                  }
                >
                  Share this story
                </Text>
                <Text style={styles.text} onPress={restartStory}>
                  Restart
                </Text>
              </>
            ) : (
              !isTabletOrMobile &&
              (mainStore.apiAvailable ? (
                <TouchableOpacity onPress={startStory}>
                  <Text style={styles.text}>Play in browser</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.text, styles.warning]}>
                  Warning: we are currently offline for maintenance. Join the{" "}
                  <Text
                    onPress={() =>
                      Linking.openURL("https://discord.gg/yXGmY6y")
                    }
                    style={styles.underline}
                  >
                    Discord
                  </Text>{" "}
                  to get notified immediately when we are back up.
                </Text>
              ))
            )}
          </View>
        ) : null}
        {loadingStory && (
          <View style={styles.storyContainer}>
            <LoadingStory />
          </View>
        )}
        {story && (
          <View style={styles.storyContainer}>
            <ScrollView style={{ flex: 1 }}>
              <Story items={story} width={maxWidth} inverted />
            </ScrollView>
            <View>
              <TellMeMore />
              <Chatbox
                value={typing}
                onSubmit={sendMessage}
                onChangeText={typing => setTyping(typing)}
                inputDisabled={mainStore.infering}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

Play.defaultProps = {};

Play.propTypes = {
  mainStore: PropTypes.any
};

export default inject("mainStore")(observer(Play));
