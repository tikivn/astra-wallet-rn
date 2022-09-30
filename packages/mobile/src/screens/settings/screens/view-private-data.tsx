import React, { FunctionComponent, useEffect } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";

import { Button } from "../../../components/button";
import { WordChip } from "../../../components/mnemonic";
import Clipboard from "expo-clipboard";
import { PageWithScrollView } from "../../../components/page";
import { useSimpleTimer } from "../../../hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { AlertInline } from "../../../components";
import { useIntl } from "react-intl";
import { useToastModal } from "../../../providers/toast-modal";

export const getPrivateDataTitle = (
  keyRingType: string,
  capitalize?: boolean
) => {
  if (capitalize) {
    return `View ${
      keyRingType === "mnemonic" ? "Mnemonic Seed" : "Private Key"
    }`;
  }

  return `View ${keyRingType === "mnemonic" ? "mnemonic seed" : "private key"}`;
};

export const canShowPrivateData = (keyRingType: string): boolean => {
  return keyRingType === "mnemonic" || keyRingType === "privateKey";
};

export const ViewPrivateDataScreen: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  const toast = useToastModal();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          privateData: string;
          privateDataType: string;
        }
      >,
      string
    >
  >();

  const privateData = route.params.privateData;
  const privateDataType = route.params.privateDataType;

  const words = privateData.split(" ");

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      style={style.flatten(["padding-x-page"])}
    >
      <View style={style.flatten(["flex-1"])} />
      <Text
        style={style.flatten([
          "h4",
          "color-text-gray",
          "margin-bottom-16",
          "text-center",
        ])}
      >
        Xem cụm từ bí mật
      </Text>
      <AlertInline
        type="warning"
        title={intl.formatMessage({
          id: "common.alert.title.notShareMnemonic",
        })}
        content={intl.formatMessage({
          id: "common.alert.content.notShareMnemonic",
        })}
      />
      <View
        style={style.flatten([
          "margin-top-14",
          "margin-bottom-4",
          "words-container",
        ])}
      >
        {privateDataType === "mnemonic" ? (
          words.map((word, i) => {
            return <WordChip key={i.toString()} index={i + 1} word={word} />;
          })
        ) : (
          <Text style={style.flatten(["h6", "margin-bottom-30"])}>{words}</Text>
        )}
      </View>
      <View style={style.flatten(["items-center", "margin-top-16"])}>
        <Button
          mode="outline"
          text={intl.formatMessage({ id: "component.text.copy" })}
          onPress={() => {
            Clipboard.setString(words.join(" "));
            toast.makeToast({
              title: intl.formatMessage({ id: "seedphrase.copied" }),
              type: "neutral",
            });
          }}
        />
      </View>
    </PageWithScrollView>
  );
};
