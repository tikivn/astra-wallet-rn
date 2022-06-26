import React, { FunctionComponent } from "react";
import { useHeaderHeight } from "@react-navigation/stack";
import { PageWithScrollView } from "../../components/page";
import { useStyle } from "../../styles";
import { View, Dimensions, ImageBackground, Image,Text } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SignClient as SignClientV2 } from "@walletconnect/sign-client";

export const RegisterIntroScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;

  return (
    <View style={style.get("background-color-background")}>
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../assets/logo/main_background.png")}
        resizeMode="contain">
        <PageWithScrollView
          backgroundColor={style.get("color-transparent").color}
          contentContainerStyle={style.get("flex-grow-1")}
          style={{
            ...style.flatten(["padding-x-42"]),
            paddingTop: Dimensions.get("window").height * 0.22 - actualHeightHeight,
            // paddingBottom: Dimensions.get("window").height * 0.11,
          }}
        >
          <View
            style={style.flatten(["flex-grow-1", "items-center", "padding-x-18"])}
          >
            <Image 
              resizeMode='contain'
              source={require("../../assets/logo/Astra.png")} />
              <Text style={style.flatten(["color-white", "title3", "text-center"])}>Astra Wallet</Text>
              <Text style={style.flatten(["color-white", "text-caption", "padding-top-4", "text-center"])}>Nơi an toàn để lưu giữ Astra của bạn</Text>
          </View>

          <Button
            textStyle={style.flatten(["subtitle2", "color-background"])}
            containerStyle={style.flatten(["margin-bottom-16", "border-radius-52"])}
            text="Init sign client"
            size="large"
            mode="light"
            onPress={() => { 
              initWalletSignClient(); 
            }}
          />

          <Button
            textStyle={style.flatten(["subtitle2", "color-background"])}
            containerStyle={style.flatten(["margin-bottom-16", "border-radius-52"])}
            text="Bắt đầu"
            size="large"
            mode="light"
            onPress={() => {
              smartNavigation.navigateSmart("Register.Tutorial", {})
            }}
          />
          <Button
            textStyle={style.flatten(["subtitle2", "color-white"])}
            containerStyle={style.flatten(["margin-bottom-16", "border-radius-52", "background-color-transparent", "border-color-border-white"])}
            text="Khôi phục tài khoản đã có"
            size="large"
            mode="outline"
            onPress={() => {
              smartNavigation.navigateSmart("Register.RecoverMnemonic", {
                registerConfig,
              });
            }}
          />
        </PageWithScrollView>
      </ImageBackground>
    </View>
  );
});

const initWalletSignClient = (): Promise<any> => {
  console.log(`initWalletSignClient clicked`);
  return SignClientV2.init({
    projectId: "fcdca68497e7ccee9cccb18fcf2e38f7",
  })
  .then((client) => {
    console.log(`initWalletSignClient got client ${client}.`);
    if (client == undefined) return;
    let {
      protocol, version, name, metadata,
      core, engine, events, pairing, session, proposal, history, expirer
     } = client ;
    console.log(`initWalletSignClient got protocol=${protocol}. version=${version}. name=${name}.`);
    console.log(`initWalletSignClient got METADATA=${Object.entries(metadata)}.`);
    console.log(`initWalletSignClient got CORE=${Object.entries(core)}.`);
  }).catch((e) => {
    console.log(`initWalletSignClient got err ${e}`);
  });
};
