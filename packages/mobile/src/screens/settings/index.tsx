import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { useSmartNavigation } from "../../navigation-util";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { View, SafeAreaView, ImageBackground, Linking } from "react-native";
import {
  AllIcon,
  KeyIcon,
  FaqIcon,
  SocialIcon,
  ConnectIcon,
  LockIcon,
  BiometricsIcon,
} from "../../components/icon";
import { SettingsAccountItem } from "./items/select-account";
import { AccountItem } from "./components";
import { AccountNetworkItem, RightView } from "./items/select-network";
import { AccountVersionItem } from "./items/version-item";
import { AccountLanguageItem } from "./items/select-language";
import { useIntl } from "react-intl";
import { AlertInline } from "../../components";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Toggle } from "../../components/toggle";

export const SettingsScreen: FunctionComponent = observer(() => {
  const { keyRingStore, signClientStore, keychainStore } = useStore();

  const connect = signClientStore.sessions.length;

  const style = useStyle();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();

  const accountItemProps = {
    containerStyle: style.flatten([
      "margin-left-16",
      "margin-right-16",
      "border-radius-8",
      "overflow-hidden",
    ]),
    labelStyle: style.flatten(["margin-left-12"]),
  };
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          floatAlert?: {
            type: "info" | "success" | "warning" | "error";
            content: string;
          };
        }
      >,
      string
    >
  >();

  const [isBiometricOn, setIsBiometricOn] = useState(
    keychainStore.isBiometryOn && keychainStore.isBiometrySupported
  );
  const floatAlert =
    route.params && route.params.floatAlert ? route.params.floatAlert : null;
  const [displayFloatAlert, setDisplayFloatAlert] = useState(floatAlert);

  useEffect(() => {
    const floatAlert =
      route.params && route.params.floatAlert ? route.params.floatAlert : null;
    setDisplayFloatAlert(floatAlert);

    const timeoutId = setTimeout(() => {
      setDisplayFloatAlert(null);
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [route.params]);

  async function tryUnlock() {
    try {
      if (isBiometricOn) {
        await keychainStore.turnOffBiometryWithoutReset();
      } else {
        await keychainStore.turnOnBiometryWithoutPassword();
      }
      setIsBiometricOn(!isBiometricOn);
    } catch (error) {
      console.log("__DEBUG__", error);
    }
  }

  async function lock() {
    await keyRingStore.lock();

    smartNavigation.reset({
      index: 0,
      routes: [{ name: "Unlock" }],
    });
  }

  return (
    <View style={style.flatten(["background-color-background", "flex-grow-1"])}>
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../assets/logo/main_background.png")}
        resizeMode="cover"
      >
        <SafeAreaView />
        <View style={style.get("height-64")} />
        <PageWithScrollViewInBottomTabView
          style={style.flatten(["flex-grow-1"])}
          backgroundColor={style.get("color-transparent").color}
        >
          <SettingsAccountItem />
          <View style={style.get("height-32")} />
          <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.changePassword" })}
            left={<LockIcon />}
            right={<AllIcon color={style.get("color-white").color} />}
            onPress={() => {
              smartNavigation.navigateSmart("Settings.PasswordInput", {
                type: "updatePassword",
              });
            }}
          />
          <View style={style.get("height-8")} />
          <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.viewPassphase" })}
            right={<AllIcon color={style.get("color-white").color} />}
            left={<KeyIcon />}
            onPress={() => {
              smartNavigation.navigateSmart("Settings.PasswordInput", {
                type: "viewMnemonic",
              });
            }}
          />
          {keychainStore.isBiometrySupported && (
            <View style={style.get("margin-top-8")}>
              <AccountItem
                {...accountItemProps}
                label={intl.formatMessage({ id: "settings.unlockBiometrics" })}
                right={
                  <View style={{ marginRight: 12 }}>
                    <Toggle on={isBiometricOn} onChange={tryUnlock} />
                  </View>
                }
                left={<BiometricsIcon />}
              />
            </View>
          )}

          <View style={style.get("height-32")} />
          <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.faq" })}
            right={<AllIcon color={style.get("color-white").color} />}
            left={<FaqIcon />}
            onPress={() => {
              smartNavigation.navigateSmart("WebView", {
                url: "https://hotro.tiki.vn/s/article/chuong-trinh-sep-mua-sam-co-loi",
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
              Linking.openURL("https://t.me/AstraOfficialChannel");
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
            onPress={lock}
          />
          <View style={style.get("height-8")} />
          <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.deleteAccount" })}
            onPress={() => {
              smartNavigation.navigateSmart("Settings.PasswordInput", {
                type: "deleteWallet",
              });
            }}
            labelStyle={style.flatten(["body3", "color-danger"])}
          />
          <View style={style.get("height-32")} />
          <AccountVersionItem />
        </PageWithScrollViewInBottomTabView>
        {displayFloatAlert && (
          <View style={{ paddingHorizontal: 16 }}>
            <AlertInline
              type={displayFloatAlert.type}
              content={displayFloatAlert.content}
              actionButton="close"
              onActionButtonTap={() => {
                setDisplayFloatAlert(null);
              }}
            />
            <View style={{ height: 44, marginTop: 16 }} />
            <SafeAreaView />
          </View>
        )}
      </ImageBackground>
    </View>
  );
});
