import { Card, CardBody } from "../../../components/card";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ViewStyle, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { SwapIcon, SendIcon, ReceiveIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation";

export const ActionsCard: FunctionComponent<{
    containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
    const style = useStyle();
    const smartNavigation = useSmartNavigation();
    const { chainStore } = useStore();
    return (
        <Card style={containerStyle}>
            <CardBody>
                <View style={style.flatten(["flex-row", "justify-center"])}>
                    <Button
                        containerStyle={style.flatten([
                            "border-radius-52",
                            "border-width-0",
                            "height-44",
                            "margin-right-12",
                        ])}
                        text="Nhận"
                        leftIcon={
                            <View style={style.flatten(["margin-right-6", "margin-left-6"])}>
                                <ReceiveIcon color={style.get("color-white").color} size={20} />
                            </View>
                        }
                        rightIcon={
                            <View style={style.flatten(["margin-right-12"])} />
                        }
                        style={style.flatten(["background-color-background-secondary"])}
                        textStyle={style.flatten(["color-white", "subtitle3"])}
                        underlayColor="#00000020"
                        size="default"
                        mode="outline"
                        onPress={() => {
                            smartNavigation.navigateSmart("Receive", {});
                        }} />
                    <Button
                        containerStyle={style.flatten([
                            "border-radius-52",
                            "border-width-0",
                            "height-44",
                            "margin-right-12",
                        ])}
                        text="Gửi"
                        leftIcon={
                            <View style={style.flatten(["margin-right-6", "margin-left-6"])}>
                                <SendIcon color={style.get("color-white").color} size={20} />
                            </View>
                        }
                        rightIcon={
                            <View style={style.flatten(["margin-right-12"])} />
                        }
                        style={style.flatten(["background-color-background-secondary"])}
                        textStyle={style.flatten(["color-white", "subtitle3"])}
                        underlayColor="#00000020"
                        size="default"
                        mode="outline"
                        onPress={() => {
                            smartNavigation.navigateSmart("Wallet.Send", {
                                currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                            });
                        }} />
                    <Button
                        containerStyle={style.flatten([
                            "border-radius-52",
                            "border-width-0",
                            "height-44",
                        ])}
                        text="Chuyển đổi"
                        leftIcon={
                            <View style={style.flatten(["margin-right-6", "margin-left-6"])}>
                                <SwapIcon color={style.get("color-white").color} size={20} />
                            </View>
                        }
                        rightIcon={
                            <View style={style.flatten(["margin-right-12"])} />
                        }
                        style={style.flatten(["background-color-background-secondary"])}
                        textStyle={style.flatten(["color-white", "subtitle3"])}
                        underlayColor="#00000020"
                        size="default"
                        mode="outline"
                        onPress={() => {
                            smartNavigation.navigateSmart("Swap", {});
                        }} />
                </View>
            </CardBody>
        </Card>
    );
});

