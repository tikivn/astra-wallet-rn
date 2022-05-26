import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";
import { useUndelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "../../../components/page";
import { AmountInput, ValidatorItem } from "../../../components/input";
import { Text, View } from "react-native";
import { Button } from "../../../components/button";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { Staking } from "@keplr-wallet/stores";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { Buffer } from "buffer/";
import { useSmartNavigation } from "../../../navigation";
import { AlertInline } from "../../../components/alert-inline";
import { AlignItems, ItemRow } from "../../../components/foundation-view/item-row";
import { TextAlign } from "../../../components/foundation-view/text-style";

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

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const style = useStyle();
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
  const fee = sendConfigs.feeConfig.fee?.trim(true).toString() ?? "";
  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <AlertInline
        type="warning"
        content="Bạn sẽ nhận được số ASA bạn rút sau 14 ngày"
      />
      <ValidatorItem
        containerStyle={style.flatten(["margin-y-16"])}
        name={validator ? validator.description.moniker : "..."}
        thumbnail={validatorThumbnail}
        value={staked.trim(true).shrink(true).maxDecimals(6).toString()}
      />
      <AmountInput label="Số tiền rút (không bao gồm lãi)" amountConfig={sendConfigs.amountConfig} />
      <ItemRow style={{ marginHorizontal: 0, paddingHorizontal: 0, }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: "Khả dụng",
            textColor: Colors["gray-30"],
          },
          {
            text: staked.trim(true).shrink(true).maxDecimals(6).toString(),
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]} />
      <ItemRow style={{ marginHorizontal: 0, paddingHorizontal: 0, }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: "Phí",
            textColor: Colors["gray-30"],
          },
          {
            text: fee,
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]} />
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
        text="Rút"
        size="large"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "undelegate"}
        onPress={async () => {
          if (account.isReadyToSendTx && txStateIsValid) {
            try {
              await account.cosmos.sendUndelegateMsg(
                sendConfigs.amountConfig.amount,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                sendConfigs.feeConfig.toStdFee(),
                {
                  preferNoSetMemo: true,
                  preferNoSetFee: true,
                },
                {
                  onBroadcasted: (txHash) => {
                    analyticsStore.logEvent("Undelegate tx broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      validatorName: validator?.description.moniker,
                      feeType: sendConfigs.feeConfig.feeType,
                    });
                    smartNavigation.pushSmart("TxPendingResult", {
                      txHash: Buffer.from(txHash).toString("hex"),
                    });
                  },
                }
              );
            } catch (e) {
              if (e?.message === "Request rejected") {
                return;
              }
              console.log(e);
              smartNavigation.navigateSmart("Home", {});
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
