// src/api/mypage.js
import axios from "axios";
import BASE_URL from "./apiconfig";

/**
 * 마이페이지 조회
 * GET /members/me
 * 헤더: Authorization: Bearer <accessToken>
 */
export const getMyPage = async (accessToken) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/members/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error("getMyPage Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 닉네임 변경
 * PATCH /members/me/app_nickname
 * 바디: { nickname: "새닉네임" }
 * 헤더: Authorization: Bearer <accessToken>
 */
export const updateNickname = async (accessToken, appNickname) => {
  try {
    const { data } = await axios.patch(
      `${BASE_URL}/members/me/app_nickname`,
      { appNickname },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    return data;
  } catch (error) {
    console.error("updateNickname Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 프로필 이미지 수정
 * PATCH /members/me/profile_image
 * form-data: key=image, type=file
 * 헤더: Authorization: Bearer <accessToken>
 * RN 파일 객체 예: { uri, name: 'profile.jpg', type: 'image/jpeg' }
 */
export const updateProfileImage = async (accessToken, file) => {
  try {
    const formData = new FormData();
    formData.append("image", {
      uri: file.uri,
      name: file.name || "profile.jpg",
      type: file.type || "image/jpeg",
    });

    const { data } = await axios.post(
      `${BASE_URL}/members/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 15000,
      }
    );
    return data;
  } catch (error) {
    console.error("updateProfileImage Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 활동 지역 수정
 * PATCH /members/me/activity_region
 * 바디: { activityRegion: "서울 특별시" }
 * 헤더: Authorization: Bearer <accessToken>
 */
export const updateActivityRegion = async (accessToken, activityRegion) => {
  try {
    const { data } = await axios.patch(
      `${BASE_URL}/members/me/activity_region`,
      { activityRegion },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    return data;
  } catch (error) {
    console.error("updateActivityRegion Error:", error.response?.data || error.message);
    throw error;
  }
};