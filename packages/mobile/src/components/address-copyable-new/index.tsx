import { Bech32Address } from "@keplr-wallet/cosmos";
import React, { FunctionComponent } from "react";
import { ViewStyle, StyleSheet, Text, View } from "react-native";
import { useSimpleTimer } from "../../hooks";
import { useStyle } from "../../styles";
import Clipboard from "expo-clipboard";
import LottieView from "lottie-react-native";
import { RectButton } from "../rect-button";
import { CopyIconNew } from "../icon";

export const AddressCopyableItem: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters }) => {
  const style = useStyle();
  const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "padding-left-12",
          "padding-right-8",
          "background-color-transparent",
          "flex-row",
          "items-center",
          "justify-center",
        ]),
        propStyle,
      ])}
      onPress={() => {
        Clipboard.setString(address);
        setTimer(2000);
      }}
      rippleColor={style.get("color-transparent").color}
      underlayColor={style.get("color-transparent").color}
      activeOpacity={1}
    >
      <Text style={style.flatten(["body3", "color-white"])}>
        {Bech32Address.shortenAddress(address, maxCharacters)}
      </Text>
      <View style={style.flatten(["margin-left-4", "width-20"])}>
        {isTimedOut ? (
          <View style={style.flatten(["margin-left-2"])}>
            <View style={style.flatten(["width-20", "height-20"])}>
              <View
                style={StyleSheet.flatten([
                  style.flatten(["absolute", "justify-center", "items-center"]),
                  {
                    left: 0,
                    right: 4,
                    top: 0,
                    bottom: 0,
                  },
                ])}
              >
                <LottieView
                  source={require("../../assets/lottie/check.json")}
                  autoPlay
                  speed={2}
                  loop={false}
                  style={style.flatten(["width-58", "height-58"])}
                />
              </View>
            </View>
          </View>
        ) : (
          <CopyIconNew
            color={style.get("color-text-black-low").color}
            size={17}
          />
        )}
      </View>
    </RectButton>
  );
};
