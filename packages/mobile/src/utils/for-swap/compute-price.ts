import { SwapField } from "./index";
import {
  CurrencyAmount,
  Fraction,
  Percent,
  TokenAmount,
  Trade,
  JSBI,
} from "@solarswap/sdk";
import { calculateSlippagePercent } from ".";
import { BASE_FEE } from "./constant";

const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000));
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE);

export function computeTradePriceBreakdown(
  trade?: Trade | null
): {
  priceImpactWithoutFee: Percent | undefined;
  realizedLPFee: CurrencyAmount | undefined | null;
} {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction =>
            currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
          ONE_HUNDRED_PERCENT
        )
      );

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction =
    trade && realizedLPFee
      ? trade.priceImpact.subtract(realizedLPFee)
      : undefined;

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(
        priceImpactWithoutFeeFraction?.numerator,
        priceImpactWithoutFeeFraction?.denominator
      )
    : undefined;

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(
          trade.inputAmount.token,
          realizedLPFee.multiply(trade.inputAmount.raw).quotient
        )
      : CurrencyAmount.ether(
          realizedLPFee.multiply(trade.inputAmount.raw).quotient
        ));

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
  };
}

export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number
): { [field in SwapField]?: CurrencyAmount } {
  const pct = calculateSlippagePercent(allowedSlippage);
  return {
    [SwapField.Input]: trade?.maximumAmountIn(pct),
    [SwapField.Output]: trade?.minimumAmountOut(pct),
  };
}
