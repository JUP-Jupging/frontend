// src/api/trails.js
import axios from "axios";
import BASE_URL from "./apiconfig";

/**
 * 산책로 목록 전체 조회 (필터 선택)
 * GET /trails?cityName=&difficultyLevel=
 */
export const getTrails = async (filters = {}) => {
  const { cityName, difficultyLevel } = filters;
  try {
    const { data } = await axios.get(`${BASE_URL}/trails`, {
      params: {
        ...(cityName ? { cityName } : {}),
        ...(difficultyLevel ? { difficultyLevel } : {}),
      },
      timeout: 10000,
    });
    return data; // 배열
  } catch (error) {
    console.error("getTrails Error:", error.response?.data || error.message);
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
    const { data } = await axios.get(`${BASE_URL}/trails/search`, {
      params: { keyword },
      timeout: 10000,
    });
    return data; // 배열
  } catch (error) {
    console.error("searchTrails Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 산책로 상세 정보 조회
 * GET /trails/{trailId}
 */
export const getTrailDetail = async (trailId) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trails/${trailId}`, {
      timeout: 10000,
    });
    return data; // 단건
  } catch (error) {
    console.error("getTrailDetail Error:", error.response?.data || error.message);
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