import { IRecipientConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInputSubmitEditingEventData,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, ScanIcon } from "../../../components";
import { NormalInput } from "../../../components/input/normal-input";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import Clipboard from "expo-clipboard";

export const AddressInput: FunctionComponent<{
  recipientConfig: IRecipientConfig;
  onAddressChanged?: (
    address: string,
    errorText: string,
    isFocus: boolean
  ) => void;
  inputRef?: any;
  onSubmitEditting?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void;
  returnKeyType?: ReturnKeyTypeOptions;
}> = observer(
  ({
    recipientConfig,
    onAddressChanged = (
      address: string,
      errorText: string,
      isFocus: boolean
    ) => {
      console.log(address, errorText, isFocus);
    },
    inputRef,
    onSubmitEditting,
    returnKeyType,
  }) => {
    const style = useStyle();
    const intl = useIntl();
    const smartNavigation = useSmartNavigation();

    const [isFocus, setIsFocus] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [showError, setShowError] = useState(false);

    useEffect(() => {
      let errorText = "";
      if (
        recipientConfig.error?.message &&
        recipientConfig.rawRecipient.length != 0
      ) {
        errorText = intl.formatMessage({
          id: "component.address.input.error.invalid",
        });
      }

      setShowError(!isFocus);
      setErrorText(errorText);

      onAddressChanged(recipientConfig.rawRecipient, errorText, isFocus);
    }, [isFocus, recipientConfig.rawRecipient, recipientConfig.error]);

    return (
      <NormalInput
        value={recipientConfig.rawRecipient}
        label={intl.formatMessage({
          id: "component.address.input.receiver.label",
        })}
        error={showError ? errorText : ""}
        multiline={true}
        onChangeText={(text) => {
          recipientConfig.setRawRecipient(text);
        }}
        onBlur={() => {
          setIsFocus(false);
        }}
        onFocus={() => {
          setIsFocus(true);
        }}
        rightView={
          <View
            style={{
              flexDirection: "row",
              marginLeft: 16,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={style.flatten(["width-24", "height-24"])}
              onPress={() => {
                smartNavigation.navigateSmart("Camera", {});
              }}
            >
              <ScanIcon size={24} />
            </TouchableOpacity>
            <Button
              containerStyle={style.flatten(["margin-left-8"])}
              size="medium"
              mode="ghost"
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
        style={{ marginBottom: showError && errorText ? 24 : 0 }}
        inputRef={inputRef}
        onSubmitEditting={onSubmitEditting}
        returnKeyType={returnKeyType}
      />
    );
  }
);
