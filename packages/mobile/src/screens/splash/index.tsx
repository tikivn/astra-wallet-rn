
import * as SplashScreen from "expo-splash-screen";

let splashScreenHided = false;

export async function preventAutoHideAsync() {
  return SplashScreen.preventAutoHideAsync()
    .then((result) => {
      splashScreenHided = false;
      console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`)
    })
    .catch(console.warn);
}

export async function hideSplashScreen() {
  if (!splashScreenHided) {
    console.log("Hide Splash screen");
    if (await SplashScreen.hideAsync()) {
      splashScreenHided = true;
    }
  }
}