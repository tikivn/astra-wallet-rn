import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { Colors, useStyle } from "../../styles";
import { WarningIcon } from "../icon/warning";
import { allStyles, styles } from "./styles";

interface IAlertInline {
  style?: ViewStyle;
  type: "info" | "success" | "error" | "warning";
  title?: string | undefined;
  content?: string | undefined;
}

export const AlertInline: FunctionComponent<IAlertInline> = observer(({
  style,
  type,
  title,
  content,
}) => {
  const styleBuilder = useStyle();

  const viewContainer = allStyles[type].container;

  return (
    <View style={{ ...styles.container, ...viewContainer, ...style }}>
      <WarningIcon
        containerStyle={{ marginRight: 8, }}
        style={{
          height: 16,
          width: 16,
          ...allStyles[type].logo,
          color: Colors["orange-60"],
        }}
      />
      <View style={{ ...styles.textContainer }}>
        {title && (
          <Text style={styleBuilder.flatten(["text-base-medium"])}>{title}</Text>
        )}
        {content && (
          <Text style={styleBuilder.flatten(["text-base-regular", "color-gray-90"])}>{content}</Text>
        )}
      </View>
    </View >
  );
});