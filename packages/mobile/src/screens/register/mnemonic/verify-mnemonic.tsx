import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView } from "../../../components/page";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { WordChip } from "../../../components/mnemonic";
import { Button } from "../../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../navigation-util";
import { NewMnemonicConfig } from "./hook";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { RectButton } from "../../../components/rect-button";
import { BIP44HDPath } from "@keplr-wallet/background";
import { useBIP44Option } from "../bip44";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { AlertInline } from "../../../components";

export const VerifyMnemonicScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          newMnemonicConfig: NewMnemonicConfig;
          bip44HDPath: BIP44HDPath;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = route.params.registerConfig;
  const newMnemonicConfig = route.params.newMnemonicConfig;
  const intl = useIntl();
  const [candidateWords, setCandidateWords] = useState<
    {
      word: string;
      usedIndex: number;
    }[]
  >([]);
  const [wordSet, setWordSet] = useState<(string | undefined)[]>([]);

  useEffect(() => {
    const words = newMnemonicConfig.mnemonic.split(" ");
    const randomSortedWords = words.slice().sort(() => {
      return Math.random() > 0.5 ? 1 : -1;
    });

    const candidateWords = randomSortedWords.slice(0, 5);
    setCandidateWords(
      candidateWords.map((word) => {
        return {
          word,
          usedIndex: -1,
        };
      })
    );

    setWordSet(
      newMnemonicConfig.mnemonic.split(" ").map((word) => {
        return candidateWords.includes(word) ? undefined : word;
      })
    );
  }, [newMnemonicConfig.mnemonic]);

  const firstEmptyWordSetIndex = wordSet.findIndex(
    (word) => word === undefined
  );

  const [isCreating, setIsCreating] = useState(false);

  const bip44Option = useBIP44Option();
  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const submit = handleSubmit(() => {
    setIsCreating(true);
    smartNavigation.navigateSmart("Register.SetPincode", {
      registerConfig,
      bip44HDPath: bip44Option.bip44HDPath,
      mnemonic: newMnemonicConfig.mnemonic,
    });
  });

  const onWordButtonHandler = (candidateWord: { word: string, usedIndex: number }, i: number) => {
    const { word, usedIndex } = candidateWord;
    const newWordSet = wordSet.slice();
    const newCandiateWords = candidateWords.slice();
    if (usedIndex < 0) {
      if (firstEmptyWordSetIndex < 0) {
        return;
      }

      newWordSet[firstEmptyWordSetIndex] = word;
      setWordSet(newWordSet);

      newCandiateWords[i].usedIndex = firstEmptyWordSetIndex;
      setCandidateWords(newCandiateWords);
    } else {
      newWordSet[usedIndex] = undefined;
      setWordSet(newWordSet);

      newCandiateWords[i].usedIndex = -1;
      setCandidateWords(newCandiateWords);
    }
  }

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      <Text
        style={style.flatten([
          "text-x-large-semi-bold",
          "color-label-text-1",
          "margin-top-24",
          "margin-bottom-4",
          "text-center",
        ])}
      >
        {intl.formatMessage({ id: "seedphrase.action.rearrange" })}
      </Text>
      <Text
        style={style.flatten([
          "text-base-regular",
          "color-label-text-2",
          "margin-bottom-4",
          "text-center",
        ])}
      >
        {intl.formatMessage({ id: "seedphrase.action.rearrange.description" })}
      </Text>
      <WordsCard
        wordSet={wordSet.map((word, i) => {
          const isInteractive = word
            ? candidateWords.map(({ word }) => word).indexOf(word) !== -1
            : false;

          return {
            word: word ?? "",
            empty: word === undefined,
            isInteractive,
            onPress: () => {
              const wordParams = candidateWords.map((w, i) => {
                return {
                  word: w.word,
                  usedIndex: w.usedIndex,
                  index: i
                };
              }).filter((candidateWord) => {
                return candidateWord.word === word;
              }).shift();

              if (!wordParams) {
                return;
              }

              const { index: i, ...candidateWord } = wordParams;
              onWordButtonHandler(candidateWord, i);
            },
          };
        })}
      />
      <View style={style.flatten(["flex-row", "flex-wrap", "justify-center"])}>
        {candidateWords.map(({ word, usedIndex }, i) => {
          return (
            <WordButton
              key={i.toString()}
              word={word}
              used={usedIndex >= 0}
              onPress={() => {
                onWordButtonHandler({ word, usedIndex }, i);
              }}
            />
          );
        })}
      </View>

      <View style={style.flatten(["flex-1"])} />
      <AlertInline
        type="warning"
        content={intl.formatMessage({
          id: "seedphrase.important",
        })}
      />
      <View style={style.flatten(["height-16"])} />
      <Button
        text={intl.formatMessage({ id: "common.text.continue" })}
        loading={isCreating}
        disabled={wordSet.join(" ") !== newMnemonicConfig.mnemonic}
        onPress={submit}
      />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

const WordButton: FunctionComponent<{
  word: string;
  used: boolean;
  onPress: () => void;
}> = ({ word, used, onPress }) => {
  const style = useStyle();

  return (
    <RectButton
      style={style.flatten(
        [
          "background-color-white",
          "padding-x-12",
          "padding-y-4",
          "margin-right-12",
          "margin-bottom-12",
          "border-radius-8",
        ],
        [used && "opacity-40", used && "background-color-disabled"]
      )}
      onPress={onPress}
    >
      <Text style={style.flatten(["subtitle3", "color-background"])}>
        {word}
      </Text>
    </RectButton>
  );
};

const WordsCard: FunctionComponent<{
  wordSet: {
    word: string;
    empty: boolean;
    isInteractive: boolean;
    onPress?: () => void;
  }[];
}> = ({ wordSet }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "margin-top-14",
        "margin-bottom-20",
        "padding-top-16",
        "padding-left-16",
        "words-container",
        "flex-row",
        "flex-wrap",
        "justify-center",
      ])}
    >
      {wordSet.map((word, i) => {
        return (
          <WordChip
            key={i.toString()}
            index={i + 1}
            word={word.word}
            empty={word.empty}
            isInteractive={word.isInteractive}
            onPress={word.onPress}
          />
        );
      })}
    </View>
  );
};
