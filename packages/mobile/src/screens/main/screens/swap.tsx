import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback } from "react";
import { useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components";
import { ChangeTokenIcon } from "../../../components/icon/change-token";
import { PageWithScrollView } from "../../../components/page";
import { RectButton } from "../../../components/rect-button";
import { useSwap, useSwapCallback } from "../../../hooks";
import { Colors, useStyle } from "../../../styles";
import {
  AmountSwapInput,
  AmountSwapOutput,
  Dropdown,
  Tooltip,
} from "../components";

const DATA_SLIPPAGE_TOLERANCE = [0.1, 0.5, 1.0];

export const SwapScreen: FunctionComponent = observer(() => {
  const {
    inputBalance,
    inputCurrency,
    setSwapValue,
    handleSwapAll,
    outputCurrency,
    outputSwapValue,
    pricePerInputCurrency,
    lpFee,
    isReadyToSwap,
    handleSetSlippageTolerance,
    trade,
  } = useSwap();

  const { callback: swapCallback } = useSwapCallback(trade, 50);
  const style = useStyle();
  const intl = useIntl();

  const handleSwap = useCallback(() => {
    if (swapCallback) {
      swapCallback();
    }
  }, [swapCallback]);

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16", "padding-x-16"])}
      backgroundColor={style.get("color-background").color}
    >
      {/* <View style={style.get("height-12")} /> */}
      <AmountSwapInput
        setSwapValue={setSwapValue}
        currency={inputCurrency}
        balance={inputBalance}
        onSwapAll={handleSwapAll}
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
            // onPress={}
            // rippleColor={rippleColor}
            // underlayColor={underlayColor}
            activeOpacity={1}
          >
            <ChangeTokenIcon color={style.get("color-white").color} />
          </RectButton>
        </View>
      </View>

      <AmountSwapOutput currency={outputCurrency} value={outputSwapValue} />

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
        <Tooltip text={intl.formatMessage({ id: "swap.exchangeRate" })} />
        <Text style={style.flatten(["color-gray-10", "body3"])}>
          {`1 ${inputCurrency.denom} ≈ ${pricePerInputCurrency} ${outputCurrency.coinDenom}`}
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
        <Tooltip text={intl.formatMessage({ id: "swap.transactionFee" })} />
        <Text style={style.flatten(["color-gray-10", "body3"])}>
          {lpFee} ASA
        </Text>
      </View>
      <View
        style={style.flatten(["flex-row", "items-center", "justify-between"])}
      >
        <Tooltip text={intl.formatMessage({ id: "swap.priceSlippage" })} />
        <Dropdown
          data={DATA_SLIPPAGE_TOLERANCE}
          onSelect={handleSetSlippageTolerance}
        />
      </View>
      {/* end describe */}

      <Button
        text={intl.formatMessage({ id: "swap.buttonText" })}
        size="large"
        containerStyle={style.flatten(["border-radius-4", "margin-top-34"])}
        textStyle={style.flatten(["subtitle2"])}
        disabled={!isReadyToSwap}
        // loading={account.txTypeInProgress === "send"}
        onPress={handleSwap}
      />
    </PageWithScrollView>
  );
});
