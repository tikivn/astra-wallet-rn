import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";
import { Staking } from "@keplr-wallet/stores";
import { useRedelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "../../../components/page";
import { Text, View } from "react-native";
import {
  AmountInput,
  SelectorButtonWithoutModal,
  ValidatorItem,
} from "../../../components/input";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation";
import { ItemRow, AlignItems } from "../../../components/foundation-view/item-row";
import { TextAlign } from "../../../components/foundation-view/text-style";

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

  const smartNavigation = useSmartNavigation();

  const { chainStore, accountStore, queriesStore, analyticsStore, transactionStore } = useStore();

  const style = useStyle();

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

  const srcValidatorThumbnail = srcValidator
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

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;
  sendConfigs.feeConfig.setFeeType('high');
  sendConfigs.gasConfig.setGas(3000000);
  const fee = sendConfigs.feeConfig.fee?.trim(true).toString() ?? "";
  return (
    <PageWithScrollView
      backgroundColor={Colors["background"]}
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <Text style={style.flatten(["color-gray-30", "subtitle2"])}>Từ</Text>
      <ValidatorItem
        containerStyle={style.flatten(["margin-bottom-16"])}
        name={srcValidator ? srcValidator.description.moniker : "..."}
        thumbnail={srcValidatorThumbnail}
        value={staked.trim(true).shrink(true).maxDecimals(6).toString()}
      />

      <SelectorButtonWithoutModal
        label="Sang"
        placeHolder="Select Validator"
        selected={
          dstValidator
            ? {
                key: dstValidatorAddress,
                label: dstValidator.description.moniker || dstValidatorAddress,
              }
            : undefined
        }
        onPress={() => {
          smartNavigation.pushSmart("Validator.List.New", {
            validatorSelector: (validatorAddress: string) => {
              setDstValidatorAddress(validatorAddress);
            },
          });
        }}
      />
      <AmountInput label="Số tiền chuyển đổi" amountConfig={sendConfigs.amountConfig} />
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
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Chuyển đổi quỹ"
        size="large"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "redelegate"}
        onPress={async () => {
          if (account.isReadyToSendTx && txStateIsValid) {
            try {
              await account.cosmos.sendBeginRedelegateMsg(
                sendConfigs.amountConfig.amount,
                sendConfigs.srcValidatorAddress,
                sendConfigs.dstValidatorAddress,
                sendConfigs.memoConfig.memo,
                sendConfigs.feeConfig.toStdFee(),
                {
                  preferNoSetMemo: true,
                  preferNoSetFee: true,
                },
                {
                  onBroadcasted: (txHash) => {
                    analyticsStore.logEvent("Redelgate tx broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      validatorName: srcValidator?.description.moniker,
                      toValidatorName: dstValidator?.description.moniker,
                      feeType: sendConfigs.feeConfig.feeType,
                    });
                    transactionStore.updateTxHash(txHash);
                    // smartNavigation.pushSmart("TxPendingResult", {
                    //   txHash: Buffer.from(txHash).toString("hex"),
                    // });
                  },
                }
              );
            } catch (e) {
              if (e?.message === "Request rejected") {
                return;
              }
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
