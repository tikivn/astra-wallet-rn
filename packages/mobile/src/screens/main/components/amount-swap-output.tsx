import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Text, View, TextInput, StyleSheet } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { useStore } from "../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../components";

export const AmountSwapOutput: FunctionComponent<{
  amountConfig: IAmountConfig;
}> = observer(({ amountConfig }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();
  const intl = useIntl();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;

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

  const cointImg =
    "https://salt.tikicdn.com/ts/upload/e0/3a/3f/73b30182fd438639dbfb1ed26ab98497.png";
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
              char={"USDC"}
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
                values={{ token: "USDC" }}
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
              {amountConfig.amount}
            </Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
});
