import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, View, SafeAreaView } from "react-native";
import { AllIcon, PageWithView } from "../../../components";
import { Colors, useStyle } from "../../../styles";
import { GoogleIcon, MnemonicIcon, TikiIcon } from "./icons";
import { useSmartNavigation } from "../../../navigation-util";
import { InfoIcon } from "../../../components/icon/outlined";
import { RectButton } from "react-native-gesture-handler";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../../stores";
import { useBIP44Option } from "../bip44";

export const RegisterCreateEntryScreen: FunctionComponent = observer(() => {
  const { keyRingStore, socialLoginStore } = useStore();
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();
  const registerConfig = useRegisterConfig(keyRingStore, []);
  const bip44Option = useBIP44Option();

  async function registerWithTiki() {
    await socialLoginStore.openLogin({
      serviceProviderType: "tiki"
    });

    smartNavigation.pushSmart("Register.SetPincode", {
      registerConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  }

  async function registerWithGoogle() {
    await socialLoginStore.openLogin({
      serviceProviderType: "google"
    });

    smartNavigation.pushSmart("Register.SetPincode", {
      registerConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  }

  function registerWithMnemonic() {
    smartNavigation.navigateSmart("Register.Tutorial", {});
  }

  function showConvenientInfo() {

  }

  function showSafeInfo() {

  }

  return (
    <PageWithView disableSafeArea={true} style={style.flatten(["background-color-background", "height-full", "padding-16"])}>
      <SafeAreaView>
        <View style={{ flexDirection: "row", }}>
          <Text style={
            style.flatten(["text-medium-semi-bold", "color-gray-10", "margin-right-8"])
          }>{intl.formatMessage({ id: "register.createEntry.section.convenient" })}</Text>
          <RectButton onPress={showConvenientInfo}>
            <InfoIcon />
          </RectButton>
        </View>
        <EntryItem
          iconType="tiki"
          title={intl.formatMessage({ id: "register.createEntry.item.title.tiki" })}
          onPress={registerWithTiki}
        />
        <EntryItem
          iconType="google"
          title={intl.formatMessage({ id: "register.createEntry.item.title.google" })}
          onPress={registerWithGoogle}
        />
        <View style={{ height: 16, }} />
        <View style={{ flexDirection: "row", }}>
          <Text style={
            style.flatten(["text-medium-semi-bold", "color-gray-10", "margin-right-8"])
          }>{intl.formatMessage({ id: "register.createEntry.section.safe" })}</Text>
          <RectButton onPress={showSafeInfo}>
            <InfoIcon />
          </RectButton>
        </View>
        <EntryItem
          iconType="mnemonic"
          title={intl.formatMessage({ id: "register.createEntry.item.title.mnemonic" })}
          subTitle={intl.formatMessage({ id: "register.createEntry.item.desc.mnemonic" })}
          onPress={registerWithMnemonic}
        />
      </SafeAreaView>
    </PageWithView>
  );
});

export type EntryItemIconType = "tiki" | "google" | "mnemonic";

export const EntryItem: FunctionComponent<{
  iconType: EntryItemIconType,
  title: string,
  subTitle?: string,
  onPress?: () => void
}> = observer(({
  iconType,
  title,
  subTitle,
  onPress,
}) => {
  const styleBuilder = useStyle();

  let Icon;
  switch (iconType) {
    case "google":
      Icon = GoogleIcon;
      break;
    case "mnemonic":
      Icon = MnemonicIcon;
      break;
    default:
      Icon = TikiIcon;
      break;
  }

  return (
    <RectButton
      onPress={onPress}
      style={{
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: Colors["gray-80"],
        flexDirection: "row",
        alignContent: "stretch",
        alignItems: "center"
      }}>
      <Icon />
      <View style={{ flex: 1, marginHorizontal: 12, alignItems: "stretch", }}>
        <Text style={styleBuilder.flatten(["text-base-medium", "color-gray-10"])}>{title}</Text>
        {subTitle && (
          <Text style={
            styleBuilder.flatten([
              "text-small-regular",
              "color-gray-30",
              "margin-top-4",
            ])
          }>
            {subTitle}
          </Text>
        )}
      </View>
      <AllIcon color={styleBuilder.get("color-white").color} />
    </RectButton>
  );
});