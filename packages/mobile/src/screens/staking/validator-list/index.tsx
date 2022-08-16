import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { Text, View } from "react-native";
import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RectButton } from "react-native-gesture-handler";
import { CardDivider } from "../../../components/card";
import { AllIcon } from "../../../components/icon";
import { PageWithSectionList } from "../../../components/page";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";
import { FormattedMessage, useIntl } from "react-intl";

type Sort = "APY" | "Voting Power" | "Name";

export const ValidatorListScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorSelector?: (validatorAddress: string) => void;
        }
      >,
      string
    >
  >();

  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const [sort, setSort] = useState<Sort>("Voting Power");
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const style = useStyle();
  const intl = useIntl();

  const data = useMemo(() => {
    const data = bondedValidators.validators;

    switch (sort) {
      case "APY":
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(
            new Dec(val2.commission.commission_rates.rate)
          )
            ? 1
            : -1;
        });
        break;
      case "Name":
        data.sort((val1, val2) => {
          if (!val1.description.moniker) {
            return 1;
          }
          if (!val2.description.moniker) {
            return -1;
          }
          return val1.description.moniker > val2.description.moniker ? -1 : 1;
        });
        break;
      case "Voting Power":
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? -1 : 1;
        });
        break;
    }

    return data;
  }, [bondedValidators.validators, sort]);

  return (
    <React.Fragment>
      <PageWithSectionList
        style={style.get("background-color-background")}
        sections={[
          {
            data,
          },
        ]}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item: Staking.Validator) => item.operator_address}
        renderItem={({
          item,
          index,
        }: {
          item: Staking.Validator;
          index: number;
        }) => {
          return (
            <ValidatorItem
              validatorAddress={item.operator_address}
              index={index}
              sort={sort}
              onSelectValidator={route.params.validatorSelector}
            />
          );
        }}
        ItemSeparatorComponent={() => (
          <CardDivider style={style.flatten(["background-color-gray-70"])} />
        )}
        renderSectionHeader={() => {
          return (
            <View
              style={style.flatten(["flex", "height-40", "padding-top-12"])}
            >
              <View
                style={style.flatten([
                  "flex-row",
                  "justify-between",
                  "padding-x-16",
                  "margin-bottom-8",
                ])}
              >
                <Text style={style.flatten(["color-gray-30", "text-caption2"])}>
                  <FormattedMessage id="validator.list.name" />
                </Text>
                <TooltipLabel
                  text={intl.formatMessage({
                    id: "validator.list.totalShares",
                  })}
                />
              </View>
              <CardDivider
                style={style.flatten([
                  "background-color-gray-70",
                  "margin-bottom-0",
                ])}
              />
            </View>
          );
        }}
      />
    </React.Fragment>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  index: number;
  sort: Sort;

  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(({ validatorAddress, index, sort, onSelectValidator }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const style = useStyle();

  const validator = bondedValidators.getValidator(validatorAddress);

  const smartNavigation = useSmartNavigation();

  return validator ? (
    <RectButton
      style={style.flatten([
        "flex-row",
        "background-color-background",
        "height-72",
        "items-center",
        "padding-x-16",
      ])}
      onPress={() => {
        if (onSelectValidator) {
          onSelectValidator(validatorAddress);
          smartNavigation.goBack();
        } else {
          smartNavigation.navigateSmart("Validator.Details", {
            validatorAddress,
          });
        }
      }}
    >
      <ValidatorThumbnail
        style={style.flatten(["margin-right-8"])}
        size={40}
        url={bondedValidators.getValidatorThumbnail(validator.operator_address)}
      />
      <View style={style.flatten(["flex-1"])}>
        <View
          style={style.flatten([
            "flex-row",
            "justify-between",
            "items-center",
            "margin-bottom-4",
          ])}
        >
          <Text
            style={style.flatten([
              "subtitle3",
              "color-gray-10",
              "max-width-160",
            ])}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {validator.description.moniker}
          </Text>
          <View
            style={style.flatten(["flex-row", "justify-end", "items-center"])}
          >
            <Text style={style.flatten(["subtitle3", "color-gray-10"])}>
              {new CoinPretty(
                chainStore.current.stakeCurrency,
                new Dec(validator.tokens)
              )
                .maxDecimals(0)
                .toString()}
            </Text>
            <View
              style={style.flatten([
                "width-20",
                "height-20",
                "items-center",
                "justify-center",
                "margin-right-12",
              ])}
            >
              <AllIcon color={style.get("color-gray-10").color} />
            </View>
          </View>
        </View>
        <Text style={style.flatten(["text-caption2", "color-gray-30"])}>
          {queries.cosmos.queryInflation.inflation
            .mul(
              new Dec(1).sub(
                new Dec(validator.commission.commission_rates.rate)
              )
            )
            .maxDecimals(2)
            .trim(true)
            .toString() + "%"}
        </Text>
      </View>
    </RectButton>
  ) : null;
});
