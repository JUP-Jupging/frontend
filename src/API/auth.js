import axios from "axios";
import BASE_URL from "../apiconfig";

// 로그인 & 회원가입 (카카오)
export const kakaoLogin = async (kakaoAccessToken) => {
  const { data } = await axios.post(`${BASE_URL}/oauth/kakao/callback`, {
    provider: "kakao",
    accessToken: kakaoAccessToken,
  });
  return data;
};

// 로그아웃
export const logout = async (accessToken) => {
  const { data } = await axios.post(
    `${BASE_URL}/oauth/logout`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
};

// 회원탈퇴
export const withdraw = async (accessToken) => {
  const { data } = await axios.post(
    `${BASE_URL}/members/withdraw`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
};