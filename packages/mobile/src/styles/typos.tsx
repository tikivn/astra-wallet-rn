import { getPlatformFontWeight } from "./builder/utils";

const XSmallTypos = {
  "text-x-small-medium": {
    fontSize: 10,
    lineHeight: 12,
    ...getPlatformFontWeight("500"),
  },
};

const SmallTypos = {
  "text-small-regular": {
    fontSize: 12,
    lineHeight: 16,
    ...getPlatformFontWeight("400"),
  },
  "text-small-medium": {
    fontSize: 12,
    lineHeight: 16,
    ...getPlatformFontWeight("500"),
  },
};

const BaseTypos = {
  "text-base-light": {
    fontSize: 14,
    lineHeight: 20,
    ...getPlatformFontWeight("300"),
  },
  "text-base-regular": {
    fontSize: 14,
    lineHeight: 20,
    ...getPlatformFontWeight("400"),
  },
  "text-base-medium": {
    fontSize: 14,
    lineHeight: 20,
    ...getPlatformFontWeight("500"),
  },
  "text-base-semi-bold": {
    fontSize: 14,
    lineHeight: 20,
    ...getPlatformFontWeight("600"),
  },
};

const MediumTypos = {
  "text-medium-regular": {
    fontSize: 16,
    lineHeight: 24,
    ...getPlatformFontWeight("400"),
  },
  "text-medium-medium": {
    fontSize: 16,
    lineHeight: 24,
    ...getPlatformFontWeight("500"),
  },
  "text-medium-semi-bold": {
    fontSize: 16,
    lineHeight: 24,
    ...getPlatformFontWeight("600"),
  },
  "text-medium-bold": {
    fontSize: 16,
    lineHeight: 24,
    ...getPlatformFontWeight("700"),
  },
};

const LargeTypos = {
  "text-large-semi-bold": {
    fontSize: 18,
    lineHeight: 24,
    ...getPlatformFontWeight("600"),
  },
  "text-large-bold": {
    fontSize: 18,
    lineHeight: 27,
    ...getPlatformFontWeight("700"),
  },
};

const XLargeTypos = {
  "text-x-large-medium": {
    fontSize: 20,
    lineHeight: 32,
    ...getPlatformFontWeight("500"),
  },
  "text-x-large-semi-bold": {
    fontSize: 20,
    lineHeight: 32,
    ...getPlatformFontWeight("600"),
  },
};

const XXLargeTypos = {
  "text-2x-large-regular": {
    fontSize: 24,
    lineHeight: 32,
    ...getPlatformFontWeight("400"),
  },
  "text-2x-large-medium": {
    fontSize: 24,
    lineHeight: 32,
    ...getPlatformFontWeight("500"),
  },
  "text-2x-large-semi-bold": {
    fontSize: 24,
    lineHeight: 32,
    ...getPlatformFontWeight("600"),
  },
};

const XXXXLargeTypos = {
  "text-4x-large-semi-bold": {
    fontSize: 32,
    lineHeight: 40,
    ...getPlatformFontWeight("600"),
  },
};

export const Typos = {
  ...XSmallTypos,
  ...SmallTypos,
  ...BaseTypos,
  ...MediumTypos,
  ...LargeTypos,
  ...XLargeTypos,
  ...XXLargeTypos,
  ...XXXXLargeTypos,
};
