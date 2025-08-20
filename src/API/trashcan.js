// src/api/trashcan.js
import axios from "axios";
import BASE_URL from "./apiconfig";

/**
 * 전체 휴지통 목록 조회 (쿼리 파라미터 없이 요청)
 * GET /trash-can
 */
export const getAllTrashCans = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trash-can`, {
      timeout: 15000,
    });
    return data; // { items: [...] }
  } catch (error) {
    console.error("getAllTrashCans Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 근처 휴지통 위치 목록 조회 (기존 API - 필요시 사용)
 * GET /trash-can?userLatitude=...&userLongitude=...
 */
export const getNearbyTrashCans = async (userLatitude, userLongitude) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trash-can`, {
      params: { userLatitude, userLongitude },
      timeout: 10000,
    });
    return data; // { items: [...] }
  } catch (error) {
    console.error("getNearbyTrashCans Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 휴지통 상세 조회
 * GET /trash-can/{trashCanId}
 */
export const getTrashCanDetail = async (trashCanId) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trash-can/${trashCanId}`, {
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error("getTrashCanDetail Error:", error.response?.data || error.message);
    throw error;
  }
};