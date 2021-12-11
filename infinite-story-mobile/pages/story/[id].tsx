import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Linking,
  TouchableOpacity
} from "react-native";
import PropTypes from "prop-types";
import { NextPage, NextPageContext } from "next";
import ApiService from "../../services/ApiService";
import ErrorService from "../../services/ErrorService";
import StoryComponent from "../../components/Story";
import AutoHeightImage from "../../components/AutoHeightImage";
import { colors, fonts } from "../../theme";

const screenWidth = Math.round(Dimensions.get("window").width);
const maxWidth = 600;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: Math.min(screenWidth, maxWidth),
    paddingVertical: 50,
    alignSelf: "center"
  },
  text: {
    color: colors.defaultText,
    fontFamily: fonts.regular
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 100
  }
});

const StoryPage: NextPage<any> = ({ story, error }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <AutoHeightImage uri={require("../../assets/title.png")} width={150} />
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
          uri={require("../../assets/googleplay.svg")}
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
          uri={require("../../assets/appstore.svg")}
          width={150}
        />
      </TouchableOpacity>
    </View>
    {story ? (
      <StoryComponent
        items={story}
        width={maxWidth < screenWidth ? maxWidth : undefined}
      />
    ) : (
      <Text style={styles.text}>Sorry, this story is private</Text>
    )}
  </View>
);

StoryPage.getInitialProps = async ({ query }) => {
  try {
    const { id } = query;
    const { storyBits, error } = await ApiService.getStory(id as string);
    if (error) {
      return { error };
    }
    return { story: storyBits || [] };
  } catch (e) {
    return { error: e };
  }
};

StoryPage.propTypes = {
  story: PropTypes.any,
  error: PropTypes.any
};

export default StoryPage;
