import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { AccountItem } from "../components";
import { AllIcon } from "../../../components/icon";
import { useStore } from "../../../stores";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { getPrivateDataTitle } from "../../setting/screens/view-private-data";
import { useSmartNavigation } from "../../../navigation";
import { useStyle } from "../../../styles";

export const AccountViewPrivateDataItem: FunctionComponent<{
}> = observer(({ }) => {
  const { keyRingStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const style = useStyle();

  return (
    <React.Fragment>
      <AccountItem
        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
        label={'Xem cụm từ bí mật'}
        right={<AllIcon color={style.get("color-white").color}/>}
        onPress={() => {
          setIsOpenModal(true);
        }}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title={getPrivateDataTitle(keyRingStore.keyRingType, true)}
        onEnterPassword={async (password) => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(
            (keyStore) => keyStore.selected
          );

          if (index >= 0) {
            const privateData = await keyRingStore.showKeyRing(index, password);
            smartNavigation.navigateSmart("Setting.ViewPrivateData", {
              privateData,
              privateDataType: keyRingStore.keyRingType,
            });
          }
        }}
      />
    </React.Fragment>
  );
});
