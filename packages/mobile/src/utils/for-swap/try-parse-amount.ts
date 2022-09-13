import { parseUnits } from "@ethersproject/units";
import {
  Currency,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
} from "@solarswap/sdk";
// eslint-disable-next-line import/no-extraneous-dependencies

// try to parse a user entered amount for a given token
export const tryParseAmount = (
  value?: string,
  currency?: Currency,
  WASA?: Token
): CurrencyAmount | TokenAmount | undefined => {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();

    if (typedValueParsed !== "0") {
      return currency.symbol !== WASA?.symbol
        ? new TokenAmount(currency as Token, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
};
