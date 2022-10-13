import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleBuilder } from "./builder";
import { DeepPartial } from "utility-types";
import { AsyncKVStore } from "../../common";

type ThemeVersion = "v1" | "v2";

const createStyleContext = <
  Themes extends ReadonlyArray<string>,
  Custom extends Record<string, unknown>,
  Typos extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>,
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>
>() =>
  createContext<
    | {
      builder: StyleBuilder<
        Themes,
        Custom,
        Typos,
        Colors,
        Widths,
        Heights,
        PaddingSizes,
        MarginSizes,
        BorderWidths,
        BorderRadiuses,
        Opacities
      >;
      isInitializing: boolean;
      isAutomatic: boolean;
      theme: ThemeVersion;
      setTheme: (theme: ThemeVersion | null) => void;
    }
    | undefined
  >(undefined);

export const supportedThemeVersions: readonly ThemeVersion[] = ["v1", "v2"];

export const createStyleProvider = <
  Themes extends typeof supportedThemeVersions,
  Custom extends Record<string, unknown>,
  Typos extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>,
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>
>(
  config: {
    themes: Themes;
    custom: Custom;
    typos: Typos;
    colors: Colors;
    widths: Widths;
    heights: Heights;
    paddingSizes: PaddingSizes;
    marginSizes: MarginSizes;
    borderWidths: BorderWidths;
    borderRadiuses: BorderRadiuses;
    opacities: Opacities;
  },
  themeConfigs?: {
    [K in Themes[number]]?: DeepPartial<{
      custom: Custom;
      typos: Typos;
      colors: Colors;
      widths: Widths;
      heights: Heights;
      paddingSizes: PaddingSizes;
      marginSizes: MarginSizes;
      borderWidths: BorderWidths;
      borderRadiuses: BorderRadiuses;
      opacities: Opacities;
    }>;
  },
): {
  StyleProvider: FunctionComponent;
  useStyle: () => StyleBuilder<
    Themes,
    Custom,
    Typos,
    Colors,
    Widths,
    Heights,
    PaddingSizes,
    MarginSizes,
    BorderWidths,
    BorderRadiuses,
    Opacities
  >;
  useStyleThemeController: () => {
    isInitializing: boolean;
    isAutomatic: boolean;
    theme: ThemeVersion;
    setTheme: (theme: ThemeVersion | null) => void;
  };
} => {
  const context = createStyleContext<
    Themes,
    Custom,
    Typos,
    Colors,
    Widths,
    Heights,
    PaddingSizes,
    MarginSizes,
    BorderWidths,
    BorderRadiuses,
    Opacities
  >();

  return {
    // eslint-disable-next-line react/display-name
    StyleProvider: ({ children }) => {
      const [kvStore] = useState(
        () => new AsyncKVStore("__app-theme-setting__")
      );
      const [isInitializing, setIsInitializing] = useState(false);
      const [isAutomatic, setIsAutomatic] = useState(true);

      useEffect(() => {
        kvStore.get("theme").then((theme) => {
          setIsInitializing(false);

          switch (theme) {
            case "v1":
              setIsAutomatic(false);
              break;
            case "v2":
              setIsAutomatic(false);
              break;
            default:
              setIsAutomatic(true);
              break;
          }
        });
      }, [kvStore]);

      const setTheme = useCallback(
        (theme: ThemeVersion | null) => {
          if (isInitializing) {
            return;
          }

          switch (theme) {
            case "v1":
              setIsAutomatic(false);
              kvStore.set("theme", "v1");
              break;
            case "v2":
              setIsAutomatic(false);
              kvStore.set("theme", "v2");
              break;
            default:
              setIsAutomatic(true);
              kvStore.set("theme", null);
              break;
          }
        },
        [isInitializing, kvStore]
      );

      const builder = useMemo(() => {
        const builder = new StyleBuilder(config, themeConfigs);
        builder.setTheme("v1");
        return builder;
      }, []);

      return (
        <context.Provider
          value={{
            builder,
            isInitializing,
            isAutomatic,
            theme: builder.theme ?? "v1",
            setTheme,
          }}
        >
          {children}
        </context.Provider>
      );
    },
    useStyle: () => {
      const state = useContext(context);
      if (!state) throw new Error("You probably forgot to use StyleProvider");
      return state.builder;
    },
    useStyleThemeController: () => {
      const state = useContext(context);
      if (!state) throw new Error("You probably forgot to use StyleProvider");
      return state;
    },
  };
};
