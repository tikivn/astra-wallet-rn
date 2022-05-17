import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { ViewStyle, StyleSheet, Text, View, TextInput } from "react-native";
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

export const AmountInput: FunctionComponent<{
    amountConfig: IAmountConfig;
}> = observer(
    ({
        amountConfig,
    }) => {
        const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  
        const style = useStyle();
      
      
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

        return (
            <React.Fragment>
                <View style={
                    style.flatten(["padding-x-16", "padding-y-12", "flex-1", "background-color-background-secondary", "overflow-hidden", "border-radius-12", "justify-between"])}>
                    <View style={style.flatten(["flex-row", "justify-between"])}>
                        <Text style={style.flatten(["color-text-black-low", "text-caption2"])}>Số Astra muốn gửi</Text>
                        <View style={style.flatten(["flex-row"])}>
                        <Text style={style.flatten(["color-text-black-low", "text-caption2"])}>{'(Khả dụng: '}</Text>
                        <Text style={style.flatten(["color-text-black-low", "text-caption2"])}>
                            {stakable.trim(true)
                            .shrink(true)
                            .maxDecimals(6)
                            .upperCase(true)
                            .hideDenom(true)
                            .toString()}{')'}</Text>
                            </View>
                    </View>
                    <View style={style.flatten(["flex-row", "margin-top-8", "justify-between"])}>
                        <TextInput
                            style={style.flatten(["self-center", "flex-1", "margin-right-12", "color-white", "text-amount-input"])}
                            value={amountConfig.amount}
                            onChangeText={(text) => {
                                amountConfig.setAmount(text);
                            }}
                            keyboardType="numeric" />
                        <Button text={"Gửi hết"}
                            style={style.flatten(["self-center"])}
                            size="small"
                            textStyle={style.flatten(["color-white", "subtitle5"])}
                            containerStyle={style.flatten(["height-24", "border-radius-4"])}
                            onPress={() => {
                                console.log("DucNN--Debug", amountConfig.amount);
                                amountConfig.setFraction(amountConfig.fraction === 1 ? 0 : 1);
                            }} />

                    </View>
                </View>
                <View style={style.flatten(["flex-row", "padding-y-16", "justify-between"])}>
                    <Text style={style.flatten(["color-text-black-low", "body3"])}>Phí giao dịch</Text>
                    <Text style={style.flatten(["color-text-black-low", "body3", "text-right"])}>1 ASA</Text>
                </View>
            </React.Fragment>
        );
    }
);
