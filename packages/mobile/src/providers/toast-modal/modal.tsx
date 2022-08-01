import React, { FunctionComponent, useEffect } from "react";
import { registerModal } from "../../modals/base";
import { Colors, useStyle } from "../../styles";
import { Text, View } from "react-native";
import { ToastIcon } from "../../components/icon";

export const ToastModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  type: "success" | "error" | "infor";
  displayTime?: number;
}> = registerModal(
  ({ close, title, type = "infor", displayTime = 2000 }) => {
    useEffect(() => {
      setTimeout(() => {
        close();
      }, displayTime);
    }, []);

    const style = useStyle();
    const backgroundColorDefinition = (() => {
      switch (type) {
        case "infor":
          return "background-color-blue-20";
        case "error":
          return "background-color-red-10";
        case "success":
          return "background-color-green-10";
        default:
          return "background-color-white";
      }
    })();

    const colorDefinition = (() => {
      switch (type) {
        case "infor":
          return "blue-40";
        case "error":
          return "red-30";
        case "success":
          return "green-30";
        default:
          return "white";
      }
    })();

    const toastColorDefinition = (() => {
      switch (type) {
        case "infor":
          return Colors["blue-70"];
        case "error":
          return Colors["red-60"];
        case "success":
          return Colors["green-60"];
        default:
          return Colors["white"];
      }
    })();

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            backgroundColorDefinition as any,
            "padding-y-12",
            "padding-x-16",
            "border-width-1",
            `border-color-${colorDefinition}` as any,
            "flex-row",
            "items-center",
            "justify-between",
          ])}
        >
          <ToastIcon height={15} color={toastColorDefinition} />
          <Text
            style={style.flatten([
              "body3",
              "color-gray-100",
              "margin-left-8",
              "flex-1",
            ])}
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
  }
);
