import React, { FunctionComponent, useEffect, useState } from "react";
import { View, Image, Text } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { CollapseIcon, ExpandIcon } from "../../../components";
import { CardDivider } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Button } from "../../../components";
import { FormattedMessage, useIntl } from "react-intl";
import FastImage from "react-native-fast-image";

export const TransactionSignRequestView: FunctionComponent<{
  onApprove: (name?: string) => void;
  onReject: (name?: string, isWC?: boolean) => void;
}> = ({ onApprove, onReject }) => {
  const { signInteractionStore, signClientStore } = useStore();

  const [isWC, setIsWC] = useState(false);

  useEffect(() => {
    const pendingRequest = signClientStore.pendingRequest;
    const requestSession = signClientStore.requestSession(
      pendingRequest?.topic
    );
    if (pendingRequest && requestSession) {
      setIsWC(true);
    }
  }, [signClientStore]);

  const waitingData = signInteractionStore.waitingData;
  const request = signClientStore.pendingRequest;
  const session = signClientStore.requestSession(request?.topic);
  
  const metadata = session?.peer.metadata;

  const data = waitingData?.data;

  const [isOpen, setIsOpen] = useState(false);
  const style = useStyle();
  const signDocWrapper = data?.signDocWrapper;
  const msgs = signDocWrapper
    ? signDocWrapper.mode === "amino"
      ? signDocWrapper.aminoSignDoc.msgs
      : signDocWrapper.protoSignDoc.txMsgs
    : [];

  const messsages = JSON.stringify(msgs, null, 2);
  const source = isWC ? session?.peer.metadata.name : data?.msgOrigin;
  
  const intl = useIntl();
  return (
    <React.Fragment>
      <View style={style.flatten(["padding-x-16", "flex", "margin-top-20"])}>
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
            {metadata && metadata.icons.length > 0 ? (
              <FastImage
                style={{
                  width: 64,
                  height: 64,
                }}
                source={{
                  uri: metadata.icons[0],
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <Image
                source={require("../../../assets/image/icon_verified.png")}
                resizeMode="contain"
                style={style.flatten(["width-64", "height-64"])}
              />
            )}
          </View>
        </View>
        <Text style={style.flatten(["color-gray-10", "text-center", "h5"])}>
          {intl.formatMessage(
            { id: "walletconnect.text.verify" },
            { name: source }
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
          {source}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setIsOpen(!isOpen);
          }}
          style={style.flatten([
            "flex-row",
            "justify-center",
            "items-center",
            "margin-16",
          ])}
        >
          <Text style={style.flatten(["color-blue-70", "subtitle3"])}>
            <FormattedMessage
              id={
                isOpen
                  ? "walletconnect.action.hide"
                  : "walletconnect.action.show"
              }
            />
          </Text>
          {isOpen ? (
            <CollapseIcon size={20} color={style.get("color-blue-70").color} />
          ) : (
            <ExpandIcon size={20} color={style.get("color-blue-70").color} />
          )}
        </TouchableOpacity>
      </View>
      {isOpen ? (
        <View
          style={style.flatten([
            "flex",
            "border-radius-16",
            "border-color-gray-60",
            "background-color-gray-90",
            "border-width-1",
            "margin-x-16",
            "padding-16",
            "max-height-276",
          ])}
        >
          <ScrollView style={style.flatten(["flex-0"])}>
            <Text style={style.flatten(["color-gray-10", "body3", "flex-0"])}>
              {messsages}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <View style={style.flatten(["flex-1"])} />
      )}
      <View style={style.flatten(["flex-7"])} />
      <View style={style.flatten(["margin-bottom-0", "margin-x-0", "flex"])}>
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
            containerStyle={style.flatten([
              "margin-right-12",
              "flex-1",
              "background-color-gray-70",
            ])}
            text={intl.formatMessage({ id: "common.text.reject" })}
            mode="fill"
            onPress={async () => {
              onReject(source, isWC);
            }}
          />
          <Button
            size="small"
            text={intl.formatMessage({ id: "common.text.verify" })}
            onPress={async () => {
              onApprove(source);
            }}
            containerStyle={style.flatten(["flex-1"])}
          />
        </View>
      </View>
    </React.Fragment>
  );
};
