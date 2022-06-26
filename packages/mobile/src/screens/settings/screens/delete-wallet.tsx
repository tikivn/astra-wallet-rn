import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";

import { useSmartNavigation } from "../../../navigation";

import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
    CodeField,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';

export const DeleteWalletScreen: FunctionComponent = observer(() => {
    const style = useStyle();
    const { keyRingStore, keychainStore } = useStore();
    const smartNavigation = useSmartNavigation();

    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInvalidPassword, setIsInvalidPassword] = useState(false);
    const cellCount = 6;

    const submitPassword = async () => {
        setIsLoading(true);
        try {
            await onEnterPassword();
            setIsInvalidPassword(false);
        } catch (e) {
            console.log(e);
            setIsInvalidPassword(true);
        } finally {
            setIsLoading(false);
        }
    };

    const onEnterPassword= async () => {
        const index = keyRingStore.multiKeyStoreInfo.findIndex(
          (keyStore) => keyStore.selected
        );

        if (index >= 0) {
          await keyRingStore.deleteKeyRing(index, password);

          if (keyRingStore.multiKeyStoreInfo.length === 0) {
            await keychainStore.reset();

            smartNavigation.reset({
              index: 0,
              routes: [
                {
                  name: "Unlock",
                },
              ],
            });
          }
        }
    };

    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: cellCount });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });


    return (
        <React.Fragment>
            <View
                style={style.flatten([
                    "absolute-fill",
                    "background-color-background",
                ])}>
            </View>
            <View
                style={style.flatten(["flex-1", "background-color-transparent"])}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={style.flatten(["flex-grow-1", "padding-x-page"])}
                >
                    <View style={style.get("flex-1")} />
                    <Text style={style.flatten(["color-gray-30", "text-caption", "text-center", "margin-bottom-64"])}>Bạn có thể hồi phục lại được ví sau khi xoá nếu bạn đã sao lưu lại cụm từ bí mất.</Text>
                    <View>
                        <CodeField
                            ref={ref}
                            {...props}
                            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setIsLoading(false);
                            }}
                            cellCount={cellCount}
                            rootStyle={style.flatten(["flex-1", "padding-20"])}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({ index, symbol, isFocused }) => (
                                <View style={style.flatten(["items-center", "overflow-hidden", "background-color-gray-80", "width-42", "height-42", "border-width-1", "border-color-gray-80", "border-radius-6"], [isFocused && "border-color-white", isInvalidPassword && "border-color-danger"])}
                                    key={`code-field.cell_${index}`}
                                >
                                    <Text
                                        key={index}
                                        style={style.flatten(["text-center", "h2", "color-white"])}
                                        onLayout={getCellOnLayoutHandler(index)}>
                                        {symbol ? '•' : null}
                                    </Text>
                                </View>
                            )}
                        />
                        <Text style={style.flatten(["color-danger", "text-caption2"])}>{isInvalidPassword ? "Mật khẩu không đúng, vui lòng nhập lại" : null}</Text>
                    </View>
                    <View style={style.get("flex-1")} />
                    <Button
                        containerStyle={style.flatten(["border-radius-4", "height-44"])}
                        textStyle={style.flatten(["subtitle2"])}
                        text="Xoá ví"
                        size="large"
                        loading={isLoading}
                        onPress={submitPassword}
                        disabled={password.length < 6}
                        color="danger"
                    />
                    <View style={style.get("flex-5")} />
                </KeyboardAwareScrollView>
            </View>
        </React.Fragment>
    );
});

