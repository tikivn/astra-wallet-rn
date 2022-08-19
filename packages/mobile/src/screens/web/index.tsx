import React, { FunctionComponent } from "react";
import { PageWithScrollView, PageWithView } from "../../components/page";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation-util";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIntl } from "react-intl";
import { TouchableOpacity } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import { useHeaderHeight } from "@react-navigation/stack";

export const WebScreen: FunctionComponent = () => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeaderHeight = headerHeight - safeAreaInsets.top;
  const intl = useIntl();

  return (
    <PageWithView
      disableSafeArea={true}
      style={style.flatten(["background-color-background"])}
    >
      <PageWithScrollView
        backgroundColor={style.get("color-background").color}
        contentContainerStyle={style.get("flex-grow-1")}
        style={StyleSheet.flatten([
          style.flatten(["padding-0"]),
          {
            marginTop:
              Platform.OS === "ios" ? actualHeaderHeight : headerHeight,
          },
        ])}
      >
        <DappButton
          infor={{
            name: "Astra Web App",
            type: "DEX",
            url: "https://app.astranaut.dev",
            thumbnail:
              "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
            description:
              "You can open a Vault and borrow Dai against your preffered collateral",
          }}
          onPress={() => {
            smartNavigation.pushSmart("Web.Astranaut", {});
          }}
        />
        <DappButton
          infor={{
            name: "Astra Defi",
            type: "DEFI",
            url: "https://defi.astranaut.network",
            thumbnail:
              "https://salt.tikicdn.com/ts/upload/69/0f/b8/0385f053c018ea3208125e96a1b3fca0.png",
            description:
              "Yearn Finance is a suite of decentralized finance (DeFi) products that let users optimize their earning",
          }}
          onPress={() => {
            smartNavigation.pushSmart("Web.AstraDefi", {});
          }}
        />
      </PageWithScrollView>
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "absolute",
            "background-color-background",
            "width-full",
          ]),
          {
            height: headerHeight,
          },
        ])}
      >
        <View
          style={{
            height:
              safeAreaInsets.top -
              (Platform.OS === "ios" && safeAreaInsets.top > 44 ? 6 : 0),
          }}
        />
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "background-color-background",
              "flex-row",
              "padding-x-16",
              "justify-center",
              "items-center",
            ]),
            {
              height: actualHeaderHeight,
            },
          ])}
        >
          <Text style={style.flatten(["color-white", "title2"])}>
            {intl.formatMessage({ id: "tabs.d-apps" })}
          </Text>
        </View>
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
      </View>
    </PageWithView>
  );
};

export interface DappInfor {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly thumbnail?: string;
  readonly url: string;
}

export const DappButton: FunctionComponent<{
  infor: DappInfor;
  onPress?: () => void;
}> = ({ infor, onPress }) => {
  const style = useStyle();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={style.flatten(["background-color-background", "padding-x-16"])}
    >
      <View style={style.flatten(["padding-y-16", "flex-row"])}>
        {infor.thumbnail && infor.thumbnail.length > 0 ? (
          <FastImage
            style={{
              width: 40,
              height: 40,
            }}
            source={{
              uri: infor.thumbnail,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <Image
            source={require("../../assets/image/icon_dapps.png")}
            resizeMode="contain"
            style={{
              width: 40,
              height: 40,
            }}
          />
        )}
        <View style={style.flatten(["margin-left-16", "flex-1"])}>
          <View style={style.flatten(["flex-row", "items-center"])}>
            <Text style={style.flatten(["color-gray-10", "subtitle3"])}>
              {infor.name}
            </Text>
            <View
              style={style.flatten([
                "background-color-gray-10",
                "margin-left-4",
                "padding-x-2",
                "border-radius-4",
              ])}
            >
              <Text style={style.flatten(["color-gray-100", "subtitle5"])}>
                {infor.type}
              </Text>
            </View>
          </View>
          <Text style={style.flatten(["color-gray-30", "text-caption2"])}>
            {infor.description ? infor.description : infor.url}
          </Text>
        </View>
      </View>

      <View style={style.flatten(["background-color-gray-70", "height-1"])} />
    </TouchableOpacity>
  );
};
