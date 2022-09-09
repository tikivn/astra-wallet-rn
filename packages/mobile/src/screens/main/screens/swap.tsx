import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, SlippageDescribe, SlippageInput } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { ChangeTokenIcon } from "../../../components/icon/change-token";
import { RectButton } from "../../../components/rect-button";
import { Approval } from "../../../components/swap/approval";
import { useSwapActions } from "../../../hooks";
import {
  ApprovalState,
  useApproveCallbackFromTrade,
} from "../../../hooks/use-approve";
import { useSmartNavigation } from "../../../navigation-util";
import { useDataSwapContext } from "../../../providers/swap/use-data-swap-context";
import { Colors, useStyle } from "../../../styles";
import {
  getExchangeRateString,
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
    pricePerInputCurrency,
    isReadyToSwap,
    currencies,
    trade,
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
  const [isOpenApproval, setIsOpenApproval] = useState<boolean>(false);
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();
  const [approvalState, onApproval, approve0] = useApproveCallbackFromTrade(
    trade,
    swapInfos.slippageTolerance
  );

  // useEffect(() => {
  //   if (currencies[SwapField.Input]?.symbol === "USDT") {
  //     console.log("run appove 0");
  //     (async () => {
  //       await approve0();
  //     })();
  //   }
  // }, [approve0, currencies]);

  const handleClickContinue = useCallback(() => {
    if (approvalState === ApprovalState.APPROVED) {
      smartNavigation.navigateSmart("Swap.Confirm", {});
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      setIsOpenApproval(true);
    }
  }, [approvalState, smartNavigation]);

  const handleApproval = useCallback(async () => {
    await onApproval();
    if (approvalState === ApprovalState.APPROVED) {
      smartNavigation.navigateSmart("Swap.Confirm", {});
    }
  }, [approvalState, onApproval, smartNavigation]);

  return (
    <View
      style={StyleSheet.flatten([
        { borderTopWidth: 1, borderColor: Colors["gray-70"] },
        style.flatten(["background-color-background", "flex-1"]),
      ])}
    >
      <View style={style.flatten(["padding-x-16"])}>
        <View style={style.get("height-12")} />

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
            style.flatten(["items-center", "justify-center", "height-16"]),
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
                  backgroundColor: Colors["gray-100"],
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
            {getTransactionFee(currencies, lpFee)}
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
                  b: () => (
                    <Text style={{ fontWeight: "bold" }}>
                      {getSlippageTolaranceString(swapInfos)}
                    </Text>
                  ),
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
        <Approval
          isOpen={isOpenApproval}
          label={intl.formatMessage(
            {
              id: "swap.approvalSymbol",
            },
            { symbol: currencies[SwapField.Input]?.symbol }
          )}
          close={() => setIsOpenApproval(false)}
          onConfirm={handleApproval}
        />
      </View>

      <View
        style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}
      >
        <View
          style={StyleSheet.flatten([
            { borderTopWidth: 1, borderColor: Colors["gray-70"] },
            style.flatten(["height-12"]),
          ])}
        />
        <View style={style.flatten(["padding-x-16"])}>
          <Button
            text={intl.formatMessage({
              id: "swap.buttonText" + swapInfos.error,
            })}
            size="large"
            containerStyle={style.flatten(["border-radius-4"])}
            textStyle={style.flatten(["subtitle2"])}
            disabled={!isReadyToSwap || !!swapInfos.error}
            onPress={handleClickContinue}
          />
        </View>
      </View>
      <AvoidingKeyboardBottomView />
    </View>
  );
});
