import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { IntlShape } from "react-intl";

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_AMOUNT = 10;
export const MIN_REWARDS_AMOUNT = 0.001;
export const LOCALE_FORMAT = {
  locale: "en-US",
  fractionDelimitter: ".",
  maximumFractionDigits: (value: number): number => {
    return value >= 1000 ? 0 : value > 1 ? 3 : 6;
  },
};
export const TX_GAS_DEFAULT = {
  send: 200000,
  delegate: 250000,
  undelegate: 250000,
  redelegate: 250000,
  withdraw: 250000,
}

export const formatCoin = (coin?: CoinPretty, hideDenom: boolean = false) => {
  if (!coin) {
    return "";
  }

  const value = Number(coin.toDec());
  let formattedText = value.toLocaleString(
    LOCALE_FORMAT.locale,
    { minimumFractionDigits: 18 }
  );

  // Prevent rounded value
  const maximumFractionDigits = LOCALE_FORMAT.maximumFractionDigits(value);
  const parts = formattedText.split(LOCALE_FORMAT.fractionDelimitter);

  if (maximumFractionDigits != 0) {
    formattedText =
      parts[0]
      + LOCALE_FORMAT.fractionDelimitter
      + parts[1].substring(0, maximumFractionDigits);
  }
  else {
    formattedText = parts[0];
  }

  while (formattedText.endsWith("0")) {
    formattedText = formattedText.slice(0, -1);
  }
  if (formattedText.endsWith(".")) {
    formattedText = formattedText.slice(0, -1);
  }

  if (!hideDenom) {
    formattedText += " " + coin.denom.toUpperCase();
  }
  return formattedText;
};

export const formatDate = (date: Date) => {
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTextNumber = (value: string) => {
  var replacedValue = value.split(",").join(LOCALE_FORMAT.fractionDelimitter);
  const idx = replacedValue.indexOf(LOCALE_FORMAT.fractionDelimitter);
  if (idx !== -1) {
    replacedValue =
      replacedValue.substring(0, idx)
      + LOCALE_FORMAT.fractionDelimitter
      + replacedValue
        .substring(idx + 1, replacedValue.length)
        .split(LOCALE_FORMAT.fractionDelimitter)
        .join("");
  }

  return replacedValue;
};

export const formatPercent = (value: any, hideSymbol: boolean = false) => {
  return (
    new IntPretty(new Dec(value ?? 0))
      .moveDecimalPointRight(2)
      .maxDecimals(2)
      .trim(true)
      .toString() + (hideSymbol ? "" : "%")
  );
};

export const formatUnbondingTime = (sec: number, intl: IntlShape) => {
  const relativeEndTimeDays = Math.floor(sec / (3600 * 24));
  const relativeEndTimeHours = Math.ceil(sec / 3600);

  if (relativeEndTimeDays) {
    return intl
      .formatRelativeTime(relativeEndTimeDays, "days", {
        numeric: "always",
      })
      .replace("days", intl.formatMessage({ id: "staking.unbonding.days" }));
  } else if (relativeEndTimeHours) {
    return intl
      .formatRelativeTime(relativeEndTimeHours, "hours", {
        numeric: "always",
      })
      .replace("hours", "h");
  }

  return "";
}