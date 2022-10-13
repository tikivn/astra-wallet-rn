import React from "react";
import { useIntl } from "react-intl";
import { Image, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { BottomSheetSwap, BottomSheetSwapProps } from "./bottom-sheet-swap";

export type SlippageDescribeProps = BottomSheetSwapProps;

export const SlippageDescribe = (props: SlippageDescribeProps) => {
  const style = useStyle();
  const intl = useIntl();

  return (
    <BottomSheetSwap {...props}>
      <View style={style.flatten(["flex-grow-1"])}>
        <View
          style={style.flatten([
            "padding-y-24",
            "padding-x-16",
            "min-height-80",
            "border-width-top-1",
            "border-width-bottom-1",
            "border-color-border",
          ])}
        >
          <View
            style={style.flatten([
              "flex-row",
              "flex-nowrap",
              "justify-end",
              "items-end",
              "height-200",
            ])}
          >
            <View style={style.flatten(["margin-right-16", "flex-1"])}>
              <View
                style={StyleSheet.flatten([
                  {
                    height: 100,
                  },
                  style.flatten([
                    "background-color-gray-80",
                    "border-color-gray-30",
                    "border-width-1",
                    "border-radius-8",
                  ]),
                ])}
              />
              <View style={style.flatten(["margin-top-8"])}>
                <Text style={style.flatten(["color-gray-30", "text-caption2"])}>
                  {intl.formatMessage({
                    id: "swap.slippage.describe.expected_to_pay",
                  })}
                </Text>
                <Text style={style.flatten(["color-gray-10", "subtitle2"])}>
                  100 ASA
                </Text>
              </View>
            </View>
            <View style={style.flatten(["margin-right-16", "flex-1"])}>
              <View style={style.flatten(["margin-bottom-8"])}>
                <Image
                  style={StyleSheet.flatten([
                    {
                      width: 12,
                      height: 12,
                    },
                  ])}
                  resizeMode="contain"
                  source={require("../../assets/image/like.svg")}
                />
                <Text
                  style={style.flatten([
                    "color-gray-30",
                    "text-caption2",
                    "margin-top-6",
                  ])}
                >
                  {intl.formatMessage({
                    id: "swap.slippage.describe.slippage_1",
                  })}
                </Text>
              </View>
              <View
                style={StyleSheet.flatten([
                  {
                    height: 90,
                    backgroundColor: "rgba(74, 181, 124, 0.15)",
                  },
                  style.flatten([
                    "border-color-green-50",
                    "border-width-1",
                    "border-radius-8",
                  ]),
                ])}
              />
              <View style={style.flatten(["margin-top-8"])}>
                <Text style={style.flatten(["color-gray-30", "text-caption2"])}>
                  {intl.formatMessage({
                    id: "swap.slippage.describe.really_pay",
                  })}
                </Text>
                <Text style={style.flatten(["color-gray-10", "subtitle2"])}>
                  90 ASA
                </Text>
              </View>
            </View>

            <View style={style.flatten(["flex-1"])}>
              <View style={style.flatten(["margin-bottom-8"])}>
                <Image
                  style={StyleSheet.flatten([
                    {
                      width: 12,
                      height: 12,
                    },
                  ])}
                  resizeMode="contain"
                  source={require("../../assets/image/unlike.svg")}
                />
                <Text
                  style={style.flatten([
                    "color-gray-30",
                    "text-caption2",
                    "margin-top-6",
                  ])}
                >
                  {intl.formatMessage({
                    id: "swap.slippage.describe.slippage_2",
                  })}
                </Text>
              </View>
              <View
                style={StyleSheet.flatten([
                  {
                    height: 110,
                    backgroundColor: "rgba(212, 78, 103, 0.15)",
                  },
                  style.flatten([
                    "border-color-red-50",
                    "border-width-1",
                    "border-radius-8",
                  ]),
                ])}
              />
              <View style={style.flatten(["margin-top-8"])}>
                <Text style={style.flatten(["color-gray-30", "text-caption2"])}>
                  {intl.formatMessage({
                    id: "swap.slippage.describe.really_pay",
                  })}
                </Text>
                <Text style={style.flatten(["color-gray-10", "subtitle2"])}>
                  110 ASA
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={style.flatten([
            "padding-y-24",
            "padding-x-16",
            "min-height-80",
          ])}
        >
          <Text style={style.flatten(["color-gray-10", "text-caption"])}>
            {intl.formatMessage({ id: "swap.slippage.describe.content_1" })}
          </Text>
          <Text
            style={style.flatten([
              "color-gray-10",
              "text-caption",
              "margin-top-8",
            ])}
          >
            {intl.formatMessage({ id: "swap.slippage.describe.content_2" })}
          </Text>
        </View>
        <View style={style.get("height-80")} />
      </View>
    </BottomSheetSwap>
  );
};
