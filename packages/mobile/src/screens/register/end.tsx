import React, { FunctionComponent, useEffect } from "react";
import { useStyle } from "../../styles";
import { View, Text, SafeAreaView } from "react-native";
import { useSmartNavigation } from "../../navigation-util";
import { observer } from "mobx-react-lite";
import LottieView from "lottie-react-native";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useIntl } from "react-intl";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterType } from "../../stores/user-login";
import { useStore } from "../../stores";
import { Button } from "../../components";

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();
  const { analyticsStore, keychainStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerType?: RegisterType;
          password: string;
        }
      >,
      string
    >
  >();

  useEffect(() => {
    updateNavigationTitle();
  }, []);

  const successText =
    route.params.registerType === RegisterType.recover
      ? intl.formatMessage({ id: "wallet.recover.success" })
      : intl.formatMessage({ id: "wallet.create.success" });

  const updateNavigationTitle = () => {
    smartNavigation.setOptions({
      headerShown: false,
    });
  };

  const onContinueHandler = () => {
    let nextRoute = { name: "MainTabDrawer", params: {} };
    if (keychainStore.isBiometrySupported) {
      nextRoute = {
        name: "Register.SetupBiometrics",
        params: route.params,
      };
    } else {
      trackRegisterAccount();
    }

    smartNavigation.reset({
      index: 0,
      routes: [nextRoute],
    });
  };

  const trackRegisterAccount = () => {
    const eventName =
      route.params.registerType === RegisterType.recover
        ? "astra_hub_recover_account"
        : "astra_hub_create_account";

    analyticsStore.logEvent(eventName, {
      type: "mnemonic",
      use_biometrics: false,
      biometrics_type: "",
    });
  };

  return (
    <View
      style={style.flatten([
        "padding-x-page",
        "height-full",
        "background-color-background",
        "items-stretch",
      ])}
    >
      <View style={style.flatten(["flex-1"])} />
      <View style={style.flatten(["items-center"])}>
        <LottieView
          source={require("../../assets/lottie/tx-loading-complete.json")}
          autoPlay
          loop={false}
          style={{
            width: 120,
            height: 120,
          }}
        />
        <Text
          style={style.flatten([
            "text-center",
            "text-x-large-semi-bold",
            "color-label-text-1",
            "margin-top-24",
          ])}
        >
          {successText}
        </Text>
      </View>
      <View style={style.flatten(["flex-1"])} />
      <Button
        text={intl.formatMessage({ id: "common.text.continue" })}
        onPress={onContinueHandler}
        containerStyle={style.flatten(["margin-bottom-12"])}
      />
      <SafeAreaView />
    </View>
  );
});
