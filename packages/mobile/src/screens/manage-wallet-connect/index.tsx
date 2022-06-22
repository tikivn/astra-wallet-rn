import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithScrollView } from "../../components/page";
import { Image, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { WCAppLogo } from "../../components/wallet-connect";
import { UnconnectIcon } from "../../components/icon";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useConfirmModal } from "../../providers/confirm-modal";
import { Button } from "../../components";
import { CardDivider } from "../../components/card";
import { useSmartNavigation } from "../../navigation";
import { DelegationsEmptyItem } from "../staking/dashboard/delegate";

export const ManageWalletConnectScreen: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const style = useStyle();

  const confirmModal = useConfirmModal();

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
            Kết nối ứng dụng DApps/DeFi với ví qua WalletConnect để thực hiện
            giao dịch của ứng dụng
          </Text>
        </View>
        <Button
          containerStyle={style.flatten(["margin-x-16"])}
          text="Liên kết ứng dụng"
          onPress={() => {
            smartNavigation.navigateSmart("Camera", {});
          }}
        ></Button>
      </View>

      <View style={style.get("height-card-gap")} />
      {walletConnectStore.sessions.length > 0 ? (
        <React.Fragment>
          {walletConnectStore.sessions.map((session, i) => {
            const appName =
              session.peerMeta?.name || session.peerMeta?.url || "unknown";

            return (
              <React.Fragment key={session.key}>
                <View
                  style={style.flatten([
                    "height-0.5",
                    "background-color-divider",
                  ])}
                />
                <View
                  style={style.flatten([
                    "flex-row",
                    "items-center",
                    "background-color-white",
                    "padding-y-25.5",
                  ])}
                >
                  <WCAppLogo
                    logoStyle={style.flatten(["margin-left-20"])}
                    altLogoStyle={style.flatten(["margin-left-20"])}
                    peerMeta={session.peerMeta}
                  />
                  <View style={style.flatten(["flex-1", "margin-left-16"])}>
                    <Text
                      style={style.flatten([
                        "subtitle2",
                        "color-text-black-medium",
                      ])}
                    >
                      {appName}
                    </Text>
                  </View>
                  <View
                    style={style.flatten([
                      "height-1",
                      "overflow-visible",
                      "justify-center",
                    ])}
                  >
                    <TouchableOpacity
                      style={style.flatten(["padding-x-16", "padding-y-24"])}
                      onPress={async () => {
                        if (
                          await confirmModal.confirm({
                            title: "Disconnect Session",
                            paragraph:
                              "Are you sure you want to end this WalletConnect session?",
                            yesButtonText: "Disconnect",
                            noButtonText: "Cancel",
                          })
                        ) {
                          await walletConnectStore.disconnect(session.key);
                        }
                      }}
                    >
                      <UnconnectIcon
                        color={
                          style.get("color-text-black-very-very-low").color
                        }
                        height={28}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {walletConnectStore.sessions.length - 1 === i ? (
                  <View
                    style={style.flatten([
                      "height-0.5",
                      "background-color-divider",
                    ])}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ) : (
        <DelegationsEmptyItem
          containerStyle={style.flatten(["background-color-background"])}
          label="Bạn chưa có ứng dụng liên kết nào"
        ></DelegationsEmptyItem>
      )}

      <View style={style.get("height-card-gap")} />
    </PageWithScrollView>
  );
});
