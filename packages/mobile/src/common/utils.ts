import { CoinPretty } from "@keplr-wallet/unit";

export const formatCoin = (coin?: CoinPretty, hideDenom: boolean = false) => {
  if (!coin) {
    return "";
  }

  const value = Number(coin.toDec());
  const maximumFractionDigits = value >= 1000 ? 0 : (value > 1 ? 3 : 6);
  var formattedText = value.toLocaleString("en-US", { maximumFractionDigits });
  if (!hideDenom) {
    formattedText += " " + coin.denom.toUpperCase();
  }
  return formattedText;
};

export const formatDate = (date: Date) => {
  return date.toLocaleTimeString("vi-VN") + ", " + date.toLocaleDateString("vi-VN");
};