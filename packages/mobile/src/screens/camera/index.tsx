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
import { useSmartNavigation } from "../../navigation-util";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FullScreenCameraView } from "../../components/camera";
import { useFocusEffect } from "@react-navigation/native";
import { useToastModal } from "../../providers/toast-modal";
import { useIntl } from "react-intl";
import { View, Text } from "react-native";
import { isAddress } from "@ethersproject/address";

export const CameraScreen: FunctionComponent = observer(() => {
  const { chainStore, signClientStore } = useStore();
  const toastModal = useToastModal();
  const smartNavigation = useSmartNavigation();
  const style = useStyle();
  const [isLoading, setIsLoading] = useState(false);
  const intl = useIntl();
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
                    return false;
                  }
                  return true;
                })();

                const isHexAddress = isAddress(data);

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
                      title: intl.formatMessage({ id: "camera.qrcode.error" }),
                      type: "error",
                      displayTime: 2000,
                    });
                  }
                } else if (isHexAddress) {
                  smartNavigation.pushSmart("Wallet.Send", {
                    recipient: data,
                  });
                } else {
                  toastModal.makeToast({
                    title: intl.formatMessage({ id: "camera.qrcode.error" }),
                    type: "error",
                    displayTime: 2000,
                  });
                }
              }
              setIsCompleted(true);
            } catch (e) {
              toastModal.makeToast({
                title: intl.formatMessage({ id: "camera.qrcode.error" }),
                type: "error",
                displayTime: 2000,
              });
              console.log(e);
            } finally {
              setIsLoading(false);
            }
          }
        }}
        containerBottom={
          <View style={style.flatten(["flex-1", "width-full", "margin-top-4"])}>
            <Text
              style={style.flatten(["text-center", "color-white", "body3"])}
            >
              {intl.formatMessage({ id: "camera.text.description" })}
            </Text>
          </View>
        }
      />
    </PageWithView>
  );
});
