// src/screens/HomeScreen.js
// ===================================================================================
// [파일 역할]
// - 소셜 로그인(카카오/구글) 버튼을 누르면 "공급자 승인 URL"을 브라우저로 엽니다.
// - 서버가 redirect_uri에서 모든 토큰 교환/세션 처리를 수행한다는 전제하에,
//   사용자가 브라우저에서 돌아와 앱이 foreground(active) 상태가 되면 홈으로 이동시킵니다.
//
// [흐름 설명]
//   사용자가 버튼 클릭
//     → buildAuthorizeUrl(provider)로 승인 URL 생성(필수 파라미터 포함)
//     → Linking.openURL(url) 로 시스템 브라우저 오픈
//     → 사용자가 로그인 완료(또는 취소) 후 앱으로 돌아옴
//     → AppState 'background→active' 전이 감지
//     → (여기서는 성공으로 가정) navigation.replace('Main')
//
// [주의/개선 포인트]
// - 이 구현은 "앱이 명시적 성공 콜백을 받지 않는" 환경에 맞춘 최소 구현입니다.
// - 서버가 성공 시 `ploggingapp://...` 같은 앱 스킴으로 리다이렉트해주면,
//   Linking 'url' 이벤트로 보다 정확하게 성공/실패를 분기할 수 있습니다.
// ===================================================================================

