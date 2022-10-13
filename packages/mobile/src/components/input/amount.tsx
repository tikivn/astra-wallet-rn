import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { TextInput } from "./input";
import { Platform, Text, TextStyle, View, ViewStyle } from "react-native";
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { Button } from "../button";
import { useStyle } from "../../styles";
import { useIntl } from "react-intl";

export const AmountInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;

  label: string;

  amountConfig: IAmountConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    amountConfig,
  }) => {
    const style = useStyle();
    const intl = useIntl();
    labelStyle = {
      ...style.flatten(["subtitle2", "color-gray-30", "margin-bottom-4"]),
      ...labelStyle,
    };

    inputContainerStyle = {
      ...style.flatten([
        "height-44",
        "padding-y-0",
        "border-radius-4",
        "border-width-1",
        "border-color-gray-60",
        "background-color-gray-90",
      ]),
      ...inputContainerStyle,
    };

    const textInputStyle = {
      ...style.flatten(["text-medium-regular", "color-gray-10"]),
      ...Platform.select({
        android: {
          height: 19,
        },
      }),
      lineHeight: 19,
    };

    const error = amountConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            // No need to show the error to user.
            return;
          case InvalidNumberAmountError:
            return "Invalid number";
          case ZeroAmountError:
            return "Amount is zero";
          case NegativeAmountError:
            return "Amount is negative";
          case InsufficientAmountError:
            return "Insufficient fund";
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    return (
      <TextInput
        style={textInputStyle}
        label={label}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        value={amountConfig.amount}
        onChangeText={(text) => {
          amountConfig.setAmount(text);
        }}
        inputRight={
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "margin-left-16",
              "overflow-visible",
              "justify-center",
            ])}
          >
            <Text
              style={style.flatten([
                "text-base-regular",
                "color-gray-50",
                "margin-right-16",
              ])}
            >
              {amountConfig.sendCurrency.coinDenom}
            </Text>
            <Button
              text={intl.formatMessage({ id: "component.amount.input.max" })}
              mode="ghost"
              size="small"
              onPress={() => {
                amountConfig.setFraction(1);
              }}
            />
          </View>
        }
        error={errorText}
        keyboardType="numeric"
      />
    );
  }
);
