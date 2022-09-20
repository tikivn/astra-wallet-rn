import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { View } from "react-native";
import { useStyle } from "../../styles";
import { Button } from "../button";
import { BottomSheetSwap, BottomSheetSwapProps } from "./bottom-sheet-swap";

export type ApprovalProps = BottomSheetSwapProps & {
  onConfirm: () => void;
};

export const Approval = (props: ApprovalProps) => {
  const style = useStyle();
  const intl = useIntl();
  const handleConfirm = useCallback(() => {
    props.onConfirm && props.onConfirm();
  }, [props]);
  return (
    <BottomSheetSwap {...props}>
      <View style={style.flatten(["flex-grow-1"])}>
        <View
          style={style.flatten([
            "padding-x-16",
            "padding-y-12",
            "flex-row",
            "flex-nowrap",
          ])}
        >
          <Button
            text={intl.formatMessage({
              id: "swap.slippage.input.button.clear",
            })}
            size="large"
            containerStyle={style.flatten([
              "border-radius-4",
              "flex-1",
              "margin-right-8",
            ])}
            color="neutral"
            style={style.flatten(["background-color-gray-70"])}
            textStyle={style.flatten(["subtitle2"])}
            onPress={() => props.close && props.close()}
          />
          <Button
            text={intl.formatMessage({
              id: "swap.slippage.input.button.confirm",
            })}
            size="large"
            containerStyle={style.flatten(["border-radius-4", "flex-1"])}
            textStyle={style.flatten(["subtitle2"])}
            onPress={handleConfirm}
          />
        </View>
        <View style={style.get("height-32")} />
      </View>
    </BottomSheetSwap>
  );
};
