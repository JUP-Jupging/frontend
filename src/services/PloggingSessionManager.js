// PloggingSessionManager.js - 플로깅 세션 관리 로직 분리

import { savePloggingRecord } from '../api/plog';

/**
 * 플로깅 세션 관리 클래스
 */
export class PloggingSessionManager {
  constructor() {
    this.sessionData = null;
    this.listeners = new Set();
  }

  /**
   * 리스너 등록
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * 리스너 제거
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * 상태 변경 알림
   */
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
   * 플로깅 결과 데이터 준비
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
      capturedImageUri
    } = params;

    if (!this.sessionData) {
      console.warn('⚠️ [PloggingSessionManager] 세션 데이터가 없습니다');
      return null;
    }

    // 안전한 데이터 처리
    const safeRouteCoordinates = Array.isArray(routeCoordinates) ? routeCoordinates : [];
    const safeCollectedTrash = Array.isArray(collectedTrash) ? collectedTrash : [];

    const resultData = {
      // 세션 기본 정보
      sessionId: this.generateSessionId(),
      startTime: this.sessionData.startTime,
      endTime: new Date().toISOString(),
      
      // 플로깅 결과
      routeName: selectedRoute?.name || courseInfo?.name || "플로깅 기록",
      routeLocation: selectedRoute?.location || courseInfo?.address || "플로깅 경로",
      totalTime: Math.max(0, time || 0),
      totalDistance: Math.max(0, totalDistance || 0),
      trashCount: Math.max(0, trashCount || 0),
      
      // 수집 데이터
      collectedTrash: safeCollectedTrash,
      routeCoordinates: safeRouteCoordinates,
      trashLocations: trashLocations || [],
      
      // 이미지
      mapImage: capturedImageUri,
      routeImage: capturedImageUri,
      
      // 메타데이터
      trailId: this.sessionData.selectedTrailId,
      memberId: this.sessionData.memberId,
    };

    console.log("📋 [PloggingSessionManager] 결과 데이터 준비 완료:", {
      hasMapImage: !!resultData.mapImage,
      routeLength: resultData.routeCoordinates.length,
      trashCount: resultData.trashCount,
      trailId: resultData.trailId,
    });

    return resultData;
  }

  /**
   * 서버에 플로깅 결과 저장
   */
  async saveToServer(resultData, accessToken) {
    if (!resultData || !this.sessionData) {
      throw new Error('결과 데이터 또는 세션 데이터가 없습니다');
    }

    console.log('📤 [PloggingSessionManager] 서버 저장 시작');

    // 서버 저장용 데이터 구성
    const serverData = {
      trailId: this.sessionData.selectedTrailId || null,
      ploggingTime: new Date().toISOString(),
      distance: Math.max(0, resultData.totalDistance || 0),
      memberId: this.sessionData.memberId || 1,
      imageFile: resultData.mapImage ? {
        uri: resultData.mapImage,
        type: 'image/png',
        name: `plogging_${Date.now()}.png`
      } : null
    };

    console.log("📤 [PloggingSessionManager] 서버 저장 데이터:", {
      trailId: serverData.trailId,
      distance: serverData.distance,
      hasImage: !!serverData.imageFile,
      hasToken: !!accessToken
    });

    try {
      // API 호출
      const response = await savePloggingRecord(serverData, accessToken || '');
      
      console.log("✅ [PloggingSessionManager] 서버 저장 성공");
      this.notifyListeners('save_success', { response });
      
      return response;

    } catch (error) {
      console.error("❌ [PloggingSessionManager] 서버 저장 실패:", error);
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