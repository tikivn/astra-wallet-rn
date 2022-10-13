import React, { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useStyle } from "../../styles";
import {
  INITIAL_ALLOWED_SLIPPAGE,
  SLIPPAGE_TOLERANCE,
} from "../../utils/for-swap";
import { AvoidingKeyboardBottomView } from "../avoiding-keyboard/avoiding-keyboard-bottom";
import { Button } from "../button";
import { BottomSheetSwap, BottomSheetSwapProps } from "./bottom-sheet-swap";

export interface SlippageInputProps extends BottomSheetSwapProps {
  onSelectValue: (value: number) => void;
}

export const SlippageInput = ({
  onSelectValue,
  ...props
}: SlippageInputProps) => {
  const style = useStyle();
  const intl = useIntl();
  const [selectedValue, setSelectedValue] = useState<number>(
    INITIAL_ALLOWED_SLIPPAGE
  );
  const [inputValue, setInputValue] = useState<string>("");

  const [error, setError] = useState("");
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const inputRef = useRef<TextInput | null>(null);

  const handleTextInputFocus = useCallback(() => {
    setSelectedValue(0);
    setIsFocus(true);
  }, []);
  const handleChangeTextInput = useCallback((value) => {
    setSelectedValue(0);
    setInputValue(value);
  }, []);

  const handleSelectValue = useCallback((value) => {
    setSelectedValue(value);
    setError("");
    setInputValue("");
    setIsFocus(false);
    inputRef.current && inputRef.current.blur();
  }, []);

  const handleClear = useCallback(() => {
    setSelectedValue(INITIAL_ALLOWED_SLIPPAGE);
    setInputValue("");
    setError("");
    onSelectValue(INITIAL_ALLOWED_SLIPPAGE);
    props.close && props.close();
  }, [onSelectValue, props]);

  const handleConfirmValue = useCallback(
    (value) => {
      onSelectValue(value);
      setError("");
      props.close && props.close();
    },
    [onSelectValue, props]
  );

  const handleConfirm = useCallback(() => {
    if (selectedValue) {
      handleConfirmValue(selectedValue);
    }

    if (selectedValue === 0) {
      let errorKey = "";

      const value = parseInt(inputValue, 10);
      if (isNaN(value)) {
        errorKey = "swap.slippage.input.invalid.value";
      } else if (value < 1) {
        errorKey = "swap.slippage.input.minvalue";
      } else if (value > 10) {
        errorKey = "swap.slippage.input.maxvalue";
      }
      if (errorKey) {
        setError(intl.formatMessage({ id: errorKey }));
      } else {
        handleConfirmValue(value * 100);
      }
    }
  }, [handleConfirmValue, inputValue, selectedValue]);
  return (
    <BottomSheetSwap {...props}>
      <View
        style={StyleSheet.flatten([
          {
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: style.get("color-border").color,
          },
          style.flatten(["padding-y-24", "padding-x-16"]),
        ])}
      >
        <Text style={style.flatten(["color-gray-30", "text-caption"])}>
          {intl.formatMessage({ id: "swap.slippage.input.caption" })}
        </Text>
        <View
          style={style.flatten(["margin-top-16", "flex-row", "flex-nowrap"])}
        >
          {SLIPPAGE_TOLERANCE.map((value) => (
            <TouchableOpacity
              style={style.flatten([
                selectedValue !== value
                  ? "background-color-gray-80"
                  : "background-color-primary",
                "border-radius-8",
                "padding-x-12",
                "padding-y-8",
                "items-center",
                "justify-center",
                "margin-right-8",
              ])}
              key={value}
              onPress={() => handleSelectValue(value)}
            >
              <Text style={style.flatten(["color-gray-10", "text-caption"])}>
                {value / 100}%
              </Text>
            </TouchableOpacity>
          ))}
          <View
            style={style.flatten([
              "flex-1",
              "height-36",
              "width-full",
              "background-color-gray-90",
              "border-width-1",
              "border-radius-8",
              "padding-x-12",
              "padding-y-8",
              "text-caption-center",
              "self-center",
              "flex-row",
              "items-center",
              isFocus
                ? "border-color-primary"
                : error
                ? "border-color-red-50"
                : "border-color-gray-70",
            ])}
          >
            <TextInput
              ref={inputRef}
              style={style.flatten([
                "color-gray-10",
                "flex-1",
                "background-color-transparent",
              ])}
              placeholderTextColor={style.get("color-label-text-2").color}
              placeholder="1 - 10"
              value={inputValue}
              onChangeText={handleChangeTextInput}
              keyboardType="numeric"
              onFocus={handleTextInputFocus}
              selectionColor={style.get("color-label-text-1").color}
            />

            <Text
              style={style.flatten([
                "text-caption",
                "color-gray-50",
                "width-12",
                "height-20",
              ])}
            >
              %
            </Text>
          </View>
        </View>
        <Text
          style={style.flatten([
            "text-caption",
            "color-text-red",
            "margin-y-8",
          ])}
        >
          {error && error}
        </Text>
      </View>
      <View
        style={style.flatten([
          "padding-x-16",
          "padding-y-12",
          "flex-row",
          "flex-nowrap",
        ])}
      >
        <Button
          text={intl.formatMessage({ id: "swap.slippage.input.button.clear" })}
          containerStyle={style.flatten(["flex-1", "margin-right-8"])}
          color="neutral"
          onPress={handleClear}
        />
        <Button
          text={intl.formatMessage({
            id: "swap.slippage.input.button.confirm",
          })}
          containerStyle={style.flatten(["flex-1"])}
          onPress={handleConfirm}
        />
      </View>
      <AvoidingKeyboardBottomView />
    </BottomSheetSwap>
  );
};
