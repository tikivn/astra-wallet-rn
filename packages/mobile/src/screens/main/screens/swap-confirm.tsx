import { Currency } from "@solarswap/sdk";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { Button } from "../../../components";
import { SwapCallbackState, useSwapCallback } from "../../../hooks";
import { useSmartNavigation } from "../../../navigation-util";
import { useDataSwapContext } from "../../../providers/swap/use-data-swap-context";
import { useToastModal } from "../../../providers/toast-modal";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import {
  getExchangeRateString,
  getLiquidityFee,
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
    currencies,
    minimunReceived,
    txFee,
  } = useDataSwapContext();

  const { transactionStore, chainStore, analyticsStore } = useStore();

  const { callback: swapCallback, state, error } = useSwapCallback(
    trade,
    swapInfos.slippageTolerance
  );
  const [loading, setLoading] = useState<boolean>();
  const toastModal = useToastModal();

  const viewData = {
    inputAmount: `${values[SwapField.Input]} ${
      currencies[SwapField.Input]?.symbol
    }`,
    outputAmount: `${values[SwapField.Output]} ${
      currencies[SwapField.Output]?.symbol
    }`,
    exchageRate: getExchangeRateString(
      swapInfos,
      currencies,
      pricePerInputCurrency
    ),
    minimumReceived: `${minimunReceived} ${
      currencies[SwapField.Output]?.symbol
    }`,
    liquidityFee: getLiquidityFee(currencies, lpFee),
    slippageTolerance: getSlippageTolaranceString(swapInfos),
    txFee: getTransactionFee(txFee),
  };

  const paramsForAnalytics = useMemo(
    () => ({
      pair: `${currencies[SwapField.Input]?.symbol}/${
        currencies[SwapField.Output]?.symbol
      }`,
      from_token: currencies[SwapField.Input]?.symbol,
      to_token: currencies[SwapField.Input]?.symbol,
      from_amount: values[SwapField.Input],
      to_amount: values[SwapField.Output],
      gas: txFee,
      liquidity_fee: lpFee,
      slippage: swapInfos.slippageTolerance / 100,
      price: pricePerInputCurrency,
    }),
    [
      currencies,
      lpFee,
      pricePerInputCurrency,
      swapInfos.slippageTolerance,
      txFee,
      values,
    ]
  );

  const handleSwap = useCallback(() => {
    if (loading) {
      return;
    }
    setLoading(true);

    if (swapCallback && state === SwapCallbackState.VALID && !error) {
      transactionStore.updateRawData({ type: "wallet-swap", value: viewData });

      swapCallback()
        .then((hash) => {
          analyticsStore.logEvent("astra_hub_swap_token", {
            ...paramsForAnalytics,
            tx_hash: hash,
            success: true,
          });
        })
        .catch((error) => {
          console.error("Error swap: ", { error });
          analyticsStore.logEvent("astra_hub_swap_token", {
            ...paramsForAnalytics,
            success: false,
            error: error.message,
          });
          toastModal.makeToast({
            title: "Swap Failed!",
            type: "error",
            displayTime: 2000,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [
    loading,
    swapCallback,
    state,
    error,
    transactionStore,
    viewData,
    analyticsStore,
    paramsForAnalytics,
    toastModal,
  ]);

  const animatedButtonScale = new Animated.Value(0);

  const onPress = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedButtonScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: 2,
      }
    ).start();
  };
  const animatedScaleStyle = {
    transform: [
      {
        rotate: animatedButtonScale.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };
  const cointImg = useCallback(
    (currency?: Currency) => {
      if (!currency) return "";
      const currencies = chainStore.current.currencies;
      return currencies.find((f) => f.coinDenom === currency?.symbol)
        ?.coinImageUrl;
    },
    [chainStore]
  );

  return (
    <View
      style={style.flatten([
        "background-color-background",
        "flex-1",
        "border-color-border",
        "border-width-top-1",
      ])}
    >
      <View style={style.get("padding-x-16")}>
        <View
          style={style.flatten(["flex-row", "flex-nowrap", "margin-top-32"])}
        >
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
                uri: cointImg(currencies[SwapField.Input]),
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
            <Text
              style={style.flatten([
                "subtitle2",
                "color-gray-10",
                "text-center",
              ])}
              numberOfLines={2}
            >
              {viewData.inputAmount}
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
                uri: cointImg(currencies[SwapField.Output]),
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
            <Text
              style={style.flatten([
                "subtitle2",
                "color-gray-10",
                "text-center",
              ])}
              numberOfLines={2}
            >
              {viewData.outputAmount}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={style.flatten([
            "justify-center",
            "items-center",
            "margin-top-34",
            "flex-row",
          ])}
          onPress={onPress}
        >
          <Animated.View style={[animatedScaleStyle]}>
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
          </Animated.View>
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
        </TouchableOpacity>

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
            style={style.flatten([
              "flex-row",
              "flex-nowrap",
              "justify-between",
              "padding-bottom-16",
              "items-center",
              "border-width-bottom-1",
              "border-color-border",
              "overflow-hidden",
            ])}
          >
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-30",
                "margin-right-8",
              ])}
            >
              {intl.formatMessage({ id: "swap.exchangeRate" })}
            </Text>
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-10",
                "flex-1",
                "text-right",
              ])}
              numberOfLines={1}
            >
              {viewData.exchageRate}
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "flex-nowrap",
              "justify-between",
              "items-center",
              "padding-y-16",
              "border-width-bottom-1",
              "border-color-border",
              "overflow-hidden",
            ])}
          >
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-30",
                "margin-right-8",
              ])}
            >
              {intl.formatMessage({ id: "swap.confirm.minimumReceived" })}
            </Text>
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-10",
                "flex-1",
                "text-right",
              ])}
              numberOfLines={1}
            >
              {viewData.minimumReceived}
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "flex-nowrap",
              "justify-between",
              "padding-y-16",
              "border-width-bottom-1",
              "border-color-border",
              "overflow-hidden",
            ])}
          >
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-30",
                "margin-right-8",
              ])}
            >
              {intl.formatMessage({ id: "swap.transactionFee" })}
            </Text>
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-10",
                "flex-1",
                "text-right",
              ])}
              numberOfLines={1}
            >
              {viewData.txFee}
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "flex-nowrap",
              "justify-between",
              "padding-y-16",
              "border-width-bottom-1",
              "border-color-border",
              "overflow-hidden",
            ])}
          >
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-30",
                "margin-right-8",
              ])}
            >
              {intl.formatMessage({ id: "swap.liquidityFee" })}
            </Text>
            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-10",
                "flex-1",
                "text-right",
              ])}
            >
              {viewData.liquidityFee}
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
              {viewData.slippageTolerance}
            </Text>
          </View>
        </View>
      </View>
      <View style={style.get("flex-1")} />
      <View
        style={style.flatten([
          "padding-x-16",
          "padding-y-12",
          "flex-row",
          "flex-nowrap",
          "border-width-top-1",
          "border-color-border",
        ])}
      >
        <Button
          text={intl.formatMessage({ id: "swap.confirm.button.back" })}
          containerStyle={style.flatten(["flex-1", "margin-right-8"])}
          color="neutral"
          onPress={() => smartNavigation.goBack()}
        />
        <Button
          text={intl.formatMessage({
            id: "swap.confirm.button.next",
          })}
          containerStyle={style.flatten(["flex-1"])}
          onPress={handleSwap}
          loading={loading || state !== SwapCallbackState.VALID}
        />
      </View>
      <View style={style.flatten(["height-page-pad"])} />
    </View>
  );
});
