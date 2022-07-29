import { LogBox } from "react-native";

if (__DEV__) {
  const ignoreWarns = [
    "Require cycle: ../unit/build/int.js -> ../unit/build/decimal.js -> ../unit/build/int.js",
    "Require cycle: ../unit/build/int.js -> ../unit/build/decimal.js -> ../unit/build/coin-utils.js -> ../unit/build/int.js",
    "Require cycle: ../unit/build/int.js -> ../unit/build/decimal.js -> ../unit/build/coin-utils.js -> ../unit/build/coin.js -> ../unit/build/int.js",
    "Require cycle: ../unit/build/decimal.js -> ../unit/build/coin-utils.js -> ../unit/build/decimal.js",
    "Require cycle: ../hooks/build/tx/index.js -> ../hooks/build/tx/redelegate-tx.js -> ../hooks/build/tx/index.js",
    "Require cycle: ../hooks/build/tx/index.js -> ../hooks/build/tx/undelegate-tx.js -> ../hooks/build/tx/index.js",
    "Require cycle: ../hooks/build/tx/index.js -> ../hooks/build/tx/delegate-tx.js -> ../hooks/build/tx/index.js",
    "Require cycle: ../hooks/build/tx/index.js -> ../hooks/build/tx/send-tx.js -> ../hooks/build/tx/index.js",
    "Require cycle: ../stores/build/common/query/index.js -> ../stores/build/common/query/json-rpc.js -> ../stores/build/common/query/index.js",
    "Require cycle: ../../node_modules/semver/classes/comparator.js -> ../../node_modules/semver/classes/range.js -> ../../node_modules/semver/classes/comparator.js",
    "Require cycle: ../../node_modules/protobufjs/src/util/minimal.js -> ../../node_modules/protobufjs/src/util/longbits.js -> ../../node_modules/protobufjs/src/util/minimal.js",
    "Require cycle: ../unit/build/int.js -> ../unit/build/decimal.js -> ../unit/build/coin-utils.js -> ../unit/build/dec-utils.js -> ../unit/build/int.js",
    "Require cycle: ../unit/build/decimal.js -> ../unit/build/coin-utils.js -> ../unit/build/dec-utils.js -> ../unit/build/decimal.js",
  ];

  const warn = console.warn;
  console.warn = (...arg) => {
    for (const warning of ignoreWarns) {
      if (arg[0].startsWith(warning)) {
        return;
      }
    }
    warn(...arg);
  };

  LogBox.ignoreLogs(ignoreWarns);
}
