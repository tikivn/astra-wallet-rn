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

export const AmountSwapInput: FunctionComponent<{
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
  const stakable = queryStakable.balance;

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
    "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png";
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
              char={"ASA"}
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
                id="swap.amount.inputText"
                values={{ token: "ASA" }}
              />
            </Text>
            <View style={style.flatten(["flex-row"])}>
              <Text
                style={style.flatten(["color-text-black-low", "text-caption2"])}
              >
                <FormattedMessage
                  id="swap.amount.available"
                  values={{
                    // eslint-disable-next-line react/display-name
                    b: () => (
                      <Text style={{ fontWeight: "bold" }}>
                        {stakable
                          .trim(true)
                          .shrink(true)
                          .maxDecimals(6)
                          .upperCase(true)
                          .hideDenom(true)
                          .toString()}
                      </Text>
                    ),
                  }}
                />
              </Text>
            </View>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "margin-top-4",
              "margin-bottom-4",
              "justify-between",
              "items-center",
            ])}
          >
            <TextInput
              style={style.flatten([
                "flex-1",
                "margin-right-12",
                "color-white",
                "text-amount-input",
              ])}
              value={amountConfig.amount}
              onChangeText={(text) => {
                amountConfig.setAmount(text);
              }}
              keyboardType="numeric"
            />
            <Button
              text={intl.formatMessage({
                id: "swap.amount.swapAll",
              })}
              style={style.flatten(["self-center"])}
              size="small"
              textStyle={style.flatten(["color-white", "subtitle5"])}
              containerStyle={style.flatten(["height-24", "border-radius-4"])}
              onPress={() => {
                amountConfig.setFraction(amountConfig.fraction === 1 ? 0 : 1);
              }}
            />
          </View>
          <Text style={style.flatten(["color-text-black-low", "text-caption"])}>
            ≈ 123.000 Xu
          </Text>
        </View>
      </View>
    </React.Fragment>
  );
});
