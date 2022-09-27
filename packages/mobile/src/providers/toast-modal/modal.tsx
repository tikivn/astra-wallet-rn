import React, { FunctionComponent, useEffect } from "react";
import { registerModal } from "../../modals/base";
import { useStyle } from "../../styles";
import { StyleSheet, Text, View } from "react-native";
import {
  AlertErrorIcon,
  AlertInfoIcon,
  AlertSuccessIcon,
} from "../../components/icon";

export const ToastModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  type: "success" | "error" | "infor" | "neutral";
  displayTime?: number;
  bottomOffset?: number;
}> = registerModal(
  ({ close, title, type = "infor", displayTime = 2000, bottomOffset }) => {
    useEffect(() => {
      setTimeout(() => {
        close();
      }, displayTime);
    }, []);

    const style = useStyle();
    const styleDefinition = style.get(`toast-${type}` as any);

    function getIcon() {
      const props = {
        style: { marginRight: 8 },
        size: 20,
        color: styleDefinition.color,
      };

      let Icon = AlertInfoIcon;

      switch (type) {
        case "success":
          Icon = AlertSuccessIcon;
          break;
        case "infor":
          Icon = AlertInfoIcon;
          break;
        case "error":
          Icon = AlertErrorIcon;
          break;
        default:
          return;
      }

      return <Icon {...props} />;
    }

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "overflow-hidden",
              "toast-container",
              `toast-${type}` as any,
              "padding-y-12",
              "padding-x-16",
              "flex-row",
              "items-center",
              "justify-between",
            ]),
            {
              marginBottom: bottomOffset,
            }
          ])}
        >
          {getIcon()}
          <Text
            style={{
              ...style.flatten(["text-base-regular", "flex-1"]),
              color: styleDefinition.color,
            }}
          >
            {title}
          </Text>
        </View>
      </View>
    );
  },
  {
    align: "bottom",
    disableBackdrop: true,
    blurBackdropOnIOS: false,
    transitionVelocity: 0,
  }
);
