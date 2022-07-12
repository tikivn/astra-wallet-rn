import React, { FunctionComponent } from "react";
import { RNCamera } from "react-native-camera";
import { useIsFocused } from "@react-navigation/native";
import { useStyle } from "../../styles";
import { StyleSheet, Text, View } from "react-native";
import { LoadingSpinner } from "../spinner";
import { BarcodeMask } from "@nartc/react-native-barcode-mask";

export const FullScreenCameraView: FunctionComponent<
  React.ComponentProps<typeof RNCamera> & {
    containerBottom?: React.ReactElement;
    isLoading?: boolean;
  }
> = (props) => {
  const style = useStyle();

  const isFocused = useIsFocused();

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
            showAnimatedLine={false}
            backgroundColor={"#141828"}
            maskOpacity={0.7}
            edgeHeight={32}
            edgeWidth={32}
          />
        </RNCamera>
      ) : null}

      <View style={style.flatten(["absolute-fill", "items-center"])}>
        <View style={style.flatten(["flex-row"])}>
          <View style={style.get("flex-1")} />
        </View>
        <View style={style.get("flex-5")} />
        <View>
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
        </View>
        {containerBottom}
        <View style={style.get("flex-1")} />
      </View>
      {children}
    </React.Fragment>
  );
};
