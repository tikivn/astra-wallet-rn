import { V1Colors } from "../color-palette";

export const V1Custom = {
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
  },
  "button-default-container": {
    height: 44,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  "button-small-container": {
    height: 36,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  "button-large-container": {
    height: 44,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  "button-primary-active": {
    color: "white",
    backgroundColor: V1Colors["purple-50"],
    opacity: 1,
  },
  "button-primary-highlighted": {
    color: "white",
    backgroundColor: V1Colors["purple-60"],
    opacity: 1,
  },
  "button-primary-disabled": {
    color: "white",
    backgroundColor: V1Colors["purple-50"],
    opacity: 0.4,
  },
  "button-secondary-active": {
    color: "white",
    backgroundColor: V1Colors["gray-80"],
    opacity: 1,
  },
  "button-secondary-highlighted": {
    color: "white",
    backgroundColor: V1Colors["gray-70"],
    opacity: 1,
  },
  "button-secondary-disabled": {
    color: "white",
    backgroundColor: V1Colors["gray-80"],
    opacity: 0.4,
  },
  "button-danger-active": {
    color: "white",
    backgroundColor: V1Colors["red-50"],
    opacity: 1,
  },
  "button-danger-highlighted": {
    color: "white",
    backgroundColor: V1Colors["red-60"],
    opacity: 1,
  },
  "button-danger-disabled": {
    color: "white",
    backgroundColor: V1Colors["red-50"],
    opacity: 0.4,
  },
  "button-outline-active": {
    borderWidth: 1,
    borderColor: V1Colors["gray-30"],
    color: "white",
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-outline-highlighted": {
    borderWidth: 1,
    borderColor: V1Colors["gray-40"],
    color: "white",
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-outline-disabled": {
    borderWidth: 1,
    borderColor: V1Colors["gray-30"],
    color: "white",
    backgroundColor: "transparent",
    opacity: 0.4,
  },
  "button-text-active": {
    color: V1Colors["purple-50"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-text-highlighted": {
    color: V1Colors["purple-60"],
    backgroundColor: "transparent",
    opacity: 1,
  },
  "button-text-disabled": {
    color: V1Colors["purple-50"],
    backgroundColor: "transparent",
    opacity: 0.4,
  },
};