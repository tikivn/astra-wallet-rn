import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { useSmartNavigation } from "../../navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { View, SafeAreaView, ImageBackground } from "react-native";
import {
  AllIcon,
  KeyIcon,
  FaqIcon,
  SocialIcon,
  ConnectIcon,
} from "../../components/icon";
import { SettingsAccountItem } from "./items/select-account";
import { AccountItem } from "./components";
import { AccountNetworkItem, RightView } from "./items/select-network";
import { AccountVersionItem } from "./items/version-item";
import { AccountLanguageItem } from "./items/select-language";
import { useIntl } from "react-intl";

export const SettingsScreen: FunctionComponent = observer(() => {
  const { keyRingStore, signClientStore } = useStore();

  const connect = signClientStore.sessions.length;

  const style = useStyle();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();

  const accountItemProps = {
    containerStyle: style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden",]),
    labelStyle: style.flatten(["margin-left-12"])
  }

  return (
    <View style={style.flatten(["background-color-background", "flex-grow-1"])}>
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../assets/logo/main_background.png")}
        resizeMode="contain"
      >
        <SafeAreaView />
        <View style={style.get("height-64")} />
        <PageWithScrollViewInBottomTabView
          style={style.flatten(["flex-grow-1"])}
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
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.viewPassphase" })}
            right={<AllIcon color={style.get("color-white").color} />}
            left={<KeyIcon />}
            onPress={() => {
              smartNavigation.navigateSmart("Settings.EnterPincode", {});
            }}
          />

          <View style={style.get("height-32")} />
          <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.faq" })}
            right={<AllIcon color={style.get("color-white").color} />}
            left={<FaqIcon />}
            onPress={() => {
              smartNavigation.navigateSmart("WebView", {
                url: "https://google.com",
              });
            }}
          />
          <View style={style.get("height-8")} />
          <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.community" })}
            right={<AllIcon color={style.get("color-white").color} />}
            left={<SocialIcon />}
            onPress={() => {
              smartNavigation.navigateSmart("WebView", {
                url: "https://tiki.vn/sep/home",
              });
            }}
          />
          <View style={style.get("height-32")} />
          <AccountLanguageItem accountItemProps={accountItemProps} />
          <View style={style.get("height-32")} />
          <AccountNetworkItem accountItemProps={accountItemProps} />
          <View style={style.get("height-8")} />
          <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.connectedApps" })}
            left={<ConnectIcon />}
            right={<RightView paragraph={connect.toString()} />}
            onPress={() => {
              smartNavigation.navigate("Others", {
                screen: "ManageWalletConnect",
              });
            }}
          />
          <View style={style.get("height-32")} />
          <AccountItem
            containerStyle={accountItemProps.containerStyle}
            label={intl.formatMessage({ id: "settings.lockScreen" })}
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
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.deleteAccount" })}
            onPress={() => {
              smartNavigation.navigateSmart("Settings.DeleteWallet", {});
            }}
            labelStyle={style.flatten(["body3", "color-danger"])}
          />
          <View style={style.get("height-32")} />
          <AccountVersionItem />
        </PageWithScrollViewInBottomTabView>
      </ImageBackground>
    </View>
  );
});
