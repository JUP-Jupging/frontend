// src/api/plog.js
import axios from "axios";
import BASE_URL from "./apiconfig";

// 📌 플로깅 종료 및 저장 (시작 API 제거, 종료시에만 호출)
export const savePloggingRecord = async (ploggingData, accessToken) => {
  try {
    console.log('📡 [API] savePloggingRecord 호출 시작');
    
    // 🔥 액세스 토큰 디버깅
    console.log('🔑 [API] 받은 accessToken:', accessToken);
    console.log('🔑 [API] accessToken 타입:', typeof accessToken);
    console.log('🔑 [API] accessToken 길이:', accessToken ? accessToken.length : 'null/undefined');
    console.log('🔑 [API] accessToken 첫 20자:', accessToken ? accessToken.substring(0, 20) + '...' : 'null/undefined');
    
    // 토큰이 없으면 경고
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || accessToken === '') {
      console.error('❌ [API] 유효한 accessToken이 없습니다!');
      console.error('   - 받은 값:', accessToken);
      // 테스트를 위해 에러를 던지지 않고 계속 진행
      // throw new Error('AccessToken이 필요합니다');
    }
    
    const formData = new FormData();
    
    // 플로깅 기본 정보 추가
    if (ploggingData.trailId) {
      formData.append('trailId', String(ploggingData.trailId));
    }
    if (ploggingData.ploggingTime) {
      formData.append('ploggingTime', ploggingData.ploggingTime);
    }
    if (ploggingData.distance !== undefined) {
      formData.append('distance', String(ploggingData.distance));
    }
    if (ploggingData.memberId) {
      formData.append('memberId', String(ploggingData.memberId));
    }
    
    // 🔥 이미지 파일 추가 - 'image' 키 사용
    if (ploggingData.imageFile) {
      formData.append('image', ploggingData.imageFile);
      console.log('📎 [API] 이미지 파일 추가됨');
    }

    console.log('📋 [API] FormData 준비 완료:', {
      trailId: ploggingData.trailId,
      distance: ploggingData.distance,
      memberId: ploggingData.memberId,
      hasImage: !!ploggingData.imageFile
    });

    // 🔥 요청 URL과 헤더 로깅
    const requestUrl = `${BASE_URL}/plogging`;
    console.log('🌐 [API] 요청 URL:', requestUrl);
    console.log('📨 [API] Authorization 헤더:', `Bearer ${accessToken ? accessToken.substring(0, 20) + '...' : 'NO_TOKEN'}`);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken || ''}`,
      },
      body: formData
    });

    console.log('📡 [API] 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error('❌ [API] HTTP 에러 발생');
      console.error('   - Status:', response.status);
      
      // 응답 본문 확인
      try {
        const errorText = await response.text();
        console.error('   - 에러 응답 본문:', errorText.substring(0, 200));
      } catch (e) {
        console.error('   - 에러 응답 본문 읽기 실패');
      }
      
      throw new Error(`HTTP error: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('📄 [API] 받은 응답 텍스트:', responseText ? responseText.substring(0, 100) + '...' : '[응답 내용 없음]');

    // 🔥 응답 텍스트가 있을 경우에만 JSON으로 파싱합니다.
    if (responseText) {
      const data = JSON.parse(responseText);
      console.log('✅ [API] savePloggingRecord 성공 (JSON 데이터 있음):', data);
      return data;
    } else {
      // 🔥 응답 텍스트가 비어있으면, 성공으로 간주하고 빈 객체나 성공 메시지를 반환합니다.
      console.log('✅ [API] savePloggingRecord 성공 (응답 내용 없음)');
      return { success: true, message: '기록이 성공적으로 저장되었습니다.' };
    }
    
  } catch (error) {
    console.error('❌ [API] savePloggingRecord 실패');
    console.error('   - 에러 타입:', error.constructor.name);
    console.error('   - 에러 메시지:', error.message);
    // 전체 에러 로깅은 너무 길어질 수 있으므로 주석 처리하거나 필요시 사용
    // console.error('   - 전체 에러:', error);
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
    return data;
  } catch (error) {
    console.error('❌ [API] getMyPloggingRecords 실패:', error);
    throw error;
  }
};

// 🔥 레거시 함수들 (하위 호환성)
// 기존 코드에서 사용하던 함수명들을 새 함수로 매핑
export const startPlogging = async (formData, accessToken) => {
  console.warn('⚠️ startPlogging은 더 이상 사용되지 않습니다. 플로깅은 앱에서 로컬로 관리되고 종료시에만 서버에 저장됩니다.');
  // 시작 API는 더 이상 호출하지 않음
  return { success: true, message: '플로깅이 로컬에서 시작되었습니다.' };
};

export const endPlogging = async (ploggingData, accessToken) => {
  console.log('🔄 endPlogging -> savePloggingRecord로 리다이렉트');
  return await savePloggingRecord(ploggingData, accessToken);
};

// 🔥 사용 예시 주석
/*
// 플로깅 종료 및 저장 사용 예시:
const ploggingData = {
  trailId: 123,
  ploggingTime: "2025-08-19T10:30:00",
  distance: 2.5,
  memberId: 456,
  imageUrl: null, // 이미지가 있으면 File 객체
  imageFile: null // 실제 파일 객체
};

await savePloggingRecord(ploggingData, accessToken);

// 플로깅 상세 조회 사용 예시:
const detail = await getPloggingDetail(ploggingId, memberId, accessToken);

// 트레일 플로깅 참여자 수 조회 사용 예시:
const count = await getTrailPloggingCount(trailId, accessToken);

// 내 플로깅 기록 조회 사용 예시:
const myRecords = await getMyPloggingRecords(accessToken);
*/

export default {
  savePloggingRecord,
  getPloggingDetail, 
  getTrailPloggingCount,
  getMyPloggingRecords,
  // 레거시 호환성
  startPlogging,
  endPlogging,
};