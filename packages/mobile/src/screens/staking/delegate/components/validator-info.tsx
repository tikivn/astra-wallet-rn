import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, View, ViewStyle } from "react-native";
import { formatCoin, formatPercent } from "../../../../common/utils";
import {
  AlignItems,
  buildLeftColumn,
  buildRightColumn,
} from "../../../../components/foundation-view/item-row";
import {
  IRow,
  ListRowView,
} from "../../../../components/foundation-view/list-row-view";
import { ValidatorThumbnail } from "../../../../components/thumbnail";
import { useStore } from "../../../../stores";
import { useStyle } from "../../../../styles";
import { Typos } from "../../../../styles/typos";

interface IValidatorInfo {
  validatorAddress: string;
}

export const ValidatorInfo: FunctionComponent<
  {
    style?: ViewStyle;
  } & IValidatorInfo
> = observer(({ style, validatorAddress }) => {
  const intl = useIntl();
  const styleBuilder = useStyle();

  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const validator = bondedValidators.getValidator(validatorAddress);
  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);
  const hasStake = staked.toDec().gt(new Dec(0));

  const rewards = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);

  const name = validator?.description.moniker ?? "";
  const thumbnailUrl = bondedValidators.getValidatorThumbnail(validatorAddress);

  const commissionText = intl.formatMessage(
    { id: "validator.details.commission.percent" },
    {
      percent: formatPercent(validator?.commission.commission_rates.rate, true),
    }
  );

  const votingPower = new CoinPretty(
    chainStore.current.stakeCurrency,
    new Dec(validator?.tokens || 0)
  )
    .maxDecimals(0)
    .toString();

  let rows: IRow[] = [
    {
      type: "items",
      itemSpacing: 8,
      alignItems: AlignItems.center,
      cols: [
        <ValidatorThumbnail size={24} url={thumbnailUrl} />,
        buildLeftColumn({
          text: name,
          textStyle: Typos["text-base-medium"],
          textColor: styleBuilder.get("color-label-text-1").color,
        }),
        buildRightColumn({ text: !hasStake ? commissionText : "" }),
      ],
    },
    { type: "separator" },
  ];

  if (hasStake) {
    rows.push(
      {
        type: "items",
        cols: [
          buildLeftColumn({
            text: intl.formatMessage({
              id: "validator.details.delegated.invested",
            }),
          }),
          buildRightColumn({ text: formatCoin(staked) }),
        ],
      },
      {
        type: "items",
        cols: [
          buildLeftColumn({
            text: intl.formatMessage({
              id: "validator.details.delegated.profit",
            }),
          }),
          buildRightColumn({
            text: "+" + formatCoin(rewards),
            textColor: styleBuilder.get("color-rewards-text").color,
          }),
        ],
      }
    );
  } else {
    rows.push(
      {
        type: "items",
        cols: [
          buildLeftColumn({
            text: intl.formatMessage({
              id: "stake.delegate.validator.totalShares",
            }),
          }),
          buildRightColumn({ text: votingPower }),
        ],
      },
      {
        type: "items",
        cols: [
          buildLeftColumn({
            text: intl.formatMessage({ id: "stake.delegate.validator.uptime" }),
          }),
          buildRightColumn({ text: "100%" }),
        ],
      }
    );
  }

  return (
    <View style={style}>
      <ListRowView rows={rows} />
      <Text
        style={styleBuilder.flatten([
          "color-label-text-2",
          "text-small-regular",
          "text-center",
          "margin-top-8",
        ])}
      >
        {intl.formatMessage({
          id: "stake.delegate.validator.claimRewardsNotice",
        })}
      </Text>
    </View>
  );
});
