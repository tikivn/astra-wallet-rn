import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { RNCamera } from "react-native-camera";
import { useStyle } from "../../styles";
import { PageWithView } from "../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSmartNavigation } from "../../navigation";
import { Button } from "../../components/button";
import { Share, StyleSheet, View } from "react-native";
import { registerModal } from "../../modals/base";
import { CardModal } from "../../modals/card";
import { AddressCopyable } from "../../components/address-copyable";
import QRCode from "react-native-qrcode-svg";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FullScreenCameraView } from "../../components/camera";
import { useFocusEffect } from "@react-navigation/native";
import { useToastModal } from "../../providers/toast-modal";

export const CameraScreen: FunctionComponent = observer(() => {
  const { chainStore, signClientStore } = useStore();
  const toastModal = useToastModal();
  const smartNavigation = useSmartNavigation();

  const [isLoading, setIsLoading] = useState(false);

  // To prevent the reading while changing to other screen after processing the result.
  // Expectedly, screen should be moved to other after processing the result.
  const [isCompleted, setIsCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // If the other screen is pushed according to the qr code data,
      // the `isCompleted` state would remain as true because the screen in the stack is not unmounted.
      // So, we should reset the `isComplete` state whenever getting focused.
      setIsCompleted(false);
    }, [])
  );

  useEffect(() => {
    if (signClientStore.pendingProposal) {
      console.log("useEffect: ", signClientStore.pendingProposal);
      smartNavigation.replaceSmart("SessionProposal", {
        proposal: signClientStore.pendingProposal,
      });
    }
  }, [smartNavigation, signClientStore.pendingProposal]);

  return (
    <PageWithView disableSafeArea={true}>
      <FullScreenCameraView
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        captureAudio={false}
        isLoading={isLoading}
        onBarCodeRead={async ({ data }) => {
          if (!isLoading && !isCompleted) {
            setIsLoading(true);
            try {
              if (data.startsWith("wc:")) {
                await signClientStore.pair(data);
              } else {
                const isBech32Address = (() => {
                  try {
                    // Check that the data is bech32 address.
                    // If this is not valid bech32 address, it will throw an error.
                    Bech32Address.validate(data);
                  } catch {
                    toastModal.makeToast({
                      title: "Mã QR hiện không được hỗ trợ",
                      type: "error",
                      displayTime: 2000,
                    });
                    return false;
                  }
                  return true;
                })();

                if (isBech32Address) {
                  const prefix = data.slice(0, data.indexOf("1"));
                  const chainInfo = chainStore.chainInfosInUI.find(
                    (chainInfo) =>
                      chainInfo.bech32Config.bech32PrefixAccAddr === prefix
                  );
                  if (chainInfo) {
                    smartNavigation.pushSmart("Wallet.Send", {
                      chainId: chainInfo.chainId,
                      recipient: data,
                    });
                  } else {
                    toastModal.makeToast({
                      title: "Mã QR hiện không được hỗ trợ",
                      type: "error",
                      displayTime: 2000,
                    });
                  }
                }
              }
              setIsCompleted(true);
            } catch (e) {
              toastModal.makeToast({
                title: "Mã QR hiện không được hỗ trợ",
                type: "error",
                displayTime: 2000,
              });
              console.log(e);
            } finally {
              setIsLoading(false);
            }
          }
        }}
      />
    </PageWithView>
  );
});

export const AddressQRCodeModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  chainId: string;
}> = registerModal(
  observer(({ chainId }) => {
    const { accountStore } = useStore();

    const account = accountStore.getAccount(chainId);

    const style = useStyle();

    return (
      <CardModal title="Scan QR code">
        <View style={style.flatten(["items-center"])}>
          <AddressCopyable address={account.bech32Address} maxCharacters={22} />
          <View style={style.flatten(["margin-y-32"])}>
            {account.bech32Address ? (
              <QRCode size={200} value={account.bech32Address} />
            ) : (
              <View
                style={StyleSheet.flatten([
                  {
                    width: 200,
                    height: 200,
                  },
                  style.flatten(["background-color-disabled"]),
                ])}
              />
            )}
          </View>
          <View style={style.flatten(["flex-row"])}>
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text="Share Address"
              mode="light"
              size="large"
              loading={account.bech32Address === ""}
              onPress={() => {
                Share.share({
                  message: account.bech32Address,
                }).catch((e) => {
                  console.log(e);
                });
              }}
            />
          </View>
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
