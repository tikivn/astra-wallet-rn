import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, Text, TextInput, View } from "react-native";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../components";
import { Button } from "../../../components/button";
import { useDebounce } from "../../../hooks";
import { useStyle } from "../../../styles";

interface SwapAmountInputProps {
  setSwapValue: (value: number) => void;
  currency: CoinPretty;
  balance: string;
  onSwapAll?: () => void;
}
export const AmountSwapInput: FunctionComponent<SwapAmountInputProps> = observer(
  ({ setSwapValue, currency, balance, onSwapAll }) => {
    const [valueTerm, setValueTerm] = useState<string>("");
    const debouncedValueTerm = useDebounce(valueTerm, 300);
    useEffect(() => {
      try {
        if (debouncedValueTerm) {
          setSwapValue(+debouncedValueTerm);
        } else {
          setSwapValue(0);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    }, [debouncedValueTerm, setSwapValue]);

    const handleClickSwapAll = useCallback(() => {
      setValueTerm(balance);
      onSwapAll && onSwapAll();
    }, [balance, onSwapAll]);

    const handleInputValue = (value: string) => {
      if (value === "") {
        setValueTerm("");
      } else {
        try {
          setValueTerm(value);
        } catch (err: any) {
          console.log(err.message);
        }
      }
    };

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

    const cointImg = currency.currency.coinImageUrl;

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
                  values={{ token: currency.denom }}
                />
              </Text>
              <View style={style.flatten(["flex-row"])}>
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
                        <Text style={{ fontWeight: "bold" }}>{balance}</Text>
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
                value={valueTerm}
                onChangeText={handleInputValue}
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
                onPress={handleClickSwapAll}
              />
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  }
);
