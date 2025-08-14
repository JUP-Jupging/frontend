// src/api/plogging.js
import axios from "axios";
import BASE_URL from "../apiconfig";

// 📌 플로깅 시작
export const startPlogging = async (formData, accessToken) => {
  const { data } = await axios.post(`${BASE_URL}/plogging`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// 📌 플로깅 종료
export const endPlogging = async (formData, accessToken) => {
  const { data } = await axios.post(`${BASE_URL}/plogging`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// 📌 내 플로깅 기록 조회
export const getMyPloggingRecords = async (accessToken) => {
  const { data } = await axios.get(`${BASE_URL}/plogging/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};

// 📌 플로깅 상세 조회
export const getPloggingDetail = async (ploggingId, accessToken) => {
  const { data } = await axios.get(`${BASE_URL}/plogging/${ploggingId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};