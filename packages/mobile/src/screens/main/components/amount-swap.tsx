import { Currency, CurrencyAmount, Token } from "@solarswap/sdk";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, Text, TextInput, View } from "react-native";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../components";
import { Button } from "../../../components/button";
import { useStyle } from "../../../styles";
import { SIGNIFICANT_DECIMAL_PLACES, SwapField } from "../../../utils/for-swap";

interface SwapAmountProps {
  currency?: Currency | undefined;
  balance: CurrencyAmount | undefined;
  onSwapAll?: (field?: SwapField) => void;
  showBalance?: boolean;
  showSwapAll?: boolean;
  field: SwapField;
  onUserInput: (value: string, field: SwapField) => void;
  value: string;
}
export const AmountSwap: FunctionComponent<SwapAmountProps> = observer(
  ({
    currency,
    balance,
    onSwapAll,
    showBalance = true,
    showSwapAll = true,
    field,
    onUserInput,
    value,
  }) => {
    const handleClickSwapAll = useCallback(() => {
      showSwapAll && onSwapAll && onSwapAll(field);
    }, [field, onSwapAll, showSwapAll]);

    const style = useStyle();
    const intl = useIntl();

    const cointImg = useMemo(
      () => currency && (currency as Token).projectLink,
      [currency]
    );

    return (
      <React.Fragment>
        <View
          style={style.flatten([
            "padding-16",
            "background-color-gray-90",
            "overflow-hidden",
            "border-radius-12",
          ])}
        >
          <View
            style={StyleSheet.flatten([
              style.flatten([
                "overflow-hidden",
                "background-color-transparent",
                "width-full",
              ]),
            ])}
          >
            <View
              style={style.flatten([
                "flex-row",
                "flex-nowrap",
                "justify-between",
              ])}
            >
              <Text
                style={style.flatten(["color-text-black-low", "text-caption2"])}
              >
                <FormattedMessage
                  id="swap.amount.inputText"
                  values={{ token: currency?.symbol }}
                />
              </Text>
              {showBalance && (
                <Text
                  style={style.flatten([
                    "color-text-black-low",
                    "text-caption2",
                  ])}
                >
                  <FormattedMessage
                    id="swap.amount.available"
                    values={{
                      // eslint-disable-next-line react/display-name
                      b: () => (
                        <Text style={{ fontWeight: "bold" }}>
                          {balance?.toSignificant(SIGNIFICANT_DECIMAL_PLACES)}
                        </Text>
                      ),
                    }}
                  />
                </Text>
              )}
            </View>
          </View>
          <View
            style={StyleSheet.flatten([
              {
                lineHeight: 32,
                height: 32,
                marginTop: 4,
              },
              style.flatten(["flex-row", "flex-nowrap"]),
            ])}
          >
            <View style={style.flatten(["self-center", "margin-right-8"])}>
              {cointImg ? (
                <FastImage
                  style={{
                    width: 24,
                    height: 24,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  source={{
                    uri: cointImg,
                  }}
                />
              ) : (
                <VectorCharacter
                  char={"ASA"}
                  height={Math.floor(24)}
                  color="white"
                />
              )}
            </View>

            <TextInput
              style={style.flatten([
                "flex-1",
                "margin-right-12",
                "color-gray-10",
                "text-amount-input-center",
                "self-center",
              ])}
              value={value}
              onChangeText={(value) => onUserInput(value, field)}
              keyboardType="numeric"
            />
            {showSwapAll && (
              <Button
                text={intl.formatMessage({
                  id: "swap.amount.swapAll",
                })}
                style={style.flatten(["width-56", "height-20", "margin-top-8"])}
                size="large"
                textStyle={style.flatten(["color-primary", "subtitle3"])}
                containerStyle={style.flatten([
                  "height-24",
                  "border-radius-4",
                  "background-color-transparent",
                ])}
                onPress={handleClickSwapAll}
              />
            )}
          </View>
        </View>
      </React.Fragment>
    );
  }
);
