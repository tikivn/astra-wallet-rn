import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { LeftArrowIcon } from "../../../components";

export const ValidatorHeaderCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  animOpacity: Animated.Value;
}> = observer(({ containerStyle, animOpacity }) => {
  const inl = useIntl();
  const paddingTop = useSafeAreaInsets().top;
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const backgroundColor = style.get("color-background").color;
  const backgroundButtonAnim = {
    backgroundColor: animOpacity.interpolate({
      inputRange: [0, 255],
      outputRange: ["transparent", "transparent"],
    }),
  };
  const viewAnimOpacity = {
    opacity: animOpacity.interpolate({
      inputRange: [0, 200],
      outputRange: [0, 1],
    }),
  };

  return (
    <Card style={containerStyle}>
      <Animated.View
        style={[{ backgroundColor: backgroundColor }, viewAnimOpacity]}
      >
        <View style={{ height: paddingTop }} />
        <View style={styles.content}>
          <View style={styles.backButton} />
          <View style={styles.titleView}>
            <Text style={style.flatten(["text-center", "color-white", "h5"])}>
              {inl.formatMessage({ id: "validator.details.new.title" })}
            </Text>
          </View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.backButton, backgroundButtonAnim]}>
        <TouchableOpacity
          onPress={() => {
            smartNavigation.goBack();
          }}
        >
          <LeftArrowIcon size={24} color={style.get("color-white").color} />
        </TouchableOpacity>
      </Animated.View>
    </Card>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexDirection: "row",
    paddingHorizontal: 16,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  titleView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 42,
  },
  backButton: {
    position: "absolute",
    bottom: 6,
    left: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: 16,
  },
});
