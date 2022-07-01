import { useRoute, RouteProp } from "@react-navigation/native";
import { SessionTypes, SignClientTypes } from "@walletconnect/types";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Image, View, Text } from "react-native";
import {
  Button,
  HomeTabbarIcon,
  PageWithScrollView,
  VerifiedIcon,
} from "../../components";
import { useSmartNavigation } from "../../navigation";
import { useStyle } from "../../styles";
import FastImage from "react-native-fast-image";
import { CardDivider } from "../../components/card";
import { useStore } from "../../stores";
export const SessionProposalScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          proposal: SignClientTypes.EventArguments["session_proposal"];
        }
      >,
      string
    >
  >();

  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const proposal = route.params.proposal;
  const {id, params } = proposal;
  const {relays, proposer, requiredNamespaces } = params;
  const icons = proposer.metadata.icons;

  console.log("Got proposer: ", proposer);

  const onApproveSession = async () => {
    const address = accountInfo.bech32Address;
    const namespaces: SessionTypes.Namespaces = {}
    Object.keys(requiredNamespaces).forEach(key => {
        const accounts: string[] = []
        requiredNamespaces[key].chains.map(chain => {
            accounts.push(`${chain}:${address}`)
        })
        namespaces[key] = {
          accounts,
          methods: requiredNamespaces[key].methods,
          events: requiredNamespaces[key].events
        }
      })

    const approvePayload = {
        id,
        relayProtocol: relays[0].protocol,
        namespaces
      };
  }

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.flatten([
        "padding-y-16",
        "flex-1",
        "justify-between",
      ])}
    >
      <View style={style.flatten(["padding-x-16", "flex"])}>
        <View
          style={style.flatten([
            "padding-12",
            "flex-row",
            "justify-center",
            "items-center",
          ])}
        >
          <View
            style={style.flatten([
              "width-80",
              "height-80",
              "border-radius-64",
              "background-color-secondary",
              "items-center",
              "justify-center",
            ])}
          >
            {icons.length > 0 ? (
              <FastImage
                style={{
                  width: 56,
                  height: 56,
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
          <View
            style={style.flatten([
              "width-48",
              "height-48",
              "items-center",
              "justify-center",
            ])}
          >
            <Image
              source={require("../../assets/image/icon_connect.png")}
              resizeMode="contain"
              style={style.flatten(["width-18", "height-18"])}
            ></Image>
          </View>
          <View
            style={style.flatten([
              "width-80",
              "height-80",
              "border-radius-64",
              "background-color-secondary",
              "items-center",
              "justify-center",
            ])}
          >
            <Image
              source={require("../../assets/image/icon_astra_hub.png")}
              resizeMode="contain"
              style={style.flatten(["width-56", "height-56"])}
            />
          </View>
        </View>
        <Text style={style.flatten(["color-gray-10", "text-center", "h5"])}>
          Liên kết {proposer.metadata.name} với Astra Hub?
        </Text>
        <Text
          style={style.flatten([
            "color-gray-30",
            "text-center",
            "body3",
            "margin-top-8",
          ])}
        >
          {proposer.metadata.url}
        </Text>
        <View
          style={style.flatten([
            "height-116",
            "border-radius-16",
            "border-color-gray-60",
            "background-color-gray-90",
            "border-width-1",
            "margin-top-24",
            "padding-16",
          ])}
        >
          <Text style={style.flatten(["color-gray-30", "subtitle3"])}>
            {proposer.metadata.name} sẽ có quyền
          </Text>
          <View
            style={style.flatten(["flex-row", "items-center", "margin-y-12"])}
          >
            <HomeTabbarIcon
              size={16}
              color={style.get("color-gray-10").color}
            />
            <Text
              style={style.flatten(["color-gray-10", "body3", "margin-left-8"])}
            >
              Xem số dư và hoạt động trong ví của bạn
            </Text>
          </View>
          <View style={style.flatten(["flex-row", "items-center"])}>
            <VerifiedIcon
              height={16}
              color={style.get("color-gray-10").color}
            />
            <Text
              style={style.flatten(["color-gray-10", "body3", "margin-left-8"])}
            >
              Yêu cầu phê duyệt cho các giao dịch
            </Text>
          </View>
        </View>
      </View>
      <View style={style.flatten(["flex-7"])} />
      <View
        style={style.flatten([
          "height-68",
          "margin-bottom-0",
          "margin-x-0",
          "flex-1",
        ])}
      >
        <CardDivider
          style={style.flatten(["background-color-gray-70", "margin-0"])}
        />
        <View
          style={style.flatten([
            "flex-row",
            "justify-center",
            "padding-16",
            "items-center",
          ])}
        >
          <Button
            size="small"
            containerStyle={style.flatten(["margin-right-12", "flex-1", "background-color-gray-70"])}
            text="Từ chối"
            mode="fill"
            onPress={() => 
                smartNavigation.goBack()
            }
          ></Button>
          <Button
            size="small"
            text="Liên kết"
            containerStyle={style.flatten(["flex-1"])}

          ></Button>
        </View>
      </View>
    </PageWithScrollView>
  );
});
