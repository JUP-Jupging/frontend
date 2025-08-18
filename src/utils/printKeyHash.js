import { Platform } from "react-native";
import { NativeModules } from "react-native";

export function printAndroidKeyHash() {
  if (Platform.OS === "android") {
    const { RNKakaoLogins } = NativeModules;
    if (RNKakaoLogins && RNKakaoLogins.getKeyHash) {
      RNKakaoLogins.getKeyHash().then((keyHash) => {
        console.log("Android KeyHash:", keyHash);
      });
    } else {
      console.log("RNKakaoLogins.getKeyHash is not available");
    }
  }
}