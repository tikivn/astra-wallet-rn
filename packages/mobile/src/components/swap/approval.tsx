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
            containerStyle={style.flatten([
              "flex-1",
              "margin-right-8",
            ])}
            color="neutral"
            onPress={() => props.close && props.close()}
          />
          <Button
            text={intl.formatMessage({
              id: "swap.slippage.input.button.confirm",
            })}
            containerStyle={style.flatten(["flex-1"])}
            onPress={handleConfirm}
          />
        </View>
        <View style={style.get("height-32")} />
      </View>
    </BottomSheetSwap>
  );
};
