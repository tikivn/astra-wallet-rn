import { Token } from "@solarswap/sdk";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Image, StyleSheet, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Button } from "../../../components";
import { PageWithScrollView } from "../../../components/page";
import { useSwapCallback } from "../../../hooks";
import { useSmartNavigation } from "../../../navigation-util";
import { useDataSwapContext } from "../../../providers/swap/use-data-swap-context";
import { useToastModal } from "../../../providers/toast-modal";
import { Colors, useStyle } from "../../../styles";
import {
  getExchangeRateString,
  getSlippageTolaranceString,
  getTransactionFee,
  INTERNAL_DELAY,
  SwapField,
} from "../../../utils/for-swap";

export const SwapConfirmScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const intl = useIntl();
  const {
    swapInfos,
    values,
    pricePerInputCurrency,
    lpFee,
    trade,
  } = useDataSwapContext();

  const {
    currencies: {
      [SwapField.Input]: inputCurrency,
      [SwapField.Output]: outputCurrency,
    },
  } = useMemo(() => swapInfos, [swapInfos]);
  const { callback: swapCallback } = useSwapCallback(
    trade,
    swapInfos.slippageTolerance
  );
  const [loading, setLoading] = useState<boolean>();
  const toastModal = useToastModal();

  const handleSwap = useCallback(() => {
    if (loading) {
      return;
    }
    setLoading(true);

    if (swapCallback) {
      swapCallback()
        .then((hash) => {
          smartNavigation.navigateSmart("Swap.Success", {
            transactionHash: hash,
          });
        })
        .catch((error) => {
          toastModal.makeToast({
            title: "Swap Failed!",
            type: "error",
            displayTime: 2000,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [loading, smartNavigation, swapCallback]);

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16", "padding-x-16"])}
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.get("height-12")} />
      <View style={style.flatten(["flex-row", "flex-nowrap"])}>
        <View
          style={style.flatten(["flex-1", "margin-right-16", "items-center"])}
        >
          <FastImage
            style={{
              width: 56,
              height: 56,
            }}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri: (inputCurrency as Token)?.projectLink,
            }}
          />
          <Text
            style={style.flatten([
              "subtitle4",
              "color-gray-30",
              "margin-top-12",
            ])}
          >
            {intl.formatMessage({ id: "swap.confirm.fromText" })}
          </Text>
          <Text style={style.flatten(["subtitle2", "color-gray-10"])}>
            {values[SwapField.Input]} {inputCurrency?.symbol}
          </Text>
        </View>
        <Image
          style={StyleSheet.flatten([
            {
              width: 12,
              height: 17,
              position: "absolute",
              left: "50%",
              transform: [{ translateX: -6 }],
              top: 20,
            },
          ])}
          resizeMode="contain"
          source={require("../../../assets/image/right.png")}
        />
        <View style={style.flatten(["flex-1", "items-center"])}>
          <FastImage
            style={{
              width: 56,
              height: 56,
            }}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri: (outputCurrency as Token)?.projectLink,
            }}
          />
          <Text
            style={style.flatten([
              "subtitle4",
              "color-gray-30",
              "margin-top-12",
            ])}
          >
            {intl.formatMessage({ id: "swap.confirm.toText" })}
          </Text>
          <Text style={style.flatten(["subtitle2", "color-gray-10"])}>
            {values[SwapField.Output]} {outputCurrency?.symbol}
          </Text>
        </View>
      </View>

      <View
        style={style.flatten([
          "justify-center",
          "items-center",
          "margin-top-34",
          "flex-row",
        ])}
      >
        <Image
          style={StyleSheet.flatten([
            {
              width: 17,
              height: 17,
            },
          ])}
          resizeMode="contain"
          source={require("../../../assets/image/reload.png")}
        />
        <Text
          style={style.flatten([
            "color-gray-10",
            "text-caption",
            "margin-left-8",
          ])}
        >
          <FormattedMessage
            id="swap.confirm.updateText"
            values={{
              // eslint-disable-next-line react/display-name
              b: () => (
                <Text style={style.flatten(["color-text-yellow"])}>
                  {INTERNAL_DELAY / 1000}s
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
            {getExchangeRateString(swapInfos, pricePerInputCurrency)}
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
            {getTransactionFee(swapInfos, lpFee)}
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
      <View style={style.flatten(["flex-1"])} />
      <View
        style={style.flatten([
          "padding-x-16",
          "padding-y-12",
          "flex-row",
          "flex-nowrap",
        ])}
      >
        <Button
          text={intl.formatMessage({ id: "swap.confirm.button.back" })}
          size="large"
          containerStyle={style.flatten([
            "border-radius-4",
            "flex-1",
            "margin-right-8",
          ])}
          color="secondary"
          style={style.flatten(["background-color-gray-70"])}
          textStyle={style.flatten(["subtitle2"])}
          onPress={() => smartNavigation.goBack()}
        />
        <Button
          text={intl.formatMessage({
            id: "swap.confirm.button.next",
          })}
          size="large"
          containerStyle={style.flatten(["border-radius-4", "flex-1"])}
          textStyle={style.flatten(["subtitle2"])}
          onPress={handleSwap}
        />
      </View>
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
