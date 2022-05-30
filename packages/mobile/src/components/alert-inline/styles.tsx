import { StyleSheet } from "react-native";
import { Colors } from "../../styles";

const InfoStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["blue-10"],
    borderColor: Colors["blue-30"],
  },
  logo: {
    color: Colors["blue-70"],
  },
});

const SuccessStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["green-10"],
    borderColor: Colors["green-30"],
  },
  logo: {
    color: Colors["green-60"],
  },
});

const ErrorStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["red-10"],
    borderColor: Colors["red-30"],
  },
  logo: {
    color: Colors["red-60"],
  },
});

const WarningStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors["orange-10"],
    borderColor: Colors["orange-30"],
  },
  logo: {
    color: Colors["orange-60"],
  },
});

export const allStyles = {
  info: {
    container: InfoStyles.container,
    logo: InfoStyles.logo,
  },
  success: {
    container: SuccessStyles.container,
    logo: SuccessStyles.logo,
  },
  error: {
    container: ErrorStyles.container,
    logo: ErrorStyles.logo,
  },
  warning: {
    container: WarningStyles.container,
    logo: WarningStyles.logo,
  },
};

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "stretch",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});