import { Keplr } from "@keplr-wallet/types";

export const getKeplrFromWindow: () => Promise<
  Keplr | undefined
> = async () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (window.astra) {
    return window.astra;
  }

  if (document.readyState === "complete") {
    return window.astra;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.astra);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
