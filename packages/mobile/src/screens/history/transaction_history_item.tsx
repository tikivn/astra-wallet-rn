import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, Text, StyleProp, TextStyle } from "react-native";
import {
    TransactionItem as ITransactionItem,
    Coin
} from "./transaction_adapter"
import { RightArrowIcon } from "../../components/icon";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import { Int, IntPretty } from "@keplr-wallet/unit";

export const TransactionItem: FunctionComponent<{
    item?: ITransactionItem<any>;
}> = observer(({ item }) => {
    const style = useStyle()
    style.flatten
    const textStyles = (style: any) => [
        style.flatten(["color-text-black-low", "text-left"]),
        { height: 20, textAlignVertical: "center", fontSize: 14, color: "#D5D9E0" }
    ]

    return <View style={{ height: 73, paddingTop: 16 }}>
    <View style={{ flexDirection: "row" }}>
        <View style={{
            flex: 4,
        }}>
            <Text numberOfLines={1} style={[textStyles(style)]}>
                {item.action}
            </Text>
            <Text numberOfLines={1} style={[textStyles(style), { fontSize: 12, color: "#818DA6" }]}>
                {/* {new Date(item.timestamp).toLocaleDateString()} */}
                {/* {moment(item.timestamp).format("hh:mm - DD/MM/YYYY")} */}
                {item?.timestamp}
            </Text>
        </View>

        <View style={{
            flex: 4,

        }}>
            <TransactionAmount amount={item.amount} textStyles={textStyles(style)}/>
            <Text numberOfLines={1} style={[textStyles(style), { textAlign: "right", fontSize: 12, color: "#4AB57C" }]}>
                {item.status}
            </Text>
        </View>

        <View
            style={{ marginEnd: 8, marginStart: 16, marginTop: 5 }}
        >
            <RightArrowIcon
                height={6.25}
                color={style.get("color-text-black-low").color}
            />
        </View>
    </View>
    <View style={{ flex: 0, height: 1, backgroundColor: '#2C364F', marginTop: 16 }} />
</View>
})

export const TransactionAmount: FunctionComponent<{
    amount?: Coin;
    textStyles: StyleProp<TextStyle>
}> = observer(({ amount, textStyles }) => {
    return <View style={{flex: 1, alignItems:"flex-end", flexDirection: "row"}} >
        <Text numberOfLines={1} style={[textStyles, { flex: 1, textAlign: "right", alignSelf:"stretch" }]}>
                {`${amount?.amount}`}
        </Text>
        <Text numberOfLines={1} style={[textStyles, { textAlign: "right", alignSelf:"flex-end" }]}>
                {`${amount?.denom == "aastra" ? "ASA" : amount?.denom}`}
        </Text>

    </View>
})
