import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { BottomSheet } from "../../../components/input";
import { AccountItem } from "../components";
import { Text } from "react-native";
import { useStyle } from "../../../styles";
import { AllIcon, LanguageIcon } from "../../../components/icon";
import { useIntl } from "react-intl";
import { useLanguage } from "../../../translations";

export const AccountLanguageItem: FunctionComponent<{
  accountItemProps?: Record<string, unknown>;
}> = observer(({ accountItemProps }) => {
  const language = useLanguage();
  const intl = useIntl();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const languages = ["vi", "en"].map((code) => {
    return {
      key: `${code}`,
      code: `${code}`,
      label: intl.formatMessage({ id: `settings.languages.${code}` }),
    };
  });
  const selectedLang =
    languages.find(({ code }) => code == intl.locale) || languages[0];
  return (
    <React.Fragment>
      <BottomSheet
        label={intl.formatMessage({ id: "settings.language" })}
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        maxItemsToShow={4}
        selectedKey={selectedLang.code}
        setSelectedKey={(code) => code && language.setLanguage(code)}
        items={languages}
      />
      <AccountItem
        {...accountItemProps}
        label={intl.formatMessage({ id: "settings.language" })}
        left={<LanguageIcon />}
        right={<RightView paragraph={selectedLang.label} />}
        onPress={() => {
          setIsOpenModal(true);
        }}
      />
    </React.Fragment>
  );
});

export const RightView: FunctionComponent<{
  paragraph?: string;
}> = ({ paragraph }) => {
  const style = useStyle();

  return (
    <React.Fragment>
      {paragraph ? (
        <Text
          style={style.flatten([
            "body3",
            "color-text-black-low",
            "margin-right-16",
          ])}
        >
          {paragraph}
        </Text>
      ) : null}
      <AllIcon color={style.get("color-white").color} />
    </React.Fragment>
  );
};
