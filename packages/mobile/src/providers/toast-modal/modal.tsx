import React, { FunctionComponent, useEffect } from "react";
import { registerModal } from "../../modals/base";
import { useStyle } from "../../styles";
import { Text, View } from "react-native";
import { ToastIcon } from "../../components/icon";

export const ToastModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  type: "success" | "error" | "infor" | "neutral";
  displayTime?: number;
}> = registerModal(
  ({ close, title, type = "infor", displayTime = 2000 }) => {
    useEffect(() => {
      setTimeout(() => {
        close();
      }, displayTime);
    }, []);

    const style = useStyle();
    const styleDefinition = style.get(`toast-${type}` as any);

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "overflow-hidden",
            "toast-container",
            `toast-${type}` as any,
            "padding-y-12",
            "padding-x-16",
            "flex-row",
            "items-center",
            "justify-between",
          ])}
        >
          <ToastIcon height={15} color={styleDefinition.color} />
          <Text
            style={{
              ...style.flatten([
                "text-base-regular",
                "margin-left-8",
                "flex-1",
              ]),
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
  }
);
