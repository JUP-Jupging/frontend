// useTrashData.js - 쓰레기 데이터 관리 React 훅

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { trashDataManager } from '../utils/TrashDataManager';
import { useAuth } from '../stores/useAuth';

/**
 * 쓰레기 데이터 관리를 위한 커스텀 훅
 * - 산책로별 쓰레기 데이터 로드
 * - 쓰레기 줍기 처리
 * - 상태 변경 감지 및 UI 업데이트
 */
export const useTrashData = () => {
  // 🔐 인증 정보
  const { accessToken } = useAuth();
  
  // 📊 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrashList, setActiveTrashList] = useState([]); // 지도에 표시할 활성 쓰레기
  const [pickedTrashList, setPickedTrashList] = useState([]); // 주운 쓰레기 목록
  const [statusSummary, setStatusSummary] = useState({
    totalTrash: 0,
    pickedCount: 0,
    activeCount: 0,
    pickRatio: 0
  });

  // 🔄 리렌더링 방지를 위한 ref
  const isInitialized = useRef(false);
  const currentTrailId = useRef(null);

  /**
   * TrashDataManager의 상태 변경을 처리하는 리스너
   * @param {string} type - 변경 타입
   * @param {any} data - 관련 데이터
   */
  const handleTrashDataChange = useCallback((type, data) => {
    console.log(`🔔 [useTrashData] 상태 변경 감지: ${type}`, data);

    switch (type) {
      case 'loaded':
        // 데이터 로드 완료 시 UI 업데이트
        setActiveTrashList(trashDataManager.getActiveTrashForMap());
        setPickedTrashList(trashDataManager.getPickedTrash());
        setStatusSummary(trashDataManager.getStatusSummary());
        setIsLoading(false);
        
        console.log(`✅ [useTrashData] 쓰레기 데이터 로드 완료: ${data.activeTrashCount}개 활성`);
        break;

      case 'picked':
        // 쓰레기 줍기 완료 시 목록 업데이트
        setActiveTrashList(trashDataManager.getActiveTrashForMap());
        setPickedTrashList(trashDataManager.getPickedTrash());
        setStatusSummary(trashDataManager.getStatusSummary());
        
        console.log(`🎒 [useTrashData] 쓰레기 줍기 완료: ID ${data.trashId}`);
        
        // 성공 알림 표시
        Alert.alert(
          '✅ 쓰레기 수거 완료',
          `"${data.trashData.title}"을(를) 주웠습니다!`,
          [{ text: '확인' }]
        );
        break;

      case 'error':
        setIsLoading(false);
        console.error(`❌ [useTrashData] 오류 발생:`, data);
        
        // 오류 타입별 알림
        if (data.type === 'load_failed') {
          Alert.alert(
            '⚠️ 데이터 로드 실패',
            '쓰레기 정보를 불러오는데 실패했습니다. 네트워크를 확인해주세요.',
            [{ text: '확인' }]
          );
        } else if (data.type === 'pick_failed') {
          Alert.alert(
            '⚠️ 줍기 실패',
            '쓰레기 줍기 처리에 실패했습니다. 다시 시도해주세요.',
            [{ text: '확인' }]
          );
        }
        break;

      case 'cleared':
        // 데이터 초기화 시 UI 리셋
        setActiveTrashList([]);
        setPickedTrashList([]);
        setStatusSummary({
          totalTrash: 0,
          pickedCount: 0,
          activeCount: 0,
          pickRatio: 0
        });
        
        console.log('🧹 [useTrashData] UI 상태 초기화 완료');
        break;

      default:
        console.warn(`⚠️ [useTrashData] 알 수 없는 상태 변경: ${type}`);
    }
  }, []);

  /**
   * 컴포넌트 마운트 시 리스너 등록
   */
  useEffect(() => {
    console.log('🔌 [useTrashData] TrashDataManager 리스너 등록');
    
    trashDataManager.addListener(handleTrashDataChange);
    isInitialized.current = true;

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      console.log('🔌 [useTrashData] TrashDataManager 리스너 해제');
      trashDataManager.removeListener(handleTrashDataChange);
      isInitialized.current = false;
    };
  }, [handleTrashDataChange]);

  /**
   * 특정 산책로의 쓰레기 데이터 로드
   * @param {number} trailId - 산책로 ID
   */
  const loadTrashDataForTrail = useCallback(async (trailId) => {
    if (!isInitialized.current) {
      console.warn('⚠️ [useTrashData] 훅이 아직 초기화되지 않았습니다');
      return;
    }

    if (!trailId) {
      console.warn('⚠️ [useTrashData] trailId가 없어 쓰레기 데이터를 로드할 수 없습니다');
      return;
    }

    // 동일한 산책로 중복 로드 방지
    if (currentTrailId.current === trailId) {
      console.log(`🔄 [useTrashData] 산책로 ${trailId}는 이미 로드되어 있습니다`);
      return;
    }

    try {
      console.log(`🚀 [useTrashData] 산책로 ${trailId}의 쓰레기 데이터 로드 시작`);
      
      setIsLoading(true);
      currentTrailId.current = trailId;

      // TrashDataManager를 통해 데이터 로드
      await trashDataManager.loadTrashDataForTrail(trailId);
      
    } catch (error) {
      console.error('❌ [useTrashData] 쓰레기 데이터 로드 중 오류:', error);
      setIsLoading(false);
      
      Alert.alert(
        '오류',
        '쓰레기 정보를 불러오는 중 문제가 발생했습니다.',
        [{ text: '확인' }]
      );
    }
  }, []);

  /**
   * 쓰레기 줍기 처리
   * @param {number} trashId - 쓰레기 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  const pickTrash = useCallback(async (trashId) => {
    if (!isInitialized.current) {
      console.warn('⚠️ [useTrashData] 훅이 아직 초기화되지 않았습니다');
      return false;
    }

    if (!accessToken) {
      Alert.alert(
        '인증 필요',
        '쓰레기를 줍기 위해서는 로그인이 필요합니다.',
        [{ text: '확인' }]
      );
      return false;
    }

    try {
      console.log(`🎯 [useTrashData] 쓰레기 ${trashId} 줍기 시작`);

      // TrashDataManager를 통해 줍기 처리
      const success = await trashDataManager.pickTrash(trashId, accessToken);
      
      if (success) {
        console.log(`✅ [useTrashData] 쓰레기 ${trashId} 줍기 성공`);
      } else {
        console.warn(`⚠️ [useTrashData] 쓰레기 ${trashId} 줍기 실패`);
      }

      return success;

    } catch (error) {
      console.error('❌ [useTrashData] 쓰레기 줍기 중 오류:', error);
      
      Alert.alert(
        '오류',
        '쓰레기 줍기 처리 중 문제가 발생했습니다.',
        [{ text: '확인' }]
      );

      return false;
    }
  }, [accessToken]);

  /**
   * 특정 쓰레기의 상세 정보 조회
   * @param {number} trashId - 쓰레기 ID
   * @returns {Object|null} 쓰레기 상세 정보
   */
  const getTrashDetails = useCallback((trashId) => {
    if (!isInitialized.current) {
      console.warn('⚠️ [useTrashData] 훅이 아직 초기화되지 않았습니다');
      return null;
    }

    return trashDataManager.getTrashDetails(trashId);
  }, []);

  /**
   * 모든 쓰레기 데이터 초기화 (플로깅 종료 시 사용)
   */
  const clearAllTrashData = useCallback(() => {
    if (!isInitialized.current) {
      console.warn('⚠️ [useTrashData] 훅이 아직 초기화되지 않았습니다');
      return;
    }

    console.log('🧹 [useTrashData] 모든 쓰레기 데이터 초기화');
    
    currentTrailId.current = null;
    trashDataManager.clearAllData();
  }, []);

  /**
   * 주운 쓰레기 목록을 표시용 형태로 변환
   * @returns {Array} 표시용 주운 쓰레기 목록
   */
  const getPickedTrashForDisplay = useCallback(() => {
    return pickedTrashList.map(trash => ({
      id: trash.id,
      title: trash.title || '쓰레기',
      amount: trash.amount,
      totalCount: trash.totalCount,
      categoryDetails: trash.categoryDetails || [],
      pickTime: new Date().toISOString(), // 실제로는 줍기 시간을 트래킹해야 함
      coordinate: trash.coordinate
    }));
  }, [pickedTrashList]);

  // 🎯 훅 반환값
  return {
    // 📊 상태 데이터
    isLoading,
    activeTrashList,      // 지도에 표시할 활성 쓰레기 목록
    pickedTrashList,      // 주운 쓰레기 목록
    statusSummary,        // 쓰레기 상태 요약 (총 개수, 주운 개수 등)

    // 🔧 액션 함수들
    loadTrashDataForTrail,  // 산책로별 쓰레기 데이터 로드
    pickTrash,              // 쓰레기 줍기
    getTrashDetails,        // 쓰레기 상세 정보 조회
    clearAllTrashData,      // 모든 데이터 초기화
    getPickedTrashForDisplay, // 표시용 주운 쓰레기 목록

    // 🔍 유틸리티
    hasActiveTrash: activeTrashList.length > 0,
    hasPickedTrash: pickedTrashList.length > 0,
    currentTrailId: currentTrailId.current
  };
};