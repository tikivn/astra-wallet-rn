import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";
import { useUndelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "../../../components/page";
import { AmountInput, ValidatorItem } from "../../../components/input";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { Staking } from "@keplr-wallet/stores";
import { useSmartNavigation } from "../../../navigation-util";
import { AlertInline } from "../../../components/alert-inline";
import {
  AlignItems,
  ItemRow,
} from "../../../components/foundation-view/item-row";
import { TextAlign } from "../../../components/foundation-view/text-style";
import { useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";

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
  sendConfigs.feeConfig.setFeeType("average");
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
        label={intl.formatMessage({ id: "stake.undelegate.amountLabel" })}
        amountConfig={sendConfigs.amountConfig}
      />
      <ItemRow
        style={{ marginHorizontal: 0, paddingHorizontal: 0 }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: intl.formatMessage({ id: "stake.undelegate.available" }),
            textColor: Colors["gray-30"],
          },
          {
            text: formatCoin(staked),
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]}
      />
      <ItemRow
        style={{ marginHorizontal: 0, paddingHorizontal: 0 }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: intl.formatMessage({ id: "stake.undelegate.fee" }),
            textColor: Colors["gray-30"],
          },
          {
            text: feeText,
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]}
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
        onPress={async () => {
          if (account.isReadyToSendTx && txStateIsValid) {
            try {
              transactionStore.updateTxData({
                chainInfo: chainStore.current,
                amount: sendConfigs.amountConfig,
                fee: sendConfigs.feeConfig,
                memo: sendConfigs.memoConfig,
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
                      tx_hash: Buffer.from(txHash).toString("hex"),
                      token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
                      amount: Number(sendConfigs.amountConfig.amount),
                      fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
                      fee_type: sendConfigs.feeConfig.feeType,
                      gas: sendConfigs.gasConfig.gas,
                      validator_address: validatorAddress,
                      validator_name: validator?.description.moniker,
                      commission: 100 * Number(validator?.commission.commission_rates.rate ?? "0"),
                      success: true,
                    });
                    transactionStore.updateTxHash(txHash);
                  },
                }
              );
            } catch (e: any) {
              analyticsStore.logEvent("astra_hub_undelegate_token", {
                token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
                amount: Number(sendConfigs.amountConfig.amount),
                fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
                fee_type: sendConfigs.feeConfig.feeType,
                gas: sendConfigs.gasConfig.gas,
                validator_address: validatorAddress,
                validator_name: validator?.description.moniker,
                commission: 100 * Number(validator?.commission.commission_rates.rate ?? "0"),
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
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
