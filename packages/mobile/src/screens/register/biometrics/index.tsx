import { RouteProp, useRoute } from "@react-navigation/native";
import React, { FunctionComponent, useEffect } from "react";
import { useIntl } from "react-intl";
import { Platform, SafeAreaView, Text, View } from "react-native";
import { BIOMETRY_TYPE } from "react-native-keychain";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { RegisterType } from "../../../stores/user-login";
import { useStyle } from "../../../styles";
import { FaceIDGradientIcon, TouchIDGradientIcon } from "./icon";

export const SetupBiometricsScreen: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  const { analyticsStore } = useStore();

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

  const { keychainStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    updateNavigationTitle();
  }, []);

  const updateNavigationTitle = () => {
    smartNavigation.setOptions({
      headerShown: false,
    });
  };

  const navigateToHome = () => {
    trackRegisterAccount();

    smartNavigation.reset({
      index: 0,
      routes: [
        {
          name: "MainTabDrawer",
        },
      ],
    });
  };

  const enableBiometrics = async () => {
    if (keychainStore.isBiometrySupported && !keychainStore.isBiometryOn) {
      try {
        await keychainStore.enableBiometrics(route.params.password);
      } catch (e) {
        console.log("enableBiometrics error", e);
      }
    }

    trackRegisterAccount();

    smartNavigation.reset({
      index: 0,
      routes: [
        {
          name: "MainTabDrawer",
        },
      ],
    });
  };

  const trackRegisterAccount = () => {
    const eventName =
      route.params.registerType === RegisterType.recover
        ? "astra_hub_recover_account"
        : "astra_hub_create_account";

    analyticsStore.logEvent(eventName, {
      type: "mnemonic",
      use_biometrics: keychainStore.isBiometryOn,
      biometrics_type: (keychainStore.isBiometryType as string) || "",
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
      <View
        style={{ marginTop: safeAreaInsets.top + 76, alignItems: "center" }}
      >
        {keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
        keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID ? (
          <FaceIDGradientIcon />
        ) : (
          <TouchIDGradientIcon />
        )}
      </View>
      <Text
        style={style.flatten([
          "text-x-large-semi-bold",
          "color-label-text-1",
          "margin-top-24",
          "text-center",
        ])}
      >
        {intl.formatMessage({
          id:
            keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
            keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID
              ? "biometrics.title.face"
              : (Platform.OS === "ios"
              ? "biometrics.title.touch"
              : "biometrics.title.fingerprint"),
        })}
      </Text>
      <Text
        style={style.flatten([
          "text-base-regular",
          "color-label-text-2",
          "margin-top-8",
          "text-center",
        ])}
      >
        {intl.formatMessage({ id: "biometrics.desc" })}
      </Text>
      <View style={style.flatten(["flex-1"])} />
      <Button
        text={intl.formatMessage({
          id:
            keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
            keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID
              ? "enableBiometrics.face"
              : (Platform.OS === "ios"
              ? "enableBiometrics.touch"
              : "enableBiometrics.fingerprint"),
        })}
        onPress={enableBiometrics}
      />
      <Button
        color="neutral"
        text={intl.formatMessage({ id: "skipBiometrics" })}
        containerStyle={style.flatten(["margin-top-16", "margin-bottom-12"])}
        onPress={navigateToHome}
      />
      <SafeAreaView />
    </View>
  );
};
