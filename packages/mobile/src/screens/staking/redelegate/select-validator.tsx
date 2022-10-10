import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { ValidatorsBottomSheet } from "./validator-list-bottom-sheet";
import { SelectorButtonWithoutModal } from "../../../components/input";
import { Staking } from "@keplr-wallet/stores";
import { useStore } from "../../../stores";

export const SelectValidatorItem: FunctionComponent<{
  currentValidator: string;
  onSelectedValidator: (address: string) => void;
}> = observer(({ currentValidator, onSelectedValidator }) => {
  const intl = useIntl();
  const { chainStore, queriesStore } = useStore();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const [validator, setValidator] = useState<Staking.Validator | undefined>(
    undefined
  );

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );
  const thumbnailUrl = validator?.operator_address
    ? bondedValidators.getValidatorThumbnail(validator?.operator_address) ||
      unbondingValidators.getValidatorThumbnail(validator?.operator_address) ||
      unbondedValidators.getValidatorThumbnail(validator?.operator_address)
    : undefined;

  const setSelectedValidator = (validator: Staking.Validator | undefined) => {
    if (validator) {
      setValidator(validator);
      onSelectedValidator(validator.operator_address);
    }
  };

  return (
    <React.Fragment>
      <ValidatorsBottomSheet
        label={intl.formatMessage({ id: "stake.redelegate.listValidators" })}
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        maxItemsToShow={8}
        selectedValidator={validator}
        setSelectedValidator={setSelectedValidator}
        currentValidator={currentValidator}
      />
      <SelectorButtonWithoutModal
        label={intl.formatMessage({ id: "stake.redelegate.to" })}
        placeHolder={intl.formatMessage({
          id: "stake.redelegate.selectValidator",
        })}
        selected={
          validator
            ? {
                key: validator.operator_address,
                label:
                  validator.description.moniker || validator.operator_address,
                thumbnailUrl: thumbnailUrl,
              }
            : undefined
        }
        onPress={() => {
          setIsOpenModal(true);
        }}
        containerStyle={{ paddingBottom: 0 }}
      />
    </React.Fragment>
  );
});
