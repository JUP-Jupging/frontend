// PloggingSessionManager.js - API 에러 해결 및 안전장치 추가

import { savePloggingRecord } from '../api/plog';

/**
 * 플로깅 세션 관리 클래스 (API 에러 해결 버전)
 */
export class PloggingSessionManager {
  constructor() {
    this.sessionData = null;
    this.listeners = new Set();
  }

  /**
   * 리스너 등록/제거
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      try {
        listener(type, data);
      } catch (error) {
        console.error('🚨 [PloggingSessionManager] 리스너 오류:', error);
      }
    });
  }

  /**
   * 플로깅 세션 시작
   */
  startSession(params) {
    const { currentLocation, selectedTrailId, memberId = 1 } = params;
    
    this.sessionData = {
      startTime: new Date().toISOString(),
      startLocation: currentLocation,
      selectedTrailId: selectedTrailId || null,
      memberId: memberId,
      status: 'active'
    };

    console.log('🚀 [PloggingSessionManager] 세션 시작:', {
      trailId: this.sessionData.selectedTrailId,
      startTime: this.sessionData.startTime
    });

    this.notifyListeners('session_started', { sessionData: this.sessionData });
    
    return this.sessionData;
  }

  /**
   * 세션 데이터 업데이트
   */
  updateSession(updates) {
    if (!this.sessionData) {
      console.warn('⚠️ [PloggingSessionManager] 활성 세션이 없습니다');
      return;
    }

    this.sessionData = { ...this.sessionData, ...updates };
    this.notifyListeners('session_updated', { sessionData: this.sessionData });
  }

  /**
   * 플로깅 결과 데이터 준비 (안전장치 추가)
   */
  prepareResultData(params) {
    const {
      time,
      totalDistance,
      trashCount,
      collectedTrash,
      routeCoordinates,
      trashLocations,
      selectedRoute,
      courseInfo,
      capturedImageUri,
      trailDetails
    } = params;

    if (!this.sessionData) {
      console.warn('⚠️ [PloggingSessionManager] 세션 데이터가 없습니다');
      return null;
    }

    // 🔥 안전한 데이터 처리 및 검증
    const safeRouteCoordinates = Array.isArray(routeCoordinates) ? routeCoordinates : [];
    const safeCollectedTrash = Array.isArray(collectedTrash) ? collectedTrash : [];
    const safeTime = Math.max(0, parseInt(time) || 0);
    const safeDistance = Math.max(0, parseFloat(totalDistance) || 0);
    const safeTrashCount = Math.max(0, parseInt(trashCount) || 0);

    // 🔥 결과 데이터 구성 (null 체크 강화)
    const resultData = {
      // 세션 기본 정보
      sessionId: this.generateSessionId(),
      startTime: this.sessionData.startTime,
      endTime: new Date().toISOString(),
      
      // 플로깅 결과 (안전한 값)
      routeName: trailDetails?.trailName || selectedRoute?.name || courseInfo?.name || "플로깅 기록",
      routeLocation: trailDetails?.lotNumberAddress || selectedRoute?.location || courseInfo?.address || "플로깅 경로",
      totalTime: safeTime,
      totalDistance: safeDistance,
      trashCount: safeTrashCount,
      
      // 수집 데이터
      collectedTrash: safeCollectedTrash,
      routeCoordinates: safeRouteCoordinates,
      trashLocations: trashLocations || [],
      
      // 이미지 (안전 처리)
      mapImage: capturedImageUri || null,
      routeImage: capturedImageUri || null,
      
      // 메타데이터
      trailId: this.sessionData.selectedTrailId,
      memberId: this.sessionData.memberId,
      
      // 🔥 산책로 상세정보 추가
      trailDetails: trailDetails || null,
      
      // 🔥 디버깅 정보
      _hasMapImage: !!capturedImageUri,
      _imageUriLength: capturedImageUri ? capturedImageUri.length : 0
    };

    console.log("📋 [PloggingSessionManager] 결과 데이터 준비 완료:", {
      routeName: resultData.routeName,
      hasMapImage: resultData._hasMapImage,
      imageUriLength: resultData._imageUriLength,
      routeLength: resultData.routeCoordinates.length,
      trashCount: resultData.trashCount,
      trailId: resultData.trailId,
    });

    return resultData;
  }

