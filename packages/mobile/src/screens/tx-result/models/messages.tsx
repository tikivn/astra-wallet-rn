/* eslint-disable react/display-name */

import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { CoinUtils, Coin, IntPretty, Dec, CoinPretty } from "@keplr-wallet/unit";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import yaml from "js-yaml";
import { CoinPrimitive } from "@keplr-wallet/stores";
import { Text } from "react-native";
import { Bech32Address } from "@keplr-wallet/cosmos";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Hypher from "hypher";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import english from "hyphenation.en-us";
import { Buffer } from "buffer/";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";
import { AlignItems, buildLeftColumn, buildRightColumn, IRow, RowType } from "../../../components";

const h = new Hypher(english);

// https://zpl.fi/hyphenation-in-react-native/
function hyphen(text: string): string {
  return h.hyphenateText(text);
}

export interface MessageObj {
  readonly type: string;
  readonly value: unknown;
}

export interface MsgSend {
  value: {
    amount: [
      {
        amount: string;
        denom: string;
      }
    ];
    from_address: string;
    to_address: string;
  };
}

export interface MsgTransfer {
  value: {
    source_port: string;
    source_channel: string;
    token: {
      denom: string;
      amount: string;
    };
    sender: string;
    receiver: string;
    timeout_height: {
      revision_number: string | undefined;
      revision_height: string;
    };
  };
}

export interface MsgDelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgUndelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgWithdrawDelegatorReward {
  value: {
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgBeginRedelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_dst_address: string;
    validator_src_address: string;
  };
}

export interface MsgVote {
  value: {
    proposal_id: string;
    voter: string;
    // In the stargate, option would be the enum (0: empty, 1: yes, 2: abstain, 3: no, 4: no with veto).
    option: string | number;
  };
}

export interface MsgInstantiateContract {
  value: {
    // Admin field can be omitted.
    admin?: string;
    sender: string;
    code_id: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    init_msg: object;
    init_funds: [
      {
        amount: string;
        denom: string;
      }
    ];
  };
}

// This message can be a normal cosmwasm message or a secret-wasm message.
export interface MsgExecuteContract {
  value: {
    contract: string;
    // If message is for secret-wasm, msg will be the base64 encoded and encrypted string.
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object | string;
    sender: string;
    // The field is for wasm message.
    funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    // The bottom fields are for secret-wasm message.
    sent_funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    callback_code_hash?: string;
    callback_sig?: string | null;
  };
}

export interface MsgLink {
  value: {
    links: [
      {
        from: string;
        to: string;
      }
    ];
    address: string;
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function renderUnknownMessage(msg: object) {
  return {
    icon: undefined,
    title: "Custom",
    content: <UnknownMsgView msg={msg} />,
    scrollViewHorizontal: true,
  };
}

const common: {
  type: RowType,
  alignItems?: AlignItems,
  itemSpacing?: number,
} = {
  type: "items",
  alignItems: AlignItems.center,
  itemSpacing: 12,
};

export function renderMsgSend(
  currencies: AppCurrency[],
  amount: CoinPrimitive[],
  fee: string,
  toAddress: string
): IRow[] {
  const receives: CoinPrimitive[] = [];
  for (const coinPrimitive of amount) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    receives.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  const separatorRow: IRow = { type: "separator" };
  const rows: IRow[] = join([
    {
      ...common,
      alignItems: AlignItems.top,
      cols: [
        buildLeftColumn({ text: "Người nhận", flex: 3, }),
        buildRightColumn({ text: toAddress, flex: 7, })
      ],
    },
    ...receives.map((coin) => {
      return {
        ...common,
        cols: [
          buildLeftColumn({ text: "Số Astra", flex: 3, }),
          buildRightColumn({ text: `${coin.amount} ${coin.denom}`, flex: 7, })
        ],
      };
    }),
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Phí giao dịch", flex: 3, }),
        buildRightColumn({ text: fee, flex: 7, })
      ],
    },
  ], separatorRow);

  return rows;
}

