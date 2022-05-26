import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView } from "../../../components/page";
import { Image, Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { WordChip } from "../../../components/mnemonic";
import { Button } from "../../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../navigation";
import { NewMnemonicConfig } from "./hook";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { RectButton } from "../../../components/rect-button";
import { BIP44HDPath } from "@keplr-wallet/background";
import { useStore } from "../../../stores";
import { useBIP44Option } from "../bip44";
import { useForm } from "react-hook-form";

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
    smartNavigation.navigateSmart("Register.SetPincode", {
      registerConfig,
      newMnemonicConfig,
      bip44HDPath: bip44Option.bip44HDPath,
      type: 'new',
    });
  });

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      <View style={style.flatten(["margin-y-32", "items-center"])}>
        <Image style={style.flatten(["height-16"])} source={require('../../../assets/image/step-2.png')} resizeMode='contain'/>
      </View>
      <Text
        style={style.flatten([
          "h4",
          "color-text-gray",
          "margin-bottom-4",
          "text-center",
        ])}
      >
        Xếp lại cụm từ bí mật
      </Text>
      <Text
        style={style.flatten([
          "text-caption",
          "color-text-black-low",
          "margin-bottom-4",
        ])}
      >
        Bạn vui lòng sắp xếp lại theo thứ tự ở bước trước. Bước này nhằm đảm bảo bạn đã lưu trữ lại chuỗi kí tự cẩn thận. 
      </Text>
      <WordsCard
        wordSet={wordSet.map((word, i) => {
          return {
            word: word ?? "",
            empty: word === undefined,
            dashed: i === firstEmptyWordSetIndex,
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
              }}
            />
          );
        })}
      </View>
      <View style={style.flatten(["flex-1"])} />
      <Button
        containerStyle={style.flatten(["border-radius-4", "height-44"])}
        textStyle={style.flatten(["subtitle2"])}
        text="Tiếp tục"
        size="large"
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
        [used && "opacity-40", used && "background-color-disabled"],
      )}
      onPress={onPress}
    >
      <Text style={style.flatten(["subtitle3", "color-background"])}>{word}</Text>
    </RectButton>
  );
};

const WordsCard: FunctionComponent<{
  wordSet: {
    word: string;
    empty: boolean;
    dashed: boolean;
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
        "background-color-background-secondary",
        "border-radius-8",
        "flex-row",
        "flex-wrap",
      ])}
    >
      {wordSet.map((word, i) => {
        return (
          <WordChip
            key={i.toString()}
            index={i + 1}
            word={word.word}
            empty={word.empty}
            dashedBorder={word.dashed}
          />
        );
      })}
    </View>
  );
};
