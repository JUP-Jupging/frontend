// src/api/plogging.js
import axios from "axios";
import BASE_URL from "./apiconfig";

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

// 📌 플로깅 상세 조회 (특정 플로깅 ID + 멤버 ID) - 🔥 스웨거 응답 구조에 맞춤
export const getPloggingDetail = async (ploggingId, memberId, accessToken) => {
  try {
    console.log('📡 [API] getPloggingDetail 호출 시작');
    console.log('- ploggingId:', ploggingId);
    console.log('- memberId:', memberId);
    
    const { data } = await axios.get(
      `${BASE_URL}/plogging/${ploggingId}/members/${memberId}`, 
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('✅ [API] getPloggingDetail 성공:', data);
    
    // 🔥 스웨거 응답 구조에 맞춰서 데이터 정규화
    const normalizedData = {
      ...data,
      // 날짜 정보 정규화
      displayDate: data.ploggingDate2 || data.ploggingDate || data.createdAt,
      // 쓰레기 정보 정규화
      trashInfo: data.pickedTrashList || [],
      // 위치 정보
      coordinates: {
        startLat: data.startLat || 0,
        startLng: data.startLng || 0,
        endLat: data.endLat || 0,
        endLng: data.endLng || 0
      }
    };
    
    return normalizedData;
  } catch (error) {
    console.error('❌ [API] getPloggingDetail 실패:', error);
    throw error;
  }
};

// 📌 특정 트레일의 플로깅 참여자 수 조회
export const getTrailPloggingCount = async (trailId, accessToken) => {
  try {
    console.log('📡 [API] getTrailPloggingCount 호출 시작');
    console.log('- trailId:', trailId);
    
    const { data } = await axios.get(
      `${BASE_URL}/plogging/trail/count/${trailId}`, 
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('✅ [API] getTrailPloggingCount 성공:', data);
    return data;
  } catch (error) {
    console.error('❌ [API] getTrailPloggingCount 실패:', error);
    throw error;
  }
};

// 📌 내 플로깅 기록 조회 - 🔥 응답 구조 개선
export const getMyPloggingRecords = async (accessToken) => {
  try {
    console.log('📡 [API] getMyPloggingRecords 호출 시작');

    const { data } = await axios.get(`${BASE_URL}/plogging/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('✅ [API] getMyPloggingRecords 성공:', data?.length || 0, '개');
    console.log('🧾 [API] getMyPloggingRecords 원본 응답:', JSON.stringify(data, null, 2));
    
    // 🔥 배열이 아닌 경우 빈 배열 반환
    if (!Array.isArray(data)) {
      console.warn('⚠️ [API] 응답이 배열이 아님, 빈 배열 반환');
      return [];
    }
    
    // 🔥 각 기록의 데이터 구조 정규화
    const normalizedRecords = data.map((record, index) => {
      console.log(`📋 [API] 기록 ${index + 1} 정규화:`, record);
      
      // 🔥 ploggingTime 필드 안전하게 처리
      let normalizedPloggingTime = "0";
      if (record.ploggingTime) {
        if (record.ploggingTime === "string") {
          console.warn(`⚠️ [API] 기록 ${index + 1} ploggingTime이 "string"입니다`);
          normalizedPloggingTime = "0";
        } else {
          normalizedPloggingTime = record.ploggingTime;
        }
      }
      
      return {
        // 기본 정보
        ploggingId: record.ploggingId || 0,
        trailTypeName: record.trailTypeName || "플로깅 기록",
        
        // 날짜 정보 (여러 필드 중 우선순위로 선택)
        ploggingDate: record.ploggingDate || null,
        ploggingDate2: record.ploggingDate2 || null, // ISO 형식
        createdAt: record.createdAt || null,
        displayDate: record.ploggingDate2 || record.ploggingDate || record.createdAt,
        
        // 🔥 운동 정보 - 안전하게 처리
        ploggingTime: normalizedPloggingTime,
        distance: record.distance || 0,
        difficulty: record.difficulty === "string" ? "보통" : (record.difficulty || "보통"),
        
        // 위치 정보
        startLat: record.startLat || 0,
        startLng: record.startLng || 0,
        endLat: record.endLat || 0,
        endLng: record.endLng || 0,
        
        // 이미지 정보
        imageUrl: record.imageUrl || null,
        
        // 쓰레기 정보
        pickedTrashList: record.pickedTrashList || [],
        trashCount: (record.pickedTrashList || []).length,
        
        // 기타 메타데이터
        title: record.title === "string" ? "플로깅 기록" : (record.title || record.trailTypeName || "플로깅 기록"),
        isPicked: record.isPicked === "string" ? "수집됨" : record.isPicked,
        
        // 원본 데이터도 보존
        _original: record
      };
    });
    
    console.log('🔄 [API] 정규화된 기록들:', normalizedRecords.length, '개');
    return normalizedRecords;
    
  } catch (error) {
    console.error('❌ [API] getMyPloggingRecords 실패:', error);
    console.error('   - 에러 상세:', error.response?.data || error.message);
    throw error;
  }
};

export const endPlogging = async (ploggingData, accessToken) => {
  console.log('🔄 endPlogging -> savePloggingRecord로 리다이렉트');
  return await savePloggingRecord(ploggingData, accessToken);
};

export default {
  savePloggingRecord,
  getPloggingDetail, 
  getTrailPloggingCount,
  getMyPloggingRecords,
  // 레거시 호환성
  startPlogging,
  endPlogging,
};