import { createStyleProvider, supportedThemeVersions } from "./builder";
import { EnumTextTransform, EnumTextDecorationLine } from "./builder/types";
import { Platform } from "react-native";
import { getPlatformFontWeight } from "./builder/utils";
import { Typos } from "./typos";
import { AllColors, V1AllColors } from "./theme/color-palette";
import { Custom, V1Custom } from "./theme/custom-styles";

export * from "./typos";
export * from "./theme/color-palette";

export const {
  StyleProvider,
  useStyle,
  useStyleThemeController,
} = createStyleProvider(
  {
    themes: supportedThemeVersions,
    custom: {
      ...Custom,
      title1: {
        fontSize: 32,
        lineHeight: 40,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("600"),
      },
      title2: {
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("700"),
      },
      title3: {
        fontSize: 28,
        lineHeight: 40,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("600"),
      },
      h1: {
        fontSize: 32,
        lineHeight: 56,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("700"),
      },
      h2: {
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("700"),
      },
      h3: {
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("700"),
      },
      h4: {
        fontSize: 20,
        lineHeight: 28,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("600"),
      },
      h5: {
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("600"),
      },
      h6: {
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      h7: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      subtitle1: {
        fontSize: 18,
        lineHeight: 24,
        ...getPlatformFontWeight("500"),
      },
      subtitle2: {
        fontSize: 16,
        lineHeight: 22,
        ...getPlatformFontWeight("500"),
      },
      subtitle3: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("500"),
      },
      subtitle4: {
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("500"),
      },
      subtitle5: {
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("500"),
      },
      body1: {
        fontSize: 18,
        lineHeight: 26,
        ...getPlatformFontWeight("400"),
      },
      body2: {
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("400"),
      },
      body3: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("400"),
      },
      "text-button1": {
        fontSize: 18,
        lineHeight: 20,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      "text-button2": {
        fontSize: 16,
        lineHeight: 19,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      "text-button3": {
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: 0.2,
        textTransform: "capitalize" as EnumTextTransform,
        ...getPlatformFontWeight("600"),
      },
      "text-caption": {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-caption-center": {
        fontSize: 14,
        lineHeight: 0,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-caption1": {
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-caption2": {
        fontSize: 12,
        lineHeight: 18,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-overline": {
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0.5,
        textTransform: "uppercase" as EnumTextTransform,
        ...getPlatformFontWeight("400"),
      },
      "text-underline": {
        textDecorationLine: "underline" as EnumTextDecorationLine,
      },
      "text-amount-input": {
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-amount-input-center": {
        fontSize: 24,
        lineHeight: 0,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-success": {
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("500"),
      },
      // This style is for the text input and aims to mock the body2 style.
      // In IOS, it is hard to position the input text to the middle vertically.
      // So, to solve this problem, decrease the line height and add the additional vertical padding.
      "body2-in-text-input": Platform.select({
        ios: {
          fontSize: 16,
          lineHeight: 19,
          letterSpacing: 0.25,
          paddingTop: 1.5,
          paddingBottom: 1.5,
          ...getPlatformFontWeight("400"),
        },
        android: {
          fontSize: 16,
          lineHeight: 22,
          letterSpacing: 0.25,
          ...getPlatformFontWeight("400"),
        },
      }),
    },
    typos: Typos,
    colors: AllColors,
    widths: {
      full: "100%",
      half: "50%",
      "1": 1,
      "4": 4,
      "8": 8,
      "12": 12,
      "16": 16,
      "18": 18,
      "20": 20,
      "24": 24,
      "32": 32,
      "34": 34,
      "36": 36,
      "38": 38,
      "40": 40,
      "42": 42,
      "44": 44,
      "48": 48,
      "54": 54,
      "56": 56,
      "58": 58,
      "64": 64,
      "72": 72,
      "80": 80,
      "122": 122,
      "132": 132,
      "160": 160,
      "200": 200,
      "248": 248,
      "240": 240,
      "292": 292,
      "300": 300,

      "card-gap": 12,
      "page-pad": 20,
    },
    heights: {
      full: "100%",
      half: "50%",
      "0.5": 0.5,
      "1": 1,
      "4": 4,
      "5": 5,
      "6": 6,
      "8": 8,
      "12": 12,
      "16": 16,
      "18": 18,
      "20": 20,
      "24": 24,
      "30": 30,
      "32": 32,
      "36": 36,
      "38": 38,
      "40": 40,
      "42": 42,
      "44": 44,
      "48": 48,
      "50": 50,
      "56": 56,
      "58": 58,
      "60": 60,
      "62": 62,
      "64": 64,
      "66": 66,
      "68": 68,
      "72": 72,
      "74": 74,
      "80": 80,
      "83": 83,
      "84": 84,
      "87": 87,
      "90": 90,
      "104": 104,
      "116": 116,
      "122": 122,
      "148": 148,
      "160": 160,
      "184": 184,
      "200": 200,
      "208": 208,
      "214": 214,
      "276": 276,
      "400": 400,
      "600": 600,

      "button-small": 38,
      "button-default": 48,
      "button-large": 52,
      "governance-card-body-placeholder": 130,

      "card-gap": 12,
      "page-pad": 20,
    },
    paddingSizes: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "8": 8,
      "10": 10,
      "11": 11,
      "12": 12,
      "14": 14,
      "15": 15,
      "16": 16,
      "18": 18,
      "20": 20,
      "22": 22,
      "24": 24,
      "25.5": 25.5,
      "26": 26,
      "28": 28,
      "31": 31,
      "32": 32,
      "36": 36,
      "38": 38,
      "40": 40,
      "42": 42,
      "48": 48,
      "52": 52,
      "64": 64,
      "66": 66,

      page: 20,
      "card-horizontal": 20,
      "card-vertical": 20,
      "card-vertical-half": 10,
      "card-gap": 12,
    },
    marginSizes: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "6": 6,
      "8": 8,
      "10": 10,
      "12": 12,
      "14": 14,
      "15": 15,
      "16": 16,
      "18": 18,
      "20": 20,
      "21": 21,
      "24": 24,
      "28": 28,
      "30": 30,
      "32": 32,
      "34": 34,
      "38": 38,
      "40": 40,
      "44": 44,
      "46": 46,
      "48": 48,
      "58": 58,
      "64": 64,
      "68": 68,
      "82": 82,
      "87": 87,
      "88": 88,
      "92": 92,
      "102": 102,
      "106": 106,
      "150": 150,
      "288": 288,

      page: 20,
      "card-horizontal": 20,
      "card-vertical": 20,
      "card-gap": 12,
    },
    borderWidths: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "6": 6,
      "8": 8,
      "12": 12,
      "16": 16,
      "32": 32,
      "64": 64,
    },
    borderRadiuses: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "6": 6,
      "8": 8,
      "12": 12,
      "16": 16,
      "22": 22,
      "32": 32,
      "52": 52,
      "64": 64,
    },
    opacities: {
      transparent: 0,
      "10": 0.1,
      "20": 0.2,
      "30": 0.3,
      "40": 0.4,
      "50": 0.5,
      "60": 0.6,
      "70": 0.7,
      "80": 0.8,
      "90": 0.9,
      "100": 1,
    },
  },
  {
    v1: {
      custom: {
        ...V1Custom,
      },
      colors: V1AllColors,
    },
    v2: {
      colors: {},
    },
  }
);
