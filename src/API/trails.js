import BASE_URL from './apiconfig';

export const getTrailDetail = async (trailId) => {
  try {
    console.log('📡 [API] getTrailDetail 호출 시작');
    console.log('- trailId:', trailId);
    console.log('- BASE_URL:', BASE_URL);
    
    const url = `${BASE_URL}/trails/${trailId}`;
    console.log('- 요청 URL:', url);
    
    const response = await fetch(url);
    console.log('- 응답 상태:', response.status);
    console.log('- 응답 OK:', response.ok);
    
    if (!response.ok) {
      console.error('❌ [API] getTrailDetail HTTP 오류:', response.status);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [API] getTrailDetail 성공');
    console.log('- 응답 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('❌ [API] getTrailDetail 실패:', error.message);
    console.error('- 오류 스택:', error.stack);
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

export const getNearbyTrails = async (latitude, longitude) => {
  try {
    console.log('🔍 [API] getNearbyTrails 호출 시작');
    console.log('- 입력 파라미터:');
    console.log('  * latitude:', latitude, typeof latitude);
    console.log('  * longitude:', longitude, typeof longitude);
    console.log('- BASE_URL:', BASE_URL);
    
    // 파라미터 유효성 검사
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error('❌ [API] getNearbyTrails 파라미터 타입 오류');
      console.log('- latitude 타입:', typeof latitude);
      console.log('- longitude 타입:', typeof longitude);
      throw new Error('위도와 경도는 숫자여야 합니다');
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error('❌ [API] getNearbyTrails 파라미터 NaN 오류');
      throw new Error('위도와 경도가 유효하지 않습니다');
    }
    
    // URL 파라미터 정확히 설정
    const params = new URLSearchParams({
      userLatitude: latitude.toString(),
      userLongitude: longitude.toString()
    });
    
    const url = `${BASE_URL}/trails/nearby?${params.toString()}`;
    console.log('- 최종 요청 URL:', url);
    console.log('- URL 파라미터:', params.toString());
    
    console.log('📡 [API] fetch 요청 시작...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📨 [API] 응답 받음');
    console.log('- 응답 상태:', response.status);
    console.log('- 응답 상태 텍스트:', response.statusText);
    console.log('- 응답 OK:', response.ok);
    console.log('- 응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ [API] getNearbyTrails HTTP 오류');
      console.error('- 상태 코드:', response.status);
      console.error('- 상태 텍스트:', response.statusText);
      
      // 응답 본문도 확인해보기
      try {
        const errorText = await response.text();
        console.error('- 오류 응답 본문:', errorText);
      } catch (textError) {
        console.error('- 오류 응답 본문 읽기 실패:', textError);
      }
      
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    console.log('📊 [API] 응답 데이터 파싱 시작...');
    const data = await response.json();
    
    console.log('✅ [API] getNearbyTrails 성공');
    console.log('- 응답 데이터 타입:', typeof data);
    console.log('- 응답 데이터 배열 여부:', Array.isArray(data));
    console.log('- 응답 데이터 길이:', Array.isArray(data) ? data.length : '배열 아님');
    console.log('- 응답 데이터 첫 번째 항목:', Array.isArray(data) && data.length > 0 ? data[0] : '없음');
    console.log('- 전체 응답 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('❌ [API] getNearbyTrails 완전 실패');
    console.error('- 오류 타입:', error.constructor.name);
    console.error('- 오류 메시지:', error.message);
    console.error('- 오류 스택:', error.stack);
    
    // 네트워크 오류인지 확인
    if (error.message.includes('fetch')) {
      console.error('- 네트워크 연결 문제로 추정됨');
    }
    
    throw error;
  }
};

export const getNearestTrail = async (latitude, longitude) => {
  try {
    console.log('📡 [API] getNearestTrail 호출 시작');
    console.log('- latitude:', latitude);
    console.log('- longitude:', longitude);
    
    const url = `${BASE_URL}/trails/nearest?userLatitude=${latitude}&userLongitude=${longitude}`;
    console.log('- 요청 URL:', url);
    
    const response = await fetch(url);
    console.log('- 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error('❌ [API] getNearestTrail HTTP 오류:', response.status);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [API] getNearestTrail 성공');
    console.log('- 응답 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('❌ [API] getNearestTrail 실패:', error.message);
    throw error;
  }
};

export default {
  getTrailDetail,
  getTrailList,
  searchTrails,
  getNearbyTrails,
  getNearestTrail,
};