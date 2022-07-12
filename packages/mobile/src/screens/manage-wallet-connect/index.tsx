import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithScrollView } from "../../components/page";
import { Image, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useConfirmModal } from "../../providers/confirm-modal";
import { Button } from "../../components";
import { CardDivider } from "../../components/card";
import { useSmartNavigation } from "../../navigation";
import { DelegationsEmptyItem } from "../staking/dashboard/delegate";
import FastImage from "react-native-fast-image";
import { useToastModal } from "../../providers/toast-modal";
import { useIntl } from "react-intl";

export const ManageWalletConnectScreen: FunctionComponent = observer(() => {
  const { signClientStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const style = useStyle();

  const confirmModal = useConfirmModal();
  const sessions = signClientStore.sessions;
  const toastModal = useToastModal();

  const intl = useIntl();

  useEffect(() => {
    signClientStore.onSessionChange((infor) => {
      toastModal.makeToast({
        title: infor.isConnect
          ? intl
              .formatMessage({ id: "walletconnect.connected" })
              .replace("${name}", `${infor.name}`)
          : intl
              .formatMessage({ id: "walletconnect.disconnected" })
              .replace("${name}", `${infor.name}`),
        type: infor.isConnect ? "success" : "infor",
        displayTime: 2000,
      });
    });
  }, []);

  return (
    <PageWithScrollView backgroundColor={style.get("color-background").color}>
      <View style={style.flatten(["flex-1", "padding-x-0", "padding-y-8"])}>
        <CardDivider
          style={style.flatten(["margin-0", "background-color-gray-70"])}
        />
        <View
          style={style.flatten([
            "flex-row",
            "justify-between",
            "margin-top-8",
            "padding-16",
          ])}
        >
          <Image
            source={require("../../assets/image/icon-walletconnect.png")}
            resizeMode="contain"
            style={style.flatten(["width-40", "height-40"])}
          />
          <Text
            style={style.flatten([
              "color-gray-10",
              "body3",
              "margin-left-16",
              "flex-1",
            ])}
          >
            {intl.formatMessage({ id: "walletconnect.descriptions" })}
          </Text>
        </View>
        <Button
          containerStyle={style.flatten(["margin-x-16"])}
          text={intl.formatMessage({ id: "walletconnect.action.text" })}
          onPress={() => {
            smartNavigation.navigateSmart("Camera", {});
          }}
        />
      </View>

      <View style={style.get("height-card-gap")} />

      {sessions && sessions.length > 0 ? (
        <React.Fragment>
          {sessions.map((session) => {
            const { name, icons, url } = session.peer.metadata;
            const appName = name || "unknown";

            return (
              <React.Fragment key={session.topic}>
                <View
                  style={style.flatten([
                    "flex-row",
                    "items-center",
                    "background-color-background",
                    "padding-y-12",
                    "padding-x-16",
                  ])}
                >
                  <View
                    style={style.flatten([
                      "width-40",
                      "height-40",
                      "border-radius-32",
                      "background-color-white",
                      "items-center",
                      "justify-center",
                    ])}
                  >
                    {icons.length > 0 ? (
                      <FastImage
                        style={{
                          width: 24,
                          height: 24,
                        }}
                        source={{
                          uri: icons[0],
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    ) : (
                      <Image
                        source={require("../../assets/image/icon_dapps.png")}
                        resizeMode="contain"
                        style={style.flatten(["width-56", "height-56"])}
                      />
                    )}
                  </View>
                  <View style={style.flatten(["flex-1", "margin-left-16"])}>
                    <View
                      style={style.flatten(["flex-row", "justify-between"])}
                    >
                      <Text
                        style={style.flatten(["subtitle3", "color-gray-10"])}
                      >
                        {appName}
                      </Text>
                      <TouchableOpacity
                        style={style.flatten(["padding-0"])}
                        onPress={async () => {
                          if (
                            await confirmModal.confirm({
                              title: "",
                              paragraph: intl
                                .formatMessage({
                                  id: "walletconnect.action.disconnect.title",
                                })
                                .replace("${name}", `${name}`),
                              yesButtonText: intl.formatMessage({
                                id: "common.text.disconnect",
                              }),
                              noButtonText: intl.formatMessage({
                                id: "walletconnect.action.disconnect.cancel",
                              }),
                            })
                          ) {
                            await signClientStore.disconnect(session);
                          }
                        }}
                      >
                        <Text
                          style={style.flatten([
                            "color-blue-70",
                            "text-caption2",
                          ])}
                        >
                          {intl.formatMessage({
                            id: "common.text.disconnect",
                          })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={style.flatten(["text-caption2", "color-gray-30"])}
                    >
                      {url}
                    </Text>
                  </View>
                </View>
                <CardDivider style={style.get("background-color-gray-70")} />
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ) : (
        <DelegationsEmptyItem
          containerStyle={style.flatten(["background-color-background"])}
          label={intl.formatMessage({ id: "walletconnect.empty.description" })}
        />
      )}

      <View style={style.get("height-card-gap")} />
    </PageWithScrollView>
  );
});
