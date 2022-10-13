import { CW20Currency } from "@keplr-wallet/types";
import { ChainId, Currency, ETHER, Token } from "@solarswap/sdk";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { initialSwapReducerValue, SwapContext, SwapProviderProps } from ".";
import { useAmountOut, useSwapInfo, useSwapState, useWeb3 } from "../../hooks";
import { ApprovalState, useApproveCallback } from "../../hooks/use-approve";
import { SwapField, SWAP_ERROR_KEY } from "../../utils/for-swap";
import { reducer, SwapType } from "./reducer";

export const SwapProvider: FunctionComponent<SwapProviderProps> = ({
  children,
}) => {
  const [{ swapInfos }, dispatch] = useReducer(
    reducer,
    initialSwapReducerValue
  );
  const { chainId, getStore } = useWeb3();

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
      if (currency.coinDenom === ETHER.symbol) {
        return ETHER;
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
    [chainId, chainStore, swapInfos.indexCurrency]
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

  const { fetchTrade, pairData } = useAmountOut({
    currencies,
    swapValue: swapInfos.swapValue,
  });

  const { values, actions, ...aggregationValue } = useSwapState({
    fetchTrade,
    swapInfos,
    tokenBalances,
    dispatch,
    pairData,
  });

  const [approvalState, onApproval, approve0] = useApproveCallback(
    inputCurrency
  );
  const setLoading = useCallback((value: boolean = false) => {
    dispatch({ type: SwapType.SET_LOADING, payload: value });
  }, []);

  // auto approve
  useEffect(() => {
    if (
      approvalState !== ApprovalState.APPROVED &&
      inputCurrency instanceof Token &&
      !swapInfos.error
    ) {
      if (swapInfos.loading) return;
      setLoading(true);

      onApproval()
        .then((res) => {})
        .catch((error) => {
          dispatch({
            type: SwapType.SET_ERROR,
            payload: SWAP_ERROR_KEY.ENABLE_ERROR,
          });
        })
        .finally(() => {
          console.log("set loading false");
          setLoading();
        });
    }
  }, [
    approvalState,
    inputCurrency,
    onApproval,
    setLoading,
    swapInfos.error,
    swapInfos.loading,
    values,
  ]);

  if (!dispatch) return null;

  return (
    <SwapContext.Provider
      value={{
        swapInfos,
        dispatch,
        tokenBalances,
        values,
        currencies,
        actions,
        ...aggregationValue,
      }}
    >
      {children}
      {/* <Button text="Approve 0" onPress={approve0} /> */}
    </SwapContext.Provider>
  );
};
