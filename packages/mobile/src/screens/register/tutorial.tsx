import React, { FunctionComponent } from "react";
import { PageWithView } from "../../components/page";
import { useStyle } from "../../styles";
import { View, Text } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import { observer } from "mobx-react-lite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PrivacyIcon from "../../assets/svg/privacy.svg";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";

export const RegisterTutorialcreen: FunctionComponent = observer(() => {

  const style = useStyle();
  const intl = useIntl();

  const { keyRingStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const registerConfig = useRegisterConfig(keyRingStore, []);

  return (
    <PageWithView disableSafeArea={true} style={style.flatten(["background-color-background", "height-full", "padding-16"])}>
      <View style={style.get("flex-1")} />
      <View style={style.flatten(["items-center"])}>
        <PrivacyIcon width={122} height={122} />
        <Text
          style={style.flatten([
            "h4",
            "color-gray-10",
            "margin-top-18",
          ])}
        >Sao lưu tài khoản
        </Text>
        <Text style={style.flatten(["color-gray-10", "body3", "flex", "margin-top-12"])}>
          <Text>Bước này nhằm mục đích dễ dàng khôi phục tài khoản sau này trong các trường hợp:{"\n"}</Text>
          <Text style={style.flatten(["h7"])}>{'\u2022'} mất tài khoản{"\n"}</Text>
          <Text style={style.flatten(["h7"])}>{'\u2022'} chuyển đổi thiết bị sử dụng{"\n\n"}</Text>
          <Text>Thông tin tài khoản được lưu ở thiết bị này. Khi đăng nhập lại trên thiết bị khác, bạn phải khôi phục lại tài khoản để sử dụng.</Text>
        </Text>
      </View>
      <View style={style.flatten(["flex-1", "margin-bottom-12"])} />
      <View style={style.flatten(["flex-1", "margin-bottom-12"])} />
      <View style={style.flatten(["flex-1", "margin-bottom-12"])} />

      <View style={style.flatten(["flex-1", "margin-bottom-12"])} >
        <Button
          containerStyle={style.flatten(["border-radius-4", "background-color-primary", "height-44"])}
          textStyle={style.flatten(["subtitle2"])}
          size="large"
          text={intl.formatMessage({ id: "common.text.backupNow" })}
          onPress={() => {
            smartNavigation.navigateSmart("Register.NewMnemonic", {
              registerConfig,
            });
          }}
        />
      </View>
    </PageWithView>
  );
});
