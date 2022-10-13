import React, { FunctionComponent } from "react";
import { useHeaderHeight } from "@react-navigation/stack";
import { PageWithScrollView } from "../../components/page";
import { useStyle } from "../../styles";
import {
  View,
  Dimensions,
  ImageBackground,
  Image,
  Text,
  SafeAreaView,
} from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation-util";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIntl } from "react-intl";
import { useLanguage } from "../../translations";

export const RegisterIntroScreen: FunctionComponent = observer(() => {
  const {
    keyRingStore,
    remoteConfigStore,
    chainStore,
    analyticsStore,
  } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;
  const intl = useIntl();
  const language = useLanguage();

  analyticsStore.setUserProperties({
    astra_hub_chain_id: chainStore.current.chainId,
    astra_hub_chain_name: chainStore.current.chainName,
    astra_hub_app_lang: language.language,
  });

  return (
    <View style={style.get("background-color-background")}>
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../assets/logo/main_background.png")}
        resizeMode="cover"
      >
        <PageWithScrollView
          scrollEnabled={false}
          backgroundColor={style.get("color-transparent").color}
          contentContainerStyle={style.get("flex-grow-1")}
          style={{
            ...style.flatten(["padding-x-16"]),
            paddingTop:
              Dimensions.get("window").height * 0.1 - actualHeightHeight,
            // paddingBottom: Dimensions.get("window").height * 0.11,
          }}
        >
          <View
            style={style.flatten([
              "flex-grow-1",
              "items-center",
              "padding-x-18",
            ])}
          >
            <Image
              resizeMode="contain"
              source={require("../../assets/logo/Astra.png")}
              style={{ width: 132, height: 132 }}
            />
            <Text
              style={style.flatten([
                "color-white",
                "title3",
                "text-center",
                "padding-top-24",
              ])}
            >
              {intl.formatMessage({ id: "register.intro.appName" })}
            </Text>
            <Text
              style={style.flatten([
                "color-white",
                "text-caption",
                "padding-top-4",
                "text-center",
              ])}
            >
              {intl.formatMessage({ id: "register.intro.appDesc" })}
            </Text>
          </View>
          <Button
            text={intl.formatMessage({ id: "register.intro.button.create" })}
            onPress={() => {
              const socialLoginEnabled = remoteConfigStore.getBool(
                "feature_socialLogin_enabled"
              );
              if (socialLoginEnabled) {
                smartNavigation.navigateSmart("Register.CreateEntry", {});
                return;
              }
              smartNavigation.navigateSmart("Register.Tutorial", {});
            }}
          />
          <Button
            containerStyle={style.flatten(["margin-y-16"])}
            text={intl.formatMessage({ id: "register.intro.button.recover" })}
            color="neutral"
            onPress={() => {
              smartNavigation.navigateSmart("Register.RecoverMnemonic", {
                registerConfig,
              });
            }}
          />
          <SafeAreaView />
        </PageWithScrollView>
      </ImageBackground>
    </View>
  );
});
