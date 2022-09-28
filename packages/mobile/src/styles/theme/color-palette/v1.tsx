const GrayColors = {
  "gray-10": "#F2F3F7",
  "gray-20": "#DADCF2",
  "gray-30": "#979AC2",
  "gray-40": "#8C8FB8",
  "gray-50": "#8185B2",
  "gray-60": "#6A6FA1",
  "gray-70": "#4E5388",
  "gray-80": "#3C4172",
  "gray-90": "#2B2E54",
  "gray-100": "#1A1E40",
  "gray-overlay": "#1A1E40CC",
};

const PurpleColors = {
  "purple-10": "#EAE5FF",
  "purple-20": "#C5B8FF",
  "purple-30": "#A38FFF",
  "purple-40": "#866BFF",
  "purple-50": "#6D4DFF",
  "purple-60": "#5233FF",
  "purple-70": "#381CEB",
  "purple-80": "#2308D1",
  "purple-90": "#1600A8",
  "purple-100": "#100075",
  "purple-overlay": "#6D4DFF26",

  "purple-40-10": "#866BFF1A",
  "purple-40-15": "#866BFF26",
  "purple-50-50": "#6D4DFF66",
};

const RedColors = {
  "red-10": "#FFEAEF",
  "red-20": "#FEC7D4",
  "red-30": "#FEAABF",
  "red-40": "#FE8EAA",
  "red-50": "#FD7294",
  "red-60": "#FD567F",
  "red-70": "#DE3A62",
  "red-80": "#B32245",
  "red-90": "#750B25",
  "red-100": "#5C0017",
  "red-overlay": "#FD567F26",

  "red-50-10": "#FD72941A",
  "red-50-15": "#FD729426",
};

const YellowColors = {
  "yellow-10": "#FFF3E3",
  "yellow-20": "#FFE5C4",
  "yellow-30": "#FFD8A6",
  "yellow-40": "#FFCC88",
  "yellow-50": "#FFBF6B",
  "yellow-60": "#FFB24D",
  "yellow-70": "#F59B33",
  "yellow-80": "#E88300",
  "yellow-90": "#CC6900",
  "yellow-100": "#B55400",
  "yellow-overlay": "#FFB24D26",
};

const GreenColors = {
  "green-10": "#E5FFFC",
  "green-20": "#C4FFF8",
  "green-30": "#99FFF5",
  "green-40": "#4FE3CF",
  "green-50": "#30CFB4",
  "green-60": "#1FB59C",
  "green-70": "#00A388",
  "green-80": "#008A70",
  "green-90": "#00614E",
  "green-100": "#003B2D",
  "green-overlay": "#30CFB426",
};

const BlueColors = {
  "blue-10": "#D8EFFD",
  "blue-20": "#BEE4FC",
  "blue-30": "#9DD7FB",
  "blue-40": "#7CCAFA",
  "blue-50": "#5CBCF8",
  "blue-60": "#3BAFF7",
  "blue-70": "#2895DE",
  "blue-80": "#1377BA",
  "blue-90": "#0A568A",
  "blue-100": "#003459",
  "blue-overlay": "#3BAFF726",
};

export const V1Colors = {
  ...GrayColors,
  ...PurpleColors,
  ...RedColors,
  ...YellowColors,
  ...GreenColors,
  ...BlueColors,
};

export const V1MainColors = {
  primary: V1Colors["purple-50"],
  background: V1Colors["gray-100"],
  "button-primary": V1Colors["purple-50"],
  border: V1Colors["gray-70"],
};

export const V1AlertInlineColors = {
  "alert-inline-info-main": V1Colors["blue-60"],
  "alert-inline-info-content": V1Colors["gray-10"],
  "alert-inline-info-background": V1Colors["blue-overlay"],
  "alert-inline-info-border": V1Colors["blue-60"],
  "alert-inline-warning-main": V1Colors["yellow-60"],
  "alert-inline-warning-content": V1Colors["gray-10"],
  "alert-inline-warning-background": V1Colors["yellow-overlay"],
  "alert-inline-warning-border": V1Colors["yellow-60"],
  "alert-inline-success-main": V1Colors["green-50"],
  "alert-inline-success-content": V1Colors["gray-10"],
  "alert-inline-success-background": V1Colors["green-overlay"],
  "alert-inline-success-border": V1Colors["green-50"],
  "alert-inline-error-main": V1Colors["red-50"],
  "alert-inline-error-content": V1Colors["gray-10"],
  "alert-inline-error-background": V1Colors["red-overlay"],
  "alert-inline-error-border": V1Colors["red-50"],
};

export const V1InputColors = {
  "input-active": V1Colors["gray-50"],
  "input-inactive": V1Colors["gray-70"],
  "input-error": V1Colors["red-50"],
  "input-success": V1Colors["green-50"],
  "input-value": V1Colors["gray-10"],
  "input-label": V1Colors["gray-30"],
  "input-background": V1Colors["gray-90"],
};

export const V1ToggleColors = {
  "toggle-on": "white",
  "toggle-background-on": V1Colors["purple-50"],
  "toggle-off": "white",
  "toggle-background-off": V1Colors["gray-30"],
};

export const V1StepViewColors = {
  "step-text-active": V1Colors["gray-10"],
  "step-text-inactive": V1Colors["gray-50"],

  "step-dot-active": V1Colors["purple-50"],
  "step-dot-inactive": V1Colors["purple-50-50"],

  "step-tick-active": V1Colors["purple-50"],
  "step-tick-inactive": V1Colors["blue-90"],

  "step-line-active": V1Colors["blue-90"],
  "step-line-inactive": V1Colors["gray-90"],

  "step-text-success-active": V1Colors["gray-10"],
  "step-text-success-inactive": V1Colors["gray-50"],

  "step-dot-success-active": V1Colors["green-50"],
  "step-dot-success-inactive": V1Colors["green-overlay"],

  "step-tick-success-active": V1Colors["green-50"],
  "step-tick-success-inactive": V1Colors["green-overlay"],

  "step-line-success-active": V1Colors["green-overlay"],
  "step-line-success-inactive": V1Colors["gray-90"],
};

export const V1AllColors = {
  ...V1Colors,
  ...V1MainColors,
  ...V1AlertInlineColors,
  ...V1InputColors,
  ...V1ToggleColors,
  ...V1StepViewColors,
  ...{
    "heading-text": "white",
    "link-text": V1Colors["purple-40"],
    "link-text-active": V1Colors["purple-50"],
    "rewards-text": V1Colors["green-50"],
    "label-text-1": V1Colors["gray-10"],
    "label-text-2": V1Colors["gray-30"],
    "icon-default": V1Colors["gray-30"],

    "card-border": V1Colors["gray-70"],
    "card-background-header": V1Colors["gray-80"],
    "card-background": V1Colors["gray-90"],

    "tab-icon-active": V1Colors["purple-40"],
    "tab-text-active": V1Colors["gray-10"],
    "tab-icon-inactive": V1Colors["gray-30"],
    "tab-text-inactive": V1Colors["gray-30"],
  },
};