export function renderMsgTransfer(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  receiver: string,
  channelId: string
) {
  const coin = new Coin(amount.denom, amount.amount);
  const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  return {
    title: "IBC Transfer",
    content: (
      <Text>
        <Text>{"Send "}</Text>
        <Text
          style={{
            fontWeight: "bold",
          }}
        >
          {hyphen(`${amount.amount} ${amount.denom}`)}
        </Text>
        <Text>{" to "}</Text>
        <Text style={{ fontWeight: "bold" }}>
          {hyphen(Bech32Address.shortenAddress(receiver, 20))}
        </Text>
        <Text>{" on "}</Text>
        <Text style={{ fontWeight: "bold" }}>{channelId}</Text>
      </Text>
    ),
  };
}

export function renderMsgBeginRedelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validatorSrcAddress: string,
  validatorDstAddress: string,
  fee: string,
) {
  const { transactionStore } = useStore();
  const validatorSrc = transactionStore.getValidator({ validatorAddress: validatorSrcAddress })
  const validatorDst = transactionStore.getValidator({ validatorAddress: validatorDstAddress })

  const date = new Date();
  const dateString = date.toLocaleTimeString("vi-VN") + ", " + date.toLocaleDateString("vi-VN");

  const rows: IRow[] = join([
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Chuyển từ quỹ" }),
        buildRightColumn({ text: validatorSrc?.description.moniker ?? "" })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Đến quỹ" }),
        buildRightColumn({ text: validatorDst?.description.moniker ?? "" })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Thời gian thực hiện" }),
        buildRightColumn({ text: dateString })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Phí giao dịch" }),
        buildRightColumn({ text: fee })
      ],
    },
  ], { type: "separator" });

  return rows;
}

export function renderMsgUndelegate(
  validatorAddress: string,
  fee: string,
): IRow[] {
  const { transactionStore } = useStore();
  const validator = transactionStore.getValidator({ validatorAddress })

  const date = new Date();
  const dateString = date.toLocaleTimeString("vi-VN") + ", " + date.toLocaleDateString("vi-VN");

  const rows: IRow[] = join([
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Rút từ quỹ" }),
        buildRightColumn({ text: validator?.description.moniker ?? "" })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Thời gian thực hiện" }),
        buildRightColumn({ text: dateString })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Phí rút" }),
        buildRightColumn({ text: fee })
      ],
    },
  ], { type: "separator" });

  return rows;
}

export function renderMsgDelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  fee: string,
  validatorAddress: string
) {
  const { transactionStore } = useStore();
  const validator = transactionStore.getValidator({ validatorAddress })
  const commission = new IntPretty(
    new Dec(validator?.commission.commission_rates.rate || 0)
  )
    .maxDecimals(2)
    .trim(true)
    .toString() + "%";

  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  const date = new Date();
  const dateString = date.toLocaleTimeString("vi-VN") + ", " + date.toLocaleDateString("vi-VN");

  const rows: IRow[] = join([
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Quỹ đầu tư" }),
        buildRightColumn({ text: validator?.description.moniker ?? "" })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Hoa hồng khi mở quỹ" }),
        buildRightColumn({
          text: commission
        })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Thời gian thực hiện" }),
        buildRightColumn({ text: dateString })
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Phí giao dịch" }),
        buildRightColumn({ text: fee })
      ],
    },
  ], { type: "separator" });

  return rows;
}

