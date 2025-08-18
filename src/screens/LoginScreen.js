import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  SafeAreaView,
  NativeModules,
} from "react-native";
import { kakaoLogin } from "../api/auth";
import { useAuth } from "../stores/useAuth";
import { printAndroidKeyHash } from "../utils/printKeyHash"; // 해시키 출력 함수 경로에 맞게 수정

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
console.log("RNKakaoLogins:", NativeModules.RNKakaoLogins);
export default function LoginScreen({ navigation }) {
  const setTokens = useAuth((s) => s.setTokens);
  const setUser = useAuth((s) => s.setUser);
  useEffect(() => {
    printAndroidKeyHash();
  }, []);
  const handleKakaoLogin = async () => {
    try {
      // 카카오 네이티브 로그인 및 백엔드 인증
      const result = await kakaoLogin();
      setTokens({
        accessToken: result.jwtAccessToken,
        refreshToken: result.jwtRefreshToken,
      });
      console.log("저장된 accessToken:", useAuth.getState().accessToken);
      console.log("저장된 refreshToken:", useAuth.getState().refreshToken);
      setUser(result.profile); // 프로필 정보 저장 (선택)
      Alert.alert("로그인 성공", "카카오 로그인이 완료되었습니다.", [
        { text: "확인", onPress: () => navigation.replace("Main") },
      ]);
    } catch (e) {
      Alert.alert("로그인 실패", e?.message || "카카오 로그인 오류");
    }
  };
  
  const handleGoToMain = () => navigation.navigate("Main");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logoImage} resizeMode="contain" />
      </View>

      <View style={styles.imageContainer}>
        <Image source={require("../assets/main.png")} style={styles.mainImage} resizeMode="contain" />
      </View>

      <Text style={styles.mainText}>봉사하는 플로깅앱,{"\n"}줍깅</Text>

      <Text style={styles.description}>
        <Text style={styles.highlight}>줍깅은{"\n"}</Text>조깅을 하면서 길가의 쓰레기를{"\n"}수거하는 플로깅의 한국말입니다.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
          <View style={styles.buttonIconContainer}>
            <Image source={require("../assets/kakao.png")} style={styles.kakaoIcon} resizeMode="contain" />
          </View>
          <Text style={styles.kakaoText}>카카오로 계속하기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={handleGoToMain}>
        <Text style={styles.mainButtonText}>메인 화면으로 이동</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ✅ 기존 스타일 그대로 유지
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingHorizontal: screenWidth * 0.08,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerContainer: { alignItems: "center", marginBottom: screenHeight * 0.05 },
  logoImage: { width: screenWidth * 0.3, height: screenHeight * 0.04 },
  imageContainer: { alignItems: "center", marginBottom: screenHeight * 0.04 },
  mainImage: { width: screenWidth * 0.6, height: screenHeight * 0.25 },
  mainText: { fontSize: 24, fontWeight: "bold", color: "#333", textAlign: 'center', marginBottom: screenHeight * 0.02, lineHeight: 32 },
  description: { fontSize: 14, lineHeight: 22, textAlign: 'left', color: "#666", marginBottom: screenHeight * 0.04 },
  highlight: { fontWeight: "600", color: "#418663" },
  buttonContainer: { width: '100%', paddingHorizontal: screenWidth * 0.02 },
  kakaoButton: { 
    flexDirection: "row", alignItems: "center", justifyContent: "flex-start",
    backgroundColor: "#FEE500", borderRadius: 12, paddingVertical: 16, paddingHorizontal: 16,
    marginBottom: 12, width: '100%', shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  buttonIconContainer: { width: 24, height: 24, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  kakaoIcon: { width: 25, height: 25 },
  kakaoText: { fontWeight: "600", fontSize: 16, color: '#000', flex: 1, textAlign: 'center', marginRight: 24 },
  mainButton: { marginTop: screenHeight * 0.03, alignItems: "center", paddingVertical: 12 },
  mainButtonText: { color: "#4A89DC", fontWeight: "600", fontSize: 14 },
});
