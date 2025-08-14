// src/api/trails.js
import axios from "axios";
import BASE_URL from "./apiconfig";

// 네트워크 연결 테스트 함수
export const testConnection = async () => {
  try {
    console.log("🌐 네트워크 연결 테스트 시작...");
    console.log("- 테스트 URL:", BASE_URL);
    
    const response = await axios.get(`${BASE_URL}/trails`, {
      timeout: 5000,
    });
    
    console.log("✅ 네트워크 연결 성공!");
    console.log("- 응답 상태:", response.status);
    return true;
  } catch (error) {
    console.error("❌ 네트워크 연결 실패:");
    console.error("- 에러 코드:", error.code);
    console.error("- 에러 메시지:", error.message);
    return false;
  }
};

/**
 * 산책로 목록 전체 조회 (필터 선택)
 * GET /trails?cityName=&difficultyLevel=
 */
export const getTrails = async (filters = {}) => {
  const { cityName, difficultyLevel } = filters;
  try {
    const url = `${BASE_URL}/trails`;
    const params = {
      ...(cityName ? { cityName } : {}),
      ...(difficultyLevel ? { difficultyLevel } : {}),
    };
    
    console.log("🚀 getTrails 요청 시작:");
    console.log("- URL:", url);
    console.log("- Params:", params);
    console.log("- BASE_URL:", BASE_URL);
    
    const { data } = await axios.get(url, {
      params,
      timeout: 10000,
    });
    
    console.log("✅ getTrails 성공:");
    console.log("- 응답 데이터:", data);
    console.log("- 데이터 타입:", typeof data);
    console.log("- 배열 여부:", Array.isArray(data));
    console.log("- 데이터 길이:", data?.length);
    
    return data; // 배열
  } catch (error) {
    console.error("❌ getTrails Error:");
    console.error("- Error message:", error.message);
    console.error("- Error response:", error.response?.data);
    console.error("- Error status:", error.response?.status);
    console.error("- Error code:", error.code);
    console.error("- Full error:", error);
    throw error;
  }
};

/**
 * 산책로 검색
 * GET /trails/search?keyword=
 * - trailName, trailTypeName, cityName으로 검색
 */
export const searchTrails = async (keyword) => {
  try {
    const url = `${BASE_URL}/trails/search`;
    const params = { keyword };
    
    console.log("🔍 searchTrails 요청 시작:");
    console.log("- URL:", url);
    console.log("- Keyword:", keyword);
    console.log("- Params:", params);
    
    const { data } = await axios.get(url, {
      params,
      timeout: 10000,
    });
    
    console.log("✅ searchTrails 성공:");
    console.log("- 응답 데이터:", data);
    console.log("- 데이터 타입:", typeof data);
    console.log("- 배열 여부:", Array.isArray(data));
    console.log("- 검색 결과 수:", data?.length);
    
    return data; // 배열
  } catch (error) {
    console.error("❌ searchTrails Error:");
    console.error("- Error message:", error.message);
    console.error("- Error response:", error.response?.data);
    console.error("- Error status:", error.response?.status);
    console.error("- Error code:", error.code);
    console.error("- Full error:", error);
    throw error;
  }
};

/**
 * 산책로 상세 정보 조회
 * GET /trails/{trailId}
 */
export const getTrailDetail = async (trailId) => {
  try {
    const url = `${BASE_URL}/trails/${trailId}`;
    
    console.log("📋 getTrailDetail 요청 시작:");
    console.log("- URL:", url);
    console.log("- TrailId:", trailId);
    
    const { data } = await axios.get(url, {
      timeout: 10000,
    });
    
    console.log("✅ getTrailDetail 성공:");
    console.log("- 응답 데이터:", data);
    console.log("- 데이터 타입:", typeof data);
    console.log("- 데이터 키들:", Object.keys(data || {}));
    
    return data; // 단건
  } catch (error) {
    console.error("❌ getTrailDetail Error:");
    console.error("- Error message:", error.message);
    console.error("- Error response:", error.response?.data);
    console.error("- Error status:", error.response?.status);
    console.error("- Error code:", error.code);
    console.error("- Full error:", error);
    throw error;
  }
};

/**
 * 근처 산책로 목록 조회 - 거리순
 * GET /trails/nearby?userLatitude=&userLongitude=
 */
export const getNearbyTrails = async (userLatitude, userLongitude) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trails/nearby`, {
      params: { userLatitude, userLongitude },
      timeout: 10000,
    });
    return data; // { items: [...] } 형태 명세
  } catch (error) {
    console.error("getNearbyTrails Error:", error.response?.data || error.message);
    throw error;
  }
};