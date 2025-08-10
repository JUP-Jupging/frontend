// src/api/report.js
import axios from "axios";
import BASE_URL from "../apiconfig";

/**
 * 신고 생성
 * POST /reports
 * 바디: { trailId, title, trashAmount, location, imageUrl }
 * 헤더: Authorization: Bearer <AccessToken>
 */
export const createReport = async (accessToken, reportData) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/reports`, reportData, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error("createReport Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 내 신고 목록 조회
 * GET /reports/me
 * 헤더: Authorization: Bearer <AccessToken>
 */
export const getMyReports = async (accessToken) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/reports/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error("getMyReports Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 신고 상세 조회
 * GET /reports/{reportId}
 * 헤더: Authorization: Bearer <AccessToken>
 */
export const getReportDetail = async (accessToken, reportId) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error("getReportDetail Error:", error.response?.data || error.message);
    throw error;
  }
};