import React, { FunctionComponent, useState } from "react";
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

export const AmountInput: FunctionComponent<{
  amountConfig: IAmountConfig;
}> = observer(
  ({
    amountConfig,
  }) => {
    const style = useStyle();
    const intl = useIntl();
    const { userBalanceStore } = useStore();

    const [errorText, setErrorText] = useState("");

    function onChangeTextHandler(text: string) {
      const formattedText = text.replace(",", ".");
      amountConfig.setAmount(formattedText);

      const amount = Number(formattedText);

      if (0 < amount || formattedText.length != 0) {
        if (amount < 10) {
          setErrorText(intl.formatMessage({
            id: "component.amount.input.error.minimum"
          }, {
            amount: "10"
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
      <NormalInput
        value={amountConfig.amount}
        label={intl.formatMessage({ id: "component.amount.input.sendindAmount" })}
        error={errorText}
        onChangeText={onChangeTextHandler}
        placeholder="0"
        keyboardType="numeric"
        rightView={
          <Button text={intl.formatMessage({ id: "component.amount.input.max" })}
            size="small"
            mode="text"
            containerStyle={style.flatten(["height-24"])}
            onPress={() => {
              console.log("DucNN--Debug", amountConfig.amount);
              amountConfig.setFraction(amountConfig.fraction === 1 ? 0 : 1);
              onChangeTextHandler(amountConfig.amount)
            }}
          />
        }
        style={{ marginBottom: errorText ? 24 : 0 }}
      />
    );
  }
);