import React, { FunctionComponent, useState } from "react";
import { useStyle } from "../../styles";
import { View, Text } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation-util";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import LottieView from "lottie-react-native";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import delay from "delay";

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const [isLoading, setIsLoading] = useState(false);

  return (
    <View
      style={style.flatten([
        "padding-x-42",
        "height-full",
        "background-color-background",
      ])}
    >
      <View style={style.get("flex-1")} />
      <View style={style.flatten(["items-center"])}>
        <LottieView
          source={require("../../assets/lottie/login_success.json")}
          autoPlay
          loop
          style={style.flatten(["width-300", "flex-grow-1"])}
          resizeMode="cover"
        />
        <Text
          style={style.flatten([
            "text-center",
            "text-button2",
            "color-gray-10",
          ])}
        >
          Tạo tài khoản mới thành công
        </Text>
      </View>
      <View style={style.get("flex-1")} />
      <Button
        containerStyle={style.flatten(["margin-bottom-44"])}
        size="large"
        text="Done"
        loading={isLoading}
        onPress={async () => {
          setIsLoading(true);
          try {
            // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
            // So to make sure that the loading state changes, just wait very short time.
            await delay(10);

            // Definetly, the last key is newest keyring.
            if (keyRingStore.multiKeyStoreInfo.length > 0) {
              await keyRingStore.changeKeyRing(
                keyRingStore.multiKeyStoreInfo.length - 1
              );
            }

            smartNavigation.reset({
              index: 0,
              routes: [
                {
                  name: "MainTabDrawer",
                },
              ],
            });
          } catch (e) {
            console.log(e);
            setIsLoading(false);
          }
        }}
      />
    </View>
  );
});