export function renderMsgWithdrawDelegatorReward(
  addresses: MsgWithdrawDelegatorReward["value"][],
  fee: string,
): IRow[] {
  const { chainStore, transactionStore } = useStore();

  var rows: IRow[] = [
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Nhận tiền lãi từ quỹ" }),
        buildRightColumn({ text: "" })
      ],
    },
  ];

  addresses.map((address) => {
    const validator = transactionStore.getValidator({ validatorAddress: address.validator_address });
    const delegations = transactionStore.getDelegations({ validatorAddress: address.validator_address });

    delegations?.forEach((del) => {
      const currencies = chainStore.current.currencies.filter((currency) => {
        return currency.coinDenom == del.balance.denom;
      });

      if (currencies.length != 0) {
        const amount = new CoinPretty(currencies[0], del.balance.amount)
          .trim(true)
          .maxDecimals(6)
          .upperCase(true)
          .toString();

        rows = [
          ...rows,
          {
            ...common,
            cols: [
              buildLeftColumn({ text: validator?.description.moniker ?? "", textColor: Colors["gray-10"] }),
              buildRightColumn({ text: amount })
            ],
          },
        ];
      }
    });
  });
  // const validator = transactionStore.getValidator({ validatorAddress });

  // const rows: IRow[] = join([
  //   {
  //     ...common,
  //     cols: [
  //       buildLeftColumn({ text: "Nhận tiền lãi từ quỹ" }),
  //       buildRightColumn({ text: validator?.description.moniker ?? "" })
  //     ],
  //   },
  //   {
  //     ...common,
  //     cols: [
  //       buildLeftColumn({ text: validator?.description.moniker ?? "" }),
  //       buildRightColumn({ text: JSON.stringify(validator) ?? "" })
  //     ],
  //   },
  //   {
  //     ...common,
  //     cols: [
  //       buildLeftColumn({ text: "Thời gian thực hiện" }),
  //       buildRightColumn({ text: "Chưa có thông tin" })
  //     ],
  //   },
  //   {
  //     ...common,
  //     cols: [
  //       buildLeftColumn({ text: "Phí giao dịch" }),
  //       buildRightColumn({ text: fee })
  //     ],
  //   },
  // ], { type: "separator" });

  const date = new Date();
  const dateString = date.toLocaleTimeString("vi-VN") + ", " + date.toLocaleDateString("vi-VN");

  rows = [
    ...rows,
    { type: "separator" },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Thời gian thực hiện" }),
        buildRightColumn({ text: dateString })
      ],
    },
    { type: "separator" },
    {
      ...common,
      cols: [
        buildLeftColumn({ text: "Phí rút" }),
        buildRightColumn({ text: fee })
      ],
    },
  ];

  return rows;
}

export function renderMsgVote(proposalId: string, option: string | number) {
  const textualOption = (() => {
    if (typeof option === "string") {
      return option;
    }

    switch (option) {
      case 0:
        return "Empty";
      case 1:
        return "Yes";
      case 2:
        return "Abstain";
      case 3:
        return "No";
      case 4:
        return "No with veto";
      default:
        return "Unspecified";
    }
  })();

  // Vote <b>{option}</b> on <b>Proposal {id}</b>

  return {
    title: "Vote",
    content: (
      <Text>
        <Text>{"Vote "}</Text>
        <Text style={{ fontWeight: "bold" }}>{textualOption}</Text>
        <Text>{" on "}</Text>
        <Text style={{ fontWeight: "bold" }}>{`Proposal ${proposalId}`}</Text>
      </Text>
    ),
  };
}

export function renderMsgExecuteContract(
  currencies: Currency[],
  sentFunds: CoinPrimitive[],
  _callbackCodeHash: string | undefined,
  contract: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string
) {
  const sent: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of sentFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    sent.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  // const isSecretWasm = callbackCodeHash != null;

  return {
    icon: "fas fa-cog",
    title: "Execute Wasm Contract",
    content: (
      <Text>
        <Text>
          <Text>Execute contract </Text>
          <Text style={{ fontWeight: "bold" }}>
            {Bech32Address.shortenAddress(contract, 26)}
          </Text>
          {sent.length > 0 ? (
            <Text>
              <Text> by sending </Text>
              <Text style={{ fontWeight: "bold" }}>
                {sent
                  .map((coin) => {
                    return `${coin.amount} ${coin.denom}`;
                  })
                  .join(",")}
              </Text>
            </Text>
          ) : undefined}
        </Text>
        {/* TODO: Add secret wasm badge */}
        {/*isSecretWasm ? (
          <React.Fragment>
            <br />
            <Badge
              color="primary"
              pill
              style={{ marginTop: "6px", marginBottom: "6px" }}
            >
              <FormattedMessage id="sign.list.message.wasm/MsgExecuteContract.content.badge.secret-wasm" />
            </Badge>
          </React.Fragment>
        ) : (
          <br />
        )*/}
        <WasmExecutionMsgView msg={msg} />
      </Text>
    ),
  };
}

export const WasmExecutionMsgView: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore, accountStore } = useStore();

  const style = useStyle();

  // TODO: Toggle open button?
  // const [isOpen, setIsOpen] = useState(true);
  // const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via Keplr, Keplr cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that Keplr cannot decrypt it and allows the user to choose.
    if (typeof msg === "string") {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, "base64"));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          const keplr = await accountStore
            .getAccount(chainStore.current.chainId)
            .getKeplr();
          if (!keplr) {
            throw new Error("Can't get the keplr API");
          }

          const enigmaUtils = keplr.getEnigmaUtils(chainStore.current.chainId);
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
          );
          // Remove the contract code hash.
          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg("");
        } catch {
          setWarningMsg(
            "Failed to decrypt Secret message. This may be due to Keplr viewing key not matching the transaction viewing key."
          );
        }
      })();
    }
  }, [accountStore, chainStore, chainStore.current.chainId, msg]);

  return (
    <Text style={style.flatten(["margin-top-8"])}>
      <Text>{`\n${detailsMsg}`}</Text>
      {warningMsg ? (
        <Text style={style.flatten(["color-danger-200"])}>{warningMsg}</Text>
      ) : null}
    </Text>
  );
});

