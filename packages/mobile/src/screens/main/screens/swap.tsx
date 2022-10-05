import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, SlippageDescribe, SlippageInput } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { ChangeTokenIcon } from "../../../components/icon/change-token";
import { RectButton } from "../../../components/rect-button";
import { useSwapActions } from "../../../hooks";
import { useSmartNavigation } from "../../../navigation-util";
import { useLoadingScreen } from "../../../providers/loading-screen";
import { useDataSwapContext } from "../../../providers/swap/use-data-swap-context";
import { useStyle } from "../../../styles";
import {
  getExchangeRateString,
  getLiquidityFee,
  getSlippageTolaranceString,
  getTransactionFee,
  SwapField,
} from "../../../utils/for-swap";
import { AmountSwap, Tooltip } from "../components";

export const SwapScreen: FunctionComponent = observer(() => {
  const {
    swapInfos,
    dispatch,
    tokenBalances,
    values,
    lpFee,
    txFee,
    pricePerInputCurrency,
    isReadyToSwap,
    currencies,
  } = useDataSwapContext();

  const {
    onUserInput,
    onSetSlippageTolerance,
    onReverseCurrencies,
    onSwapAll,
  } = useSwapActions({
    tokenBalances,
    dispatch,
  });
  const [isOpenSlippageInput, setIsOpenSlippageInput] = useState<boolean>(
    false
  );
  const [isOpenSlippageDescribe, setIsOpenSlippageDescribe] = useState<boolean>(
    false
  );
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const handleClickContinue = useCallback(() => {
    smartNavigation.navigateSmart("Swap.Confirm", {});
  }, [smartNavigation]);

  const loadingScreen = useLoadingScreen();

  useEffect(() => {
    if (
      !(tokenBalances[SwapField.Input] && tokenBalances[SwapField.Output]) ||
      swapInfos.loading
    ) {
      loadingScreen.setIsLoading(true);
    } else {
      loadingScreen.setIsLoading(false);
    }
  }, [tokenBalances, loadingScreen, swapInfos.loading]);

  return (
    <View
      style={style.flatten([
        "background-color-background",
        "flex-1",
        "border-width-top-1",
        "border-color-border",
      ])}
    >
      <View style={style.flatten(["padding-x-16"])}>
        <View style={style.get("height-16")} />

        <AmountSwap
          currency={currencies[SwapField.Input]}
          balance={tokenBalances[SwapField.Input]}
          onSwapAll={onSwapAll}
          field={SwapField.Input}
          onUserInput={onUserInput}
          value={values[SwapField.Input]}
        />

        <View
          style={StyleSheet.flatten([
            {
              zIndex: 999,
            },
            style.flatten(["items-center", "justify-center", "height-8"]),
          ])}
        >
          <View
            style={StyleSheet.flatten([
              {
                width: 40,
                height: 40,
              },
            ])}
          >
            <RectButton
              style={StyleSheet.flatten([
                {
                  borderRadius: 20,
                  height: "100%",
                  width: "100%",
                  backgroundColor: style.get("color-background").color,
                  paddingLeft: 4,
                },
                style.flatten(["items-center", "justify-center"]),
              ])}
              onPress={onReverseCurrencies}
              // rippleColor={rippleColor}
              // underlayColor={underlayColor}
              activeOpacity={1}
            >
              <ChangeTokenIcon color={style.get("color-white").color} />
            </RectButton>
          </View>
        </View>

        <AmountSwap
          currency={currencies[SwapField.Output]}
          balance={tokenBalances[SwapField.Output]}
          showSwapAll={false}
          field={SwapField.Output}
          onUserInput={onUserInput}
          value={values[SwapField.Output]}
        />

        <View style={style.get("height-12")} />

        {/* start describe */}
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "justify-between",
            "margin-top-24",
            "margin-bottom-16",
          ])}
        >
          <Text
            style={StyleSheet.flatten([
              style.flatten(["color-gray-30", "text-caption"]),
            ])}
          >
            {intl.formatMessage({ id: "swap.exchangeRate" })}
          </Text>
          <Text style={style.flatten(["color-gray-10", "body3"])}>
            {getExchangeRateString(
              swapInfos,
              currencies,
              pricePerInputCurrency
            )}
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "justify-between",
            "margin-bottom-16",
          ])}
        >
          <Text
            style={StyleSheet.flatten([
              style.flatten(["color-gray-30", "text-caption"]),
            ])}
          >
            {intl.formatMessage({ id: "swap.transactionFee" })}
          </Text>
          <Text style={style.flatten(["color-gray-10", "body3"])}>
            {getTransactionFee(txFee)}
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "justify-between",
            "margin-bottom-16",
          ])}
        >
          <Text
            style={StyleSheet.flatten([
              style.flatten(["color-gray-30", "text-caption"]),
            ])}
          >
            {intl.formatMessage({ id: "swap.liquidityFee" })}
          </Text>
          <Text style={style.flatten(["color-gray-10", "body3"])}>
            {getLiquidityFee(currencies, lpFee)}
          </Text>
        </View>
        <View
          style={style.flatten(["flex-row", "items-center", "justify-between"])}
        >
          <Tooltip
            text={intl.formatMessage({ id: "swap.priceSlippage" })}
            onPress={() => setIsOpenSlippageDescribe(true)}
          />
          <TouchableOpacity
            style={style.flatten(["flex-row", "items-center"])}
            onPress={() => setIsOpenSlippageInput((o) => !o)}
          >
            <Text style={style.flatten(["color-gray-10", "body3"])}>
              <FormattedMessage
                id="swap.slipageTolarance"
                values={{
                  // eslint-disable-next-line react/display-name
                  b: () => <Text>{getSlippageTolaranceString(swapInfos)}</Text>,
                }}
              />
            </Text>
            <Image
              style={StyleSheet.flatten([
                {
                  width: 11,
                  height: 5,
                  marginLeft: 5,
                },
              ])}
              resizeMode="contain"
              source={require("../../../assets/image/icon_dropdown.png")}
            />
          </TouchableOpacity>
        </View>
        {/* <View>
          <Button onPress={approve0} text="Click Approve 0" />
        </View> */}
        {/* end describe */}

        <SlippageDescribe
          isOpen={isOpenSlippageDescribe}
          label={intl.formatMessage({ id: "swap.titleSlippageDescribe" })}
          close={() => setIsOpenSlippageDescribe(false)}
        />

        <SlippageInput
          isOpen={isOpenSlippageInput}
          label={intl.formatMessage({ id: "swap.titleSlippageInput" })}
          close={() => setIsOpenSlippageInput(false)}
          onSelectValue={onSetSlippageTolerance}
        />
      </View>

      <View
        style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}
      >
        <View
          style={style.flatten([
            "height-12",
            "border-width-top-1",
            "border-color-border",
          ])}
        />
        <View style={style.flatten(["padding-x-16"])}>
          <Button
            text={intl.formatMessage({
              id:
                "swap.buttonText" + (swapInfos.error && `.${swapInfos.error}`),
            })}
            disabled={!isReadyToSwap || !!swapInfos.error}
            onPress={handleClickContinue}
          />
        </View>
      </View>
      <AvoidingKeyboardBottomView />
    </View>
  );
});