"use client";

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  SafeAreaView,
  AppState,            // ✅ 앱 상태(백그라운드/포그라운드) 감지를 위해 추가
  Linking,             // ✅ 외부 브라우저로 승인 URL 열기
} from "react-native";
import Config from "react-native-config";  // ✅ .env에서 clientId/redirectUri 읽기

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// ──────────────────────────────────────────────────────────────────────────────
// 1) 공급자별 승인 URL 생성 함수
//    - 반드시 client_id/redirect_uri를 URL 인코딩해서 붙여야 합니다.
//    - 카카오: prompt=login 으로 매번 계정 선택 유도 (요구 사양에 맞춤)
//    - 구글  : scope 기본값 'email profile' (요구 사양에 맞춤)
// ──────────────────────────────────────────────────────────────────────────────
function buildAuthorizeUrl(provider) {
  if (provider === "kakao") {
    const clientId = encodeURIComponent(Config.KAKAO_CLIENT_ID);
    const redirectUri = encodeURIComponent(Config.KAKAO_REDIRECT_URI);
    return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&prompt=login`;
  }

  throw new Error("Unsupported provider");
}

// ──────────────────────────────────────────────────────────────────────────────
// 2) 버튼 클릭 → 승인 URL 오픈 → 앱 복귀 시 메인으로 이동
//    - Android에서 openURL은 즉시 리턴(브라우저로 스위치). 따라서
//      AppState로 'background → active' 전이를 감지해 복귀 시점을 잡습니다.
// ──────────────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  // 로그인 플로우를 시작했는지 표시(복귀 후에만 메인으로 가기 위함)
  const pendingProviderRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    // 앱 상태 변화 구독: background → active 복귀를 감지
    const sub = AppState.addEventListener("change", (nextState) => {
      const wasBg = /inactive|background/.test(appStateRef.current);
      const nowActive = nextState === "active";

      // 📌 사용자가 브라우저에서 돌아왔고, 직전에 로그인 플로우를 시작했을 때만 처리
      if (wasBg && nowActive && pendingProviderRef.current) {
        const provider = pendingProviderRef.current;
        pendingProviderRef.current = null; // 1회성 처리 후 리셋

        console.log(`=== 로그인 완료 확인 (${provider}) ===`);
        
        // 서버에서 로그인 상태 확인
        checkLoginStatus(provider);
      }

      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [navigation]);

  // 로그인 상태 확인 함수
  const checkLoginStatus = async (provider) => {
    try {
      console.log('로그인 상태 확인 시작...');
      
      // 서버에 로그인 상태 확인 (예: /members/me 엔드포인트)
      const response = await fetch(`${Config.BASE_URL}/members/me`, {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('로그인 상태 확인 응답:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('로그인 성공! 사용자 정보:', userData);
        
        // 로그인 성공 시 메인 화면으로 이동
        Alert.alert('로그인 성공', `${provider} 로그인이 완료되었습니다.`, [
          {
            text: '확인',
            onPress: () => navigation.replace('Main')
          }
        ]);
      } else {
        console.log('로그인 실패 또는 미완료');
        Alert.alert('로그인 실패', '로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      Alert.alert('오류', '로그인 상태를 확인할 수 없습니다.');
    }
  };

  // 공통 오프너: URL 지원 여부 검사 → 브라우저 오픈
  const openAuthUrl = async (provider) => {
    try {
      // 디버그: 환경변수와 생성된 URL 확인
      console.log('=== 로그인 디버그 ===');
      console.log('KAKAO_CLIENT_ID:', Config.KAKAO_CLIENT_ID);
      console.log('KAKAO_REDIRECT_URI:', Config.KAKAO_REDIRECT_URI);
      console.log('BASE_URL:', Config.BASE_URL);
      
      const url = buildAuthorizeUrl(provider);
      console.log('Generated URL:', url);
      
      // Android에서 canOpenURL이 false를 반환할 수 있지만, 실제로는 브라우저에서 열 수 있음
      // HTTPS URL은 항상 브라우저에서 열 수 있으므로 canOpenURL 체크를 우회
      let supported = true;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        supported = true;
        console.log('HTTPS URL detected, skipping canOpenURL check');
      } else {
        supported = await Linking.canOpenURL(url);
        console.log('URL supported:', supported);
      }

      console.log(`Opening URL: ${url} (supported: ${supported})`);

      if (!supported) {
        Alert.alert("로그인 오류", "승인 URL을 열 수 없습니다. (canOpenURL=false)");
        return;
      }

      // ✅ 로그인 플로우 시작 플래그
      pendingProviderRef.current = provider;

      // 외부 브라우저로 이동 (여기서 앱은 백그라운드로 내려갑니다)
      await Linking.openURL(url);
      // 이후의 흐름은 AppState 'active' 복귀에서 처리
    } catch (e) {
      pendingProviderRef.current = null;
      Alert.alert("로그인 오류", e?.message ?? "승인 URL 오픈 중 문제가 발생했습니다.");
    }
  };

  // 카카오/구글 핸들러 (UI 바인딩용)
  const handleKakaoLogin = () => openAuthUrl("kakao");

  // 개발용: 메인 화면으로 바로 이동
  const handleGoToMain = () => {
    navigation.navigate("Main");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 jupging 텍스트 */}
      <View style={styles.headerContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* 메인 이미지 */}
      <View style={styles.imageContainer}>
        <Image source={require("../assets/main.png")} style={styles.mainImage} resizeMode="contain" />
      </View>

      {/* 메인 텍스트 */}
      <Text style={styles.mainText}>봉사하는 플로깅앱,{'\n'}줍깅</Text>

      {/* 설명 텍스트 */}
      <Text style={styles.description}>
        <Text style={styles.highlight}>줍깅은{'\n'}</Text>조깅을 하면서 길가의 쓰레기를{'\n'}수거하는 플로깅의 한국말입니다.
      </Text>

      {/* 버튼 컨테이너 */}
      <View style={styles.buttonContainer}>
        {/* 카카오 로그인 버튼 */}
        <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
          <View style={styles.buttonIconContainer}>
            <Image source={require("../assets/kakao.png")} style={styles.kakaoIcon} resizeMode="contain" />
          </View>
          <Text style={styles.kakaoText}>카카오로 계속하기</Text>
        </TouchableOpacity>


      </View>

      {/* 개발용 메인 이동 버튼 */}
      <TouchableOpacity style={styles.mainButton} onPress={handleGoToMain}>
        <Text style={styles.mainButtonText}>메인 화면으로 이동</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingHorizontal: screenWidth * 0.08,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerContainer: { 
    alignItems: "center", 
    marginBottom: screenHeight * 0.05 
  },
  logoImage: { 
    width: screenWidth * 0.55, 
    height: screenHeight * 0.15 
  },
  imageContainer: { 
    alignItems: "center", 
    marginBottom: screenHeight * 0.04 
  },
  mainImage: { 
    width: screenWidth * 0.6, 
    height: screenHeight * 0.25 
  },
  mainText: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#333",
    textAlign: 'center',
    marginBottom: screenHeight * 0.02,
    lineHeight: 32
  },
  description: { 
    fontSize: 14, 
    lineHeight: 22,
    textAlign: 'center',
    color: "#666",
    marginBottom: screenHeight * 0.04
  },
  highlight: { 
    fontWeight: "600",
    color: "#4A90E2"
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: screenWidth * 0.02
  },
  kakaoButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#FEE500", 
    borderRadius: 12, 
    paddingVertical: 16, 
    marginBottom: 12,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#fff", 
    borderRadius: 12, 
    paddingVertical: 16, 
    borderWidth: 1, 
    borderColor: "#E0E0E0",
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  kakaoIcon: { 
    width: 20, 
    height: 20 
  },
  googleIcon: { 
    width: 20, 
    height: 20 
  },
  kakaoText: { 
    fontWeight: "600",
    fontSize: 16,
    color: '#000'
  },
  googleText: { 
    fontWeight: "600",
    fontSize: 16,
    color: '#333'
  },
  mainButton: { 
    marginTop: screenHeight * 0.03, 
    alignItems: "center", 
    paddingVertical: 12 
  },
  mainButtonText: { 
    color: "#4A89DC", 
    fontWeight: "600",
    fontSize: 14
  },
});
