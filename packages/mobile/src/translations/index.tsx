
import { NativeModules, Platform } from "react-native";

import React, { FunctionComponent, useEffect, useState } from "react";
import { CustomFormats, IntlProvider } from "react-intl";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { EnMsgs, ViMsgs } from "./splits";
import MessagesVi from "./vi.json";
import MessagesEn from "./en.json";

export type IntlMessage = Record<string, string>;
export type IntlMessages = { [lang: string]: Record<string, string> };

const DEFAULT_LANG = "vi"

interface Language {
  language: string;
  setLanguage: (language: string) => void;
}

function getDeviceLang() {
  switch (Platform.OS) {
    case 'ios':
      return (
        NativeModules.SettingsManager.settings.AppleLocale || 
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      ).slice(0, 2)
    case 'android':
      return NativeModules.I18nManager.localeIdentifier;
    default:
      return DEFAULT_LANG
  }
}

const allLangeMessages: IntlMessages = {
  vi: Object.assign(
    {},
    ...ViMsgs,
    MessagesVi
  ),
  en: Object.assign(
    {},
    ...EnMsgs.map(removeEmptyValueJson),
    removeEmptyValueJson(MessagesEn),
  ),
};

function removeEmptyValueJson(item: any) {
  const json: Record<string, string> = item;
  Object.keys(json).forEach((key) => {
    if (json[key].length == 0) {
      delete json[key];
    }
  });
  return json;
}

function getMessages(
  additionalMessages: IntlMessages,
  language: string
): IntlMessage {
  return Object.assign(
    {},
    allLangeMessages[DEFAULT_LANG],
    allLangeMessages[language],
    additionalMessages[language]
  );
}

const LANGUAGE_KEY = "appLanguage"

async function initLanguage(additionalMessages: IntlMessages): Promise<string> {
  const language = 
    (await AsyncStorage.getItem(LANGUAGE_KEY)) || getDeviceLang()

  if (!allLangeMessages[language] && !additionalMessages[language]) {
    return DEFAULT_LANG;
  }

  return language;
}

const LanguageContext = React.createContext<Language | null>(null);

export const useLanguage = (): Language => {
  const lang = React.useContext(LanguageContext);
  if (!lang) {
    throw new Error("You have forgot to use language provider");
  }
  return lang;
};

export const AppIntlProvider: FunctionComponent<{
  additionalMessages: IntlMessages;
  formats: CustomFormats;
}> = ( { additionalMessages, formats, children }) => {

  const [language, _setLanguage] = useState(DEFAULT_LANG)
  const [isInitLang, setIsInitLang] = useState(false);
  const [messages, setMessages] = useState(
    getMessages(additionalMessages, language)
  );

  const updateLangFromStore = async () => {
    let initLang = await initLanguage(additionalMessages)
    if (initLang != language) {
        setLanguage(initLang)
    }
  }

  useEffect(() => {
    if (!isInitLang) {
        updateLangFromStore()
        setIsInitLang(true)
    }
  }, [language]);

  useEffect(() => {
    setMessages(getMessages(additionalMessages, language));
  }, [additionalMessages, language]);

  const setLanguage = (language: string) => {
    AsyncStorage.setItem(LANGUAGE_KEY, language)
    _setLanguage(language);
    setIsInitLang(true)
  };

  return (
    <LanguageContext.Provider
      value={{
        language: language,
        setLanguage
      }}
    >
      <IntlProvider
        locale={language}
        messages={messages}
        key={`${language}`}
        formats={formats}
        defaultLocale={DEFAULT_LANG}
        defaultFormats={
          {
            number: {
              vi: {

              }
            },
            date: {
              vi: {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                hour12: false,
                minute: "2-digit",
                timeZoneName: "short",
              },
            },
            time: {
              vi: {

              }
            }
          }
        }
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};
