import { Currency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import React, { FunctionComponent } from "react";
import { ViewStyle, View, StyleSheet, Text } from "react-native";
import { RectButton } from "../../../components/rect-button";
import { useStyle } from "../../../styles";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../components/vector-character";
import { AppCurrency } from "@keplr-wallet/types";
import { formatCoin } from "../../../common/utils";

export const TokenItemNew: FunctionComponent<{
  containerStyle?: ViewStyle;

  chainInfo: {
    stakeCurrency: Currency;
  };
  balance: CoinPretty;
}> = ({ containerStyle, balance }) => {
  const style = useStyle();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "items-center",
          "padding-x-card-horizontal",
          "padding-y-14",
          "margin-top-12",
        ]),
        containerStyle,
      ])}
      onPress={() => {
        // smartNavigation.navigateSmart("Wallet.Send", {
        //   currency: balance.currency.coinMinimalDenom,
        // });
      }}
    >
      <TokenSymbolNew
        style={style.flatten(["margin-right-12"])}
        size={40}
        currency={balance.currency}
      />
      <View style={style.flatten(["flex-1"])}>
        <View style={style.flatten(["flex-row", "justify-between"])}>
          <Text
            style={style.flatten([
              "text-medium-semi-bold",
              "color-white",
              "uppercase",
            ])}
          >
            {balance.currency.coinDenom}
          </Text>
          <Text
            style={style.flatten([
              "text-medium-semi-bold",
              "color-white",
              "text-right",
              "padding-right-0",
            ])}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatCoin(balance, true)}
          </Text>
        </View>
        {/* <View style={style.flatten(["flex-row", "justify-between", "margin-bottom-0"])}>
          <Text
            style={style.flatten([
              "text-caption2",
              "color-text-black-low",
              "uppercase",
            ])}
          >
            {balance.currency.coinDenom}
          </Text>
          <Text
            style={style.flatten([
              "text-caption2",
              priceChange.includes("+") ? "color-text-green" : "color-text-red",
              "padding-right-0",
            ])}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {priceChange}
          </Text>
        </View> */}
      </View>
    </RectButton>
  );
};

export const TokenSymbolNew: FunctionComponent<{
  style?: ViewStyle;
  currency: AppCurrency;

  size: number;

  imageScale?: number;
}> = ({ style: propStyle, size, currency, imageScale = 1 }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        {
          width: size,
          height: size,
          borderRadius: size,
        },
        style.flatten([
          "items-center",
          "justify-center",
          "overflow-hidden",
          "background-color-transparent",
        ]),
        propStyle,
      ])}
    >
      {currency.coinImageUrl ? (
        <FastImage
          style={{
            width: size * imageScale,
            height: size * imageScale,
          }}
          resizeMode={FastImage.resizeMode.contain}
          source={{
            uri: currency.coinImageUrl,
          }}
        />
      ) : (
        <VectorCharacter
          char={currency.coinDenom[0]}
          height={Math.floor(size * 0.35)}
          color="white"
        />
      )}
    </View>
  );
};
