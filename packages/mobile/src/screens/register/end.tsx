import React, { FunctionComponent, useEffect } from "react";
import { useStyle } from "../../styles";
import { View, Text } from "react-native";
import { useSmartNavigation } from "../../navigation-util";
import { observer } from "mobx-react-lite";
import LottieView from "lottie-react-native";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useIntl } from "react-intl";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterType } from "../../stores/user-login";

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerType?: RegisterType | undefined;
        }
      >,
      string
    >
  >();

  const successText =
    route.params.registerType === RegisterType.recover
      ? intl.formatMessage({ id: "wallet.recover.success" })
      : intl.formatMessage({ id: "wallet.create.success" });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      smartNavigation.reset({
        index: 0,
        routes: [
          {
            name: "MainTabDrawer",
          },
        ],
      });
    }, 2000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <View
      style={style.flatten([
        "padding-x-42",
        "height-full",
        "background-color-background",
        "justify-center",
      ])}
    >
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
            "margin-top-16",
          ])}
        >
          {successText}
        </Text>
      </View>
    </View>
  );
});
