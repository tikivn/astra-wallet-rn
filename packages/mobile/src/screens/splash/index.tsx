
import * as SplashScreen from "expo-splash-screen";

let splashScreenHided = false;
export async function hideSplashScreen() {
  if (!splashScreenHided) {
    console.log("Hide Splash screen");
    if (await SplashScreen.hideAsync()) {
      splashScreenHided = true;
    }
  }
}