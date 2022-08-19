import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef } from "react";
import { Cache } from "react-native-cache";

export enum KeyCache {
  blockNumber = "blockNumber",
}

export const useCache = () => {
  const ref = useRef<Cache>();
  useEffect(() => {
    if (!ref.current) {
      const cache = new Cache({
        namespace: "myapp",
        policy: {
          maxEntries: 50000,
          stdTTL: 0,
        },
        backend: AsyncStorage,
      });
      ref.current = cache;
    }
  }, []);

  const set = useCallback(async (key: KeyCache, value: any) => {
    ref.current && ref.current.set(key, value);
  }, []);

  const get = useCallback(async (key: KeyCache) => {
    return ref.current && (await ref.current.get(key));
  }, []);

  return {
    set,
    get,
  };
};
