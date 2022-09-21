import React, { FunctionComponent } from "react";
import { ViewStyle, StyleSheet, Text, View } from "react-native";
import { Colors, useStyle } from "../../../styles";
import Clipboard from "expo-clipboard";
import { Button } from "../../../components/button";
import QRCode from "react-native-qrcode-svg";
import { useIntl } from "react-intl";
import { useToastModal } from "../../../providers/toast-modal";
import { useStore } from "../../../stores";
export const AddressQRCodeItem: FunctionComponent<{
  style?: ViewStyle;
  bech32Address: string;
  hexAddress: string;
}> = ({ style: propStyle, bech32Address, hexAddress }) => {
  const style = useStyle();
  const intl = useIntl();
  const toast = useToastModal();
  const { analyticsStore } = useStore();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "margin-x-16",
          "border-radius-16",
          "items-center",
          "padding-top-16",
          "padding-bottom-24",
          "background-color-card-background",
          "border-color-card-border",
          "border-width-1",
        ]),
        propStyle,
      ])}
    >
      <View style={style.flatten([
        "padding-16",
        "border-radius-16",
        "background-color-white",
      ])}>
        <QRCode
          size={200}
          color={"black"}
          backgroundColor={"white"}
          value={hexAddress}
        />
      </View>
      <Text
        style={style.flatten([
          "width-240",
          "margin-top-16",
          "margin-bottom-12",
          "body3",
          "text-center",
          "color-white",
        ])}
      >
        {hexAddress}
      </Text>
      <Button
        size="medium"
        mode="outline"
        text={intl.formatMessage({
          id: "component.text.copy",
        })}
        onPress={() => {
          analyticsStore.logEvent("astra_hub_select_copy_address", {
            copy_address: hexAddress
          });
          console.log("__DEBUG__ hexAddress: ", hexAddress);
          console.log("__DEBUG__ bech32Address: ", bech32Address);
          Clipboard.setString(hexAddress);
          toast.makeToast({
            title: intl.formatMessage({ id: "component.text.copied" }),
            type: "neutral",
            displayTime: 1500,
          });
        }}
      />
    </View>
  );
};
