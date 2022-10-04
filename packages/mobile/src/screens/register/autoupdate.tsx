import React, { FunctionComponent, useEffect } from "react";
import { Colors, useStyle } from "../../styles";
import { View, ImageBackground, Image, Text, Dimensions } from "react-native";
import { observer } from "mobx-react-lite";
import * as Progress from "react-native-progress";
import { useIntl } from "react-intl";
import { useAutoUpdateProgress } from "../../providers/auto-update";
import CodePush from "react-native-code-push";
import { ToastIcon } from "../../components/icon";
import { hideSplashScreen } from "../splash";

export const AutoUpdateProgressScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const intl = useIntl();

  useEffect(() => {
    (async () => {
      await hideSplashScreen();
    })();
  }, []);

  const autoUpdateProgress = useAutoUpdateProgress();

  const byteToMB = (bytes: number | undefined): number => {
    return bytes ? bytes / 1048576 : 0;
  };
  const { status, progress } = autoUpdateProgress;
  const percent =
    progress && progress.totalBytes != 0
      ? (progress.receivedBytes * 1.0) / progress.totalBytes
      : 0;
  const received = byteToMB(progress?.receivedBytes).toFixed(2);
  const total = byteToMB(progress?.totalBytes).toFixed(2);

  return (
    <View style={style.flatten(["background-color-background"])}>
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../assets/logo/main_background.png")}
        resizeMode="cover"
      >
        <View
          style={{
            ...style.flatten(["flex-grow-1", "items-center", "padding-x-18"]),
            paddingTop: Dimensions.get("window").height * 0.22,
          }}
        >
          <Image
            resizeMode="contain"
            source={require("../../assets/logo/Astra.png")}
          />
          <Text style={style.flatten(["color-white", "title3", "text-center"])}>
            {intl.formatMessage({ id: "register.intro.appName" })}
          </Text>

          <View
            style={style.flatten([
              "width-full",
              "flex-grow-1",
              "margin-top-64",
            ])}
          >
            <Text
              style={style.flatten([
                "color-white",
                "text-caption",
                "text-center",
              ])}
            >
              {intl.formatMessage({ id: "auto-update.downloading" })}
            </Text>
            <Text
              style={style.flatten([
                "color-white",
                "text-caption",
                "text-left",
                "margin-top-8",
              ])}
            >
              {received} MB / {total} MB
            </Text>
            <Progress.Bar
              progress={percent}
              width={null}
              height={8}
              color="rgba(11, 116, 229, 1)"
              unfilledColor="rgba(235, 235, 240, 1)"
            />
            <Text
              style={style.flatten([
                "color-white",
                "text-caption",
                "text-right",
              ])}
            >
              {(percent * 100).toFixed(0)} %
            </Text>
          </View>
          {status != CodePush.SyncStatus.UNKNOWN_ERROR ? null : (
            <View
              style={style.flatten([
                "border-radius-8",
                "overflow-hidden",
                "background-color-red-10",
                "padding-y-12",
                "padding-x-16",
                "border-width-1",
                `border-color-red-30`,
                "flex-column",
                "items-center",
                "justify-between",
              ])}
            >
              <View style={style.flatten(["flex-row", "items-center"])}>
                <ToastIcon height={15} color={Colors["red-60"]} />
                <Text
                  style={style.flatten([
                    "body3",
                    "color-orange-60",
                    "margin-left-8",
                    "flex-1",
                  ])}
                >
                  {intl.formatMessage({ id: "auto-update.error.title" })}
                </Text>
              </View>
              <Text
                style={style.flatten([
                  "color-gray-100",
                  "text-caption",
                  "text-left",
                ])}
              >
                {intl.formatMessage({ id: "auto-update.error.message" })}
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
});
