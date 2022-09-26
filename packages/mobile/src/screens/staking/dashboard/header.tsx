import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, Image, Text, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { useSmartNavigation } from "../../../navigation-util";
import { FormattedMessage, useIntl } from "react-intl";
import { TextLink } from "../../../components/button/text";
import { useStore } from "../../../stores";

export const DashboardHeader: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const style = useStyle();
  const intl = useIntl();
  const { chainStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const documentUrl = chainStore.getChain(chainStore.current.chainId).raw
    .documentsUrl;
  return (
    <View
      style={style.flatten([
        "flex-row",
        "padding-16",
        "margin-x-0",
        "margin-y-16",
        "justify-between",
      ])}
    >
      <View style={style.flatten(["flex-1", "margin-left-0", "items-start"])}>
        <Text style={style.flatten(["color-white", "h3"])}>
          <FormattedMessage id="staking.dashboard.title" />
        </Text>
        <TextLink
          size="medium"
          onPress={() => {
            if (documentUrl) {
              smartNavigation.navigateSmart("WebView", {
                url: `${documentUrl}/docs/guide/staking`,
              });
            }
          }}
          style={style.flatten(["margin-top-8"])}
        >
          {intl.formatMessage({ id: "staking.dashboard.learnMore" })}
        </TextLink>
      </View>
      <Image
        source={require("../../../assets/image/saving.png")}
        resizeMode="contain"
        style={style.flatten(["height-80", "width-80", "margin-right-0"])}
      />
    </View>
  );
});
