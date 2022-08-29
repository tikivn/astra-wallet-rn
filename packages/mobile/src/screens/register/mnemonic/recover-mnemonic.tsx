import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useStyle } from "../../../styles";
import { useSmartNavigation } from "../../../navigation-util";
import { Controller, useForm } from "react-hook-form";
import { TextInput } from "../../../components/input";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/button";
import Clipboard from "expo-clipboard";
import { Buffer } from "buffer/";
import { useBIP44Option } from "../bip44";
import { useNewMnemonicConfig } from "./hook";
import { useIntl } from "react-intl";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

function isPrivateKey(str: string): boolean {
  if (str.startsWith("0x")) {
    return true;
  }

  if (str.length === 64) {
    try {
      return Buffer.from(str, "hex").length === 32;
    } catch {
      return false;
    }
  }
  return false;
}

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map((word) => word.trim())
    .filter((word) => word.trim().length > 0);
  return words.join(" ");
}

interface FormData {
  mnemonic: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export const RecoverMnemonicScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const style = useStyle();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option();
  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const submit = handleSubmit(async () => {
    setIsCreating(true);

    const mnemonic = trimWordsStr(getValues("mnemonic"));
    newMnemonicConfig.setMnemonic(mnemonic);
    smartNavigation.navigateSmart("Register.SetPincode", {
      registerType: "recover",
      registerConfig,
      bip44HDPath: bip44Option.bip44HDPath,
      mnemonic: newMnemonicConfig.mnemonic,
    });
    setIsCreating(false);
  });

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <View style={{ height: 24 }} />
      <View style={style.flatten(["padding-x-page"])}>
        <Text style={style.flatten([
          "text-medium-medium",
          "color-gray-10",
        ])}>
          {intl.formatMessage({ id: "recover.wallet.mnemonicInput.label" })}
        </Text>
        <Text style={style.flatten([
          "text-small-regular",
          "color-gray-30",
          "margin-top-4"
        ])}>
          {intl.formatMessage({ id: "recover.wallet.mnemonicInput.info" })}
        </Text>
        <Controller
          control={control}
          rules={{
            required: intl.formatMessage({ id: "common.text.mnemonic.isRequired" }),
            validate: (value: string) => {
              value = trimWordsStr(value);
              if (!isPrivateKey(value)) {
                if (value.split(" ").length < 8) {
                  return intl.formatMessage({ id: "common.text.mnemonic.tooShort" });
                }

                if (!bip39.validateMnemonic(value)) {
                  return intl.formatMessage({ id: "common.text.mnemonic.invalid" });
                }
              } else {
                value = value.replace("0x", "");
                if (value.length !== 64) {
                  return intl.formatMessage({ id: "common.text.privateKey.invalidLength" });
                }

                try {
                  if (
                    Buffer.from(value, "hex").toString("hex").toLowerCase() !==
                    value.toLowerCase()
                  ) {
                    return intl.formatMessage({ id: "common.text.privateKey.invalid" });
                  }
                } catch {
                  return intl.formatMessage({ id: "common.text.privateKey.invalid" });
                }
              }
            },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => {
            return (
              <TextInput
                labelStyle={style.flatten(["color-text-black-low", "body3"])}
                returnKeyType="done"
                blurOnSubmit={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                multiline={true}
                numberOfLines={4}
                // containerStyle={{ paddingBottom: errors.mnemonic?.message ? 28 : 0 }}
                inputContainerStyle={style.flatten([
                  "padding-x-20",
                  "padding-y-16",
                  "background-color-background-secondary",
                  isFocused ? "border-color-blue-70" : "border-color-gray-60",
                  "border-radius-12",
                  "margin-top-12",
                ])}
                bottomInInputContainer={
                  <View style={style.flatten(["flex-row"])}>
                    <View style={style.flatten(["flex-1"])} />
                    <Button
                      containerStyle={style.flatten(["height-36"])}
                      style={style.flatten(["padding-x-12"])}
                      mode="text"
                      text={intl.formatMessage({ id: "common.text.paste" })}
                      onPress={async () => {
                        const text = await Clipboard.getStringAsync();
                        if (text) {
                          setValue("mnemonic", text, {
                            shouldValidate: true,
                          });

                          setFocus("name");
                        }
                      }}
                    />
                  </View>
                }
                style={StyleSheet.flatten([
                  style.flatten([
                    "h6",
                    "color-text-gray",
                    "background-color-background-secondary",
                  ]),
                  {
                    minHeight: 20 * 4,
                    textAlignVertical: "top",
                  },
                ])}
                onSubmitEditing={() => {
                  setFocus("name");
                }}
                error={errors.mnemonic?.message}
                onBlur={() => {
                  onBlur();
                  setIsFocused(false);
                }}
                onFocus={() => {
                  setIsFocused(true);
                }}
                onChangeText={onChange}
                value={value}
                ref={ref}
              />
            );
          }}
          name="mnemonic"
          defaultValue=""
        />
      </View>
      <View style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}>
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <Button
          text={intl.formatMessage({ id: "common.text.verify" })}
          loading={isCreating}
          onPress={submit}
          containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
        />
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
