import React, { FunctionComponent, useState } from "react";
import { PageWithScrollView } from "../../../components/page";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useStyle } from "../../../styles";
import { useSmartNavigation } from "../../../navigation";
import { Controller, useForm } from "react-hook-form";
import { TextInput } from "../../../components/input";
import { StyleSheet, View } from "react-native";
import { Button } from "../../../components/button";
import Clipboard from "expo-clipboard";
import { useStore } from "../../../stores";
import { Buffer } from "buffer/";
import { useBIP44Option } from "../bip44";
import { useNewMnemonicConfig } from "./hook";

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

  const submit = handleSubmit(async () => {
    setIsCreating(true);

    const mnemonic = trimWordsStr(getValues("mnemonic"));
    newMnemonicConfig.setMnemonic(mnemonic);
    smartNavigation.navigateSmart("Register.SetPincode", {
      registerConfig,
      newMnemonicConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  });

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      <Controller
        control={control}
        rules={{
          required: "Mnemonic is required",
          validate: (value: string) => {
            value = trimWordsStr(value);
            if (!isPrivateKey(value)) {
              if (value.split(" ").length < 8) {
                return "Too short mnemonic";
              }

              if (!bip39.validateMnemonic(value)) {
                return "Invalid mnemonic";
              }
            } else {
              value = value.replace("0x", "");
              if (value.length !== 64) {
                return "Invalid length of private key";
              }

              try {
                if (
                  Buffer.from(value, "hex").toString("hex").toLowerCase() !==
                  value.toLowerCase()
                ) {
                  return "Invalid private key";
                }
              } catch {
                return "Invalid private key";
              }
            }
          },
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              labelStyle={style.flatten(["color-text-black-low", "body3"])}
              label="Khôi phục tài khoản đã có bằng cách nhập cụm từ bí mật vào ô bên dưới"
              returnKeyType="next"
              multiline={true}
              numberOfLines={4}
              inputContainerStyle={style.flatten([
                "padding-x-20",
                "padding-y-16",
                "background-color-background-secondary",
                "border-width-0",
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
                    text="Paste"
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
                style.flatten(["h6", "color-text-gray", "background-color-background-secondary"]),
                {
                  minHeight: 20 * 4,
                  textAlignVertical: "top",
                },
              ])}
              onSubmitEditing={() => {
                setFocus("name");
              }}
              error={errors.mnemonic?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="mnemonic"
        defaultValue=""
      />
      <View style={style.flatten(["flex-1"])} />
      <Button 
        containerStyle={style.flatten(["border-radius-4", "height-44"])}
        textStyle={style.flatten(["subtitle2"])}
        text="Xác nhận"
        size="large" loading={isCreating} onPress={submit} />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
