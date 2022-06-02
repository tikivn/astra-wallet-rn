import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Colors, Typos } from "../../styles";
import { FilledActionIcon } from "../icon/filled-action-success";

export type StepViewState = "inactive" | "active";
export type StepViewStateColors = Record<StepViewState, { 
  text: string, 
  dot: string, 
  tick: string,
  line: string,
}>;
export type StepViewType = "dot" | "tick";
export type StepViewPosition = "start" | "center" | "end";

export const StepViewStateColorsBlue = {
  "active": {
    text: Colors["gray-10"],
    dot: Colors["blue-70"],
    tick: Colors["blue-70"],
    line: Colors["blue-90"],
  },
  "inactive": {
    text: Colors["gray-50"],
    dot: Colors["blue-90"],
    tick: Colors["blue-90"],
    line: Colors["gray-90"],
  },
};

export const StepViewStateColorsGreen = {
  "active": {
    text: Colors["gray-10"],
    dot: Colors["green-50"],
    tick: Colors["green-50"],
    line: Colors["green-2"],
  },
  "inactive": {
    text: Colors["gray-50"],
    dot: Colors["green-2"],
    tick: Colors["green-2"],
    line: Colors["gray-90"],
  },
};

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
  stateColors = StepViewStateColorsBlue,
  lineState = "inactive",
  type = "dot",
  position = "start",
}) => {
  const textStyle = {
    marginTop: 4,
    color: stateColors[state].text,
    ...Typos["text-base-regular"],
  };

  const dotColor = stateColors[state].dot;
  const tickColor = stateColors[state].tick;
  const lineColor = stateColors[lineState].line;

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
