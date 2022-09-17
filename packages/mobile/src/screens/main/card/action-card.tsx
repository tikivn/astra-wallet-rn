import { Card, CardBody } from "../../../components/card";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ViewStyle, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { SwapIcon, SendIcon, ReceiveIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation-util";
import { useIntl } from "react-intl";

export const ActionsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const { chainStore, remoteConfigStore } = useStore();
  const intl = useIntl();

  const swapEnabled = remoteConfigStore.getBool("feature_swap_enabled");
  // const swapEnabled = true;

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-y-0"])}>
        <View style={style.flatten(["flex-row", "justify-center"])}>
          <Button
            text={intl.formatMessage({ id: "main.receive" })}
            leftIcon={
              <View style={style.flatten(["margin-right-6", "margin-left-6"])}>
                <ReceiveIcon color={style.get("color-white").color} size={20} />
              </View>
            }
            rightIcon={<View style={style.flatten(["margin-right-12"])} />}
            textStyle={style.flatten(["color-white", "subtitle3"])}
            onPress={() => {
              smartNavigation.navigateSmart("Receive", {});
            }}
          />
          <Button
            containerStyle={style.flatten([
              "margin-left-8",
            ])}
            text={intl.formatMessage({ id: "main.send" })}
            leftIcon={
              <View style={style.flatten(["margin-right-6", "margin-left-6"])}>
                <SendIcon color={style.get("color-white").color} size={20} />
              </View>
            }
            rightIcon={<View style={style.flatten(["margin-right-12"])} />}
            textStyle={style.flatten(["color-white", "subtitle3"])}
            onPress={() => {
              smartNavigation.navigateSmart("Wallet.Send", {
                currency: chainStore.current.stakeCurrency.coinMinimalDenom,
              });
            }}
          />
          {swapEnabled && (
            <Button
              containerStyle={style.flatten([
                "margin-left-8",
              ])}
              text={intl.formatMessage({ id: "main.swap" })}
              leftIcon={
                <View
                  style={style.flatten(["margin-right-6", "margin-left-6"])}
                >
                  <SwapIcon color={style.get("color-white").color} size={20} />
                </View>
              }
              rightIcon={<View style={style.flatten(["margin-right-12"])} />}
              textStyle={style.flatten(["color-white", "subtitle3"])}
              onPress={() => {
                smartNavigation.navigateSmart("Swap.Home", {});
              }}
            />
          )}
        </View>
      </CardBody>
    </Card>
  );
});