/*
export function renderMsgInstantiateContract(
  currencies: Currency[],
  intl: IntlShape,
  initFunds: CoinPrimitive[],
  admin: string | undefined,
  codeId: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  initMsg: object
) {
  const funds: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of initFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    funds.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  return {
    icon: "fas fa-cog",
    title: intl.formatMessage({
      id: "sign.list.message.wasm/MsgInstantiateContract.title",
    }),
    content: (
      <React.Fragment>
        <FormattedMessage
          id="sign.list.message.wasm/MsgInstantiateContract.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            admin: admin ? Bech32Address.shortenAddress(admin, 30) : "",
            ["only-admin-exist"]: (...chunks: any[]) => (admin ? chunks : ""),
            codeId: codeId,
            label: label,
            ["only-funds-exist"]: (...chunks: any[]) =>
              funds.length > 0 ? chunks : "",
            funds: funds
              .map((coin) => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(","),
          }}
        />
        <br />
        <WasmExecutionMsgView msg={initMsg} />
      </React.Fragment>
    ),
  };
}

export const WasmExecutionMsgView: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore, accountStore } = useStore();

  const [isOpen, setIsOpen] = useState(true);
  const intl = useIntl();

  const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via Keplr, Keplr cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that Kepler cannot decrypt it and allows the user to choose.
    if (typeof msg === "string") {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, "base64"));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          const keplr = await accountStore
            .getAccount(chainStore.current.chainId)
            .getKeplr();
          if (!keplr) {
            throw new Error("Can't get the keplr API");
          }

          const enigmaUtils = keplr.getEnigmaUtils(chainStore.current.chainId);
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
          );
          // Remove the contract code hash.
          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg("");
        } catch {
          setWarningMsg(
            intl.formatMessage({
              id:
                "sign.list.message.wasm/MsgExecuteContract.content.warning.secret-wasm.failed-decryption",
            })
          );
        }
      })();
    }
  }, [chainStore, chainStore.current.chainId, intl, msg]);

  return (
    <div>
      {isOpen ? (
        <React.Fragment>
          <pre style={{ width: "280px" }}>{isOpen ? detailsMsg : ""}</pre>
          {warningMsg ? <div>{warningMsg}</div> : null}
        </React.Fragment>
      ) : null}
      <Button
        size="sm"
        style={{ float: "right", marginRight: "6px" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          toggleOpen();
        }}
      >
        {isOpen
          ? intl.formatMessage({
              id: "sign.list.message.wasm.button.close",
            })
          : intl.formatMessage({
              id: "sign.list.message.wasm.button.details",
            })}
      </Button>
    </div>
  );
});
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const UnknownMsgView: FunctionComponent<{ msg: object }> = ({ msg }) => {
  const style = useStyle();

  const prettyMsg = useMemo(() => {
    try {
      return yaml.dump(msg);
    } catch (e) {
      console.log(e);
      return "Failed to decode the msg";
    }
  }, [msg]);

  return (
    <Text style={style.flatten(["body3", "color-text-black-low"])}>
      {prettyMsg}
    </Text>
  );
};

export function clearDecimals(dec: string): string {
  if (!dec.includes(".")) {
    return dec;
  }

  for (let i = dec.length - 1; i >= 0; i--) {
    if (dec[i] === "0") {
      dec = dec.slice(0, dec.length - 1);
    } else {
      break;
    }
  }
  if (dec.length > 0 && dec[dec.length - 1] === ".") {
    dec = dec.slice(0, dec.length - 1);
  }

  return dec;
}

export function join<T extends any>(items: T[], separtor?: T): T[] {
  var newItems: T[] = [];
  items.forEach((item, index) => {
    newItems = [
      ...newItems,
      item,
      ...(index < items.length - 1 && separtor) ? [separtor] : [],
    ];
  });
  return newItems;
}