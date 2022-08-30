import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Image, Linking, StyleSheet, Text, View } from "react-native";
import { PageWithScrollView } from "../../../components/page";
import { useSmartNavigation } from "../../../navigation-util";
import { useDataSwapContext } from "../../../providers/swap/use-data-swap-context";
import { Colors, useStyle } from "../../../styles";
import {
  getExchangeRateString,
  getSlippageTolaranceString,
  getTransactionFee,
  SwapField,
} from "../../../utils/for-swap";
import { Button } from "../../../components";

export const SwapSuccessScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const {
    values,
    swapInfos,
    pricePerInputCurrency,
    lpFee,
    currencies,
  } = useDataSwapContext();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          transactionHash: string;
        }
      >,
      string
    >
  >();
  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16"])}
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.get("padding-x-16")}>
        <View style={style.flatten(["margin-top-24", "items-center"])}>
          <Image
            style={StyleSheet.flatten([
              {
                width: 107,
                height: 107,
              },
            ])}
            resizeMode="contain"
            source={require("../../../assets/image/icon_success.png")}
          />
          <Text
            style={style.flatten([
              "text-caption",
              "color-gray-30",
              "margin-top-24",
            ])}
          >
            {intl.formatMessage({ id: "swap.success.text.success" })}
          </Text>
          <Text
            style={style.flatten([
              "text-success",
              "color-gray-10",
              "margin-top-4",
            ])}
          >
            <FormattedMessage
              id="swap.success.text.from"
              values={{
                // eslint-disable-next-line react/display-name
                b: () => (
                  <Text>
                    {values[SwapField.Input]}{" "}
                    {currencies[SwapField.Input]?.symbol}
                  </Text>
                ),
              }}
            />
          </Text>
          <Text
            style={style.flatten([
              "text-success",
              "color-gray-10",
              "margin-top-4",
            ])}
          >
            <FormattedMessage
              id="swap.success.text.to"
              values={{
                // eslint-disable-next-line react/display-name
                b: () => (
                  <Text>
                    {values[SwapField.Output]}{" "}
                    {currencies[SwapField.Output]?.symbol}
                  </Text>
                ),
              }}
            />
          </Text>
        </View>
        <View
          style={style.flatten([
            "margin-top-34",
            "background-color-gray-90",
            "border-color-gray-60",
            "border-radius-16",
            "padding-16",
            "border-width-1",
          ])}
        >
          <View
            style={StyleSheet.flatten([
              {
                borderBottomWidth: 1,
                borderBottomColor: Colors["gray-70"],
              },
              style.flatten([
                "flex-row",
                "flex-nowrap",
                "justify-between",
                "padding-bottom-16",
                "items-center",
              ]),
            ])}
          >
            <Text style={style.flatten(["text-caption", "color-gray-30"])}>
              {intl.formatMessage({ id: "swap.exchangeRate" })}
            </Text>
            <Text style={style.flatten(["text-caption", "color-gray-10"])}>
              {getExchangeRateString(
                swapInfos,
                currencies,
                pricePerInputCurrency
              )}
            </Text>
          </View>
          <View
            style={StyleSheet.flatten([
              {
                borderBottomWidth: 1,
                borderBottomColor: Colors["gray-70"],
              },
              style.flatten([
                "flex-row",
                "flex-nowrap",
                "justify-between",
                "padding-y-16",
              ]),
            ])}
          >
            <Text style={style.flatten(["text-caption", "color-gray-30"])}>
              {intl.formatMessage({ id: "swap.transactionFee" })}
            </Text>
            <Text style={style.flatten(["text-caption", "color-gray-10"])}>
              {getTransactionFee(currencies, lpFee)}
            </Text>
          </View>
          <View
            style={StyleSheet.flatten([
              style.flatten([
                "flex-row",
                "flex-nowrap",
                "justify-between",
                "padding-top-16",
              ]),
            ])}
          >
            <Text style={style.flatten(["text-caption", "color-gray-30"])}>
              {intl.formatMessage({ id: "swap.priceSlippage" })}
            </Text>
            <Text style={style.flatten(["text-caption", "color-gray-10"])}>
              {getSlippageTolaranceString(swapInfos)}
            </Text>
          </View>
        </View>
        <View style={style.flatten(["items-center", "margin-top-16"])}>
          <Text
            style={style.flatten([
              "text-caption",
              "text-underline",
              "color-blue-70",
            ])}
            onPress={() =>
              Linking.openURL(
                "https://explorer.astranaut.dev/tx/" +
                  route.params.transactionHash
              )
            }
          >
            {intl.formatMessage({ id: "swap.success.text.scan" })}
          </Text>
        </View>
      </View>
      <View style={style.flatten(["flex-1"])} />
      <View
        style={StyleSheet.flatten([
          { borderTopWidth: 1, borderColor: Colors["gray-70"] },
          style.flatten(["padding-y-12", "padding-x-16", "items-center"]),
        ])}
      >
        <Button
          text={intl.formatMessage({ id: "swap.success.button" })}
          size="large"
          containerStyle={style.flatten(["border-radius-4", "width-full"])}
          textStyle={style.flatten(["subtitle2"])}
          onPress={() => smartNavigation.navigateSmart("NewHome", {})}
        />
      </View>
    </PageWithScrollView>
  );
});
