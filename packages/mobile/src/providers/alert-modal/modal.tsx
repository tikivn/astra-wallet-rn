import React, { FunctionComponent } from "react";
import { registerModal } from "../../modals/base";
import { useStyle } from "../../styles";
import { Text, View } from "react-native";
import { Button } from "../../components/button";
import { AlertInfoIcon, AlertSuccessIcon, ErrorIconV2 } from "../../components";
export const AlertModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  type: "error" | "success" | "infor";
  title: string;
  paragraph?: string;
  confirmButtonText: string;
  onConfirm: () => void;
}> = registerModal(
  ({
    close,
    title,
    paragraph,
    confirmButtonText,
    onConfirm,
    type = "error",
  }) => {
    const style = useStyle();
    const styleDefinition = style.get(`alert-${type}` as any);

    function getIcon() {
      const props = {
        style: { marginRight: 8, marginTop: 4 },
        size: 18,
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
          Icon = ErrorIconV2;
          break;
        default:
          return;
      }

      return <Icon {...props} />;
    }
    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-gray-90",
            "padding-y-12",
            "border-width-1",
            "border-color-gray-60",
          ])}
        >
          <View style={style.flatten(["flex-row", "padding-x-16"])}>
            {getIcon()}
            <View style={style.flatten(["flex-1"])}>
              {title.length > 0 ? (
                <Text
                  style={style.flatten([
                    "subtitle2",
                    "color-gray-10",
                    "margin-bottom-8",
                  ])}
                >
                  {title}
                </Text>
              ) : null}
              {paragraph ? (
                <Text
                  style={style.flatten([
                    "body3",
                    "color-gray-30",
                    "margin-bottom-8",
                  ])}
                >
                  {paragraph}
                </Text>
              ) : null}
            </View>
          </View>

          <View
            style={style.flatten(["flex-row", "padding-x-16", "justify-end"])}
          >
            <Button
              color="primary"
              containerStyle={style.flatten(["flex-0"])}
              text={confirmButtonText}
              onPress={() => {
                onConfirm();
                close();
              }}
            />
          </View>
        </View>
      </View>
    );
  },
  {
    align: "center",
  }
);
