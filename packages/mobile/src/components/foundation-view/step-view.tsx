import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useStyle } from "../../styles";
import { FilledActionIcon } from "../icon/filled-action-success";

export type StepViewState = "inactive" | "active";
export type StepViewStateColors = "success" | "default";
export type StepViewType = "dot" | "tick";
export type StepViewPosition = "start" | "center" | "end";

export const StepView: FunctionComponent<{
  text?: string,
  state?: StepViewState,
  stateColors?: StepViewStateColors,
  lineState?: StepViewState,
  type?: StepViewType,
  position?: StepViewPosition,
}> = observer(({
  text,
  state = "inactive",
  stateColors = "default",
  lineState = "inactive",
  type = "dot",
  position = "start",
}) => {
  const style = useStyle();

  const colors = {
    dot: `color-step-dot${stateColors === "success" ? "-success" : ""}-${state}`,
    tick: `color-step-tick${stateColors === "success" ? "-success" : ""}-${state}`,
    text: `color-step-text${stateColors === "success" ? "-success" : ""}-${state}`,
    line: `color-step-line${stateColors === "success" ? "-success" : ""}-${lineState}`,
  };

  const textStyle = {
    marginTop: 4,
    color: style.get(colors.text as any).color,
    ...style.flatten(["text-base-regular"]),
  };

  const dotColor = style.get(colors.dot as any).color;
  const tickColor = style.get(colors.tick as any).color;
  const lineColor = style.get(colors.line as any).color;

  return (
    <View style={{ flex: 1, alignItems: "center", }}>
      <View style={{
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
      }}>
        <View style={{ flex: 1, height: 24 }}>
          <Svg height="24" width="100%">
            {(position == "end" || position == "center") && (
              <Line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                strokeWidth={1}
                stroke={lineColor}
              />
            )}
          </Svg>
        </View>
        {
          type == "tick"
            ? <FilledActionIcon color={tickColor} style={{ marginHorizontal: 8, }} />
            : <View style={{ marginHorizontal: 12, height: 24, width: 8, }}>
              <Svg height="24" width="100%">
                <Circle
                  cx="50%"
                  cy="50%"
                  r="4"
                  fill={dotColor}
                />
              </Svg>
            </View>
        }
        <View style={{ flex: 1, height: 24 }}>
          <Svg height="24" width="100%">
            {(position == "start" || position == "center") && (
              <Line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                strokeWidth={1}
                stroke={lineColor}
              />
            )}
          </Svg>
        </View>
      </View>
      <Text style={textStyle}>
        {text}
      </Text>
    </View>
  );
});
