import React from "react";
import { Image, StyleSheet } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { Colors } from "../../../styles";

interface DropdownProps {
  data: number[] | string[];
  onSelect: (selectItem: any, index: number) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ data, onSelect }) => {
  return (
    <>
      <SelectDropdown
        data={data}
        defaultValueByIndex={0}
        onSelect={onSelect}
        renderDropdownIcon={() => (
          <Image
            // style={style.flatten(["width-16", "height-16"])}
            style={StyleSheet.flatten([
              {
                width: 16,
                height: 10,
                marginRight: 8,
              },
            ])}
            resizeMode="contain"
            source={require("../../../assets/image/icon_dropdown.png")}
          />
        )}
        buttonTextAfterSelection={(selectedItem, index) => {
          // text represented after item is selected
          // if data array is an array of objects then return selectedItem.property to render after item is selected
          return selectedItem + " %";
        }}
        rowTextForSelection={(item, index) => {
          // text represented for each item in dropdown
          // if data array is an array of objects then return item.property to represent item in dropdown
          return item + " %";
        }}
        buttonStyle={StyleSheet.flatten([
          {
            backgroundColor: Colors["secondary"],
            width: 96,
            height: 40,
            borderRadius: 8,
          },
        ])}
        buttonTextStyle={StyleSheet.flatten([
          {
            color: Colors["gray-10"],
            textAlign: "left",
          },
        ])}
        dropdownStyle={StyleSheet.flatten([
          {
            backgroundColor: Colors["secondary"],
            marginTop: 4,
            borderRadius: 4,
          },
        ])}
        rowTextStyle={StyleSheet.flatten([
          {
            color: Colors["gray-10"],
            textAlign: "left",
          },
        ])}
        rowStyle={StyleSheet.flatten([
          {
            borderBottomColor: Colors["gray-70"],
            borderBottomWidth: 1,
            marginLeft: 16,
            marginRight: 16,
            height: 40,
          },
        ])}
      />
    </>
  );
};
