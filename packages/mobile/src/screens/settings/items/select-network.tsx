import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState, useMemo } from "react";
import { useStore } from "../../../stores";
import { BottomSheet } from "../../../components/input";
import { AccountItem } from "../components";
import { Text } from "react-native";
import { useStyle } from "../../../styles";
import { AllIcon } from "../../../components/icon";
export const AccountNetworkItem: FunctionComponent<{
  }> = observer(({ }) => {
    const { chainStore } = useStore();
    const style = useStyle();
  
    const [isOpenModal, setIsOpenModal] = useState(false);
    const chainIds =  chainStore.chainInfosInUI.map(
        (chainInfo) => {
            return {
                key: chainInfo.chainId,
                label: chainInfo.chainName,
              };
        }
      )
    return (
      <React.Fragment>
        <BottomSheet
          label="Network"
          isOpen={isOpenModal}
          close={() => setIsOpenModal(false)}
          maxItemsToShow={4}
          selectedKey={chainStore.current.chainId}
          setSelectedKey={(key) => key && chainStore.selectChain(key)}
          items={chainIds}
        />
        <AccountItem
            containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
            label="Network"
            right={
                <RightView paragraph={chainStore.current.chainName.toUpperCase()} />
            }
            onPress={() => {
                setIsOpenModal(true);
          }}
        />
      </React.Fragment>
    );
  });

  export const RightView: FunctionComponent<{
    paragraph?: string;
  }> = ({ paragraph }) => {
    const style = useStyle();
  
    return (
      <React.Fragment>
        {paragraph ? (
          <Text
            style={style.flatten([
              "body3",
              "color-text-black-low",
              "margin-right-16",
            ])}
          >
            {paragraph}
          </Text>
        ) : null}
        <AllIcon
          color={style.get("color-white").color}
        />
      </React.Fragment>
    );
  };