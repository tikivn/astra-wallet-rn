import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, ImageBackground, SafeAreaView, Text } from "react-native";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { AddressQRCodeItem } from "../components";
import { useStore } from "../../../stores";

export const SwapScreen: FunctionComponent = observer(() => {
    const { chainStore, accountStore } = useStore();
    const account = accountStore.getAccount(chainStore.current.chainId);
    const style = useStyle();

    return (
        <PageWithScrollView
            style={style.flatten(["margin-top-16"])}
            backgroundColor={style.get("color-background").color}
        >
            <Text style={style.flatten(["color-text-black-low", "text-left", "padding-16", "body3"])}>Bạn có thể sao chép địa chỉ này và dán vào ô địa chỉ khi gửi Astra từ nguồn khác vào đây.</Text>
            <AddressQRCodeItem style={style.flatten(["self-center"])} address={account.bech32Address}></AddressQRCodeItem>
        </PageWithScrollView>
    );
});