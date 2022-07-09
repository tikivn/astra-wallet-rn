import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { buildLeftColumn, buildRightColumn } from "../../../../components/foundation-view/item-row";
import { IRow, ListRowView } from "../../../../components/foundation-view/list-row-view";
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

  const rows: IRow[] = [
    {
      type: "items",
      itemSpacing: 12,
      cols: [
        thumbnailIcon(thumbnailUrl),
        buildLeftColumn({
          text: name,
          textStyle: Typos["text-base-medium"],
          textColor: Colors["gray-10"],
        }),
        buildRightColumn({ text: commission }),
      ]
    },
    { type: "separator" },
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: "Tổng số cổ phần" }),
        buildRightColumn({ text: votingPower }),
      ]
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: "Thời gian hoạt động" }),
        buildRightColumn({ text: "100%" }),
      ]
    },
  ];

  return (
    <ListRowView rows={rows} style={style} />
  );
});
