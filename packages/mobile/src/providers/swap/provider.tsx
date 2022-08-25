import { CW20Currency } from "@keplr-wallet/types";
import { ChainId, Currency, Token } from "@solarswap/sdk";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useReducer,
} from "react";
import { initialSwapReducerValue, SwapContext, SwapProviderProps } from ".";
import { useAmountOut, useSwapInfo, useSwapState, useWeb3 } from "../../hooks";
import { SwapField } from "../../utils/for-swap";
import { reducer } from "./reducer";

export const SwapProvider: FunctionComponent<SwapProviderProps> = ({
  children,
}) => {
  const [{ swapInfos }, dispatch] = useReducer(
    reducer,
    initialSwapReducerValue
  );
  const { accountHex, chainId, getStore, WASA } = useWeb3();

  const { chainStore } = getStore();

  const getCurrency = useCallback(
    (value: SwapField): Currency | undefined => {
      const currencies = chainStore.current.currencies;
      const index = swapInfos.indexCurrency[value];
      if (index >= currencies.length) {
        return undefined;
      }
      const currency = currencies[index] as CW20Currency;
      const chain = chainId || ChainId.TESTNET;
      if (currency.coinDenom === "ASA") {
        return WASA;
      }
      return new Token(
        chain,
        currency.contractAddress,
        currency.coinDecimals,
        currency.coinDenom,
        currency.coinMinimalDenom,
        currency.coinImageUrl
      );
    },
    [WASA, chainId, chainStore, swapInfos.indexCurrency]
  );

  const inputCurrency = useMemo(() => getCurrency(SwapField.Input), [
    getCurrency,
  ]);
  const outputCurrency = useMemo(() => getCurrency(SwapField.Output), [
    getCurrency,
  ]);

  const currencies = useMemo(
    () => ({
      [SwapField.Input]: inputCurrency,
      [SwapField.Output]: outputCurrency,
    }),
    [inputCurrency, outputCurrency]
  );

  const { tokenBalances } = useSwapInfo({ currencies });

  const { fetchTrade } = useAmountOut({
    currencies,
    swapValue: swapInfos.swapValue,
  });

  const { values, ...aggregationValue } = useSwapState({
    fetchTrade,
    swapInfos,
    tokenBalances,
    dispatch,
  });

  if (!dispatch) return null;
  return (
    <SwapContext.Provider
      value={{
        swapInfos,
        dispatch,
        tokenBalances,
        values,
        currencies,
        ...aggregationValue,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};
