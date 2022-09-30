import React, { FunctionComponent } from "react";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { useFocusedScreen } from "../../providers/focused-screen";
import { useStyle } from "../../styles";

export const BlurredBottomTabBar: FunctionComponent<
  BottomTabBarProps & {
    enabledScreens?: string[];
  }
> = (props) => {
  if (Platform.OS === "android") {
    return <AndroidAlternativeBlurredBottomTabBar {...props} />;
  }

  const styleBuilder = useStyle();
  const { style, enabledScreens = [], ...rest } = props;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const focusedScreen = useFocusedScreen();

  const containerOpacity = (() => {
    if (enabledScreens.length === 0) {
      return 0.75;
    }

    if (focusedScreen.name && enabledScreens.includes(focusedScreen.name)) {
      return 0.75;
    }

    return 1;
  })();

  return (
    <BlurView
      style={{
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
      blurType="light"
      blurAmount={80}
      reducedTransparencyFallbackColor="white"
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          opacity: containerOpacity,
        }}
      />
      <BottomTabBar
        // Why type error??
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        style={StyleSheet.flatten([
          styleBuilder.get("background-color-tab-bar-background"),
          style,
        ])}
        {...rest}
      />
    </BlurView>
  );
};

const AndroidAlternativeBlurredBottomTabBar: FunctionComponent<BottomTabBarProps> = (
  props
) => {
  const style = useStyle();
  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
    >
      <BottomTabBar
        {...props}
        style={style.get("background-color-tab-bar-background")}
      />
    </View>
  );
};
