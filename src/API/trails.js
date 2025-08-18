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
    console.log('📡 [API] getTrailList 호출 시작');
    console.log('- filters:', filters);
    
    const { cityName, difficultyLevel } = filters;
    const params = new URLSearchParams();
    
    if (cityName) params.append('cityName', cityName);
    if (difficultyLevel) params.append('difficultyLevel', difficultyLevel);
    
    const url = `${BASE_URL}/trails?${params.toString()}`;
    console.log('- 요청 URL:', url);
    
    const response = await fetch(url);
    console.log('- 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error('❌ [API] getTrailList HTTP 오류:', response.status);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [API] getTrailList 성공');
    console.log('- 응답 데이터 길이:', Array.isArray(data) ? data.length : '배열 아님');
    
    return data;
  } catch (error) {
    console.error('❌ [API] getTrailList 실패:', error.message);
    throw error;
  }
};

export const searchTrails = async (keyword) => {
  try {
    console.log('📡 [API] searchTrails 호출 시작');
    console.log('- keyword:', keyword);
    
    const url = `${BASE_URL}/trails/search?keyword=${encodeURIComponent(keyword)}`;
    console.log('- 요청 URL:', url);
    
    const response = await fetch(url);
    console.log('- 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error('❌ [API] searchTrails HTTP 오류:', response.status);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [API] searchTrails 성공');
    console.log('- 응답 데이터 길이:', Array.isArray(data) ? data.length : '배열 아님');
    
    return data;
  } catch (error) {
    console.error('❌ [API] searchTrails 실패:', error.message);
    throw error;
  }
};

// 🔥 이제 사용하지 않음 - 성능상 문제로 제거
export const getNearbyTrails = async (latitude, longitude) => {
  console.warn('⚠️ getNearbyTrails는 성능상 문제로 사용 중단됨. getNearestTrail 사용을 권장');
  throw new Error('getNearbyTrails는 성능상 문제로 사용 중단됨');
};

// 🔥 메인 API - 가장 가까운 산책로 1개만 반환
export const getNearestTrail = async (latitude, longitude) => {
  try {
    console.log('📡 [API] getNearestTrail 호출 시작');
    console.log('- latitude:', latitude);
    console.log('- longitude:', longitude);
    
    // 파라미터 유효성 검사
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('위도와 경도는 숫자여야 합니다');
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('위도와 경도가 유효하지 않습니다');
    }
    
    // 백엔드 API 스펙에 맞춰 변수명 수정: userLat/userLong
    const url = `${BASE_URL}/trails/nearest?userLat=${latitude}&userLong=${longitude}`;
    console.log('- 요청 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📨 [API] 응답 받음 - 상태:', response.status);
    
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
    console.log('✅ [API] getNearestTrail 성공');
    console.log('- 응답 데이터 타입:', typeof data);
    
    // 🔥 단일 객체인지 배열인지 확인
    if (Array.isArray(data)) {
      console.log('- 배열 응답, 길이:', data.length);
      if (data.length > 0) {
        console.log('- 첫 번째 산책로:', data[0].trailName);
        return data[0]; // 첫 번째 항목만 반환
      } else {
        console.log('- 빈 배열 응답');
        return null;
      }
    } else if (data && typeof data === 'object') {
      console.log('- 단일 객체 응답');
      console.log('- 산책로 이름:', data.trailName);
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
  getNearestTrail, // 🔥 nearest만 export
};