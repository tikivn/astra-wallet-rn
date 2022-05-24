import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, Image, Text, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { useStyle } from "../../../styles";

export const DashboardHeader: FunctionComponent<{
    containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
    const style = useStyle();
    return (
        <View style={style.flatten(["flex-row", "padding-16", "margin-x-0", "margin-y-16", "justify-between"])}>
            <View style={style.flatten(["flex-1", "margin-left-0", "items-start"])}>
                <Text
                    style={style.flatten(["color-white", "h3"])}>
                    Đầu tư và kiếm lời nhuận
                </Text>
                <Button style={style.get("padding-x-0")}
                    text="Tìm hiểu thêm Staking"
                    mode="text" size="default"
                    underlayColor={style.get("color-background").color}
                    textStyle={style.flatten(["text-underline", "body3"])} />
            </View>
            <Image
                source={require("../../../assets/image/saving.png")}
                resizeMode='contain'
                style={style.flatten(["height-80", "width-80", "margin-right-0"])} />
        </View>
    );
});