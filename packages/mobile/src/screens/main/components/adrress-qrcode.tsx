import React, { FunctionComponent } from "react";
import { ViewStyle, StyleSheet, Text, View } from "react-native";
import { useSimpleTimer } from "../../../hooks";
import { useStyle } from "../../../styles";
import Clipboard from "expo-clipboard";
import { Button } from "../../../components/button";
import QRCode from "react-native-qrcode-svg";
import { useIntl } from "react-intl";
import { useToastModal } from "../../../providers/toast-modal";
export const AddressQRCodeItem: FunctionComponent<{
  style?: ViewStyle;
  address: string;
}> = ({ style: propStyle, address }) => {
  const style = useStyle();
  const intl = useIntl();
  const toast = useToastModal();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "width-248",
          "flex-0",
          "background-color-background-secondary",
          "overflow-hidden",
          "border-radius-12",
          "items-center",
          "padding-24",
        ]),
        propStyle,
      ])}
    >
      <View style={style.flatten(["width-200", "height-200"])}>
        <QRCode
          size={200}
          color={"white"}
          backgroundColor={"black"}
          value={address}
        />
      </View>
      <Text
        style={style.flatten([
          "margin-top-24",
          "margin-bottom-24",
          "body3",
          "text-center",
          "color-white",
        ])}
      >
        {address}
      </Text>
      <Button
        style={style.flatten([
          "border-radius-4",
          "background-color-white",
          "width-122",
        ])}
        textStyle={style.flatten(["subtitle3", "color-background"])}
        underlayColor={style.get("color-rect-button-default-underlay").color}
        size={"small"}
        text={intl.formatMessage({
          id: "component.text.copy",
        })}
        onPress={() => {
          console.log("__DEBUG__ address: ", address);
          Clipboard.setString(address);
          toast.makeToast({
            title: intl.formatMessage({ id: "component.text.copied" }),
            type: "success",
            displayTime: 1500,
          });
        }}
      />
    </View>
  );
};
