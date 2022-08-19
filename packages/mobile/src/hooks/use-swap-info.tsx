import { ChainId, Currency, Token } from "@solarswap/sdk";
import { CW20Currency } from "@keplr-wallet/types";
import { useCallback, useEffect, useMemo } from "react";
import { SwapAction, SwapType } from "../providers/swap/reducer";
import { SwapField } from "../utils/for-swap";
import { useCurrencyBalances } from "./use-balance";
import { useWeb3 } from "./use-web3";

interface UseSwapInfoProps {
  indexCurrency: {
    [K in SwapField]: number;
  };
  dispatch: React.Dispatch<SwapAction> | null;
}

export const useSwapInfo = ({ indexCurrency, dispatch }: UseSwapInfoProps) => {
  const { accountHex, chainId, getStore, WASA } = useWeb3();

  const { chainStore } = getStore();
  const getCurrency = useCallback(
    (value: SwapField): Currency | undefined => {
      const currencies = chainStore.current.currencies;
      const index = indexCurrency[value];
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
    [WASA, chainId, chainStore, indexCurrency]
  );

  const inputCurrency = useMemo(() => getCurrency(SwapField.Input), [
    getCurrency,
  ]);
  const outputCurrency = useMemo(() => getCurrency(SwapField.Output), [
    getCurrency,
  ]);

  const relevantTokenBalances = useCurrencyBalances(accountHex, [
    inputCurrency,
    outputCurrency,
  ]);

  const tokenBalances = {
    [SwapField.Input]: relevantTokenBalances[0],
    [SwapField.Output]: relevantTokenBalances[1],
  };

  useEffect(() => {
    dispatch &&
      dispatch({
        type: SwapType.SET_CURRENCIES,
        payload: {
          [SwapField.Input]: inputCurrency,
          [SwapField.Output]: outputCurrency,
        },
      });
  }, [dispatch, inputCurrency, outputCurrency]);

  return {
    tokenBalances,
  };
};
