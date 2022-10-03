import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { AccountItem } from "../components";
import { View } from "react-native";
import { BiometricsIcon } from "../../../components/icon";
import { useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { EnableBiometricsModal } from "../components/enable-biometrics-modal";
import { BIOMETRY_TYPE } from "react-native-keychain";
import { Toggle } from "../../../components/toggle";

export const AccountBiometricsItem: FunctionComponent<{
  accountItemProps?: Record<string, unknown>;
}> = observer(({ accountItemProps }) => {
  const intl = useIntl();

  const { keychainStore } = useStore();

  const [isBiometricOn, setIsBiometricOn] = useState(
    keychainStore.isBiometryOn
  );
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    setIsBiometricOn(keychainStore.isBiometryOn);
  }, [keychainStore.isBiometryOn]);

  const tryUnlock = async () => {
    try {
      if (isBiometricOn) {
        await keychainStore.turnOffBiometryWithoutReset();
      } else {
        await keychainStore.turnOnBiometryWithoutPassword();
      }
    } catch (error) {
      console.log("__DEBUG__", error);
      setIsOpenModal(true);
    }
  };

  return (
    <React.Fragment>
      <EnableBiometricsModal
        title=""
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
      />
      <AccountItem
        {...accountItemProps}
        label={intl.formatMessage({
          id:
            keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
            keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID
              ? "settings.unlockBiometrics.face"
              : "settings.unlockBiometrics.touch",
        })}
        right={
          <View style={{ marginRight: 12 }}>
            <Toggle on={isBiometricOn} onChange={tryUnlock} />
          </View>
        }
        left={
          <BiometricsIcon
            type={
              keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
              keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID
                ? "face"
                : "touch"
            }
          />
        }
      />
    </React.Fragment>
  );
});
