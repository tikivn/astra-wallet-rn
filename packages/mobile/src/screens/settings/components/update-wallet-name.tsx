import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { CloseLargeIcon } from "../../../components/icon/outlined/navigation";
import { NormalInput } from "../../../components/input/normal-input";
import { registerModal } from "../../../modals/base";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const UpdateWalletNameModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  value?: string;
}> = registerModal(({ close, value = "" }) => {
  const styleBuilder = useStyle();
  const intl = useIntl();
  const { keyRingStore } = useStore();

  const [name, setName] = useState(value);

  async function updateName() {
    const index = keyRingStore.multiKeyStoreInfo.findIndex((keyStore) => {
      return keyStore.selected;
    });
    await keyRingStore.updateNameKeyRing(index, name);
    close();
  }

  return (
    <View style={styleBuilder.flatten(["height-full", "justify-center"])}>
      <View style={styleBuilder.flatten([
        "margin-x-page",
        "content-stretch",
        "items-stretch",
        "background-color-card-background",
        "border-color-card-border",
        "border-width-1",
        "border-radius-8",
      ])}>
        <View style={{
          flexDirection: "row",
          alignContent: "stretch",
          alignItems: "center"
        }}>
          <Text style={{
            ...styleBuilder.flatten([
              "flex-1",
              "text-medium-medium",
              "color-gray-10",
              "margin-left-16"
            ]),
            marginVertical: 12,
          }}>{intl.formatMessage({ id: "common.text.updateWalletName" })}</Text>
          <TouchableOpacity
            onPress={close}
            style={{ marginRight: 12 }}>
            <CloseLargeIcon size={24} color={styleBuilder.get("color-gray-10").color} />
          </TouchableOpacity>
        </View>
        <View style={styleBuilder.flatten([
          "height-1",
          "background-color-border",
        ])} />
        <NormalInput
          value={name}
          onChangeText={setName}
          style={{
            marginHorizontal: 16,
            marginVertical: 12
          }} />
        <View style={styleBuilder.flatten([
          "height-1",
          "background-color-border",
        ])} />
        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "stretch",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <Button
            mode="outline"
            text={intl.formatMessage({ id: "common.text.cancel" })}
            onPress={close}
            containerStyle={{ flex: 1 }} />
          <Button
            text={intl.formatMessage({ id: "common.text.save" })}
            onPress={updateName}
            disabled={name.length == 0}
            containerStyle={{
              flex: 1,
              marginLeft: 8,
            }} />
        </View>
      </View>
      <AvoidingKeyboardBottomView />
    </View>
  );
});