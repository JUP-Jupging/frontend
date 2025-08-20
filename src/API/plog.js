// src/api/plog.js - 수정된 버전
import axios from "axios";
import BASE_URL from "./apiconfig";

// 📌 플로깅 종료 및 저장 (수정된 버전)
export const savePloggingRecord = async (ploggingData, accessToken) => {
  try {
    console.log('📡 [API] savePloggingRecord 호출 시작');
    console.log('📊 [API] 받은 데이터:', {
      trailId: ploggingData.trailId,
      ploggingTime: ploggingData.ploggingTime,
      distance: ploggingData.distance,
      memberId: ploggingData.memberId,
      hasImageFile: !!ploggingData.imageFile
    });
    
    // 🔥 액세스 토큰 디버깅
    console.log('🔑 [API] 받은 accessToken:', accessToken ? 'EXISTS' : 'NULL');
    console.log('🔑 [API] accessToken 타입:', typeof accessToken);
    console.log('🔑 [API] accessToken 길이:', accessToken ? accessToken.length : 'null/undefined');
    console.log('🔑 [API] accessToken 첫 20자:', accessToken ? accessToken.substring(0, 20) + '...' : 'null/undefined');
    
    // 토큰이 없으면 에러
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || accessToken === '') {
      console.error('❌ [API] 유효한 accessToken이 없습니다!');
      console.error('   - 받은 값:', accessToken);
      throw new Error('AccessToken이 필요합니다');
    }
    
    // 🔥 FormData 구성 (올바른 방법)
    const formData = new FormData();
    
    // 필수 필드들 추가
    formData.append('trailId', String(ploggingData.trailId || 0));
    formData.append('ploggingTime', ploggingData.ploggingTime || '00:00:00');
    formData.append('distance', String(ploggingData.distance || 0));
    formData.append('memberId', String(ploggingData.memberId || 0));
    
    // 🔥 이미지 파일 추가 - 'image' 키 사용 (백엔드 스펙에 맞춤)
    if (ploggingData.imageFile && ploggingData.imageFile.uri) {
      formData.append('image', {
        uri: ploggingData.imageFile.uri,
        type: ploggingData.imageFile.type || 'image/png',
        name: ploggingData.imageFile.name || `plogging_${Date.now()}.png`
      });
      console.log('📎 [API] 이미지 파일 추가됨');
      console.log('📎 [API] 이미지 URI:', ploggingData.imageFile.uri.substring(0, 50) + '...');
    } else {
      console.log('📎 [API] 이미지 파일 없음');
    }

    console.log('📋 [API] FormData 준비 완료');

    // 🔥 요청 URL과 헤더 로깅
    const requestUrl = `${BASE_URL}/plogging`;
    console.log('🌐 [API] 요청 URL:', requestUrl);
    console.log('📨 [API] Authorization 헤더:', `Bearer ${accessToken ? accessToken.substring(0, 20) + '...' : 'NO_TOKEN'}`);

    // 🔥 fetch 대신 axios 사용 (더 안정적)
    const response = await axios({
      method: 'POST',
      url: requestUrl,
      data: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30초 타임아웃
    });

    console.log('📡 [API] 응답 상태:', response.status);
    console.log('📄 [API] 응답 데이터:', response.data);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ [API] savePloggingRecord 성공');
      return response.data || { success: true, message: '기록이 성공적으로 저장되었습니다.' };
    } else {
      console.error('❌ [API] HTTP 에러 발생');
      console.error('   - Status:', response.status);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ [API] savePloggingRecord 실패');
    console.error('   - 에러 타입:', error.constructor.name);
    console.error('   - 에러 메시지:', error.message);
    
    // axios 에러 상세 처리
    if (error.response) {
      // 서버가 응답했지만 에러 상태
      console.error('   - 응답 상태:', error.response.status);
      console.error('   - 응답 데이터:', error.response.data);
      console.error('   - 응답 헤더:', error.response.headers);
    } else if (error.request) {
      // 요청이 만들어졌지만 응답을 받지 못함
      console.error('   - 요청은 전송되었으나 응답 없음');
      console.error('   - 요청 정보:', error.request);
    } else {
      // 요청을 만드는 과정에서 에러 발생
      console.error('   - 요청 생성 중 에러:', error.message);
    }
    
    throw error;
  }
};

// 📌 플로깅 상세 조회 (특정 플로깅 ID + 멤버 ID)
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
    return data;
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

// 📌 내 플로깅 기록 조회
export const getMyPloggingRecords = async (accessToken) => {
  try {
    console.log('📡 [API] getMyPloggingRecords 호출 시작');
    
    const { data } = await axios.get(`${BASE_URL}/plogging/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('✅ [API] getMyPloggingRecords 성공:', data?.length || 0, '개');
    return data;
  } catch (error) {
    console.error('❌ [API] getMyPloggingRecords 실패:', error);
    throw error;
  }
};

// 🔥 레거시 함수들 (하위 호환성)
export const startPlogging = async (formData, accessToken) => {
  console.warn('⚠️ startPlogging은 더 이상 사용되지 않습니다. 플로깅은 앱에서 로컬로 관리되고 종료시에만 서버에 저장됩니다.');
  return { success: true, message: '플로깅이 로컬에서 시작되었습니다.' };
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