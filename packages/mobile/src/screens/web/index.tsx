import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView, PageWithView } from "../../components/page";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation-util";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIntl } from "react-intl";
import { TouchableOpacity } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import { useHeaderHeight } from "@react-navigation/stack";
import { AsyncKVStore } from "../../common";
import { Button } from "../../components";
import { registerModal } from "../../modals/base";
import { NormalInput } from "../../components/input/normal-input";
import { useStore } from "../../stores";

const defaultDappsInfo = [
  {
    name: "Astra Web App",
    type: "DEX",
    url: "https://app.astranaut.dev",
    thumbnail:
      "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
    description:
      "You can open a Vault and borrow Dai against your preffered collateral",
  },
  {
    name: "Astra Defi",
    type: "DEFI",
    url: "https://defi.astranaut.dev",
    thumbnail:
      "https://salt.tikicdn.com/ts/upload/69/0f/b8/0385f053c018ea3208125e96a1b3fca0.png",
    description:
      "Yearn Finance is a suite of decentralized finance (DeFi) products that let users optimize their earning",
  },
];

export const WebScreen: FunctionComponent = () => {
  const { remoteConfigStore } = useStore();
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeaderHeight = headerHeight - safeAreaInsets.top;
  const intl = useIntl();
  const debugKVStore = new AsyncKVStore("__DEBUG_DAPPS__");

  const [dappsInfo, setDappsInfo] = useState(defaultDappsInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const DEBUG = remoteConfigStore.getBool("feature_debug_enabled");

  useEffect(() => {
    debugKVStore.get("dapps").then((value) => {
      const info = value as typeof defaultDappsInfo;
      if (info) {
        setDappsInfo(defaultDappsInfo.concat(info));
      }
    }).catch((e) => {
      console.log("get dapps_info error", e);
    });
  }, []);

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
        {DEBUG && (
          <View style={style.flatten(["flex-row", "padding-16", "border-width-bottom-1", "border-color-border"])}>
            <Button
              text="Add dApps"
              loading={isLoading}
              containerStyle={style.flatten(["flex-1"])}
              onPress={() => { setIsOpen(true) }}
            />
            <Button
              text="Reset dApps"
              color="negative"
              loading={isLoading}
              containerStyle={style.flatten(["flex-1", "margin-left-16"])}
              onPress={async () => {
                setIsLoading(true);

                await debugKVStore.set("dapps", []);
                setDappsInfo(defaultDappsInfo);
                setIsLoading(false);
              }}
            />
          </View>
        )}
        {
          dappsInfo.map((info) => {
            return <DappButton
              infor={info}
              onPress={() => {
                smartNavigation.pushSmart("Web.Dapps", {
                  name: info.name,
                  uri: info.url,
                });
              }}
            />
          })
        }
      </PageWithScrollView>
      {DEBUG && (
        <AddDappsModal
          title="Add new dApps"
          isOpen={isOpen}
          close={() => { setIsOpen(false) }}
          onAddHandler={async (params) => {
            setIsLoading(true);

            const value = await debugKVStore.get("dapps");
            var info = value as typeof defaultDappsInfo;
            if (!info) {
              info = [];
            }

            info.push(params);

            await debugKVStore.set("dapps", info);
            setDappsInfo(defaultDappsInfo.concat(info));
            setIsLoading(false);
          }}
        />
      )}
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

const AddDappsModal: FunctionComponent<{
  title: string,
  isOpen: boolean,
  close: () => void
  onAddHandler: (params: {
    name: string,
    type: string,
    url: string,
    thumbnail: string,
    description: string,
  }) => void;
}> = registerModal(({
  title,
  close,
  onAddHandler
}) => {
  const style = useStyle();
  const [url, setUrl] = useState("");

  return (
    <View style={style.flatten(["height-full", "justify-center"])}>
      <View style={style.flatten([
        "border-width-1",
        "border-radius-16",
        "border-color-border",
        "background-color-background",
        "margin-x-page",
        "padding-16",
      ])}>
        <Text style={style.flatten(["text-base-medium", "color-label-text-1"])}>
          {title}
        </Text>
        <NormalInput
          value={url}
          onChangeText={setUrl}
          style={style.flatten(["margin-top-16"])}
        />
        <View style={style.flatten(["height-1", "background-color-border", "margin-top-16"])} />
        <View style={style.flatten(["flex-row", "margin-top-16"])}>
          <Button
            text="Cancel"
            mode="outline"
            containerStyle={style.flatten(["flex-1"])}
            onPress={close} />
          <Button
            text="Add"
            containerStyle={style.flatten(["flex-1", "margin-left-8"])}
            disabled={url.length === 0}
            onPress={() => {
              onAddHandler({
                name: "Astra Web App",
                type: "DEX",
                url: url,
                thumbnail:
                  "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
                description:
                  "You can open a Vault and borrow Dai against your preffered collateral",
              });
              close();
            }} />
        </View>
      </View>
    </View >
  );
});