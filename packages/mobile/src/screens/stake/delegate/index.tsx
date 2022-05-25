import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../components/page";
import { Colors, useStyle } from "../../../styles";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import { useStore } from "../../../stores";
import { useDelegateTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { AmountInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation";
import { Staking } from "@keplr-wallet/stores";
import { ValidatorInfo } from "./components/validator-info";
import { AlertInline } from "../../../components/alert-inline";
import { AlignItems, ItemRow } from "../../../components/foundation-view/item-row";
import { TextAlign } from "../../../components/foundation-view/text-style";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";

export const DelegateScreen: FunctionComponent = observer(() => {
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

  const { chainStore, accountStore, queriesStore, analyticsStore, userBalanceStore } = useStore();

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    EthereumEndpoint
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

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const validator = bondedValidators.getValidator(validatorAddress);
  // console.log("__DEBUG__ validator:", JSON.stringify(validator));

  const balance = userBalanceStore.getBalanceString();

  const name = validator?.description.moniker ?? "";
  const thumbnailUrl = bondedValidators.getValidatorThumbnail(validatorAddress);

  const commission = new IntPretty(
    new Dec(validator?.commission.commission_rates.rate || 0)
  )
    .decreasePrecision(2)
    .maxDecimals(2)
    .trim(true)
    .toString() + "%";

  const votingPower = new CoinPretty(
    chainStore.current.stakeCurrency,
    new Dec(validator?.tokens || 0)
  )
    .maxDecimals(0)
    .toString();

  sendConfigs.feeConfig.setFeeType("average");
  const fee = sendConfigs.feeConfig.fee?.trim(true).toString() ?? "";
  // console.log("__DEBUG__ sendConfigs:", sendConfigs.feeConfig.fee);

  function item(label: string, value: string): React.ReactNode {
    return <ItemRow
      style={{ marginHorizontal: 0, paddingHorizontal: 0, }}
      alignItems={AlignItems.center}
      itemSpacing={12}
      columns={[
        {
          text: label,
          textColor: Colors["gray-30"],
        },
        {
          text: value,
          textColor: Colors["gray-10"],
          textAlign: TextAlign.right,
          flex: 1,
        },
      ]}
    />;
  }

  const items = [
    item("Khả dụng", balance),
    item("Phí", fee),
  ];

  return (
    <PageWithScrollView
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
      backgroundColor={Colors["gray-100"]}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <AlertInline
        type="warning"
        content="Sau khi đầu tư, nếu bạn muốn rút tiền, thì bạn sẽ nhận được tiền sau 14 ngày."
      />
      <ValidatorInfo
        style={{ marginTop: 24, }}
        {...{ name, thumbnailUrl, commission, votingPower }}
      />
      <AmountInput
        containerStyle={{ marginTop: 24, }}
        label="Số lượng"
        amountConfig={sendConfigs.amountConfig}
      />

      {items}

      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Đầu tư"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === "delegate"}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            try {
              await account.cosmos.sendDelegateMsg(
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
                    analyticsStore.logEvent("Delegate tx broadcasted", {
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
