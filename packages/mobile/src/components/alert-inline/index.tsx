import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Image } from "react-native-svg";
import { Colors, useStyle } from "../../styles";
// import WarningIcon from "../../assets/svg/warning.svg";

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
      {/* <Image style={{ ...styles.logo }} source={require("../../assets/logo/Astra.png")} /> */}
      {/* <WarningIcon style={{ ...styles.logo, fill: "red" }} /> */}
      {/* <Image width={24} height={24} href={require("../../assets/svg/warning.svg")} /> */}
      <View style={{ ...styles.textContainer}}>
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

const InfoStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["orange-10"],
    borderColor: Colors["orange-30"],
  },

});

const SuccessStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["orange-10"],
    borderColor: Colors["orange-30"],
  },

});

const ErrorStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["orange-10"],
    borderColor: Colors["orange-30"],
  },

});

const WarningStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["orange-10"],
    borderColor: Colors["orange-30"],
  },

});

const allStyles = {
  info: {
    container: InfoStyles.container,
  },
  success: {
    container: SuccessStyles.container,
  },
  error: {
    container: ErrorStyles.container,
  },
  warning: {
    container: WarningStyles.container,
  },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "stretch",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,    
  },
  textContainer: {
    marginRight: 16,
  },
  logo: {
    height: 16,
    width: 16,
    marginRight: 8,
  },
  content: {

  },
});