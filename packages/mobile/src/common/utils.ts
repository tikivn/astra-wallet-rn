import { CoinPretty } from "@keplr-wallet/unit";

export const formatCoin = (coin?: CoinPretty, hideDenom: boolean = false) => {
  if (!coin) {
    return "";
  }

  const value = Number(coin.toDec());
  var formattedText = value.toLocaleString("en-US", {
    maximumFractionDigits: value < 1000 ? 6 : 0,
  });
  if (!hideDenom) {
    formattedText += " " + coin.denom.toUpperCase();
  }
  return formattedText;
};