import React from "react";
import {
  TransitionPresets,
} from "@react-navigation/stack";

import { BlurredHeader } from "./blurred";
import { WalletLeftBackButton } from "./button";
import { Colors, Typos } from "../../styles";
import { StyleSheet } from "react-native";

const WalletHeaderScreenOptionsPreset = {
  headerTitleAlign: "center" as "left" | "center",
  headerStyle: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  headerBackground: undefined,
  headerBackTitleVisible: false,
  // eslint-disable-next-line react/display-name
  header: (props: any) => {
    return <BlurredHeader {...props} />;
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
  },
  headerRightContainerStyle: {
    marginRight: 10,
  },
  // eslint-disable-next-line react/display-name
  headerLeft: (props: any) => <WalletLeftBackButton {...props} />,
  ...TransitionPresets.SlideFromRightIOS,
};

const style = StyleSheet.create({
  header: {
    backgroundColor: Colors["background"],
  },
  headerTitle: {
    color: Colors["white"],
    ...Typos["text-large-bold"]
  },
});

export const NormalHeaderScreenOptions = {
  ...WalletHeaderScreenOptionsPreset,
  headerStyle: style.header,
  headerTitleStyle: style.headerTitle,
};