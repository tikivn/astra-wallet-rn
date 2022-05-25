import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { HairLine } from "../../../../components/foundation-view/hair-line";
import { AlignItems, ItemRow } from "../../../../components/foundation-view/item-row";
import { TextAlign } from "../../../../components/foundation-view/text-style";
import { PersonIcon } from "../../../../components/icon";
import { Colors } from "../../../../styles";
import { Typos } from "../../../../styles/typos";

interface IValidatorInfo {
  name: string;
  thumbnailUrl: string;
  commission: string;
  votingPower: string;
}

export const ValidatorInfo: FunctionComponent<{
  style?: ViewStyle;
} & IValidatorInfo> = observer(({
  style,
  name,
  thumbnailUrl,
  commission,
  votingPower,
}) => {
  function thumbnailIcon(url: string): React.ReactNode {
    return url
      ? <FastImage
        style={{ width: 24, height: 24, }}
        source={{ uri: thumbnailUrl, }}
        resizeMode={FastImage.resizeMode.contain}
      />
      : <PersonIcon size={24} color="white" />;
  }

  function mainItem(thumbnailUrl: string, name: string, commission: string): React.ReactNode {
    return <ItemRow
      style={{ marginHorizontal: 0, paddingHorizontal: 0, }}
      alignItems={AlignItems.center}
      itemSpacing={12}
      columns={[
        thumbnailIcon(thumbnailUrl),
        {
          text: name,
          textStyle: Typos["text-base-medium"],
          textColor: Colors["gray-10"],
        },
        {
          text: commission,
          textColor: Colors["gray-10"],
          textAlign: TextAlign.right,
          flex: 1,
        },
      ]}
    />;
  }

  function hairlineItem(): React.ReactNode {
    return <HairLine style={{ backgroundColor: Colors["gray-70"], marginHorizontal: 0, }} />;
  }

  function subItem(label: string, value: string): React.ReactNode {
    return <ItemRow
      style={{ marginHorizontal: 0, paddingHorizontal: 0, }}
      alignItems={AlignItems.center}
      itemSpacing={12}
      columns={[
        {
          text: label,
          textStyle: Typos["text-base-regular"],
          textColor: Colors["gray-30"],
        },
        {
          text: value,
          textColor: Colors["gray-10"],
          textAlign: TextAlign.right,
          flex: 1,
        },
      ]}
    />;
  }

  var items = [
    mainItem(thumbnailUrl, name, commission),
    hairlineItem(),
    subItem("Tổng số cổ phần", votingPower),
    subItem("Thời gian hoạt động", "100%"),
  ];

  return (
    <View style={{ ...styles.container, ...style }}>
      {items}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors["gray-60"],
    backgroundColor: Colors["gray-90"],
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
