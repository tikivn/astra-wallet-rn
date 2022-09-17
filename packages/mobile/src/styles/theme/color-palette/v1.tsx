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
}

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
}

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
}

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
}

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
}

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
}

const DarkBlueColors = {
  "dark-blue-10": "#EBF3FF",
  "dark-blue-20": "#AACCFF",
  "dark-blue-30": "#80B2FF",
  "dark-blue-40": "#5598FF",
  "dark-blue-50": "#2B7FFF",
  "dark-blue-60": "#0065FF",
  "dark-blue-70": "#0054D4",
  "dark-blue-80": "#0043AA",
  "dark-blue-90": "#003380",
  "dark-blue-100": "#002255",
  "dark-blue-overlay": "#2A7FFF26",
}

export const V1Colors = {
  ...GrayColors,
  ...PurpleColors,
  ...RedColors,
  ...YellowColors,
  ...GreenColors,
  ...BlueColors,
  ...DarkBlueColors,
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
  "input-active": V1Colors["purple-50"],
  "input-inactive": V1Colors["gray-70"],
  "input-error": V1Colors["red-50"],
  "input-value": V1Colors["gray-10"],
  "input-label": V1Colors["gray-30"],
  "input-background": V1Colors["gray-90"],
};

export const V1ToggleColors = {
  "toggle-on": "white",
  "toggle-background-on": V1Colors["purple-50"],
  "toggle-off": "white",
  "toggle-background-off": V1Colors["gray-20"],
};
