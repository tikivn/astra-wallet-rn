import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text } from "react-native";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { AddressQRCodeItem } from "../components";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";

export const ReceiveScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const style = useStyle();
  const intl = useIntl();

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16"])}
      backgroundColor={style.get("color-background").color}
    >
      <Text
        style={style.flatten([
          "color-text-black-low",
          "text-left",
          "padding-16",
          "body3",
        ])}
      >
        {intl.formatMessage({ id: "wallet.receive.address.guide" })}
      </Text>
      <AddressQRCodeItem
        style={style.flatten(["self-center"])}
        bech32Address={account.bech32Address}
        hexAddress={account.hexAddress}
      />
    </PageWithScrollView>
  );
});
