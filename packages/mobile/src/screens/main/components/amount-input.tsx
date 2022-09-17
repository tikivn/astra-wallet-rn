import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import {
  IAmountConfig,
} from "@keplr-wallet/hooks";
import { useIntl } from "react-intl";
import { NormalInput } from "../../../components/input/normal-input";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Text, View, ViewStyle } from "react-native";
import { formatNumber, MIN_AMOUNT } from "../../../common/utils";

export const AmountInput: FunctionComponent<{
  labelText?: string;
  hideDenom?: boolean;
  amountConfig: IAmountConfig;
  availableAmount?: CoinPretty;
  fee?: CoinPretty;
  containerStyle?: ViewStyle;
}> = observer(
  ({
    labelText,
    hideDenom,
    amountConfig,
    availableAmount,
    fee,
    containerStyle,
  }) => {
    const style = useStyle();
    const intl = useIntl();
    const feeUpdated = useRef(false);

    const [amountText, setAmountText] = useState(formatNumber(amountConfig.amount));
    const [errorText, setErrorText] = useState("");
    const infoText = intl.formatMessage(
      { id: "component.amount.input.error.minimum" },
      { amount: MIN_AMOUNT, denom: amountConfig.sendCurrency.coinDenom },
    );

    useEffect(() => {
      onChangeTextHandler(amountText);
    }, [amountText]);

    useEffect(() => {
      console.log("fee", fee?.toDec().toString());
      console.log("feeUpdated", feeUpdated);
      const amount = new Dec(Number(amountConfig.amount));
      if (!feeUpdated.current && amount.gt(new Dec(0)) && fee?.toDec().gt(new Dec(0))) {
        feeUpdated.current = true;

        if (availableAmount) {
          const maxAvailableAmount = availableAmount.sub(fee).toDec();
          if (amount.gt(maxAvailableAmount)) {
            setAmountText(Number(maxAvailableAmount.toString(3)).toString());
          }
        }
      }
    }, [fee]);

    function onChangeTextHandler(amountText: string) {
      const text = amountText.split(",").join("");
      amountConfig.setAmount(text);

      const amount = Number(text) ?? 0;

      if (text.length === 0) {
        setErrorText("");
        return;
      }

      if (!amount || amount < 0) {
        setErrorText(intl.formatMessage({ id: "component.amount.input.error.invalid" }));
        return;
      }

      if (amount < MIN_AMOUNT) {
        setErrorText(intl.formatMessage(
          { id: "component.amount.input.error.minimum" },
          { amount: MIN_AMOUNT, denom: amountConfig.sendCurrency.coinDenom },
        ));
      }
      else if (availableAmount && availableAmount.toDec().lt(new Dec(amount))) {
        setErrorText(intl.formatMessage({ id: "component.amount.input.error.insufficient" }));
      }
      else {
        setErrorText("");
      }
    }

    return (
      <View style={containerStyle}>
        <NormalInput
          value={amountText}
          label={labelText}
          info={infoText}
          error={errorText}
          onChangeText={(text) => {
            setAmountText(formatNumber(text));
          }}
          placeholder="0"
          keyboardType="numeric"
          rightView={availableAmount && (
            <View style={{ flexDirection: "row", marginLeft: 16, alignItems: "center" }}>
              {!hideDenom && (
                <Text
                  style={style.flatten([
                    "text-base-regular",
                    "color-gray-50",
                    "margin-right-16",
                  ])}
                >
                  {amountConfig.sendCurrency.coinDenom}
                </Text>
              )}
              <Button text={intl.formatMessage({ id: "component.amount.input.max" })}
                size="small"
                mode="text"
                containerStyle={style.flatten(["height-24"])}
                onPress={() => {
                  if (availableAmount) {
                    let maxAmount: CoinPretty;
                    if (fee) {
                      maxAmount = availableAmount.sub(fee);
                    }
                    else {
                      maxAmount = availableAmount;
                    }
                    setAmountText(Number(maxAmount.toDec().toString(3)).toString());
                  }
                }}
              />
            </View>
          )}
          style={{ marginBottom: (errorText || infoText) ? 24 : 0 }}
        />
      </View>
    );
  }
);