import { JSBI, Percent, Trade } from "@astradefi/sdk";
import { AppCurrency } from "@keplr-wallet/types";
import React, { FunctionComponent, useMemo, useState } from "react";
import { Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../components";
import { Button } from "../../components/button";
import { useStyle } from "../../styles";
import { registerModal } from "../base";
import { CardModal } from "../card";

export const ConfirmSwapModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  onConfirmSwap: () => void;
  inputCurrency: AppCurrency;
  outputCurrency: AppCurrency;
  trade?: Trade;
  lpFee?: string;
  pricePerInputCurrency?: string;
  slippageTolerance?: number;
}> = registerModal(
  ({
    close,
    title,
    inputCurrency,
    onConfirmSwap,
    outputCurrency,
    pricePerInputCurrency,
    lpFee,
    trade,
    slippageTolerance,
  }) => {
    const style = useStyle();
    const [loading, setLoading] = useState(false);

    const handleConfirmSwap = async () => {
      setLoading(true);
      try {
        onConfirmSwap();
        close();
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    const coinInputImg = useMemo(() => {
      if (!inputCurrency) return "";
      return inputCurrency.coinImageUrl;
    }, [inputCurrency]);

    const coinOuputImg = useMemo(() => {
      if (!outputCurrency) return "";
      return outputCurrency.coinImageUrl;
    }, [outputCurrency]);

    return (
      <CardModal title={title}>
        <View
          style={style.flatten([
            "flex",
            "justify-between",
            "items-center",
            "flex-row",
          ])}
        >
          <View style={style.flatten(["flex-row", "items-center"])}>
            {coinInputImg ? (
              <FastImage
                style={{
                  width: 24,
                  height: 24,
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: coinInputImg,
                }}
              />
            ) : (
              <VectorCharacter
                char={inputCurrency?.coinDenom || "Input"}
                height={Math.floor(24)}
                color="white"
              />
            )}
            <Text
              style={style.flatten(["text-medium-regular", "margin-left-8"])}
            >
              {trade?.inputAmount.toSignificant(6)}
            </Text>
          </View>
          <Text style={style.flatten(["text-medium-medium"])}>
            {inputCurrency?.coinDenom}
          </Text>
        </View>
        <View style={style.flatten(["margin-y-4"])}>
          <Text
            style={style.flatten(["text-x-large-semi-bold", "self-center"])}
          >
            To
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex",
            "justify-between",
            "items-center",
            "flex-row",
            "margin-bottom-20",
          ])}
        >
          <View style={style.flatten(["flex-row", "items-center"])}>
            {coinOuputImg ? (
              <FastImage
                style={{
                  width: 24,
                  height: 24,
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: coinOuputImg,
                }}
              />
            ) : (
              <VectorCharacter
                char={outputCurrency?.coinDenom || "Ouput"}
                height={Math.floor(24)}
                color="white"
              />
            )}
            <Text
              style={style.flatten(["text-medium-regular", "margin-left-8"])}
            >
              {trade?.outputAmount.toSignificant(6)}
            </Text>
          </View>
          <Text style={style.flatten(["text-medium-medium"])}>
            {outputCurrency?.coinDenom}
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex",
            "justify-between",
            "items-center",
            "flex-row",
            "margin-y-10",
          ])}
        >
          <Text style={style.flatten(["text-caption"])}>Price</Text>
          <Text style={style.flatten(["text-medium-medium"])}>
            {`${pricePerInputCurrency} ${outputCurrency?.coinDenom} / ${inputCurrency?.coinDenom}`}
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex",
            "justify-between",
            "items-center",
            "flex-row",
            "margin-y-10",
          ])}
        >
          <Text style={style.flatten(["text-caption"])}>Minimum received</Text>
          <Text style={style.flatten(["text-medium-medium"])}>
            {trade
              ?.minimumAmountOut(
                new Percent(JSBI.BigInt(slippageTolerance || 50), 10000)
              )
              .toSignificant(6)}
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex",
            "justify-between",
            "items-center",
            "flex-row",
            "margin-y-10",
            "margin-bottom-20",
          ])}
        >
          <Text style={style.flatten(["text-caption"])}>
            Liquidity Provider Fee
          </Text>
          <Text style={style.flatten(["text-medium-medium"])}>{lpFee} ASA</Text>
        </View>
        {/* <View
          style={style.flatten([
            "flex",
            "justify-between",
            "items-center",
            "flex-row",
          ])}
        >
          <Text style={style.flatten(["text-caption"])}>Price Impact</Text>
          <Text style={style.flatten(["text-medium-medium"])}>
            {trade?.minimumAmountOut(new Percent(50, 10000))}
          </Text>
        </View> */}

        <Button
          text="Confirm"
          size="large"
          loading={loading}
          onPress={handleConfirmSwap}
        />
      </CardModal>
    );
  },
  {
    disableSafeArea: true,
  }
);
