import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text } from "react-native";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { AddressCopyableItem } from "../../../components/address-copyable-new";
import { RectButton } from "../../../components/rect-button";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";
import Svg, { Path } from "react-native-svg";

export const SettingsAccountItem: FunctionComponent = observer(() => {
  const style = useStyle();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();
  const { keyRingStore } = useStore();

  return (
    <React.Fragment>
      <RectButton
        style={style.flatten([
          "padding-left-12",
          "padding-right-8",
          "padding-y-2",
          "background-color-transparent",
          "flex-row",
          "items-center",
          "justify-center",
        ])}
        onPress={() => {
          smartNavigation.navigateSmart("SettingSelectAccount", {});
        }}
        rippleColor={style.get("color-transparent").color}
        underlayColor={style.get("color-transparent").color}
        activeOpacity={1}
      >
        <Text
          style={style.flatten([
            "text-2x-large-semi-bold",
            "color-white",
            "text-center",
            "padding-right-10",
          ])}
        >
          {keyRingStore.multiKeyStoreInfo
            .filter((keyStore) => {
              return keyStore.type === "mnemonic";
            })
            .map((keyStore) => {
              return keyStore.meta?.name;
            }) || intl.formatMessage({ id: "settings.text.myWallet" })}
        </Text>
        {/* <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.6627 0C12.9732 0 12.312 0.273824 11.8245 0.761255L1.09292 11.4928C0.945546 11.6402 0.8479 11.8299 0.813636 12.0355L0.0136187 16.8356C-0.0394742 17.1542 0.0645449 17.4787 0.292906 17.7071C0.521267 17.9355 0.845854 18.0395 1.16441 17.9864L5.96451 17.1864C6.1701 17.1521 6.35984 17.0545 6.50722 16.9071L17.2388 6.17555C17.7262 5.68797 18 5.02676 18 4.33733C18 3.64789 17.7261 2.98658 17.2387 2.499L15.5009 0.761255C15.0133 0.273823 14.3521 0 13.6627 0ZM12.4141 2.99999L13.2385 2.17568C13.351 2.06326 13.5036 2 13.6627 2C13.8217 2 13.9744 2.06326 14.0869 2.17568L15.8244 3.91321C15.9369 4.02572 16 4.17827 16 4.33733C16 4.49639 15.9368 4.64904 15.8243 4.76155L15 5.58587L12.4141 2.99999ZM10.9999 4.41421L2.73374 12.6804L2.21656 15.7834L5.31961 15.2663L13.5858 7.00008L10.9999 4.41421Z"
            fill="#818DA6" />
        </Svg> */}
      </RectButton>
      {/* <AddressCopyableItem address={account.bech32Address} maxCharacters={22} /> */}
    </React.Fragment>
  );
});
