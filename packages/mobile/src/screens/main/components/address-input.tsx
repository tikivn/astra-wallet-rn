import { ObservableEnsFetcher } from "@keplr-wallet/ens";
import {
  EmptyAddressError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  ENSNotSupportedError,
  IMemoConfig,
  InvalidBech32Error,
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import {
  Text,
  View,
  TextInput,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ScanIcon } from "../../../components";
import { useSmartNavigation } from "../../../navigation";
import { useStyle } from "../../../styles";

export const AddressInput: FunctionComponent<{
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
}> = observer(({ recipientConfig, memoConfig }) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();

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
      <View
        style={style.flatten([
          "padding-x-16",
          "padding-y-12",
          "flex-row",
          "background-color-background-secondary",
          "overflow-hidden",
          "border-radius-12",
          "justify-between",
          "items-center",
        ])}
      >
        <View style={style.flatten(["flex-1", "margin-right-12"])}>
          <Text style={style.flatten(["color-text-black-low", "text-caption2"])} >
            <FormattedMessage id="component.address.input.receiver.label"/>
          </Text>
          <TextInput
            value={recipientConfig.rawRecipient}
            onChangeText={(text) => {
              recipientConfig.setRawRecipient(text);
            }}
            numberOfLines={1}
            style={style.flatten([
              "width-full",
              "margin-top-4",
              "color-white",
              "body2",
            ])}
          />
        </View>
        <TouchableOpacity
          style={style.flatten([
            "width-24",
            "height-24",
            "self-center",
            "items-center",
          ])}
          onPress={() => {
            smartNavigation.navigateSmart("Camera", {});
          }}
        >
          <ScanIcon size={24} color={"#818DA6"} />
        </TouchableOpacity>
      </View>
      
      <Text style={style.flatten(["margin-top-4", "color-text-black-low", "text-caption2"])}>
        <FormattedMessage id="component.address.input.warning"/>
      </Text>
    </React.Fragment>
  );
});
