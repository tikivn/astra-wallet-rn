import { getPlatformFontWeight } from "./builder/utils";

const SmallTypos = {
  "text-small-regular": {
    fontSize: 12,
    lineHeight: 16,
    ...getPlatformFontWeight("400"),
  },
};

const BaseTypos = {
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
};

const LargeTypos = {
  "text-large-medium": {
    fontSize: 20,
    lineHeight: 32,
    ...getPlatformFontWeight("500"),
  },
  "text-large-bold": {
    fontSize: 18,
    lineHeight: 27,
    ...getPlatformFontWeight("700"),
  },
};

const XXLargeTypos = {
  "text-2x-large-regular": {
    fontSize: 24,
    lineHeight: 32,
    ...getPlatformFontWeight("400"),
  },
};

export const Typos = {
  ...SmallTypos,
  ...BaseTypos,
  ...MediumTypos,
  ...LargeTypos,
  ...XXLargeTypos,
};
