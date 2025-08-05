"use client"

import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Dimensions, SafeAreaView } from "react-native"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function HomeScreen({ navigation }) {
  const handleKakaoLogin = () => {
    Alert.alert("카카오 로그인", "카카오 로그인 기능을 구현해주세요.")
  }

  const handleGoogleLogin = () => {
    Alert.alert("구글 로그인", "구글 로그인 기능을 구현해주세요.")
  }

  // 👇 메인화면으로 이동하는 함수
  const handleGoToMain = () => {
    navigation.navigate('Main'); // Stack.Screen의 name이 "Main"이어야 함
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 로고 이미지 */}
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* 메인 이미지 */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/main.png")}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      {/* 메인 텍스트 */}
      <Text style={styles.mainText}>봉사하는 플로깅앱, 줍깅</Text>

      {/* 설명 텍스트 */}
      <Text style={styles.description}>
        <Text style={styles.highlight}>줍깅은</Text> 조깅을 하면서 길가의 쓰레기를 수거하는 플로깅의 한국말입니다.
      </Text>

      {/* 카카오 로그인 버튼 */}
      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <View style={styles.kakaoIcon}>
          <Image
            source={require("../assets/kakao.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.kakaoText}>카카오로 계속하기</Text>
      </TouchableOpacity>

      {/* 구글 로그인 버튼 */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <View style={styles.googleIcon}>
          <Image
            source={require("../assets/Google.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.googleText}>Google로 계속하기</Text>
      </TouchableOpacity>

      {/* 메인으로 이동하는 네비게이션 버튼 (개발용) */}
      <TouchableOpacity style={styles.mainButton} onPress={handleGoToMain}>
        <Text style={styles.mainButtonText}>메인 화면으로 이동</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: screenWidth * 0.108, // 39px at 360px width
  },
  logoContainer: {
    position: "absolute",
    top: screenHeight * 0.0638, // 51px at 800px height
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 80, // 로고 이미지 크기 조정 (필요에 따라 수정)
    height: 30,
  },
  imageContainer: {
    position: "absolute",
    top: 154,
    width: screenWidth * 0.6028, // 217px at 360px width
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  mainText: {
    position: "absolute",
    top: screenHeight * 0.4688, // 375px at 800px height
    width: screenWidth * 0.5222, // 188px at 360px width
    fontFamily: "Pretendard Variable",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 28,
    textAlign: "center",
    letterSpacing: 1,
    color: "#333333",
  },
  description: {
    position: "absolute",
    top: 452,
    width: 166,
    height: 42,
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  highlight: {
    color: "#418663",
  },
  kakaoButton: {
    position: "absolute",
    top: 541,
    width: screenWidth * 0.8213, // 295.65px at 360px width
    height: 42.02,
    backgroundColor: "#FEE500",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  kakaoIcon: {
    position: "absolute",
    left: 10,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  kakaoText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 18,
    color: "#333333",
    textAlign: "center",
  },
  googleButton: {
    position: "absolute",
    top: 586,
    width: screenWidth * 0.8213, // 295.65px at 360px width
    height: 42.02,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  googleIcon: {
    position: "absolute",
    left: 10,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  googleText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 18,
    color: "#333333",
    textAlign: "center",
  },
  socialIcon: {
    width: 25,
    height: 25,
  },
  // 개발용 메인 버튼
  mainButton: {
    position: "absolute",
    top: 650,
    width: screenWidth * 0.8213,
    height: 42,
    backgroundColor: "#418663",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mainButtonText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
})
