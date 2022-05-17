import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { useSmartNavigation } from "../../navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { View, SafeAreaView, ImageBackground } from "react-native";
import { AllIcon } from "../../components/icon";
import { SettingsAccountItem } from "./items/select-account";
import { AccountItem } from "./components";
import { AccountNetworkItem } from "./items/select-network";
import { AccountSignoutItem } from "./items/signout-item";
import { AccountVersionItem } from "./items/version-item";
import { AccountViewPrivateDataItem } from "./items/view-private-data";
export const SettingsScreen: FunctionComponent = observer(() => {
    const { keychainStore, keyRingStore } = useStore();

    const style = useStyle();

    const smartNavigation = useSmartNavigation();

    return (
        <View style={style.get("background-color-background")}>
            <ImageBackground
                style={style.flatten(["width-full", "height-full"])}
                source={require("../../assets/logo/main_background.png")}
                resizeMode="contain">
                <SafeAreaView></SafeAreaView>
                <View style={style.get("height-64")} />
                <PageWithScrollViewInBottomTabView
                    backgroundColor={style.get("color-transparent").color}
                >
                    <SettingsAccountItem />
                    <View style={style.get("height-32")} />
                    <AccountItem
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        label="Đổi mật khẩu truy cập"
                        right={<AllIcon color={style.get("color-white").color} />}
                        onPress={() => {
                            smartNavigation.navigateSmart("AddressBook", {});
                        }}
                    />
                    <View style={style.get("height-8")} />
                    <AccountViewPrivateDataItem />
                    <View style={style.get("height-32")} />
                    <AccountItem
                        label="FAQ"
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        right={<AllIcon color={style.get("color-white").color} />}
                        onPress={() => {
                            smartNavigation.navigateSmart("AddressBook", {});
                        }}
                    />
                    <View style={style.get("height-8")} />
                    <AccountItem
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        label="Cộng đồng hỗ trợ"
                        right={<AllIcon color={style.get("color-white").color} />}
                        onPress={() => {
                            smartNavigation.navigateSmart("AddressBook", {});
                        }}
                    />
                    <View style={style.get("height-32")} />
                    <AccountNetworkItem />
                    <View style={style.get("height-32")} />
                    <AccountSignoutItem />
                    <View style={style.get("height-32")} />
                    <AccountVersionItem />
                </PageWithScrollViewInBottomTabView>
            </ImageBackground>
        </View>
    );
});
