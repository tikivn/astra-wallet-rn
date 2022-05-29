import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Colors, Typos } from "../../styles";
import { FilledActionIcon } from "../icon/filled-action-success";

export type StepViewState = "inactive" | "active" | undefined;
export type StepViewLineState = "inactive" | "active" | undefined;
export type StepViewType = "dot" | "tick" | undefined;
export type StepViewPosition = "start" | "center" | "end" | undefined;

export const StepView: FunctionComponent<{
  text?: string,
  state?: StepViewState,
  lineState?: StepViewLineState,
  type?: StepViewType,
  position?: StepViewPosition,
}> = observer(({
  text,
  state,
  lineState = "active",
  type = "dot",
  position,
}) => {
  const textStyle = {
    marginTop: 4,
    color: Colors[state == "active" ? "gray-10" : "gray-50"],
    ...Typos["text-base-regular"],
  };

  const circleColor = Colors[state == "active" ? "blue-70" : "blue-90"];
  const lineColor = Colors[lineState == "active" ? "blue-90" : "gray-90"];

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
            ? <FilledActionIcon style={{ marginHorizontal: 8, }} />
            : <View style={{ marginHorizontal: 12, height: 24, width: 8, }}>
              <Svg height="24" width="100%">
                <Circle
                  cx="50%"
                  cy="50%"
                  r="4"
                  fill={circleColor}
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
