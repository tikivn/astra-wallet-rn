import { useRoute, RouteProp } from "@react-navigation/native";
import { SignClientTypes } from "@walletconnect/types";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Image, View, Text } from "react-native";
import {
  Button,
  HomeTabbarIcon,
  PageWithScrollView,
  VerifiedIcon,
  LinkIcon,
} from "../../components";
import { useSmartNavigation } from "../../navigation-util";
import { useStyle } from "../../styles";
import FastImage from "react-native-fast-image";
import { CardDivider } from "../../components/card";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
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

  const { signClientStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const proposal = route.params.proposal;
  const { params } = proposal;
  const { proposer } = params;
  const icons = proposer.metadata.icons;
  const intl = useIntl();
  const onRejectSession = async () => {
    await signClientStore.rejectProposal();
    smartNavigation.goBack();
  };

  const onApproveSession = async () => {
    await signClientStore.approveProposal();
    smartNavigation.goBack();
  };

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
              "background-color-card-background",
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
            <LinkIcon />
          </View>
          <View
            style={style.flatten([
              "width-80",
              "height-80",
              "border-radius-64",
              "background-color-card-background",
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
          {intl.formatMessage(
            { id: "walletconnect.text.connect" },
            { name: proposer.metadata.name }
          )}
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
            "background-color-card-background",
            "border-width-1",
            "margin-top-24",
            "padding-16",
          ])}
        >
          <Text style={style.flatten(["color-gray-30", "subtitle3"])}>
            {intl.formatMessage(
              { id: "walletconnect.permission" },
              { name: proposer.metadata.name }
            )}
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
              {intl.formatMessage({
                id: "walletconnect.permission.showBalance",
              })}
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
              {intl.formatMessage({
                id: "walletconnect.permission.requestTransaction",
              })}
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
            color="neutral"
            containerStyle={style.flatten(["margin-right-12", "flex-1"])}
            text={intl.formatMessage({ id: "common.text.reject" })}
            onPress={onRejectSession}
          />
          <Button
            text={intl.formatMessage({ id: "common.text.connect" })}
            onPress={onApproveSession}
            containerStyle={style.flatten(["flex-1"])}
          />
        </View>
      </View>
    </PageWithScrollView>
  );
});
