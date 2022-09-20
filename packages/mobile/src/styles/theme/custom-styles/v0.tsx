import { Colors } from "../color-palette";

const ButtonCustom = {
  "button-small-container": {
    height: 24,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  "button-medium-container": {
    height: 32,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  "button-large-container": {
    height: 40,
    borderRadius: 4,
    paddingHorizontal: 12,
  },

  "button-primary-fill-default": {
    color: "white",
    backgroundColor: Colors["blue-70"],
    opacity: 1,
  },
  "button-primary-fill-highlighted": {
    color: "white",
    backgroundColor: Colors["blue-60"],
    opacity: 1,
  },
  "button-primary-fill-disabled": {
    color: "white",
    backgroundColor: Colors["blue-40"],
    opacity: 0.4,
  },
  "button-primary-outline-default": {
    color: Colors["blue-10"],
    backgroundColor: Colors["blue-40-15"],
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors["blue-40"],
  },
  "button-primary-outline-highlighted": {
    color: Colors["blue-10"],
    backgroundColor: Colors["blue-40-10"],
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors["blue-60"],
  },
  "button-primary-outline-disabled": {
    color: Colors["blue-10"],
    backgroundColor: Colors["blue-40-15"],
    opacity: 0.4,
    borderWidth: 1,
    borderColor: Colors["blue-40"],
  },
  "button-primary-text-default": {
    color: Colors["blue-40"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-primary-text-highlighted": {
    color: Colors["blue-70"],
    backgroundColor: Colors["blue-40-10"],
    opacity: 1,
  },
  "button-primary-text-disabled": {
    color: Colors["blue-40"],
    backgroundColor: "transparent",
    opacity: 0.4,
  },

  "button-neutral-fill-default": {
    color: Colors["gray-10"],
    backgroundColor: Colors["gray-80"],
    opacity: 1,
  },
  "button-neutral-fill-highlighted": {
    color: Colors["gray-10"],
    backgroundColor: Colors["gray-90"],
    opacity: 1,
  },
  "button-neutral-fill-disabled": {
    color: Colors["gray-10"],
    backgroundColor: Colors["gray-80"],
    opacity: 0.4,
  },
  "button-neutral-outline-default": {
    color: Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors["gray-60"],
  },
  "button-neutral-outline-highlighted": {
    color: Colors["gray-10"],
    backgroundColor: Colors["gray-70"],
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors["gray-60"],
  },
  "button-neutral-outline-disabled": {
    color: Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 0.4,
    borderWidth: 1,
    borderColor: Colors["gray-60"],
  },
  "button-neutral-text-default": {
    color: Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-neutral-text-highlighted": {
    color: Colors["gray-10"],
    backgroundColor: Colors["gray-70"],
    opacity: 1,
  },
  "button-neutral-text-disabled": {
    color: Colors["gray-10"],
    backgroundColor: "transparent",
    opacity: 0.4,
  },

  "button-negative-fill-default": {
    color: "white",
    backgroundColor: Colors["red-60"],
    opacity: 1,
  },
  "button-negative-fill-highlighted": {
    color: "white",
    backgroundColor: Colors["red-70"],
    opacity: 1,
  },
  "button-negative-fill-disabled": {
    color: "white",
    backgroundColor: Colors["red-60"],
    opacity: 0.4,
  },
  "button-negative-outline-default": {
    color: Colors["red-10"],
    backgroundColor: Colors["red-50-15"],
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors["red-50"],
  },
  "button-negative-outline-highlighted": {
    color: Colors["red-10"],
    backgroundColor: Colors["red-50-10"],
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors["red-70"],
  },
  "button-negative-outline-disabled": {
    color: Colors["red-10"],
    backgroundColor: Colors["red-50-15"],
    opacity: 0.4,
    borderWidth: 1,
    borderColor: Colors["red-50"],
  },
  "button-negative-text-default": {
    color: Colors["red-50"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-negative-text-highlighted": {
    color: Colors["red-60"],
    backgroundColor: Colors["red-50-10"],
    opacity: 1,
  },
  "button-negative-text-disabled": {
    color: Colors["red-50"],
    backgroundColor: "transparent",
    opacity: 0.4,
  },
};

const ToastCustom = {
  "toast-container": {
    borderRadius: 8,
    borderWidth: 1,
  },
  "toast-success": {
    color: "white",
    backgroundColor: Colors["green-60"],
    borderColor: Colors["green-60"],
  },
  "toast-error": {
    color: "white",
    backgroundColor: Colors["red-60"],
    borderColor: Colors["red-60"],
  },
  "toast-infor": {
    color: "white",
    backgroundColor: Colors["blue-70"],
    borderColor: Colors["blue-70"],
  },
  "toast-neutral": {
    color: "white",
    backgroundColor: Colors["gray-70"],
    borderColor: Colors["gray-70"],
  },
};

export const Custom = {
  ...ButtonCustom,
  ...ToastCustom,
  "alert-inline-container": {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  "input-container": {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  "words-container": {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors["gray-70"],
    backgroundColor: Colors["gray-90"],
  },
};