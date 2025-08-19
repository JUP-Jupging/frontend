// TrashDataManager.js - 쓰레기 데이터 관리 전용 로직

import { getReportsByTrailId, markReportPicked } from '../api/report';

/**
 * 쓰레기 데이터 관리 클래스
 * - 산책로별 쓰레기 정보 로드
 * - 쓰레기 줍기 상태 관리
 * - 지도용 데이터 변환
 */
export class TrashDataManager {
  constructor() {
    this.trashData = new Map(); // trashId -> 쓰레기 전체 데이터
    this.pickedTrash = new Set(); // 주운 쓰레기 ID 집합
    this.listeners = new Set(); // 상태 변경 리스너들
  }

  /**
   * 상태 변경 리스너 등록
   * @param {Function} listener - 상태 변경 시 호출될 콜백
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * 상태 변경 리스너 제거
   * @param {Function} listener - 제거할 콜백
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * 모든 리스너에게 상태 변경 알림
   * @param {string} type - 변경 타입 ('loaded', 'picked', 'error')
   * @param {any} data - 관련 데이터
   */
  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      try {
        listener(type, data);
      } catch (error) {
        console.error('🚨 [TrashDataManager] 리스너 오류:', error);
      }
    });
  }

  /**
   * 특정 산책로의 쓰레기 데이터를 API에서 로드
   * @param {number} trailId - 산책로 ID
   * @returns {Promise<Array>} 쓰레기 데이터 배열
   */
  async loadTrashDataForTrail(trailId) {
    try {
      console.log(`🗑️ [TrashDataManager] 산책로 ${trailId}의 쓰레기 데이터 로드 시작`);

      if (!trailId) {
        console.warn('⚠️ [TrashDataManager] trailId가 없어 쓰레기 데이터를 로드할 수 없습니다');
        return [];
      }

      // API 호출하여 해당 산책로의 신고 목록 가져오기
      const reports = await getReportsByTrailId(trailId);
      
      if (!Array.isArray(reports)) {
        console.warn('⚠️ [TrashDataManager] API 응답이 배열이 아닙니다:', reports);
        return [];
      }

      console.log(`📊 [TrashDataManager] ${reports.length}개의 쓰레기 신고 발견`);

      // 서버 데이터를 내부 형식으로 변환하여 저장
      const processedTrash = this.processServerData(reports);
      
      // 메모리에 저장
      processedTrash.forEach(trash => {
        this.trashData.set(trash.id, trash);
      });

      // 리스너들에게 데이터 로드 완료 알림
      this.notifyListeners('loaded', {
        trailId,
        trashCount: processedTrash.length,
        activeTrashCount: processedTrash.filter(t => !t.isPicked).length
      });

      return processedTrash;

    } catch (error) {
      console.error('❌ [TrashDataManager] 쓰레기 데이터 로드 실패:', error);
      
      // 리스너들에게 오류 알림
      this.notifyListeners('error', {
        type: 'load_failed',
        trailId,
        error: error.message
      });

      return [];
    }
  }

  /**
   * 서버에서 받은 신고 데이터를 내부 형식으로 변환
   * @param {Array} serverReports - 서버 신고 데이터
   * @returns {Array} 변환된 쓰레기 데이터
   */
  processServerData(serverReports) {
    return serverReports.map(report => {
      try {
        // 쓰레기 카테고리별 개수 정리
        const categories = this.extractTrashCategories(report);
        
        // 총 쓰레기 개수 계산
        const totalCount = Object.values(categories).reduce((sum, count) => sum + count, 0);
        
        // 쓰레기 양 결정 (많음/보통/적음)
        const amount = this.determineTrashAmount(totalCount);
        
        // 지도 표시용 색상 결정
        const color = this.getTrashColor(amount);

        return {
          id: report.reportId,
          coordinate: {
            latitude: parseFloat(report.lat),
            longitude: parseFloat(report.lng)
          },
          title: report.title || '쓰레기 신고',
          amount: amount,
          color: color,
          categories: categories,
          totalCount: totalCount,
          isPicked: report.isPicked === 'Y', // 서버의 picked 상태
          reportDate: report.createdAt,
          imageUrl: report.imageUrl,
          // 원본 서버 데이터 보존
          originalData: report
        };
      } catch (error) {
        console.error('❌ [TrashDataManager] 데이터 변환 오류:', error, report);
        return null;
      }
    }).filter(Boolean); // null 값 제거
  }

  /**
   * 신고 데이터에서 쓰레기 카테고리별 개수 추출
   * @param {Object} report - 서버 신고 데이터
   * @returns {Object} 카테고리별 개수 객체
   */
  extractTrashCategories(report) {
    const categories = {
      paper: parseInt(report.paper) || 0,
      can: parseInt(report.can) || 0,
      plastic: parseInt(report.plastic) || 0,
      vinyl: parseInt(report.vinyl) || 0,
      glass: parseInt(report.glass) || 0,
      styro: parseInt(report.styro) || 0,
      battery: parseInt(report.battery) || 0,
    };

    console.log(`🔍 [TrashDataManager] 신고 ${report.reportId} 카테고리:`, categories);
    return categories;
  }

  /**
   * 총 개수를 기반으로 쓰레기 양 결정
   * @param {number} totalCount - 총 쓰레기 개수
   * @returns {string} '많음', '보통', '적음' 중 하나
   */
  determineTrashAmount(totalCount) {
    if (totalCount >= 10) return '많음';
    if (totalCount >= 5) return '보통';
    return '적음';
  }

  /**
   * 쓰레기 양에 따른 색상 반환
   * @param {string} amount - 쓰레기 양 ('많음', '보통', '적음')
   * @returns {string} 색상 코드
   */
  getTrashColor(amount) {
    switch(amount) {
      case '많음': return '#FF5722';
      case '보통': return '#FF9800';
      case '적음': return '#4CAF50';
      default: return '#797982';
    }
  }

  /**
   * 쓰레기 줍기 처리 (서버 + 로컬 상태 업데이트)
   * @param {number} trashId - 쓰레기 ID
   * @param {string} accessToken - 인증 토큰
   * @returns {Promise<boolean>} 성공 여부
   */
  async pickTrash(trashId, accessToken) {
    try {
      console.log(`🎯 [TrashDataManager] 쓰레기 ${trashId} 줍기 처리 시작`);

      // 해당 쓰레기 데이터 확인
      const trashData = this.trashData.get(trashId);
      if (!trashData) {
        console.error(`❌ [TrashDataManager] 쓰레기 ID ${trashId}를 찾을 수 없습니다`);
        return false;
      }

      // 이미 주운 쓰레기인지 확인
      if (this.pickedTrash.has(trashId)) {
        console.warn(`⚠️ [TrashDataManager] 쓰레기 ${trashId}는 이미 주운 상태입니다`);
        return false;
      }

      // 서버에 picked 상태 업데이트 요청
      const serverResult = await markReportPicked(trashId, accessToken);
      console.log('📡 [TrashDataManager] 서버 응답:', serverResult);

      // 로컬 상태 업데이트
      this.pickedTrash.add(trashId);
      
      // 쓰레기 데이터의 picked 상태도 업데이트
      trashData.isPicked = true;
      this.trashData.set(trashId, trashData);

      console.log(`✅ [TrashDataManager] 쓰레기 ${trashId} 줍기 완료`);

      // 리스너들에게 줍기 완료 알림
      this.notifyListeners('picked', {
        trashId,
        trashData: { ...trashData }
      });

      return true;

    } catch (error) {
      console.error('❌ [TrashDataManager] 쓰레기 줍기 실패:', error);
      
      // 리스너들에게 오류 알림
      this.notifyListeners('error', {
        type: 'pick_failed',
        trashId,
        error: error.message
      });

      return false;
    }
  }

  /**
   * 지도에 표시할 활성 쓰레기 목록 반환 (주운 것 제외)
   * @returns {Array} 활성 쓰레기 데이터 배열
   */
  getActiveTrashForMap() {
    const activeTrash = Array.from(this.trashData.values())
      .filter(trash => !this.pickedTrash.has(trash.id));
    
    console.log(`🗺️ [TrashDataManager] 지도 표시용 활성 쓰레기: ${activeTrash.length}개`);
    return activeTrash;
  }

  /**
   * 주운 쓰레기 목록 반환
   * @returns {Array} 주운 쓰레기 데이터 배열
   */
  getPickedTrash() {
    const pickedTrash = Array.from(this.trashData.values())
      .filter(trash => this.pickedTrash.has(trash.id));
    
    console.log(`🎒 [TrashDataManager] 주운 쓰레기: ${pickedTrash.length}개`);
    return pickedTrash;
  }

  /**
   * 특정 쓰레기의 상세 정보 반환
   * @param {number} trashId - 쓰레기 ID
   * @returns {Object|null} 쓰레기 상세 정보
   */
  getTrashDetails(trashId) {
    const trash = this.trashData.get(trashId);
    if (!trash) {
      console.warn(`⚠️ [TrashDataManager] 쓰레기 ${trashId} 정보를 찾을 수 없습니다`);
      return null;
    }

    // 카테고리별 정보를 표시용으로 변환
    const categoryDetails = Object.entries(trash.categories)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        type: this.getCategoryDisplayName(category),
        count: count,
        color: this.getCategoryColor(category)
      }));

    return {
      ...trash,
      location: `위도: ${trash.coordinate.latitude.toFixed(4)}, 경도: ${trash.coordinate.longitude.toFixed(4)}`,
      categoryDetails: categoryDetails,
      isPicked: this.pickedTrash.has(trashId)
    };
  }

  /**
   * 카테고리 영문명을 한글 표시명으로 변환
   * @param {string} category - 영문 카테고리명
   * @returns {string} 한글 표시명
   */
  getCategoryDisplayName(category) {
    const displayNames = {
      paper: '종이',
      can: '캔',
      plastic: '플라스틱',
      vinyl: '비닐',
      glass: '유리',
      styro: '스티로폼',
      battery: '건전지'
    };
    return displayNames[category] || category;
  }

  /**
   * 카테고리별 표시 색상 반환
   * @param {string} category - 카테고리명
   * @returns {string} 색상 코드
   */
  getCategoryColor(category) {
    const colors = {
      paper: '#8BC34A',    // 연녹색
      can: '#FF9800',      // 주황색
      plastic: '#2196F3',  // 파란색
      vinyl: '#9C27B0',    // 보라색
      glass: '#00BCD4',    // 청록색
      styro: '#F44336',    // 빨간색
      battery: '#795548'   // 갈색
    };
    return colors[category] || '#757575';
  }

  /**
   * 모든 데이터 초기화 (플로깅 종료 시 사용)
   */
  clearAllData() {
    console.log('🧹 [TrashDataManager] 모든 데이터 초기화');
    this.trashData.clear();
    this.pickedTrash.clear();
    
    // 리스너들에게 초기화 알림
    this.notifyListeners('cleared', {});
  }

  /**
   * 현재 상태 요약 정보 반환
   * @returns {Object} 상태 요약
   */
  getStatusSummary() {
    const totalTrash = this.trashData.size;
    const pickedCount = this.pickedTrash.size;
    const activeCount = totalTrash - pickedCount;

    return {
      totalTrash,
      pickedCount,
      activeCount,
      pickRatio: totalTrash > 0 ? (pickedCount / totalTrash * 100).toFixed(1) : 0
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const trashDataManager = new TrashDataManager();