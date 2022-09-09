import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ChainStore, useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { FeeType, IAmountConfig, useUndelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "../../../components/page";
import { ValidatorItem } from "../../../components/input";
import { AmountInput } from "../../main/components";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { AccountStore, CosmosAccount, CosmwasmAccount, SecretAccount, Staking } from "@keplr-wallet/stores";
import { useSmartNavigation } from "../../../navigation-util";
import { AlertInline } from "../../../components/alert-inline";
import {
  buildLeftColumn,
  buildRightColumn,
} from "../../../components/foundation-view/item-row";
import { useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
import { MsgUndelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { CoinPretty, Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import { IRow, ListRowView } from "../../../components";

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

  const validatorThumbnail = validator
    ? queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidatorThumbnail(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidatorThumbnail(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidatorThumbnail(validatorAddress)
    : undefined;

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
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  const { gasPrice, gasLimit, feeType } = simulateUndelegateGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
    validatorAddress,
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const chainInfo = chainStore.getChain(chainStore.current.chainId).raw;
  const unbondingTime = chainInfo.unbondingTime ?? 86400000;
  const unbondingTimeText = (() => {
    const relativeEndTime = unbondingTime / 1000;
    const relativeEndTimeDays = Math.floor(relativeEndTime / (3600 * 24));
    const relativeEndTimeHours = Math.ceil(relativeEndTime / 3600);

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
  })();

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: intl.formatMessage({ id: "stake.undelegate.available" }) }),
        buildRightColumn({ text: formatCoin(staked) }),
      ]
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: intl.formatMessage({ id: "stake.undelegate.fee" }) }),
        buildRightColumn({ text: feeText }),
      ]
    },
  ];

  const onContinueHandler = async () => {
    if (account.isReadyToSendTx && txStateIsValid) {
      const params = {
        token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
        amount: Number(sendConfigs.amountConfig.amount),
        fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
        gas: gasLimit,
        gas_price: gasPrice,
        validator_address: validatorAddress,
        validator_name: validator?.description.moniker,
        commission: 100 * Number(validator?.commission.commission_rates.rate ?? "0"),
      };

      try {
        let dec = new Dec(sendConfigs.amountConfig.amount);
        dec = dec.mulTruncate(DecUtils.getTenExponentN(sendConfigs.amountConfig.sendCurrency.coinDecimals));
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
            commission: new IntPretty(new Dec(validator?.commission.commission_rates.rate ?? 0)),
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
        transactionStore.rejectTransaction();
        console.log(e);
        smartNavigation.navigateSmart("NewHome", {});
      }
    }
  };

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <AlertInline
        type="warning"
        content={intl.formatMessage(
          { id: "stake.undelegate.noticeWithdrawalPeriod" },
          { coin: "ASA", days: unbondingTimeText }
        )}
      />
      <ValidatorItem
        containerStyle={style.flatten(["margin-y-16"])}
        name={validator ? validator.description.moniker : "..."}
        thumbnail={validatorThumbnail}
        value={formatCoin(staked)}
      />
      <AmountInput
        labelText={intl.formatMessage({ id: "stake.undelegate.amountLabel" })}
        amountConfig={sendConfigs.amountConfig}
      />
      <ListRowView
        rows={rows}
        style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 24 }}
        hideBorder
        clearBackground
      />
      {/* <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      /> */}
      <View style={style.flatten(["flex-1"])} />
      <Button
        containerStyle={style.flatten(["border-radius-4", "height-44"])}
        textStyle={style.flatten(["subtitle2"])}
        text={intl.formatMessage({ id: "stake.undelegate.undelegate" })}
        size="large"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "undelegate"}
        onPress={onContinueHandler}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

const simulateUndelegateGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >,
  amountConfig: IAmountConfig,
  validatorAddress: string,
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(0);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0"
    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals));

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
    const { gasUsed } = await account.cosmos.simulateTx(
      [{
        typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
        value: MsgUndelegate.encode({
          delegatorAddress: msg.value.delegator_address,
          validatorAddress: msg.value.validator_address,
          amount: msg.value.amount,
        }).finish(),
      }],
      { amount: [] },
    );

    const gasLimit = Math.ceil(gasUsed * 1.3);
    console.log("__DEBUG__ simulate gasUsed", gasUsed);
    console.log("__DEBUG__ simulate gasLimit", gasLimit);
    setGasLimit(gasLimit);
  }

  const feeType = "average" as FeeType;
  const { [feeType]: wei } = chainStore.current.gasPriceStep;

  const gwei = (new Dec(wei).mulTruncate(DecUtils.getTenExponentN(-9)));

  return {
    gasPrice: Number(gwei),
    gasLimit,
    feeType,
  }
};