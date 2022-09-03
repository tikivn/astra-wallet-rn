import React, { FunctionComponent } from "react";
import { useStyle } from "../../styles";
import { View, Text, SafeAreaView } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation-util";
import { observer } from "mobx-react-lite";
import LottieView from "lottie-react-native";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useIntl } from "react-intl";
import { RouteProp, useRoute } from "@react-navigation/native";

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerType?: "new" | "recover" | undefined;
        }
      >,
      string
    >
  >();

  const successText = route.params.registerType !== "recover"
    ? intl.formatMessage({ id: "wallet.create.success" })
    : intl.formatMessage({ id: "wallet.recover.success" })

  return (
    <View
      style={style.flatten([
        "padding-x-42",
        "height-full",
        "background-color-background",
      ])}
    >
      <View style={style.get("flex-1")} />
      <View style={style.flatten(["items-center"])}>
        <LottieView
          source={require("../../assets/lottie/login_success.json")}
          autoPlay
          loop
          style={style.flatten(["width-300", "flex-grow-1"])}
          resizeMode="cover"
        />
        <Text
          style={style.flatten([
            "text-center",
            "text-button2",
            "color-gray-10",
          ])}
        >
          {successText}
        </Text>
      </View>
      <View style={style.get("flex-1")} />
      <Button
        containerStyle={style.flatten(["margin-bottom-12"])}
        text={intl.formatMessage({ id: "common.text.continue" })}
        onPress={() => {
          smartNavigation.reset({
            index: 0,
            routes: [
              {
                name: "MainTabDrawer",
              },
            ],
          });
        }}
      />
      <SafeAreaView />
    </View>
  );
});
