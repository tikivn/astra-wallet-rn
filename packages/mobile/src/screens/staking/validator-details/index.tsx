import { Dec } from "@keplr-wallet/unit";
import { useRoute, RouteProp } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { DelegatedCard } from "../../stake/validator-details/delegated-card";
import { UnbondingCard } from "../../stake/validator-details/unbonding-card";
import { ValidatorDetailsCard } from "../../stake/validator-details/validator-details-card";


export const NewValidatorDetailsScreen: FunctionComponent = observer(() => {
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

  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const unbondings = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );

  const style = useStyle();

  return (
    <PageWithScrollView>
      <ValidatorDetailsCard
        containerStyle={style.flatten(["margin-y-card-gap"])}
        validatorAddress={validatorAddress}
      />
      {staked.toDec().gt(new Dec(0)) ? (
        <DelegatedCard
          containerStyle={style.flatten(["margin-bottom-card-gap"])}
          validatorAddress={validatorAddress}
        />
      ) : null}
      {unbondings ? (
        <UnbondingCard validatorAddress={validatorAddress} />
      ) : null}
    </PageWithScrollView>
  );
});
