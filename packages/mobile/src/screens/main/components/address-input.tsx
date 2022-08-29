import {
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, ScanIcon } from "../../../components";
import { NormalInput } from "../../../components/input/normal-input";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import Clipboard from "expo-clipboard";

export const AddressInput: FunctionComponent<{
  recipientConfig: IRecipientConfig;
}> = observer(({ recipientConfig }) => {
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (recipientConfig.error?.message && recipientConfig.rawRecipient.length != 0) {
      setErrorText(intl.formatMessage({ id: "component.address.input.error.invalid" }));
    }
    else {
      setErrorText("")
    }
  }, [recipientConfig.error]);

  return (
    <NormalInput
      value={recipientConfig.rawRecipient}
      label={intl.formatMessage({ id: "component.address.input.receiver.label" })}
      error={errorText}
      multiline={true}
      onChangeText={(text) => {
        recipientConfig.setRawRecipient(text);
      }}
      rightView={
        <View style={{ flexDirection: "row", marginLeft: 16, alignSelf: "flex-start" }}>
          <TouchableOpacity
            style={style.flatten([
              "width-24",
              "height-24",
              "self-center",
              "items-center",
            ])}
            onPress={() => {
              smartNavigation.navigateSmart("Camera", {});
            }}
          >
            <ScanIcon size={24} color={"#818DA6"} />
          </TouchableOpacity>
          <Button
            containerStyle={style.flatten(["height-24", "margin-left-8"])}
            size="small"
            mode="text"
            text={intl.formatMessage({ id: "common.text.paste" })}
            onPress={async () => {
              const text = await Clipboard.getStringAsync();
              if (text) {
                recipientConfig.setRawRecipient(text);
              }
            }}
          />
        </View>
      }
      style={{ marginBottom: errorText ? 24 : 0 }}
    />
  );
});
