import { ObservableEnsFetcher } from "@keplr-wallet/ens";
import { EmptyAddressError, ENSFailedToFetchError, ENSIsFetchingError, ENSNotSupportedError, IMemoConfig, InvalidBech32Error, IRecipientConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, Fragment, useMemo } from "react";
import { ViewStyle, StyleSheet, Text, View, TextInput } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useStyle } from "../../../styles";

export const AddressInput: FunctionComponent<{
    recipientConfig: IRecipientConfig;
    memoConfig: IMemoConfig;

}> = observer(
    ({
        recipientConfig,
        memoConfig,
    }) => {

        const style = useStyle();

        const isENSAddress = ObservableEnsFetcher.isValidENS(
            recipientConfig.rawRecipient
        );

        const error = recipientConfig.error;
        const errorText: string | undefined = useMemo(() => {
            if (error) {
                switch (error.constructor) {
                    case EmptyAddressError:
                        // No need to show the error to user.
                        return;
                    case InvalidBech32Error:
                        return "Invalid address";
                    case ENSNotSupportedError:
                        return "ENS not supported";
                    case ENSFailedToFetchError:
                        return "Failed to fetch the address from ENS";
                    case ENSIsFetchingError:
                        return;
                    default:
                        return "Unknown error";
                }
            }
        }, [error]);

        const isENSLoading: boolean = error instanceof ENSIsFetchingError;

        return (
            <React.Fragment>
                <View style={
                    style.flatten(["padding-x-16", "padding-y-12", "flex-row", "background-color-background-secondary", "overflow-hidden", "border-radius-12", "justify-between"])}>
                    <View style={style.flatten(["flex-1", "margin-right-12"])}>
                        <Text style={style.flatten(["color-text-black-low", "text-caption2"])}>Địa chỉ người nhận</Text>
                        <TextInput
                            value={recipientConfig.rawRecipient}
                            onChangeText={(text) => {
                                recipientConfig.setRawRecipient(text);
                            }}
                            numberOfLines={1} style={style.flatten(["width-full", "margin-top-4", "color-white", "body2"])}></TextInput>
                    </View>
                    <View style={style.flatten(["width-24", "height-24", "self-center"])}>
                        <QRCode size={24} value="astra" color="#818DA6" backgroundColor="#1A2033"></QRCode>
                    </View>
                </View>
                <Text style={style.flatten(["margin-top-4", "color-text-black-low", "text-caption2"])}>Lưu ý: nhập chính xác để đảm bảo số Astra được gửi đến đúng địa chỉ.</Text>
            </React.Fragment>
        );
    }
);
