// api/auth.js
import axios from "axios";
import BASE_URL from "./apiconfig";
import authApi from "./authapi"; // 공용 axios 인스턴스(인터셉터 포함) 사용

// ✅ 카카오 로그인 URL 받기 (버튼 클릭 시 호출)
export const getKakaoAuthUrl = async () => {
  try {
    console.log("카카오 인증 URL 요청 시작");
    const response = await authApi.get(`/api/v1/auth/kakao`);
    console.log("응답 데이터:", response.data);
    if (!response.data?.url) throw new Error("인증 URL이 없습니다.");
    return response.data.url;
  } catch (error) {
    console.log("카카오 인증 URL 요청 에러:", error);
    throw error;
  }
};

// ✅ 로그아웃
export const logout = async (accessToken) => {
  const { data } = await axios.post(
    `${BASE_URL}/oauth/logout`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;s
};

// ✅ 회원탈퇴
export const withdraw = async (accessToken) => {
  const { data } = await axios.post(
    `${BASE_URL}/members/withdraw`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
};
