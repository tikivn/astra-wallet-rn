import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { Card, CardBody } from "../../../components/card";
import { ReceiveIcon, SendIcon, SwapIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const ActionsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const { chainStore, remoteConfigStore } = useStore();
  const intl = useIntl();

  const swapEnabled = remoteConfigStore.getBool("feature_swap_enabled");

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-y-0"])}>
        <View style={style.flatten(["flex-row", "justify-center"])}>
          <Button
            text={intl.formatMessage({ id: "main.receive" })}
            leftIcon={
              <ReceiveIcon color={style.get("color-white").color} size={20} />
            }
            onPress={() => {
              smartNavigation.navigateSmart("Receive", {});
            }}
          />
          <Button
            containerStyle={style.flatten(["margin-left-8"])}
            text={intl.formatMessage({ id: "main.send" })}
            leftIcon={
              <SendIcon color={style.get("color-white").color} size={20} />
            }
            onPress={() => {
              smartNavigation.navigateSmart("Wallet.Send", {
                currency: chainStore.current.stakeCurrency.coinMinimalDenom,
              });
            }}
          />
          {swapEnabled && (
            <Button
              containerStyle={style.flatten(["margin-left-8"])}
              text={intl.formatMessage({ id: "main.swap" })}
              leftIcon={
                <SwapIcon color={style.get("color-white").color} size={20} />
              }
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
