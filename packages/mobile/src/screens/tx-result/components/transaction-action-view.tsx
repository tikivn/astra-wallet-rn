import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Button } from "../../../components";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";

export const TransactionActionView: FunctionComponent<{
  style?: ViewStyle
}> = observer(({ style }) => {
  const { transactionStore } = useStore();
  const styleBuilder = useStyle();
  const navigation = useNavigation();

  const [txState, setTxState] = useState(transactionStore.txState);

  useEffect(() => {
    setTxState(transactionStore.txState);
  }, [transactionStore.txState]);

  return (
    <View style={style}>
      <View style={{ height: 1, backgroundColor: Colors["gray-70"], }} />
      <View style={{ flexDirection: "row", marginTop: 8, marginHorizontal: 16, }}>
        <Button
          text="Trang chủ"
          size="large"
          mode={txState == "failure" ? "text" : "fill"}
          containerStyle={styleBuilder.flatten(["border-width-1", "border-color-button-primary", "border-radius-4", "flex-1"])}
          textStyle={styleBuilder.flatten(["subtitle2"])}
          onPress={async () => {
            navigation.navigate("NewHome");
          }}
        />
        {txState == "failure" && (<Button
          text="Đầu tư lại"
          size="large"
          containerStyle={styleBuilder.flatten(["margin-left-8", "border-radius-4", "flex-1"])}
          textStyle={styleBuilder.flatten(["subtitle2"])}
          onPress={async () => {
            navigation.goBack();
          }}
        />)}
      </View>
    </View>
  );
});