import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useRef } from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { Button } from "../button";
import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon } from "../icon";
import { CloseLargeIcon } from "../icon/outlined/navigation";

export type AlertInlineType = "info" | "success" | "error" | "warning";

export interface IAlertInline {
  viewRef?: React.RefObject<View>;
  style?: ViewStyle;
  type: AlertInlineType;
  title?: string;
  content: string;
  hideIcon?: boolean;
  actionButton?: "close" | { "text": string } | undefined;
  onActionButtonTap?: () => void;
}

export const AlertInline: FunctionComponent<IAlertInline> = observer(({
  viewRef,
  style,
  type,
  title,
  content,
  hideIcon,
  actionButton,
  onActionButtonTap,
}) => {
  const styleBuilder = useStyle();

  function getIcon() {
    const props = {
      style: { marginRight: 8, },
      size: 20,
      color: styleBuilder.get(`color-alert-inline-${type}-main`).color,
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
          color={styleBuilder.get(`color-alert-inline-${type}-content`).color}
        />
      </TouchableOpacity>;
    }
    // if (actionButton && actionButton.text.length != 0) {
    //   return <Button
    //     mode="ghost"
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
    <View ref={viewRef} style={{
      ...styleBuilder.flatten([
        "flex-row",
        "items-start",
        "content-stretch",
        "alert-inline-container",
        `background-color-alert-inline-${type}-background`,
        `border-color-alert-inline-${type}-border`,
      ]),
      ...overrideContainerStyles(),
      ...style
    }}>
      {!hideIcon && getIcon()}
      <View style={{ flex: 1, }}>
        {title && (
          <Text style={styleBuilder.flatten([
            "text-base-medium",
            `color-alert-inline-${type}-main`,
          ])}>{title}</Text>
        )}
        <Text style={styleBuilder.flatten([
          "text-base-regular",
          `color-alert-inline-${type}-content`,
        ])}>{content}</Text>
      </View>
      {actionButton && getButton()}
    </View >
  );
});