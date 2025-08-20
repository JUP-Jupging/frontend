import BASE_URL from './apiconfig';

export const getTrailDetail = async (trailId) => {
  try {
    console.log('📡 [API] getTrailDetail 호출 시작');
    console.log('- trailId:', trailId);
    
    const url = `${BASE_URL}/trails/${trailId}`;
    console.log('- 요청 URL:', url);
    
    const response = await fetch(url);
    console.log('- 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error('❌ [API] getTrailDetail HTTP 오류:', response.status);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [API] getTrailDetail 성공');
    
    return data;
  } catch (error) {
    console.error('❌ [API] getTrailDetail 실패:', error.message);
    throw error;
  }
};

export const getTrailList = async (filters = {}) => {
  try {

    
    const { cityName, difficultyLevel } = filters;
    const params = new URLSearchParams();
    
    if (cityName) params.append('cityName', cityName);
    if (difficultyLevel) params.append('difficultyLevel', difficultyLevel);
    
    const url = `${BASE_URL}/trails?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('❌ [API] getTrailList 실패:', error.message);
    throw error;
  }
};

export const searchTrails = async (keyword) => {
  try {

    const url = `${BASE_URL}/trails/search?keyword=${encodeURIComponent(keyword)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ [API] searchTrails HTTP 오류:', response.status);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('❌ [API] searchTrails 실패:', error.message);
    throw error;
  }
};

// 🔥 재추가 - 가까운 산책로 여러개 반환 (백엔드에서 거리순 정렬해서 보내줌)
export const getNearbyTrails = async (latitude, longitude) => {
  try {

    // 파라미터 유효성 검사
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('위도와 경도는 숫자여야 합니다');
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('위도와 경도가 유효하지 않습니다');
    }
    
    // 스웨거 문서에 따라 userLatitude, userLongitude 파라미터 사용
    const url = `${BASE_URL}/trails/nearby?userLat=${latitude}&userLong=${longitude}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    
    if (!response.ok) {
      console.error('❌ [API] getNearbyTrails HTTP 오류:', response.status);
      
      // 응답 본문 확인
      try {
        const errorText = await response.text();
        console.error('- 오류 응답 본문:', errorText.substring(0, 200));
      } catch (textError) {
        console.error('- 오류 응답 본문 읽기 실패:', textError);
      }
      
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();

    // 🔥 응답 구조 확인을 위한 상세 로깅
    if (data && data.items && Array.isArray(data.items)) {

      // 첫 3개 산책로 정보 출력
      data.items.slice(0, 3).forEach((trail, index) => {
        console.log(`- 🚶 산책로 ${index + 1}:`, {
          trailId: trail.trailId,
          trailName: trail.trailName || trail.instlPlcNm,
          distance: trail.lengthDetail ? `${trail.lengthDetail}m` : trail.length,
          difficulty: trail.difficultyLevel,
          reportCount: trail.reportCount,
          lat: trail.spotLatitude,
          lng: trail.spotLongitude
        });
      });
      
      return data.items;
    } else if (Array.isArray(data)) {

      // 첫 3개 산책로 정보 출력
      data.slice(0, 3).forEach((trail, index) => {
        console.log(`- 🚶 산책로 ${index + 1}:`, {
          trailId: trail.trailId,
          trailName: trail.trailName || trail.instlPlcNm,
          distance: trail.lengthDetail ? `${trail.lengthDetail}m` : trail.length,
          difficulty: trail.difficultyLevel,
          reportCount: trail.reportCount,
          lat: trail.spotLatitude,
          lng: trail.spotLongitude
        });
      });
      
      return data;
    } else {
      console.log('- ⚠️ 예상치 못한 응답 형식:', data);
      return [];
    }
    
  } catch (error) {
    console.error('❌ [API] getNearbyTrails 실패');
    console.error('- 오류 타입:', error.constructor.name);
    console.error('- 오류 메시지:', error.message);
    
    // 네트워크 오류인지 확인
    if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
      console.error('- 🌐 네트워크 연결 문제로 추정됨');
    }
    
    throw error;
  }
};

// 🔥 메인 API - 가장 가까운 산책로 1개만 반환
export const getNearestTrail = async (latitude, longitude) => {
  try {

    // 파라미터 유효성 검사
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('위도와 경도는 숫자여야 합니다');
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('위도와 경도가 유효하지 않습니다');
    }
    
    // 백엔드 API 스펙에 맞춰 변수명 수정: userLat/userLong
    const url = `${BASE_URL}/trails/nearest?userLat=${latitude}&userLong=${longitude}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    
    if (!response.ok) {
      console.error('❌ [API] getNearestTrail HTTP 오류:', response.status);
      
      // 응답 본문 확인
      try {
        const errorText = await response.text();
        console.error('- 오류 응답 본문:', errorText.substring(0, 200));
      } catch (textError) {
        console.error('- 오류 응답 본문 읽기 실패:', textError);
      }
      
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();

    // 🔥 단일 객체인지 배열인지 확인
    if (Array.isArray(data)) {
      if (data.length > 0) {
        return data[0]; // 첫 번째 항목만 반환
      } else {
        return null;
      }
    } else if (data && typeof data === 'object') {

      return data;
    } else {
      console.log('- 예상치 못한 응답 형식:', data);
      return null;
    }
    
  } catch (error) {
    console.error('❌ [API] getNearestTrail 실패');
    console.error('- 오류 타입:', error.constructor.name);
    console.error('- 오류 메시지:', error.message);
    
    // 네트워크 오류인지 확인
    if (error.message.includes('fetch')) {
      console.error('- 네트워크 연결 문제로 추정됨');
    }
    
    throw error;
  }
};

export default {
  getTrailDetail,
  getTrailList,
  searchTrails,
  getNearbyTrails, // 🔥 nearby 다시 추가
  getNearestTrail,
};