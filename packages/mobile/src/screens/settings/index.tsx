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
import { AccountVersionItem } from "./items/version-item";
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
                    {/* <AccountItem
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        label="Đổi mật khẩu truy cập"
                        right={<AllIcon color={style.get("color-white").color} />}
                        onPress={() => {

                        }}
                    /> */}
                    <View style={style.get("height-8")} />
                    <AccountItem
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        label="Xem cụm từ bí mật"
                        right={<AllIcon color={style.get("color-white").color} />}
                        onPress={() => {
                            smartNavigation.navigateSmart("Settings.EnterPincode", {
                            });
                        }}
                    />

                    <View style={style.get("height-32")} />
                    <AccountItem
                        label="FAQ"
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        right={<AllIcon color={style.get("color-white").color} />}
                        onPress={() => {

                        }}
                    />
                    <View style={style.get("height-8")} />
                    <AccountItem
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        label="Cộng đồng hỗ trợ"
                        right={<AllIcon color={style.get("color-white").color} />}
                        onPress={() => {

                        }}
                    />
                    <View style={style.get("height-32")} />
                    <AccountNetworkItem />
                    <View style={style.get("height-32")} />
                    <AccountItem
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        label="Màn hình khoá"
                        onPress={async () => {
                            keyRingStore.lock();
                            smartNavigation.reset({
                                index: 0,
                                routes: [
                                    {
                                        name: "Unlock",
                                    },
                                ],
                            });
                        }}
                    />
                    <View style={style.get("height-8")} />
                    <AccountItem
                        label="Xoá ví"
                        onPress={() => {
                            smartNavigation.navigateSmart("Settings.DeleteWallet", {
                            });
                        }}
                        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
                        labelStyle={style.flatten(["body3", "color-danger"])}
                    />
                    <View style={style.get("height-32")} />
                    <AccountVersionItem />
                </PageWithScrollViewInBottomTabView>
            </ImageBackground>
        </View>
    );
});
