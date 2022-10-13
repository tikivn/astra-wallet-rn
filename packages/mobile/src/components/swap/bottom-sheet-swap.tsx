import React, { FunctionComponent, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import { registerModal } from "../../modals/base";
import { useStyle } from "../../styles";

export interface BottomSheetSwapProps {
  label?: React.ReactNode;
  isOpen: boolean;
  close: () => void;
  children?: React.ReactNode;
}
export const BottomSheetSwap: FunctionComponent<BottomSheetSwapProps> = registerModal(
  ({ label, children, close }) => {
    useEffect(() => {
      Keyboard.dismiss();
    }, []);
    const style = useStyle();
    return (
      <View style={style.flatten(["padding-0"])}>
        <View
          style={StyleSheet.flatten([
            {
              backgroundColor: "transparent",
              // height: 600,
            },
          ])}
        />
        <View
          style={style.flatten([
            "background-color-gray-10",
            "width-48",
            "height-6",
            "margin-bottom-12",
            "self-center",
            "border-radius-16",
          ])}
        />

        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-gray-90",
          ])}
        >
          <TouchableOpacity
            onPress={close}
            style={StyleSheet.flatten([
              {
                width: 20,
                height: 20,
                position: "absolute",
                top: 20,
                left: 20,
                zIndex: 100,
                padding: 3,
              },
            ])}
          >
            <Image
              style={StyleSheet.flatten([
                {
                  width: 14,
                  height: 14,
                },
              ])}
              resizeMode="contain"
              source={require("../../assets/image/close.png")}
            />
          </TouchableOpacity>
          <View style={style.flatten(["height-60", "justify-center"])}>
            <Text
              style={style.flatten([
                "subtitle2",
                "color-gray-10",
                "text-center",
              ])}
            >
              {label}
            </Text>
          </View>

          {children}
        </View>
      </View>
    );
  },
  {
    disableSafeArea: true,
  }
);
