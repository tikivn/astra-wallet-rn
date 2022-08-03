import { Fraction, Percent, Trade } from "@astradefi/sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useCallback, useMemo, useState } from "react";
import { useStore } from "../stores";
import { computeTradePriceBreakdown } from "../utils/for-swap/compute-price";
import { useAmountOut } from "./use-amout-out";

export const useSwap = () => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const [swapValue, setSwapValue] = useState<number>(0);
  const [outputSwapValue, setOutputSwapValue] = useState<string>("");
  const [pricePerInputCurrency, setpricePerInputCurrency] = useState<string>(
    ""
  );
  const [slippageTolerance, setSlippageTolerance] = useState<number>(50);
  const [isReadyToSwap, setIsReadyToSwap] = useState<boolean>(false);
  const { trade: amountOut } = useAmountOut();
  const [fee, setFee] = useState<string>("0");
  const { chainId } = chainStore.current;
  const [trade, setTrade] = useState<Trade | undefined>();

  const account = useMemo(() => {
    return accountStore.getAccount(chainId);
  }, [accountStore, chainId]);

  const queries = useMemo(() => {
    return queriesStore.get(chainId);
  }, [chainId, queriesStore]);

  const { balance: inputCurrency } = useMemo(() => {
    return queries.queryBalances.getQueryBech32Address(account.bech32Address)
      .stakable;
  }, [account.bech32Address, queries.queryBalances]);

  const outputCurrency = useMemo(() => {
    return chainStore.current.currencies[1];
  }, [chainStore]);

  const convertBalance = useCallback(
    (currencyBalance: CoinPretty = inputCurrency) => {
      if (!currencyBalance) return "0";
      // const value = currencyBalance.toCoin().amount;
      // return (+value / 1e18).toLocaleString("vi-VN", {
      //   maximumFractionDigits: 3,
      // });
      return currencyBalance
        .trim(true)
        .shrink(true)
        .maxDecimals(6)
        .hideDenom(true)
        .toString();
    },
    [inputCurrency]
  );

  const handleSetReadyToSwap = useCallback((priceImpact?: Percent) => {
    if (!priceImpact) return;
    const isPriceImpactTooHigh = priceImpact.greaterThan(new Fraction(15, 100));
    setIsReadyToSwap(!isPriceImpactTooHigh);
  }, []);

  const handleSetSlippageTolerance = useCallback(
    (value: number) => {
      if (value !== slippageTolerance) {
        setSlippageTolerance(value);
      } else {
        return;
      }
    },
    [slippageTolerance]
  );

  const getOutputValue = useCallback(
    async (value: number) => {
      if (value && typeof amountOut !== undefined) {
        const trades = await amountOut(value);
        if (trades && trades.length > 0) {
          setTrade(trades[0]);
          const { inputAmount, outputAmount } = trades[0];

          const pricePerCurrencyIn = outputAmount
            .divide(inputAmount)
            .toSignificant(6);

          const output = outputAmount.toSignificant(6);
          setpricePerInputCurrency(pricePerCurrencyIn);
          const {
            realizedLPFee,
            priceImpactWithoutFee,
          } = computeTradePriceBreakdown(trades[0]);
          setFee(realizedLPFee?.toSignificant(6) || "0");
          handleSetReadyToSwap(priceImpactWithoutFee);
          return setOutputSwapValue(output);
        }
      }
      setOutputSwapValue("");
    },
    [amountOut, handleSetReadyToSwap]
  );

  const handleSetSwapValue = useCallback(
    async (value: number) => {
      // TODO: Error for validate value
      if (new Dec(value).gt(inputCurrency.toDec())) {
        return;
      }
      setSwapValue(value);
      await getOutputValue(value);
    },
    [getOutputValue, inputCurrency]
  );

  const handleSwapAll = useCallback(async () => {
    const value =
      +inputCurrency.toCoin().amount /
      10 ** inputCurrency.currency.coinDecimals;

    setSwapValue(value);

    await getOutputValue(value);
  }, [getOutputValue, inputCurrency]);

  return useMemo(() => {
    return {
      account,
      inputBalance: convertBalance(),
      inputCurrency,
      swapValue,
      setSwapValue: handleSetSwapValue,
      handleSwapAll,
      outputCurrency,
      outputSwapValue,
      pricePerInputCurrency,
      lpFee: fee,
      isReadyToSwap,
      handleSetSlippageTolerance,
      trade,
      slippageTolerance,
    };
  }, [
    account,
    convertBalance,
    handleSetSwapValue,
    handleSwapAll,
    inputCurrency,
    swapValue,
    outputCurrency,
    outputSwapValue,
    pricePerInputCurrency,
    fee,
    isReadyToSwap,
    handleSetSlippageTolerance,
    trade,
    slippageTolerance,
  ]);
};
