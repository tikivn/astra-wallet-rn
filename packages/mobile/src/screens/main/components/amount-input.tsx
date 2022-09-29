import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { IAmountConfig, IFeeConfig } from "@keplr-wallet/hooks";
import { useIntl } from "react-intl";
import { NormalInput } from "../../../components/input/normal-input";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Text, View, ViewStyle } from "react-native";
import {
  formatTextNumber,
  MIN_AMOUNT,
  removeZeroFractionDigits,
} from "../../../common/utils";

export const AmountInput: FunctionComponent<{
  labelText?: string;
  hideDenom?: boolean;
  amountConfig: IAmountConfig;
  availableAmount?: CoinPretty;
  feeConfig?: IFeeConfig;
  containerStyle?: ViewStyle;
  onAmountChanged?: (
    amount: string,
    errorText: string,
    isFocus: boolean
  ) => void;
}> = observer(
  ({
    labelText,
    hideDenom,
    amountConfig,
    availableAmount,
    feeConfig,
    containerStyle,
    onAmountChanged = (amount: string, errorText: string, isFocus: boolean) => {
      console.log(amount, errorText, isFocus);
    },
  }) => {
    const style = useStyle();
    const intl = useIntl();

    const [isFocus, setIsFocus] = useState(false);
    const [amountText, setAmountText] = useState(
      formatTextNumber(amountConfig.amount)
    );
    const [errorText, setErrorText] = useState("");
    const [showError, setShowError] = useState(false);

    const infoText = intl.formatMessage(
      { id: "component.amount.input.error.minimum" },
      { amount: MIN_AMOUNT, denom: amountConfig.sendCurrency.coinDenom }
    );

    useEffect(() => {
      setShowError(!isFocus);
      onChangeTextHandler(amountText);
    }, [isFocus, amountText]);

    function onChangeTextHandler(amountText: string) {
      const text = amountText.split(",").join("");
      const amount = Number(text);
      if (!amount || amount < 0) {
        let errorText = "";
        if (text.length !== 0) {
          errorText = intl.formatMessage({
            id: "component.amount.input.error.invalid",
          });
        }

        setErrorText(errorText);
        onAmountChanged(text, errorText, isFocus);
        return;
      }

      amountConfig.setAmount(text);

      const amountDec = new Dec(text);

      let errorText = "";
      if (amountDec.lt(new Dec(MIN_AMOUNT))) {
        errorText = intl.formatMessage(
          { id: "component.amount.input.error.minimum" },
          { amount: MIN_AMOUNT, denom: amountConfig.sendCurrency.coinDenom }
        );
      } else if (availableAmount && availableAmount.toDec().lt(new Dec(text))) {
        errorText = intl.formatMessage({
          id: "component.amount.input.error.insufficientAmount",
        });
      } else if (feeConfig && feeConfig.error) {
        errorText = intl.formatMessage({
          id: "component.amount.input.error.insufficientFee",
        });
      }

      setErrorText(errorText);
      onAmountChanged(text, errorText, isFocus);
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
          error={showError ? errorText : ""}
          onChangeText={(text) => {
            setAmountText(formatTextNumber(text));
          }}
          onBlur={() => {
            setIsFocus(false);
          }}
          onFocus={() => {
            setIsFocus(true);
          }}
          placeholder="0"
          keyboardType="numeric"
          rightView={
            availableAmount && (
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 16,
                  alignItems: "center",
                }}
              >
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
                <Button
                  text={intl.formatMessage({
                    id: "component.amount.input.max",
                  })}
                  size="medium"
                  mode="ghost"
                  onPress={onMaxHandler}
                />
              </View>
            )
          }
          style={{ marginBottom: errorText || infoText ? 24 : 0 }}
        />
      </View>
    );
  }
);
