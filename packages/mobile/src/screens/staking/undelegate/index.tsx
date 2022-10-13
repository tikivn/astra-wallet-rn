import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ChainStore, useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import {
  FeeType,
  IAmountConfig,
  useUndelegateTxConfig,
} from "@keplr-wallet/hooks";
import { AmountInput } from "../../main/components";
import { Keyboard, Text, View } from "react-native";
import { Button } from "../../../components/button";
import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
  Staking,
} from "@keplr-wallet/stores";
import { AlertInline } from "../../../components/alert-inline";
import {
  buildLeftColumn,
  buildRightColumn,
} from "../../../components/foundation-view/item-row";
import { useIntl } from "react-intl";
import {
  formatCoin,
  formatPercent,
  formatUnbondingTime,
  TX_GAS_DEFAULT,
} from "../../../common/utils";
import { MsgUndelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { CoinPretty, Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import { IRow, ListRowView } from "../../../components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { useSmartNavigation } from "../../../navigation-util";
import { ValidatorInfo } from "../delegate/components/validator-info";

export const UndelegateScreen: FunctionComponent = observer(() => {
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
  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const validator =
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

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );

  useEffect(() => {
    updateNavigationTitle();
  });

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const { gasPrice, gasLimit, feeType } = simulateUndelegateGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
    validatorAddress
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const unbondingTime =
    queries.cosmos.queryStakingParams.unbondingTimeSec ?? 172800;
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl);

  const [amountIsValid, setAmountIsValid] = useState(false);
  const [amountErrorText, setAmountErrorText] = useState("");

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "stake.undelegate.fee" }),
        }),
        buildRightColumn({ text: feeText }),
      ],
    },
  ];

  const onContinueHandler = async () => {
    Keyboard.dismiss();

    if (account.isReadyToSendTx && amountIsValid) {
      const params = {
        token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
        amount: Number(sendConfigs.amountConfig.amount),
        fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
        gas: gasLimit,
        gas_price: gasPrice,
        validator_address: validatorAddress,
        validator_name: validator?.description.moniker,
        commission: Number(
          formatPercent(validator?.commission.commission_rates.rate, true)
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
          type: account.cosmos.msgOpts.undelegate.type,
          value: {
            amount,
            fee: sendConfigs.feeConfig.fee,
            validatorAddress,
            validatorName: validator?.description.moniker,
            commission: new IntPretty(
              new Dec(validator?.commission.commission_rates.rate ?? 0)
            ),
          },
        });
        const tx = account.cosmos.makeUndelegateTx(
          sendConfigs.amountConfig.amount,
          sendConfigs.recipientConfig.recipient
        );
        await tx.simulateAndSend(
          { gasAdjustment: 1.3 },
          sendConfigs.memoConfig.memo,
          {
            preferNoSetMemo: true,
            preferNoSetFee: true,
          },
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("astra_hub_undelegate_token", {
                ...params,
                tx_hash: Buffer.from(txHash).toString("hex"),
                success: true,
              });
              transactionStore.updateTxHash(txHash);
            },
          }
        );
      } catch (e: any) {
        analyticsStore.logEvent("astra_hub_undelegate_token", {
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

  const updateNavigationTitle = () => {
    smartNavigation.setOptions({
      title: intl.formatMessage(
        { id: "undelegate.title" },
        { coin: chainStore.current.stakeCurrency.coinDenom }
      ),
    });
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["padding-x-page"])}
        enableOnAndroid
      >
        <View style={style.flatten(["height-page-pad"])} />
        <AlertInline
          type="info"
          content={intl.formatMessage(
            { id: "stake.undelegate.noticeWithdrawalPeriod" },
            { coin: staked.denom, days: unbondingTimeText }
          )}
        />
        <Text
          style={style.flatten([
            "color-gray-30",
            "text-base-semi-bold",
            "margin-top-24",
          ])}
        >
          {intl.formatMessage({ id: "stake.undelegate.validatorLabel" })}
        </Text>
        <ValidatorInfo
          style={style.flatten(["margin-top-4"])}
          validatorAddress={validatorAddress}
        />
        <AmountInput
          labelText={intl.formatMessage({ id: "stake.undelegate.amountLabel" })}
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
            text={intl.formatMessage({ id: "stake.undelegate.undelegate" })}
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

const simulateUndelegateGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>,
  amountConfig: IAmountConfig,
  validatorAddress: string
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(TX_GAS_DEFAULT.undelegate);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0";
    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
    );

    const msg = {
      type: account.cosmos.msgOpts.undelegate.type,
      value: {
        delegator_address: account.bech32Address,
        validator_address: validatorAddress,
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
            typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
            value: MsgUndelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
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
      console.log("simulateUndelegateGasFee error", e);
      setGasLimit(TX_GAS_DEFAULT.undelegate); // default gas
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
