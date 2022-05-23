import { FeeConfig } from "@keplr-wallet/hooks";
import { CoinPrimitive, CosmosMsgOpts, CosmwasmMsgOpts, SecretMsgOpts } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { Coin, CoinUtils } from "@keplr-wallet/unit";
import { clearDecimals, MessageObj, MsgBeginRedelegate, MsgDelegate, MsgExecuteContract, MsgSend, MsgTransfer, MsgUndelegate, MsgVote, MsgWithdrawDelegatorReward, renderMsgBeginRedelegate, renderMsgDelegate, renderMsgExecuteContract, renderMsgSend, renderMsgTransfer, renderMsgUndelegate, renderMsgVote, renderMsgWithdrawDelegatorReward, renderUnknownMessage } from "../../../modals/sign/messages";
import { Amount, IAmount } from "./amount";
import { ITransaction } from "./transaction";

function parseAmount(
  currencies: AppCurrency[],
  amounts: CoinPrimitive[],
): IAmount[] {
  return amounts.map((amount) => {
    const coin = new Coin(amount.denom, amount.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    return new Amount(
      Number(clearDecimals(parsed.amount)),
      clearDecimals(parsed.amount),
      parsed.denom,
    );
  });
}

export function processTransactionAmino(
  msgOpts: {
    readonly cosmos: {
      readonly msgOpts: CosmosMsgOpts;
    };
    readonly cosmwasm: {
      readonly msgOpts: CosmwasmMsgOpts;
    };
    readonly secret: {
      readonly msgOpts: SecretMsgOpts;
    };
  },
  msg: MessageObj,
  feeConfig: FeeConfig,
  currencies: AppCurrency[]
): {
  title?: string;
  content?: React.ReactElement;
  scrollViewHorizontal?: boolean;
  transaction?: ITransaction;
} {
  const feeAmountString = feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0";
  const feeAmount = new Amount(
    Number(feeAmountString),
    feeAmountString,
    feeConfig.fee?.denom ?? ""
  );

  if (msg.type === msgOpts.cosmos.msgOpts.send.native.type) {
    const value = msg.value as MsgSend["value"];
    console.log("__DEBUG__ 11111111111111", value);
    return {
      ...renderMsgSend(currencies, value.amount, value.to_address),
      transaction: {
        fromAddress: value.from_address,
        toAddress: value.to_address,
        amounts: parseAmount(currencies, value.amount),
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.cosmos.msgOpts.ibcTransfer.type) {
    const value = msg.value as MsgTransfer["value"];
    console.log("__DEBUG__ 2222222222222", value);
    return {
      ...renderMsgTransfer(
        currencies,
        value.token,
        value.receiver,
        value.source_channel
      ),
      transaction: {
        fromAddress: value.sender,
        toAddress: value.receiver,
        amounts: parseAmount(currencies, [value.token]),
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.cosmos.msgOpts.redelegate.type) {
    const value = msg.value as MsgBeginRedelegate["value"];
    console.log("__DEBUG__ 33333333333:", value);
    return {
      ...renderMsgBeginRedelegate(
        currencies,
        value.amount,
        value.validator_src_address,
        value.validator_dst_address
      ),
      transaction: {
        fromAddress: value.validator_src_address,
        toAddress: value.validator_dst_address,
        amounts: parseAmount(currencies, [value.amount]),
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.cosmos.msgOpts.undelegate.type) {
    const value = msg.value as MsgUndelegate["value"];
    console.log("__DEBUG__ 4444444444444:", value);
    return {
      ...renderMsgUndelegate(
        currencies,
        value.amount,
        value.validator_address
      ),
      transaction: {
        fromAddress: value.delegator_address,
        toAddress: value.validator_address,
        amounts: parseAmount(currencies, [value.amount]),
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.cosmos.msgOpts.delegate.type) {
    const value = msg.value as MsgDelegate["value"];
    console.log("__DEBUG__ 55555555555555555:", value);
    return {
      ...renderMsgDelegate(currencies, value.amount, value.validator_address),
      transaction: {
        fromAddress: value.delegator_address,
        toAddress: value.validator_address,
        amounts: parseAmount(currencies, [value.amount]),
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.cosmos.msgOpts.withdrawRewards.type) {
    const value = msg.value as MsgWithdrawDelegatorReward["value"];
    console.log("__DEBUG__ 6666666666666666:", value);
    return {
      ...renderMsgWithdrawDelegatorReward(value.validator_address),
      transaction: {
        fromAddress: value.delegator_address,
        toAddress: value.validator_address,
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.cosmos.msgOpts.govVote.type) {
    const value = msg.value as MsgVote["value"];
    console.log("__DEBUG__ 77777777777777777:", value);
    return {
      ...renderMsgVote(value.proposal_id, value.option),
      transaction: {
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.cosmwasm.msgOpts.executeWasm.type) {
    const value = msg.value as MsgExecuteContract["value"];
    console.log("__DEBUG__ 888888888888888:", value);
    return {
      ...renderMsgExecuteContract(
        currencies,
        value.funds ?? [],
        undefined,
        value.contract,
        value.msg
      ),
      transaction: {
        fromAddress: value.sender,
        toAddress: value.contract,
        amounts: parseAmount(
          currencies,
          [
            ...value.funds || [],
            ...value.sent_funds || []
          ]
        ),
        feeAmount,
      },
    };
  }

  if (msg.type === msgOpts.secret.msgOpts.executeSecretWasm.type) {
    const value = msg.value as MsgExecuteContract["value"];
    console.log("__DEBUG__ 9999999999999999999:", value);
    return {
      ...renderMsgExecuteContract(
        currencies,
        value.sent_funds ?? [],
        value.callback_code_hash,
        value.contract,
        value.msg
      ),
      transaction: {
        fromAddress: value.sender,
        toAddress: value.contract,
        amounts: parseAmount(
          currencies,
          [
            ...value.funds || [],
            ...value.sent_funds || []
          ]
        ),
        feeAmount,
      },
    };
  }

  return {
    ...renderUnknownMessage(msg),
    transaction: {
      feeAmount,
    },
  };
}