  /**
   * 🔥 서버 저장 데이터 검증 및 변환
   */
/**
 * 🔥 서버 저장 데이터 검증 및 변환 (Multipart FormData 방식)
 */
validateAndTransformServerData(resultData) {
  console.log("🔍 [PloggingSessionManager] 서버 저장용 데이터 검증 시작 (Multipart)");
  
  // 🔥 PloggingInsertRequestDto에 맞춘 데이터 구성
  const dtoData = {
    trailId: parseInt(resultData.trailId) || 0,
    ploggingTime: resultData.endTime || new Date().toISOString(),
    distance: Math.max(0, parseFloat(resultData.totalDistance) || 0),
    // memberId는 백엔드에서 authHeader로부터 추출하므로 제외
  };

  // 🔥 이미지 파일 처리
  let imageFile = null;
  if (resultData.mapImage && typeof resultData.mapImage === 'string' && resultData.mapImage.length > 0) {
    imageFile = {
      uri: resultData.mapImage,
      type: 'image/png',
      name: `plogging_${Date.now()}.png`
    };
    console.log("✅ [PloggingSessionManager] 이미지 파일 포함됨");
  } else {
    console.log("ℹ️ [PloggingSessionManager] 이미지 없이 저장");
  }

  console.log("📤 [PloggingSessionManager] DTO 데이터:", dtoData);
  console.log("📤 [PloggingSessionManager] 이미지 파일:", !!imageFile);

  return { dtoData, imageFile };
}

/**
 * 🔥 FormData 생성 함수
 */
createFormData(dtoData, imageFile) {
  console.log("📦 [PloggingSessionManager] FormData 생성 시작");
  
  const formData = new FormData();

  // 🔥 이미지 파일 추가 (@RequestPart(value = "image"))
  if (imageFile) {
    formData.append('image', imageFile);
    console.log("📦 [PloggingSessionManager] 이미지 파일 FormData에 추가");
  }

  // 🔥 DTO 데이터 추가 (각 필드별로)
  Object.keys(dtoData).forEach(key => {
    if (dtoData[key] !== null && dtoData[key] !== undefined) {
      formData.append(key, dtoData[key].toString());
      console.log(`📦 [PloggingSessionManager] ${key}: ${dtoData[key]} 추가`);
    }
  });

  console.log("✅ [PloggingSessionManager] FormData 생성 완료");
  return formData;
}

/**
 * 🔥 서버에 플로깅 결과 저장 (Multipart FormData 방식)
 */
async saveToServer(resultData, accessToken) {
  if (!resultData || !this.sessionData) {
    throw new Error('결과 데이터 또는 세션 데이터가 없습니다');
  }

  console.log('📤 [PloggingSessionManager] === 서버 저장 시작 (Multipart) ===');
  
  try {
    // 🔥 데이터 검증 및 변환
    const { dtoData, imageFile } = this.validateAndTransformServerData(resultData);
    
    // 🔥 FormData 생성
    const formData = this.createFormData(dtoData, imageFile);
    
    // 🔥 액세스 토큰 검증
    if (!accessToken || typeof accessToken !== 'string') {
      console.warn("⚠️ [PloggingSessionManager] 액세스 토큰이 없거나 유효하지 않음");
      throw new Error('유효하지 않은 액세스 토큰');
    }

    console.log("📤 [PloggingSessionManager] API 호출 준비:");
    console.log("📤 [PloggingSessionManager] - FormData 생성됨");
    console.log("📤 [PloggingSessionManager] - 이미지 포함:", !!imageFile);
    console.log("📤 [PloggingSessionManager] - 토큰 길이:", accessToken.length);
    
    // 🔥 savePloggingRecord API 호출 (FormData 전송)
    const response = await Promise.race([
      savePloggingRecord(formData, accessToken), // FormData 전송
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API 호출 타임아웃 (30초)')), 30000)
      )
    ]);
    
    console.log("✅ [PloggingSessionManager] 서버 저장 성공");
    console.log("✅ [PloggingSessionManager] 응답:", response);
    
    this.notifyListeners('save_success', { response });
    return response;

  } catch (error) {
    console.error("❌ [PloggingSessionManager] === 서버 저장 실패 ===");
    console.error("❌ [PloggingSessionManager] 에러 타입:", error.constructor.name);
    console.error("❌ [PloggingSessionManager] 에러 메시지:", error.message);
    
    // 🔥 HTTP 에러 분석
    if (error.message.includes('500')) {
      console.error("💡 [PloggingSessionManager] HTTP 500 - 서버 내부 오류");
      console.error("💡 [PloggingSessionManager] 가능한 원인:");
      console.error("   - S3 업로드 실패 (이미지 파일)");
      console.error("   - PloggingInsertRequestDto 필드 불일치");
      console.error("   - 인증 헤더 처리 오류");
      console.error("   - DB 저장 오류");
    } else if (error.message.includes('400')) {
      console.error("💡 [PloggingSessionManager] HTTP 400 - 잘못된 요청");
      console.error("💡 [PloggingSessionManager] 확인사항:");
      console.error("   - Content-Type: multipart/form-data");
      console.error("   - @RequestPart(value = 'image') 매핑");
      console.error("   - PloggingInsertRequestDto 필드 매핑");
    } else if (error.message.includes('401')) {
      console.error("💡 [PloggingSessionManager] HTTP 401 - 인증 오류");
      console.error("💡 [PloggingSessionManager] Authorization 헤더 확인");
    } else if (error.message.includes('타임아웃')) {
      console.error("💡 [PloggingSessionManager] 네트워크 타임아웃");
    }
    
    this.notifyListeners('save_error', { error });
    throw error;
  }
}

  /**
   * 세션 종료
   */
  endSession() {
    if (!this.sessionData) {
      console.warn('⚠️ [PloggingSessionManager] 종료할 세션이 없습니다');
      return;
    }

    console.log('🏁 [PloggingSessionManager] 세션 종료');
    
    const endedSession = { ...this.sessionData };
    this.sessionData = null;
    
    this.notifyListeners('session_ended', { sessionData: endedSession });
  }

  /**
   * 현재 세션 정보 반환
   */
  getCurrentSession() {
    return this.sessionData;
  }

  /**
   * 세션 활성 상태 확인
   */
  isActive() {
    return this.sessionData !== null && this.sessionData.status === 'active';
  }

  /**
   * 세션 ID 생성
   */
  generateSessionId() {
    return `plogging_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 모든 데이터 초기화
   */
  reset() {
    this.sessionData = null;
    this.notifyListeners('reset', {});
  }
}

// 싱글톤 인스턴스
export const ploggingSessionManager = new PloggingSessionManager();