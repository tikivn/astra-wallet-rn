import React, { FunctionComponent } from "react";
import { RNCamera } from "react-native-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useStyle } from "../../styles";
import { StyleSheet, Text, View } from "react-native";
import { LoadingSpinner } from "../spinner";
import { BarcodeMask } from "@nartc/react-native-barcode-mask";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CloseIcon, LeftArrowIcon } from "../icon";
import { RectButton } from "../rect-button";

export const FullScreenCameraView: FunctionComponent<
  React.ComponentProps<typeof RNCamera> & {
    containerBottom?: React.ReactElement;
    isLoading?: boolean;
  }
> = (props) => {
  const style = useStyle();

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {
    children,
    containerBottom,
    isLoading,
    style: propStyle,
    ...rest
  } = props;

  return (
    <React.Fragment>
      {isFocused ? (
        <RNCamera
          style={StyleSheet.flatten([
            style.flatten(["absolute-fill"]),
            propStyle,
          ])}
          {...rest}
        >
          <BarcodeMask
            edgeBorderWidth={4}
            width={304}
            height={304}
            edgeColor={"#FFFFFF"}
            edgeRadius={16}
            backgroundColor={"#141828"}
            maskOpacity={0.7}
            edgeHeight={32}
            edgeWidth={32}
          />
        </RNCamera>
      ) : null}

      <View style={style.flatten(["absolute-fill", "items-center"])}>
        <View style={style.flatten(["flex-row"])}>
          <View style={style.flatten(["flex"])} />
          {navigation.canGoBack() ? (
            <RectButton
              style={style.flatten([
                "border-radius-32",
                "padding-4",
                "margin-top-44",
                "margin-left-20",
                "background-color-black-transparent",
                "width-32",
                "height-32",
              ])}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <LeftArrowIcon size={24} color={style.get("color-white").color} />
            </RectButton>
          ) : null}
          <View style={style.flatten(["flex-1"])} />
        </View>
        <View style={style.get("flex-5")} />

        {isLoading ? (
          <View
            style={style.flatten([
              "absolute-fill",
              "items-center",
              "justify-center",
            ])}
          >
            <View
              style={style.flatten([
                "padding-x-32",
                "padding-top-48",
                "padding-bottom-31",
                "background-color-camera-loading-background",
                "border-radius-8",
                "items-center",
              ])}
            >
              <LoadingSpinner
                size={42}
                color={style.get("color-primary").color}
              />
              <Text
                style={style.flatten([
                  "subtitle1",
                  "color-text-black-low",
                  "margin-top-34",
                ])}
              >
                Loading...
              </Text>
            </View>
          </View>
        ) : null}

        {containerBottom}
        <View style={style.get("flex-1")} />
      </View>
      {children}
    </React.Fragment>
  );
};
