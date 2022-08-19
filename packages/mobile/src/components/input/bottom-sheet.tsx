import React, { FunctionComponent, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { registerModal } from "../../modals/base";
import { RectButton } from "../rect-button";

export const BottomSheet: FunctionComponent<{
  label: string;
  isOpen: boolean;
  close: () => void;
  items: {
    label: string;
    key: string;
  }[];
  maxItemsToShow?: number;
  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;
  modalPersistent?: boolean;
}> = registerModal(
  ({
    label,
    close,
    items,
    selectedKey,
    setSelectedKey,
    maxItemsToShow,
    modalPersistent,
  }) => {
    const style = useStyle();

    const renderBall = (selected: boolean) => {
      if (selected) {
        return (
          <View
            style={style.flatten([
              "width-24",
              "height-24",
              "border-radius-32",
              "background-color-transparent",
              "items-center",
              "justify-center",
              "border-width-1",
              "border-color-primary",
            ])}
          >
            <View
              style={style.flatten([
                "width-12",
                "height-12",
                "border-radius-32",
                "background-color-primary",
              ])}
            />
          </View>
        );
      } else {
        return (
          <View
            style={style.flatten([
              "width-24",
              "height-24",
              "border-radius-32",
              "background-color-transparent",
              "border-width-1",
              "border-color-gray-10",
            ])}
          />
        );
      }
    };

    const scrollViewRef = useRef<ScrollView | null>(null);
    const initOnce = useRef<boolean>(false);

    const onInit = () => {
      if (!initOnce.current) {
        if (scrollViewRef.current) {
          scrollViewRef.current.flashScrollIndicators();

          if (maxItemsToShow) {
            const selectedIndex = items.findIndex(
              (item) => item.key === selectedKey
            );

            if (selectedIndex) {
              const scrollViewHeight = maxItemsToShow * 64 + 72;

              scrollViewRef.current.scrollTo({
                y: selectedIndex * 64 - scrollViewHeight / 2 + 32,
                animated: false,
              });
            }
          }

          initOnce.current = true;
        }
      }
    };

    return (
      <View style={style.flatten(["padding-0"])}>
        <View
          style={style.flatten([
            "background-color-gray-10",
            "width-48",
            "height-6",
            "margin-bottom-12",
            "self-center",
            "border-radius-16",
          ])}
        />
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-gray-90",
          ])}
        >
          <ScrollView
            style={{
              maxHeight: maxItemsToShow ? 64 * maxItemsToShow + 72 : undefined,
            }}
            ref={scrollViewRef}
            persistentScrollbar={true}
            onLayout={onInit}
          >
            <View style={style.flatten(["height-60", "justify-center"])}>
              <Text
                style={style.flatten([
                  "subtitle2",
                  "color-gray-10",
                  "text-center",
                ])}
              >
                {label}
              </Text>
            </View>
            {items.map((item, index) => {
              return (
                <View key={index}>
                  <View
                    style={style.flatten(
                      [
                        "height-1",
                        "margin-x-0",
                        "background-color-gray-70",
                        "margin-top-0",
                      ],
                      [index > 0 && "margin-x-16"]
                    )}
                  />
                  <RectButton
                    key={item.key}
                    style={style.flatten([
                      "height-64",
                      "padding-left-16",
                      "padding-right-28",
                      "flex-row",
                      "items-center",
                    ])}
                    onPress={() => {
                      setSelectedKey(item.key);
                      if (!modalPersistent) {
                        close();
                      }
                    }}
                  >
                    {renderBall(item.key === selectedKey)}
                    <Text
                      style={style.flatten([
                        "body3",
                        "color-gray-10",
                        "flex-0",
                        "margin-left-12",
                      ])}
                    >
                      {item.label}
                    </Text>
                  </RectButton>
                </View>
              );
            })}
          </ScrollView>
          <View style={style.get("height-24")} />
        </View>
      </View>
    );
  },
  {
    disableSafeArea: true,
  }
);
