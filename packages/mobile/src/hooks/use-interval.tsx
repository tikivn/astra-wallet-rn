import { useEffect, useRef } from "react";
import { INTERVAL_STOP } from "../utils/for-swap";

export function useInterval(
  callback: () => void,
  delay: number | null | false,
  immediate?: boolean,
  valueDetect?: any
) {
  const savedCallback = useRef(() => {});
  const timerIdRef = useRef<NodeJS.Timeout>();
  const timeOutIdRef = useRef<NodeJS.Timeout>();
  const valueRef = useRef(valueDetect);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Execute callback if immediate is set.
  useEffect(() => {
    if (!immediate) return;
    if (delay === null || delay === false) return;
    savedCallback.current();
  }, [delay, immediate]);

  const clearTimeInterval = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = undefined;
    }
  };

  const clearTimeOut = () => {
    if (timeOutIdRef.current) {
      clearTimeout(timeOutIdRef.current);
      timeOutIdRef.current = undefined;
    }
  };

  // Set up the interval.
  useEffect(() => {
    if (delay === null || delay === false) return undefined;
    const tick = () => savedCallback.current();
    timerIdRef.current = setInterval(tick, delay);

    // check timeout
    if (valueDetect !== undefined) {
      valueRef.current = valueDetect;

      clearTimeOut();
      timeOutIdRef.current = setTimeout(clearTimeInterval, INTERVAL_STOP);
    }

    return () => {
      clearTimeInterval();
      clearTimeOut();
    };
  }, [delay, valueDetect]);
}
