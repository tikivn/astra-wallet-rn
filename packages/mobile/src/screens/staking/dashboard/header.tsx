import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, Text, ViewStyle, StyleSheet } from "react-native";
import { useStyle } from "../../../styles";
import { useSmartNavigation } from "../../../navigation-util";
import { FormattedMessage, useIntl } from "react-intl";
import { TextLink } from "../../../components/button";
import { useStore } from "../../../stores";
import { SavingIcon } from "../../../components";

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
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "padding-x-16",
          "margin-x-0",
          "justify-between",
        ]),
        containerStyle,
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
      <View style={style.flatten(["margin-right-0"])}>
        <SavingIcon />
      </View>
    </View>
  );
});
