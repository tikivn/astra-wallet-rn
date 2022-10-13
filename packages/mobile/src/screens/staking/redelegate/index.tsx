import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ChainStore, useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
  Staking,
} from "@keplr-wallet/stores";
import {
  FeeType,
  IAmountConfig,
  useRedelegateTxConfig,
} from "@keplr-wallet/hooks";
import { Keyboard, Text, View } from "react-native";
import { AmountInput } from "../../main/components";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import {
  buildLeftColumn,
  buildRightColumn,
} from "../../../components/foundation-view/item-row";
import { useIntl } from "react-intl";
import { SelectValidatorItem } from "./select-validator";
import {
  formatCoin,
  formatPercent,
  TX_GAS_DEFAULT,
} from "../../../common/utils";
import { MsgBeginRedelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { IRow, ListRowView } from "../../../components";
import { ValidatorInfo } from "../delegate/components/validator-info";

export const RedelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const srcValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useRedelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );

  const [dstValidatorAddress, setDstValidatorAddress] = useState("");

  const dstValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(dstValidatorAddress);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(dstValidatorAddress);
  }, [dstValidatorAddress, sendConfigs.recipientConfig]);

  const { gasPrice, gasLimit, feeType } = simulateRedelegateGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
    sendConfigs.srcValidatorAddress,
    dstValidatorAddress
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const [amountIsValid, setAmountIsValid] = useState(false);
  const [amountErrorText, setAmountErrorText] = useState("");

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "stake.redelegate.fee" }),
        }),
        buildRightColumn({ text: feeText }),
      ],
    },
  ];

  const onContinueHandler = async () => {
    Keyboard.dismiss();

    if (account.isReadyToSendTx && amountIsValid && dstValidatorAddress) {
      const params = {
        token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
        amount: Number(sendConfigs.amountConfig.amount),
        fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
        gas: gasLimit,
        gas_price: gasPrice,
        from_validator_address: sendConfigs.srcValidatorAddress,
        from_validator_name: srcValidator?.description.moniker,
        from_commission: Number(
          formatPercent(srcValidator?.commission.commission_rates.rate, true)
        ),
        to_validator_address: sendConfigs.dstValidatorAddress,
        to_validator_name: dstValidator?.description.moniker,
        to_commission: Number(
          formatPercent(dstValidator?.commission.commission_rates.rate, true)
        ),
      };

      try {
        let dec = new Dec(sendConfigs.amountConfig.amount);
        dec = dec.mulTruncate(
          DecUtils.getTenExponentN(
            sendConfigs.amountConfig.sendCurrency.coinDecimals
          )
        );
        const amount = new CoinPretty(
          sendConfigs.amountConfig.sendCurrency,
          dec
        );

        transactionStore.updateRawData({
          type: account.cosmos.msgOpts.redelegate.type,
          value: {
            amount,
            fee: sendConfigs.feeConfig.fee,
            srcValidatorAddress: sendConfigs.srcValidatorAddress,
            srcValidatorName: srcValidator?.description.moniker || "",
            dstValidatorAddress: sendConfigs.dstValidatorAddress,
            dstValidatorName: dstValidator?.description.moniker || "",
          },
        });
        const tx = account.cosmos.makeBeginRedelegateTx(
          sendConfigs.amountConfig.amount,
          sendConfigs.srcValidatorAddress,
          sendConfigs.dstValidatorAddress
        );
        await tx.simulateAndSend(
          { gasAdjustment: 1.3 },
          sendConfigs.memoConfig.memo,
          {
            preferNoSetMemo: true,
            preferNoSetFee: true,
          },
          {
            onBroadcasted: (txHash: Uint8Array) => {
              analyticsStore.logEvent("astra_hub_redelegate_token", {
                ...params,
                tx_hash: Buffer.from(txHash).toString("hex"),
                success: true,
              });
              transactionStore.updateTxHash(txHash);
            },
          }
        );
      } catch (e: any) {
        analyticsStore.logEvent("astra_hub_redelegate_token", {
          ...params,
          success: false,
          error: e?.message,
        });
        if (e?.message === "Request rejected") {
          return;
        }
        console.log(e);
        transactionStore.updateTxState("failure");
      }
    }
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["padding-x-page"])}
        enableOnAndroid
      >
        <View style={style.flatten(["height-24"])} />
        <Text style={style.flatten(["color-gray-30", "text-base-semi-bold"])}>
          {intl.formatMessage({ id: "stake.redelegate.from" })}
        </Text>
        <ValidatorInfo
          style={style.flatten(["margin-top-4", "margin-bottom-24"])}
          validatorAddress={sendConfigs.srcValidatorAddress}
        />
        <SelectValidatorItem
          currentValidator={validatorAddress}
          onSelectedValidator={(address) => {
            setDstValidatorAddress(address);
          }}
        />
        <AmountInput
          labelText={intl.formatMessage({ id: "stake.redelegate.amountLabel" })}
          amountConfig={sendConfigs.amountConfig}
          feeConfig={sendConfigs.feeConfig}
          onAmountChanged={(amount, errorText, isFocus) => {
            setAmountIsValid(Number(amount) > 0 && errorText.length === 0);
            setAmountErrorText(isFocus ? "" : errorText);
          }}
          availableAmount={staked}
          containerStyle={style.flatten(["margin-top-24"])}
        />
        <ListRowView
          rows={rows}
          style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 16 }}
          hideBorder
          clearBackground
        />
      </KeyboardAwareScrollView>
      <View
        style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}
      >
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: 56,
          }}
        >
          <Button
            text={intl.formatMessage({ id: "stake.redelegate.redelagate" })}
            disabled={amountErrorText.length !== 0}
            loading={account.txTypeInProgress === "redelegate"}
            onPress={onContinueHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});

const simulateRedelegateGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>,
  amountConfig: IAmountConfig,
  srcValidatorAddress: string,
  dstValidatorAddress: string
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(TX_GAS_DEFAULT.redelegate);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0";
    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
    );

    const msg = {
      type: account.cosmos.msgOpts.redelegate.type,
      value: {
        delegator_address: account.bech32Address,
        validator_src_address: srcValidatorAddress,
        validator_dst_address: dstValidatorAddress,
        amount: {
          denom: amountConfig.sendCurrency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };
    try {
      const { gasUsed } = await account.cosmos.simulateTx(
        [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
            value: MsgBeginRedelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorSrcAddress: msg.value.validator_src_address,
              validatorDstAddress: msg.value.validator_dst_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
        { amount: [] }
      );

      const gasLimit = Math.ceil(gasUsed * 1.3);
      console.log("__DEBUG__ simulate gasUsed", gasUsed);
      console.log("__DEBUG__ simulate gasLimit", gasLimit);
      setGasLimit(gasLimit);
    } catch (e) {
      console.log("simulateRedelegateGasFee error", e);
      setGasLimit(TX_GAS_DEFAULT.redelegate); // default gas
    }
  };

  const feeType = "average" as FeeType;
  var gasPrice = 1000000000; // default 1 gwei = 1 nano aastra
  const feeConfig = chainStore.current.feeCurrencies
    .filter((feeCurrency) => {
      return (
        feeCurrency.coinMinimalDenom ===
        chainStore.current.stakeCurrency.coinMinimalDenom
      );
    })
    .shift();
  if (feeConfig?.gasPriceStep) {
    const { [feeType]: wei } = feeConfig.gasPriceStep;
    gasPrice = wei;
  }

  return {
    gasPrice,
    gasLimit,
    feeType,
  };
};
