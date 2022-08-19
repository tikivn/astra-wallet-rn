import { SwapContext, SwapContextProps } from "./index";
import { useContext } from "react";

export const useDataSwapContext = (): SwapContextProps => {
  const data = useContext<SwapContextProps>(SwapContext);
  return {
    ...data,
  };
};
