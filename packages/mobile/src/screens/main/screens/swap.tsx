import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components";
import { ChangeTokenIcon } from "../../../components/icon/change-token";
import { PageWithScrollView } from "../../../components/page";
import { RectButton } from "../../../components/rect-button";
import { useSwap, useSwapCallback } from "../../../hooks";
import { ConfirmSwapModal } from "../../../modals/confirm-swap";
import { useToastModal } from "../../../providers/toast-modal";
import { Colors, useStyle } from "../../../styles";
import {
  AmountSwapInput,
  AmountSwapOutput,
  Dropdown,
  Tooltip,
} from "../components";

const DATA_SLIPPAGE_TOLERANCE = [10, 50, 100];

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
    slippageTolerance,
  } = useSwap();
  console.log(
    "🚀 -> constSwapScreen:FunctionComponent=observer -> slippageTolerance",
    slippageTolerance
  );

  const { callback: swapCallback } = useSwapCallback(trade, slippageTolerance);
  const [isOpenConfirm, setIsOpenConfirm] = useState<boolean>(false);
  const style = useStyle();
  const intl = useIntl();
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
          toastModal.makeToast({
            title: "Swap Successful!",
            type: "success",
            displayTime: 2000,
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
  }, [loading, swapCallback, toastModal]);

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
          {`1 ${inputCurrency.denom} ≈ ${pricePerInputCurrency} ${outputCurrency?.coinDenom}`}
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
        onPress={() => setIsOpenConfirm(true)}
      />
      <ConfirmSwapModal
        isOpen={isOpenConfirm}
        close={() => setIsOpenConfirm(false)}
        title={"Confirm Swap"}
        onConfirmSwap={handleSwap}
        inputCurrency={inputCurrency.currency}
        outputCurrency={outputCurrency}
        trade={trade}
        lpFee={lpFee}
        pricePerInputCurrency={pricePerInputCurrency}
        slippageTolerance={slippageTolerance}
      />
    </PageWithScrollView>
  );
});
