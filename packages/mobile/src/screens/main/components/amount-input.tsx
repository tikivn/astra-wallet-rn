import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import {
  IAmountConfig, IFeeConfig,
} from "@keplr-wallet/hooks";
import { useIntl } from "react-intl";
import { NormalInput } from "../../../components/input/normal-input";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Text, View, ViewStyle } from "react-native";
import { formatTextNumber, MIN_AMOUNT, removeZeroFractionDigits } from "../../../common/utils";

export const AmountInput: FunctionComponent<{
  labelText?: string;
  hideDenom?: boolean;
  amountConfig: IAmountConfig;
  availableAmount?: CoinPretty;
  feeConfig?: IFeeConfig;
  containerStyle?: ViewStyle;
  onAmountChanged?: (value: string, isValid: boolean) => void;
}> = observer(({
  labelText,
  hideDenom,
  amountConfig,
  availableAmount,
  feeConfig,
  containerStyle,
  onAmountChanged = (value: string, isValid: boolean) => {
    console.log(value, isValid);
  },
}) => {
  const style = useStyle();
  const intl = useIntl();

  const [amountText, setAmountText] = useState(formatTextNumber(amountConfig.amount));
  const [errorText, setErrorText] = useState("");
  const infoText = intl.formatMessage(
    { id: "component.amount.input.error.minimum" },
    { amount: MIN_AMOUNT, denom: amountConfig.sendCurrency.coinDenom },
  );

  useEffect(() => {
    onChangeTextHandler(amountText);
  }, [amountText]);

  function onChangeTextHandler(amountText: string) {
    const text = amountText.split(",").join("");
    const amount = Number(text);
    if (!amount || amount < 0) {
      if (text.length !== 0) {
        setErrorText(intl.formatMessage({ id: "component.amount.input.error.invalid" }));
      }
      else {
        setErrorText("");
      }

      onAmountChanged(text, false);
      return;
    }

    amountConfig.setAmount(text);

    const amountDec = new Dec(text);

    if (amountDec.lt(new Dec(MIN_AMOUNT))) {
      setErrorText(intl.formatMessage(
        { id: "component.amount.input.error.minimum" },
        { amount: MIN_AMOUNT, denom: amountConfig.sendCurrency.coinDenom },
      ));
      onAmountChanged(text, false);
    }
    else if (availableAmount && availableAmount.toDec().lt(new Dec(text))) {
      setErrorText(intl.formatMessage({ id: "component.amount.input.error.insufficientAmount" }));
      onAmountChanged(text, false);
    }
    else if (feeConfig && feeConfig.error) {
      setErrorText(intl.formatMessage({ id: "component.amount.input.error.insufficientFee" }));
      onAmountChanged(text, false);
    }
    else {
      setErrorText("");
      onAmountChanged(text, true);
    }
  }

  const onMaxHandler = () => {
    if (!availableAmount) {
      return;
    }

    setAmountText(
      removeZeroFractionDigits(availableAmount.toDec().toString())
    );
  };

  return (
    <View style={containerStyle}>
      <NormalInput
        value={amountText}
        label={labelText}
        info={infoText}
        error={errorText}
        onChangeText={(text) => {
          setAmountText(formatTextNumber(text));
        }}
        placeholder="0"
        keyboardType="numeric"
        rightView={availableAmount && (
          <View style={{ flexDirection: "row", marginLeft: 16, alignItems: "center" }}>
            {!hideDenom && (
              <Text
                style={style.flatten([
                  "text-base-regular",
                  "color-label-text-2",
                  "margin-right-8",
                ])}
              >
                {amountConfig.sendCurrency.coinDenom}
              </Text>
            )}
            <Button text={intl.formatMessage({ id: "component.amount.input.max" })}
              size="medium"
              mode="ghost"
              onPress={onMaxHandler}
            />
          </View>
        )}
        style={{ marginBottom: (errorText || infoText) ? 24 : 0 }}
      />
    </View>
  );
});