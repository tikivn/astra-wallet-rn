import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { IAmountConfig, IFeeConfig } from "@keplr-wallet/hooks";
import { useIntl } from "react-intl";
import { NormalInput } from "../../../components/input/normal-input";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  Text,
  TextInputSubmitEditingEventData,
  View,
  ViewStyle,
} from "react-native";
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
  config?: {
    feeReservation: number;
    minAmount: number;
  };
  inputRef?: any;
  onSubmitEditting?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void;
  returnKeyType?: ReturnKeyTypeOptions;
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
    config = {
      feeReservation: 0,
      minAmount: MIN_AMOUNT,
    },
    inputRef,
    onSubmitEditting,
    returnKeyType,
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
      { amount: config.minAmount, denom: amountConfig.sendCurrency.coinDenom }
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
      if (amountDec.lt(new Dec(config.minAmount))) {
        errorText = intl.formatMessage(
          { id: "component.amount.input.error.minimum" },
          {
            amount: config.minAmount,
            denom: amountConfig.sendCurrency.coinDenom,
          }
        );
      } else if (
        (availableAmount &&
          availableAmount
            .toDec()
            .sub(new Dec(config.feeReservation))
            .lt(new Dec(text))) ||
        (feeConfig && feeConfig.error)
      ) {
        if (config.feeReservation > 0) {
          errorText = intl.formatMessage(
            {
              id: "component.amount.input.error.insufficientFeeReservation",
            },
            {
              amount: config.feeReservation,
              denom: amountConfig.sendCurrency.coinDenom,
            }
          );
        } else {
          errorText = intl.formatMessage({
            id: "component.amount.input.error.insufficientAmount",
          });
        }
      }

      setErrorText(errorText);
      onAmountChanged(text, errorText, isFocus);
    }

    const onMaxHandler = () => {
      if (!availableAmount) {
        return;
      }

      const maxAmount = availableAmount
        .toDec()
        .gt(new Dec(config.feeReservation))
        ? availableAmount.toDec().sub(new Dec(config.feeReservation))
        : new Dec(0);
      setAmountText(removeZeroFractionDigits(maxAmount.toString()));
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
          inputRef={inputRef}
          onSubmitEditting={onSubmitEditting}
          returnKeyType={returnKeyType}
        />
      </View>
    );
  }
);
