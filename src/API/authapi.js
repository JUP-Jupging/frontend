// api/authapi.js
import axios from "axios";
import BASE_URL from "../api/apiconfig";
import { useAuth } from "../stores/useAuth"; // Zustand에서 토큰 읽기

// ✅ 앱 전역에서 쓸 공용 axios 인스턴스
const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ✅ 요청 인터셉터: 매 요청에 토큰 자동 첨부
authApi.interceptors.request.use((config) => {
  const { accessToken } = useAuth.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// (선택) 응답 인터셉터: 401 처리/토큰갱신 훅
authApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    // 예시: 401이면 리프레시 시도(엔드포인트 준비되면 구현)
    // const { refreshToken, logout, setTokens } = useAuth.getState();
    // if (error.response?.status === 401 && refreshToken) {
    //   const { data } = await axios.post(`${BASE_URL}/oauth/refresh`, { refreshToken });
    //   setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    //   error.config.headers.Authorization = `Bearer ${data.accessToken}`;
    //   return authApi.request(error.config);
    // }
    return Promise.reject(error);
  }
);

export default authApi;
