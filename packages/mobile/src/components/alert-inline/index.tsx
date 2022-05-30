import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon } from "../icon";
import { allStyles, styles } from "./styles";

export type AlertInlineType = "info" | "success" | "error" | "warning";

interface IAlertInline {
  style?: ViewStyle;
  type: AlertInlineType;
  title?: string;
  content: string;
  hideIcon?: boolean;
}

export const AlertInline: FunctionComponent<IAlertInline> = observer(({
  style,
  type,
  title,
  content,
  hideIcon,
}) => {
  const styleBuilder = useStyle();

  const viewContainer = allStyles[type].container;

  function getIcon() {
    const props = {
      style: { marginRight: 8, },
      size: 20,
      color: allStyles[type].logo.color
    };

    var icon = <AlertInfoIcon {...props} />;

    switch (type) {
      case "success":
        icon = <AlertSuccessIcon {...props} />;
        break;
      case "warning":
        icon = <AlertWarningIcon {...props} />;
        break;
      case "error":
        icon = <AlertErrorIcon {...props} />;
        break;
      default:
        break;
    }
    return icon;
  }

  return (
    <View style={{ ...styles.container, ...viewContainer, ...style }}>
      {!hideIcon && getIcon()}
      <View style={{ flex: 1, }}>
        {title && (
          <Text style={styleBuilder.flatten(["text-base-medium"])}>{title}</Text>
        )}
        <Text style={styleBuilder.flatten(["text-base-regular", "color-gray-90"])}>{content}</Text>
      </View>
    </View >
  );
});