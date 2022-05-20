import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { AccountItem } from "../components";
import { useStyle } from "../../../styles";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
import { useNavigation } from "@react-navigation/native";

export const AccountSignoutItem: FunctionComponent<{
}> = observer(({ }) => {
  const { keychainStore, keyRingStore, analyticsStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <AccountItem
        label="Xoá ví"
        onPress={() => {
          setIsOpenModal(true);
        }}
        containerStyle={style.flatten(["margin-left-16", "margin-right-16", "border-radius-8", "overflow-hidden"])}
        labelStyle={style.flatten(["body3", "color-danger"])}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title="Xoá ví"
        onEnterPassword={async (password) => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(
            (keyStore) => keyStore.selected
          );

          if (index >= 0) {
            await keyRingStore.deleteKeyRing(index, password);
            analyticsStore.logEvent("Account removed");

            if (keyRingStore.multiKeyStoreInfo.length === 0) {
              await keychainStore.reset();

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Unlock",
                  },
                ],
              });
            }
          }
        }}
      />
    </React.Fragment>
  );
});
