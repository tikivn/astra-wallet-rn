import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Keyboard, KeyboardEvent, Platform, StyleSheet } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStyle } from "../../styles";

const useAnimatedValueSet = () => {
  const [state] = useState(() => {
    return {
      clock: new Animated.Clock(),
      finished: new Animated.Value(0),
      time: new Animated.Value(0),
      frameTime: new Animated.Value(0),
      value: new Animated.Value(0),
    };
  });

  return state;
};

export const AvoidingKeyboardBottomView: FunctionComponent = () => {
  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();
  const animatedValueSet = useAnimatedValueSet();

  const [
    softwareKeyboardBottomPadding,
    setSoftwareKeyboardBottomPadding,
  ] = useState(0);

  useEffect(() => {
    const onKeyboarFrame = (e: KeyboardEvent) => {
      setSoftwareKeyboardBottomPadding(
        e.endCoordinates.height - safeAreaInsets.bottom
      );
    };
    const onKeyboardClearFrame = () => {
      setSoftwareKeyboardBottomPadding(0);
    };

    // No need to do this on android
    if (Platform.OS !== "android") {
      Keyboard.addListener("keyboardWillShow", onKeyboarFrame);
      Keyboard.addListener("keyboardWillChangeFrame", onKeyboarFrame);
      Keyboard.addListener("keyboardWillHide", onKeyboardClearFrame);

      return () => {
        Keyboard.removeListener("keyboardWillShow", onKeyboarFrame);
        Keyboard.removeListener("keyboardWillChangeFrame", onKeyboarFrame);
        Keyboard.removeListener("keyboardWillHide", onKeyboardClearFrame);
      };
    }
  }, [safeAreaInsets.bottom]);

  const animatedKeyboardPaddingBottom = useMemo(() => {
    return Animated.block([
      Animated.cond(
        Animated.and(
          Animated.neq(animatedValueSet.value, softwareKeyboardBottomPadding),
          Animated.not(Animated.clockRunning(animatedValueSet.clock))
        ),
        [
          Animated.debug(
            "start clock for keyboard avoiding",
            animatedValueSet.value
          ),
          Animated.set(animatedValueSet.finished, 0),
          Animated.set(animatedValueSet.time, 0),
          Animated.set(animatedValueSet.frameTime, 0),
          Animated.startClock(animatedValueSet.clock),
        ]
      ),
      Animated.timing(
        animatedValueSet.clock,
        {
          finished: animatedValueSet.finished,
          position: animatedValueSet.value,
          time: animatedValueSet.time,
          frameTime: animatedValueSet.frameTime,
        },
        {
          toValue: softwareKeyboardBottomPadding,
          duration: 175,
          easing: Easing.linear,
        }
      ),
      Animated.cond(
        animatedValueSet.finished,
        Animated.stopClock(animatedValueSet.clock)
      ),
      animatedValueSet.value,
    ]);
  }, [
    animatedValueSet.clock,
    animatedValueSet.finished,
    animatedValueSet.frameTime,
    animatedValueSet.time,
    animatedValueSet.value,
    softwareKeyboardBottomPadding,
  ]);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        style.flatten(["overflow-hidden"]),
        {
          paddingBottom: Animated.add(
            safeAreaInsets.bottom,
            animatedKeyboardPaddingBottom
          ),
        },
      ])}
    />
  );
};
