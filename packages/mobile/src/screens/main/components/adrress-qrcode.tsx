import React, { FunctionComponent } from "react";
import { ViewStyle, StyleSheet, Text, View } from "react-native";
import { useSimpleTimer } from "../../../hooks";
import { useStyle } from "../../../styles";
import Clipboard from "expo-clipboard";
import { Button } from "../../../components/button";
import QRCode from "react-native-qrcode-svg";
import { useIntl } from "react-intl";
export const AddressQRCodeItem: FunctionComponent<{
  style?: ViewStyle;
  address: string;
}> = ({ style: propStyle, address }) => {
  const style = useStyle();
  const intl = useIntl();
  const { isTimedOut, setTimer } = useSimpleTimer();

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
        textStyle={style.flatten([
          "subtitle3",
          isTimedOut ? "color-primary" : "color-background",
        ])}
        underlayColor={style.get("color-rect-button-default-underlay").color}
        size={"small"}
        text={intl.formatMessage({
          id: !isTimedOut ? "component.text.copy" : "component.text.copied",
        })}
        onPress={() => {
          console.log("__Address__: ", address);
          Clipboard.setString(address);
          setTimer(2000);
        }}
      />
    </View>
  );
};
