import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import DeviceInfo from "react-native-device-info";
import { useState } from "react";
import React from "react";
export const AccountVersionItem: FunctionComponent = observer(() => {
    const style = useStyle();
    const [appVersion] = useState(() => DeviceInfo.getVersion());
    const [buildNumber] = useState(() => DeviceInfo.getBuildNumber());
    return (
        <View style={style.flatten(["height-48", "items-center"])}>
            <Text style={style.flatten(["body3", "color-text-black-low"])}>Version {appVersion}({buildNumber})</Text>
        </View>
        );
});
