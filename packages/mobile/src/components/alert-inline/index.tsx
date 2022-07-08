import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Colors, useStyle } from "../../styles";
import { Button } from "../button";
import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon } from "../icon";
import { CloseLargeIcon } from "../icon/outlined/navigation";
import { allStyles, styles } from "./styles";

export type AlertInlineType = "info" | "success" | "error" | "warning";

interface IAlertInline {
  style?: ViewStyle;
  type: AlertInlineType;
  title?: string;
  content: string;
  hideIcon?: boolean;
  actionButton?: "close" | { "text": string } | undefined;
  onActionButtonTap?: () => void;
}

export const AlertInline: FunctionComponent<IAlertInline> = observer(({
  style,
  type,
  title,
  content,
  hideIcon,
  actionButton,
  onActionButtonTap,
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

  function getButton() {
    if (actionButton === "close") {
      return <TouchableOpacity
        style={{
          width: 44,
          justifyContent: "center",
          alignItems: "center"
        }}
        onPress={() => {
          if (onActionButtonTap) {
            onActionButtonTap();
          }
        }}>
        <CloseLargeIcon
          size={20}
          color={Colors["gray-100"]}
        />
      </TouchableOpacity>;
    }
    // if (actionButton && actionButton.text.length != 0) {
    //   return <Button
    //     mode="text"
    //     size="small"
    //     text={actionButton.text}
    //   />
    // }
  }

  function overrideContainerStyles(): ViewStyle {
    if (!actionButton) {
      return {};
    }

    return {
      paddingHorizontal: 0,
      paddingLeft: 16,
    };
  }

  return (
    <View style={{ ...styles.container, ...viewContainer, ...overrideContainerStyles(), ...style }}>
      {!hideIcon && getIcon()}
      <View style={{ flex: 1, }}>
        {title && (
          <Text style={styleBuilder.flatten(["text-base-medium"])}>{title}</Text>
        )}
        <Text style={styleBuilder.flatten(["text-base-regular", "color-gray-90"])}>{content}</Text>
      </View>
      {actionButton && getButton()}
    </View >
  );
});