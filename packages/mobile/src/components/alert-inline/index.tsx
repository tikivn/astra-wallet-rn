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

    var Icon = AlertInfoIcon;

    switch (type) {
      case "success":
        Icon = AlertSuccessIcon;
        break;
      case "warning":
        Icon = AlertWarningIcon;
        break;
      case "error":
        Icon = AlertErrorIcon;
        break;
      default:
        break;
    }

    return <Icon {...props} />
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