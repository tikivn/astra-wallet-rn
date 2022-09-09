import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import {
  IAmountConfig,
} from "@keplr-wallet/hooks";
import { useIntl } from "react-intl";
import { NormalInput } from "../../../components/input/normal-input";
import { useStore } from "../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { Text, View, ViewStyle } from "react-native";
import { MIN_AMOUNT } from "../../../common/utils";

export const AmountInput: FunctionComponent<{
  labelText?: string;
  hideDenom?: boolean;
  amountConfig: IAmountConfig;
  containerStyle?: ViewStyle;
}> = observer(
  ({
    labelText,
    hideDenom,
    amountConfig,
    containerStyle,
  }) => {
    const style = useStyle();
    const intl = useIntl();
    const { userBalanceStore } = useStore();

    const [errorText, setErrorText] = useState("");
    const infoText = intl.formatMessage({
      id: "component.amount.input.error.minimum"
    }, {
      amount: MIN_AMOUNT
    });

    useEffect(() => {
      onChangeTextHandler(amountConfig.amount);
    }, [amountConfig.amount]);

    const formatTextValue = (text: string) => {
      var validTextValue = text;
      if (validTextValue.indexOf(".") !== -1) {
        // Case many '.' => remove all '.' except first '.'
        const idx = validTextValue.indexOf(".");
        validTextValue = validTextValue.substring(0, idx + 1) + validTextValue.substring(validTextValue.indexOf(".") + 1).replaceAll(".", "");
      }

      if (validTextValue.indexOf(",") !== -1) {
        if (validTextValue.indexOf(".") !== -1) {
          validTextValue = validTextValue.replaceAll(",", "");
        }
        else {
          validTextValue = validTextValue.replaceAll(",", ".");
        }
      }

      if (!Number(validTextValue)) {
        return;
      }

      amountConfig.setAmount(validTextValue);
    };

    function onChangeTextHandler(text: string) {
      const amount = Number(text);

      if (0 < amount || text.length != 0) {
        if (amount < MIN_AMOUNT) {
          setErrorText(intl.formatMessage({
            id: "component.amount.input.error.minimum"
          }, {
            amount: MIN_AMOUNT
          }));
        }
        else if (userBalanceStore.getBalance().toDec().lt(new Dec(amount))) {
          setErrorText(intl.formatMessage({ id: "component.amount.input.error.insufficient" }));
        }
        else {
          setErrorText("");
        }
      }
      else {
        setErrorText("");
      }
    }

    return (
      <View style={containerStyle}>
        <NormalInput
          value={amountConfig.amount}
          label={labelText}
          info={infoText}
          error={errorText}
          onChangeText={formatTextValue}
          placeholder="0"
          keyboardType="numeric"
          rightView={
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
                  amountConfig.setFraction(1);
                }}
              />
            </View>
          }
          style={{ marginBottom: (errorText || infoText) ? 24 : 0 }}
        />
      </View>
    );
  }
);