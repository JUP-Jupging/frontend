import axios from "axios";
import authApi from "./authapi";
import { login, loginWithKakaoAccount } from "@react-native-seoul/kakao-login";

// ✅ 카카오 네이티브 로그인 및 백엔드 인증
export const kakaoLogin = async () => {
  try {
    console.log("[KAKAO] kakaoLogin 시작");

    // 1. 카카오 네이티브 SDK로 로그인 시도
    let kakaoResult;
    try {
      console.log("[KAKAO] login() 시도");
      kakaoResult = await login();
      console.log("[KAKAO] login() 성공:", kakaoResult);
    } catch (e) {
      console.log("[KAKAO] login() 실패, loginWithKakaoAccount() 시도:", e);
      kakaoResult = await loginWithKakaoAccount();
      console.log("[KAKAO] loginWithKakaoAccount() 성공:", kakaoResult);
    }

    if (!kakaoResult?.accessToken) {
      throw new Error("카카오 AccessToken을 가져오지 못했습니다.");
    }

    const kakaoAccessToken = kakaoResult.accessToken;
    console.log("[KAKAO] accessToken =", kakaoAccessToken);

    // 2. 백엔드에 카카오 accessToken 전달하여 자체 JWT 토큰 발급 요청
    console.log("[BACKEND] /login/v1/auth/kakao 요청 시작");
    // 백엔드에 카카오 accessToken 전달하여 JWT 토큰 발급
    let data;
    try {
      const response = await axios.post("https://api.jupging.store/auth/kakao/native", {}, {
        headers: { Authorization: `Bearer ${kakaoAccessToken}` }
      });
      data = response.data;
      console.log("[BACKEND] 응답 수신:", data);
      // ...성공 처리...
    } catch (error) {
      if (error.response) {
        console.log("[BACKEND] 에러 응답:", error.response.status, error.response.data);
      } else if (error.request) {
        console.log("[BACKEND] 요청 에러:", error.request);
      } else {
        console.log("[BACKEND] 기타 에러:", error.message);
      }
      throw error;
    }

    // 3. 백엔드에서 받은 자체 JWT 토큰, 프로필 등 반환
    return {
      jwtAccessToken: data.accessToken, // 백엔드에서 발급한 JWT 토큰
      jwtRefreshToken: data.refreshToken, // 백엔드에서 발급한 리프레시 토큰
      memberId: data.memberId,
      profile: data.profile, // 닉네임, 이미지 등
    };
  } catch (error) {
    console.log("[KAKAO] 카카오 로그인 에러:", error?.response || error?.message || error);
    throw error;
  }
};

// ✅ 로그아웃 (JWT 토큰 사용)
export const logout = async (jwtAccessToken) => {
  console.log("[BACKEND] 로그아웃 요청");
  const { data } = await authApi.post(
    "/oauth/logout",
    {},
    { headers: { Authorization: `Bearer ${jwtAccessToken}` } }
  );
  console.log("[BACKEND] 로그아웃 응답:", data);
  return data;
};

// ✅ 회원탈퇴 (JWT 토큰 사용)
export const withdraw = async (jwtAccessToken) => {
  console.log("[BACKEND] 회원탈퇴 요청");
  const { data } = await authApi.post(
    "/members/withdraw",
    {},
    { headers: { Authorization: `Bearer ${jwtAccessToken}` } }
  );
  console.log("[BACKEND] 회원탈퇴 응답:", data);
  return data;
};
