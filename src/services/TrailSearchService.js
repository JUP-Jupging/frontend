// TrailSearchService.js - 산책로 검색 관련 로직 분리

import { getNearestTrail, getTrailDetail } from '../api/trails';

/**
 * 산책로 검색 및 관리 서비스
 */
export class TrailSearchService {
  constructor() {
    this.searchInProgress = false;
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
        console.error('🚨 [TrailSearchService] 리스너 오류:', error);
      }
    });
  }

  /**
   * 거리 계산 유틸리티
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * 가장 가까운 산책로 검색
   */
  async searchNearestTrail(currentLocation) {
    if (this.searchInProgress) {
      console.log('🔄 [TrailSearchService] 이미 검색 진행 중');
      return null;
    }

    if (!currentLocation?.latitude || !currentLocation?.longitude) {
      console.log("❌ [TrailSearchService] 현재 위치 정보가 없습니다");
      return null;
    }

    try {
      this.searchInProgress = true;
      this.notifyListeners('search_started', { location: currentLocation });

      console.log("🔍 [TrailSearchService] 가장 가까운 산책로 검색 시작...");

      const nearestTrailData = await getNearestTrail(
        currentLocation.latitude,
        currentLocation.longitude
      );

      console.log("🔬 [TrailSearchService] API 응답:", nearestTrailData);

      if (!nearestTrailData || typeof nearestTrailData !== 'object') {
        console.log("🤷‍♂️ [TrailSearchService] 주변에 검색된 산책로가 없습니다");
        this.notifyListeners('search_completed', { trail: null });
        return null;
      }

      // 좌표 유효성 검사
      const lat = parseFloat(nearestTrailData.spotLatitude);
      const lon = parseFloat(nearestTrailData.spotLongitude);

      if (isNaN(lat) || !isFinite(lat) || isNaN(lon) || !isFinite(lon)) {
        console.error("🔥 [TrailSearchService] 좌표 데이터가 유효하지 않습니다");
        this.notifyListeners('search_error', { error: 'Invalid coordinates' });
        return null;
      }

      // 거리 계산 및 데이터 포맷팅
      const distance = this.calculateDistance(
        currentLocation.latitude, 
        currentLocation.longitude, 
        lat, 
        lon
      );

      const formattedTrail = {
        id: nearestTrailData.trailId,
        name: nearestTrailData.trailName || '이름 없는 산책로',
        coordinate: { latitude: lat, longitude: lon },
        distance: String(nearestTrailData.lengthDetail) || '정보 없음',
        difficulty: nearestTrailData.difficultyLevel || '보통',
        reportCount: nearestTrailData.reportCount || 0,
        address: nearestTrailData.lotNumberAddress || '주소 정보 없음',
        duration: nearestTrailData.trackTime || "정보 없음",
        distanceToUser: distance,
        originalData: nearestTrailData
      };

      console.log("✅ [TrailSearchService] 산책로 검색 완료:", formattedTrail.name);
      this.notifyListeners('search_completed', { trail: formattedTrail });
      
      return formattedTrail;

    } catch (error) {
      console.error("❌ [TrailSearchService] 검색 실패:", error);
      this.notifyListeners('search_error', { error: error.message });
      return null;
    } finally {
      this.searchInProgress = false;
    }
  }

  /**
   * 산책로 상세 정보 가져오기
   */
  async getTrailDetails(trailId) {
    try {
      console.log(`🔍 [TrailSearchService] 산책로 ${trailId} 상세 정보 요청`);
      
      const trailDetail = await getTrailDetail(trailId);
      
      console.log("📋 [TrailSearchService] 상세 정보 로드 완료");
      return trailDetail;

    } catch (error) {
      console.error("❌ [TrailSearchService] 상세 정보 로드 실패:", error);
      throw error;
    }
  }

  /**
   * 시작 가능 거리 체크
   */
  canStartPlogging(userLocation, trailCoords, maxDistance = 50000) {
    if (!userLocation || !trailCoords) {
      return false;
    }

    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      trailCoords.latitude,
      trailCoords.longitude
    );

    return {
      canStart: distance <= maxDistance,
      distance: distance,
      maxDistance: maxDistance
    };
  }

  /**
   * 검색 상태 초기화
   */
  reset() {
    this.searchInProgress = false;
    this.notifyListeners('reset', {});
  }
}

// 싱글톤 인스턴스
export const trailSearchService = new TrailSearchService();