import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { Button } from "../../../components";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";

export const TransactionActionView: FunctionComponent<{
  style?: ViewStyle
}> = observer(({ style }) => {
  const { transactionStore } = useStore();
  const styleBuilder = useStyle();
  const intl = useIntl();
  const navigation = useNavigation();

  const [txState, setTxState] = useState(transactionStore.txState);

  useEffect(() => {
    setTxState(transactionStore.txState);
  }, [transactionStore.txState]);

  return (
    <View style={style}>
      <View style={styleBuilder.flatten(["height-1", "background-color-border"])} />
      <View style={{ flexDirection: "row", marginTop: 12, marginHorizontal: 16, }}>
        <Button
          text={intl.formatMessage({ id: "tx.result.action.homepage" })}
          mode={txState == "failure" ? "text" : "fill"}
          containerStyle={styleBuilder.flatten(["flex-1"])}
          onPress={async () => {
            navigation.navigate("NewHome");
          }}
        />
        {txState == "failure" && (<Button
          text={intl.formatMessage({ id: "tx.result.action.reInvest" })}
          containerStyle={styleBuilder.flatten(["margin-left-8", "flex-1"])}
          onPress={async () => {
            navigation.goBack();
          }}
        />)}
      </View>
    </View>
  );
});