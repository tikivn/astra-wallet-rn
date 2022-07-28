import { AppCurrency } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../components";
import { useStyle } from "../../../styles";

export const AmountSwapOutput: FunctionComponent<{
  currency?: AppCurrency;
  value?: string;
}> = observer(({ currency, value }) => {
  const style = useStyle();
  const intl = useIntl();

  // const error = amountConfig.error;
  // const errorText: string | undefined = useMemo(() => {
  //   if (error) {
  //     switch (error.constructor) {
  //       case EmptyAmountError:
  //         // No need to show the error to user.
  //         return;
  //       case InvalidNumberAmountError:
  //         return "Invalid number";
  //       case ZeroAmountError:
  //         return "Amount is zero";
  //       case NegativeAmountError:
  //         return "Amount is negative";
  //       case InsufficientAmountError:
  //         return "Insufficient fund";
  //       default:
  //         return "Unknown error";
  //     }
  //   }
  // }, [error]);

  const cointImg = currency?.coinImageUrl;
  return (
    <React.Fragment>
      <View
        style={style.flatten([
          "padding-x-16",
          "padding-y-12",
          "background-color-background-secondary",
          "overflow-hidden",
          "border-radius-12",
          "justify-between",
          "flex-row",
          "items-center",
        ])}
      >
        <View
          style={StyleSheet.flatten([
            {
              marginRight: 12,
            },
            style.flatten([
              "items-center",
              "justify-center",
              "overflow-hidden",
              "background-color-transparent",
            ]),
          ])}
        >
          {cointImg ? (
            <FastImage
              style={{
                width: 19.2,
                height: 19.2,
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri: cointImg,
              }}
            />
          ) : (
            <VectorCharacter
              char={currency?.coinDenom || "ASA"}
              height={Math.floor(24 * 0.35)}
              color="white"
            />
          )}
        </View>
        <View style={style.flatten(["flex-1"])}>
          <View style={style.flatten(["flex-row", "justify-between"])}>
            <Text
              style={style.flatten(["color-text-black-low", "text-caption2"])}
            >
              <FormattedMessage
                id="swap.amount.outputText"
                values={{ token: currency?.coinDenom }}
              />
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "margin-top-4",
              "margin-bottom-4",
              "justify-between",
            ])}
          >
            <Text
              style={style.flatten([
                "self-center",
                "flex-1",
                "color-white",
                "text-amount-input",
                "min-height-32",
              ])}
            >
              {value}
            </Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
});
