import React, { FunctionComponent } from "react";
import { PageWithView } from "../../components/page";
import { useStyle } from "../../styles";
import { View, Text, SafeAreaView } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation-util";
import { observer } from "mobx-react-lite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PrivacyIcon from "../../assets/svg/privacy.svg";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";

export const RegisterTutorialcreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const intl = useIntl();

  const { keyRingStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const registerConfig = useRegisterConfig(keyRingStore, []);

  return (
    <PageWithView
      disableSafeArea={true}
      style={style.flatten([
        "background-color-background",
        "height-full",
        "padding-16",
      ])}
    >
      <View style={style.flatten(["items-center", "margin-top-8"])}>
        <PrivacyIcon width={122} height={122} />
        <Text style={style.flatten(["h4", "color-gray-10", "margin-top-18"])}>
          {intl.formatMessage({ id: "security.term.title" })}
        </Text>
        <Text
          style={style.flatten([
            "color-gray-10",
            "body3",
            "flex",
            "margin-top-12",
          ])}
        >
          <Text>{intl.formatMessage({ id: "security.term.description" })}</Text>
          <Text style={style.flatten(["h7"])}>
            {intl.formatMessage({ id: "security.term.description.sub.1" })}
          </Text>
          <Text style={style.flatten(["h7"])}>
            {intl.formatMessage({ id: "security.term.description.sub.2" })}
          </Text>
        </Text>
      </View>
      <View style={style.flatten(["flex-1", "margin-bottom-12"])} />
      <View style={style.flatten(["flex-0", "margin-bottom-12"])}>
        <Text
          style={style.flatten([
            "color-gray-10",
            "body3",
            "flex",
            "margin-bottom-12",
          ])}
        >
          {intl.formatMessage({ id: "security.term.subdescription" })}
        </Text>
        <Button
          text={intl.formatMessage({ id: "security.term.action.understand" })}
          onPress={() => {
            smartNavigation.navigateSmart("Register.NewMnemonic", {
              registerConfig,
            });
          }}
        />
      </View>
      <SafeAreaView />
    </PageWithView>
  );
});
