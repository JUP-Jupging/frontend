import axios from "axios";
import BASE_URL from "../apiconfig";

// 로그인 & 회원가입 (카카오)
export const kakaoLogin = async (kakaoAccessToken) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/oauth/kakao/callback`, {
      provider: "kakao",
      accessToken: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwiaWF0IjoxNzU1MjUyMDczLCJleHAiOjE3NTU2ODQwNzN9.GjFRgp6ZLqxMV7x3IAemzL5oaKwam9KacsSrCW0hXlQ,
    });

    // 📌 서버에서 어떤 값이 오는지 확인용 로그
    console.log("✅ [kakaoLogin 응답 데이터]:", data);

    return data;
  } catch (error) {
    console.error("❌ [kakaoLogin 오류]:", error.response?.data || error.message);
    throw error;
  }
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