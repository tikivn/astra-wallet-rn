import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../../components";
import { CloseLargeIcon } from "../../../components/icon/outlined/navigation";
import { NormalInput } from "../../../components/input/normal-input";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";

export const UpdateWalletName: FunctionComponent = observer(() => {
  const styleBuilder = useStyle();
  const intl = useIntl();
  const { keyRingStore } = useStore();

  const [name, setName] = useState("");

  // useEffect(() => {

  // }, [name]);

  async function updateName() {
    const index = keyRingStore.multiKeyStoreInfo.findIndex((keyStore) => {
      return keyStore.selected;
    });
    await keyRingStore.updateNameKeyRing(index, name);
    dismiss();
  }

  function dismiss() {

  }

  return (
    <View style={{
      marginHorizontal: 16,
      alignContent: "stretch",
      alignItems: "stretch",
      backgroundColor: Colors["gray-90"],
      borderColor: Colors["gray-60"],
      borderWidth: 1,
      borderRadius: 8,
    }}>
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
          onPress={dismiss}
          style={{ marginRight: 12 }}>
          <CloseLargeIcon size={24} color={Colors["gray-10"]} />
        </TouchableOpacity>
      </View>
      <View style={{
        backgroundColor: Colors["gray-70"],
        height: 1
      }} />
      <NormalInput
        value={name}
        onChangeText={setName}
        style={{
          marginHorizontal: 16,
          marginVertical: 12
        }} />
      <View style={{
        backgroundColor: Colors["gray-70"],
        height: 1
      }} />
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
          onPress={dismiss}
          containerStyle={{ flex: 1 }} />
        <Button
          mode="fill"
          text={intl.formatMessage({ id: "common.text.save" })}
          onPress={updateName}
          disabled={name.length == 0}
          containerStyle={{
            flex: 1,
            marginLeft: 8,
          }} />
      </View>
    </View>
  );
});