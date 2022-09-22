import { V1Colors } from "../color-palette";

const V1ButtonCustom = {
  "button-small-container": {
    height: 24,
    borderRadius: 6,
    paddingLeft: 12,
    paddingRight: 12,
  },
  "button-medium-container": {
    height: 36,
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 12,
  },
  "button-large-container": {
    height: 44,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },

  "button-primary-solid-default": {
    color: "white",
    backgroundColor: V1Colors["purple-50"],
    opacity: 1,
  },
  "button-primary-solid-highlighted": {
    color: "white",
    backgroundColor: V1Colors["purple-60"],
    opacity: 1,
  },
  "button-primary-solid-disabled": {
    color: "white",
    backgroundColor: V1Colors["purple-40"],
    opacity: 0.4,
  },
  "button-primary-outline-default": {
    color: V1Colors["purple-10"],
    backgroundColor: V1Colors["purple-40-15"],
    opacity: 1,
    borderWidth: 1,
    borderColor: V1Colors["purple-40"],
  },
  "button-primary-outline-highlighted": {
    color: V1Colors["purple-10"],
    backgroundColor: V1Colors["purple-40-10"],
    opacity: 1,
    borderWidth: 1,
    borderColor: V1Colors["purple-60"],
  },
  "button-primary-outline-disabled": {
    color: V1Colors["purple-10"],
    backgroundColor: V1Colors["purple-40-15"],
    opacity: 0.4,
    borderWidth: 1,
    borderColor: V1Colors["purple-40"],
  },
  "button-primary-ghost-default": {
    color: V1Colors["purple-40"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-primary-ghost-highlighted": {
    color: V1Colors["purple-50"],
    backgroundColor: V1Colors["purple-40-10"],
    opacity: 1,
  },
  "button-primary-ghost-disabled": {
    color: V1Colors["purple-40"],
    backgroundColor: "transparent",
    opacity: 0.4,
  },

  "button-neutral-solid-default": {
    color: V1Colors["gray-10"],
    backgroundColor: V1Colors["gray-80"],
    opacity: 1,
  },
  "button-neutral-solid-highlighted": {
    color: V1Colors["gray-10"],
    backgroundColor: V1Colors["gray-90"],
    opacity: 1,
  },
  "button-neutral-solid-disabled": {
    color: V1Colors["gray-10"],
    backgroundColor: V1Colors["gray-80"],
    opacity: 0.4,
  },
  "button-neutral-outline-default": {
    color: V1Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 1,
    borderWidth: 1,
    borderColor: V1Colors["gray-60"],
  },
  "button-neutral-outline-highlighted": {
    color: V1Colors["gray-10"],
    backgroundColor: V1Colors["gray-70"],
    opacity: 1,
    borderWidth: 1,
    borderColor: V1Colors["gray-60"],
  },
  "button-neutral-outline-disabled": {
    color: V1Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 0.4,
    borderWidth: 1,
    borderColor: V1Colors["gray-60"],
  },
  "button-neutral-ghost-default": {
    color: V1Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-neutral-ghost-highlighted": {
    color: V1Colors["gray-10"],
    backgroundColor: V1Colors["gray-70"],
    opacity: 1,
  },
  "button-neutral-ghost-disabled": {
    color: V1Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 0.4,
  },

  "button-negative-solid-default": {
    color: "white",
    backgroundColor: V1Colors["red-60"],
    opacity: 1,
  },
  "button-negative-solid-highlighted": {
    color: "white",
    backgroundColor: V1Colors["red-70"],
    opacity: 1,
  },
  "button-negative-solid-disabled": {
    color: "white",
    backgroundColor: V1Colors["red-60"],
    opacity: 0.4,
  },
  "button-negative-outline-default": {
    color: V1Colors["red-10"],
    backgroundColor: V1Colors["red-50-15"],
    opacity: 1,
    borderWidth: 1,
    borderColor: V1Colors["red-50"],
  },
  "button-negative-outline-highlighted": {
    color: V1Colors["red-10"],
    backgroundColor: V1Colors["red-50-10"],
    opacity: 1,
    borderWidth: 1,
    borderColor: V1Colors["red-70"],
  },
  "button-negative-outline-disabled": {
    color: V1Colors["red-10"],
    backgroundColor: V1Colors["red-50-15"],
    opacity: 0.4,
    borderWidth: 1,
    borderColor: V1Colors["red-50"],
  },
  "button-negative-ghost-default": {
    color: V1Colors["red-50"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-negative-ghost-highlighted": {
    color: V1Colors["red-60"],
    backgroundColor: V1Colors["red-50-10"],
    opacity: 1,
  },
  "button-negative-ghost-disabled": {
    color: V1Colors["red-50"],
    backgroundColor: "transparent",
    opacity: 0.4,
  },
};

const V1ToastCustom = {
  "toast-container": {
    borderRadius: 12,
  },
  "toast-success": {
    color: "white",
    backgroundColor: V1Colors["green-60"],
  },
  "toast-error": {
    color: "white",
    backgroundColor: V1Colors["red-60"],
  },
  "toast-infor": {
    color: "white",
    backgroundColor: V1Colors["blue-70"],
  },
  "toast-neutral": {
    color: "white",
    backgroundColor: V1Colors["gray-70"],
  },
};

const V1AlertCustom = {
  "alert-success": {
    color: V1Colors["green-60"],
  },
  "alert-error": {
    color: V1Colors["red-60"],
  },
  "alert-infor": {
    color: V1Colors["blue-70"],
  },
  "alert-neutral": {
    color: V1Colors["gray-70"],
  },
};

export const V1Custom = {
  ...V1ButtonCustom,
  ...V1ToastCustom,
  ...V1AlertCustom,
  "alert-inline-container": {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  "input-container": {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop: 6,
    paddingBottom: 6,
    minHeight: 44,
  },
  "words-container": {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: V1Colors["gray-70"],
    backgroundColor: V1Colors["gray-90"],
  },
};
