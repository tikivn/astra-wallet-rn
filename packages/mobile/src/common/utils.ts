import { CoinPretty, Dec } from "@keplr-wallet/unit";

export const formatNumber = (value: any) => {
  if (value instanceof Dec) {
    const numValue = Number(value);
    return numValue.toLocaleString("vi-VN", {
      maximumFractionDigits: numValue < 1000 ? 3 : 0,
    })
  }
  return value;
};

export const formatCoin = (coin?: CoinPretty, hideDenom: boolean = false) => {
  if (!coin) {
    return "";
  }

  const value = Number(coin.toDec());
  var formattedText = value.toLocaleString("vi-VN", {
    maximumFractionDigits: value < 1000 ? 3 : 0,
  });
  if (!hideDenom) {
    formattedText += " " + coin.denom.toUpperCase();
  }
  return formattedText;
};