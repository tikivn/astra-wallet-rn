import React, { FunctionComponent } from "react";
import { View } from "react-native";
import {
  Header,
  StackHeaderProps,
  TransitionPresets,
} from "@react-navigation/stack";

import { BlurredHeader } from "./blurred";
import { WalletLeftBackButton } from "./button";

export const WalletHeaderScreenOptionsPreset = {
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
