// PloggingContext.js - 쓰레기 데이터 관리가 통합된 플로깅 컨텍스트

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { usePlogging } from '../hooks/usePlogging';
import { useTrashData } from '../hooks/useTrashData';

const PloggingContext = createContext();

export const PloggingProvider = ({ children }) => {
  const ploggingHook = usePlogging();
  const locationHook = useLocation();
  
  // 🗑️ 쓰레기 데이터 관리 훅 통합
  const trashDataHook = useTrashData();
  
  // 기존 상태들
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [collectedTrash, setCollectedTrash] = useState([]);
  const [currentTrailInfo, setCurrentTrailInfo] = useState(null);
  
  const contextRef = useRef({ isActive: true });
  
  // 컨텍스트 생명주기 관리
  useEffect(() => {
    contextRef.current.isActive = true;
    console.log('🚀 [PloggingContext] 컨텍스트 활성화');
    
    return () => {
      console.log('🔄 [PloggingContext] 컨텍스트 정리 시작');
      contextRef.current.isActive = false;
      
      // 플로깅 진행 중이면 위치 추적 중단
      if (ploggingHook.status === "running" || ploggingHook.status === "paused") {
        locationHook.stopLocationTracking();
      }
      
      // 쓰레기 데이터 정리
      trashDataHook.clearAllTrashData();
      console.log('✅ [PloggingContext] 컨텍스트 정리 완료');
    };
  }, []);
  
  // 앱 상태 변경 감지 (백그라운드 모드 처리)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (!contextRef.current.isActive) return;
      
      if (ploggingHook.status === "running" || ploggingHook.status === "paused") {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          console.log('📱 [PloggingContext] 앱이 백그라운드로 전환됨');
          setIsBackgroundMode(true);
        } else if (nextAppState === 'active') {
          console.log('📱 [PloggingContext] 앱이 포그라운드로 전환됨');
          setIsBackgroundMode(false);
          
          // 플로깅 중이면 위치 추적 재개
          if (ploggingHook.status === "running" && contextRef.current.isActive) {
            locationHook.startLocationTracking(true);
          }
        }
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [ploggingHook.status]);

  // 🎯 액션 함수들
  const actions = {
    /**
     * 플로깅 시작 (산책로 정보와 쓰레기 데이터 로드 포함)
     * @param {Object} trailInfo - 산책로 정보 (id, name 등)
     * @returns {Promise<boolean>} 시작 성공 여부
     */
    startPlogging: async (trailInfo = null) => {
      if (!contextRef.current.isActive) {
        console.warn('⚠️ [PloggingContext] 컨텍스트가 비활성화되어 플로깅을 시작할 수 없습니다');
        return false;
      }

      try {
        console.log('🚀 [PloggingContext] 플로깅 시작 처리 시작');
        
        // 1️⃣ 현재 위치 확인
        const location = await locationHook.getCurrentLocation();
        if (!location || !contextRef.current.isActive) {
          Alert.alert('위치 오류', 'GPS 위치를 가져올 수 없습니다.');
          return false;
        }

        // 2️⃣ 산책로 정보 저장
        if (trailInfo) {
          setCurrentTrailInfo(trailInfo);
          console.log('🎯 [PloggingContext] 산책로 정보 설정:', trailInfo);

          // 3️⃣ 해당 산책로의 쓰레기 데이터 로드
          if (trailInfo.id) {
            console.log(`🗑️ [PloggingContext] 산책로 ${trailInfo.id}의 쓰레기 데이터 로드 시작`);
            await trashDataHook.loadTrashDataForTrail(trailInfo.id);
          }
        }

        // 4️⃣ 플로깅 및 위치 추적 시작
        ploggingHook.startPlogging();
        locationHook.startLocationTracking(true);
        
        console.log('✅ [PloggingContext] 플로깅 시작 완료');
        return true;

      } catch (error) {
        console.error('❌ [PloggingContext] 플로깅 시작 중 오류:', error);
        Alert.alert('오류', '플로깅 시작 중 오류가 발생했습니다.');
        return false;
      }
    },

    /**
     * 플로깅 일시정지
     */
    pausePlogging: () => {
      if (!contextRef.current.isActive) return;
      
      console.log('⏸️ [PloggingContext] 플로깅 일시정지');
      ploggingHook.pausePlogging();
      locationHook.stopLocationTracking();
    },

    /**
     * 플로깅 재개
     */
    resumePlogging: () => {
      if (!contextRef.current.isActive) return;
      
      console.log('▶️ [PloggingContext] 플로깅 재개');
      ploggingHook.resumePlogging();
      locationHook.startLocationTracking(true);
    },

    /**
     * 플로깅 종료 (모든 데이터 정리 포함)
     * @returns {Object} 플로깅 결과 데이터
     */
    endPlogging: () => {
      console.log('🏁 [PloggingContext] 플로깅 종료 처리 시작');

      // 플로깅 결과 데이터 수집
      const result = {
        // 기본 플로깅 데이터
        ...ploggingHook.getResult?.() || {},
        
        // 위치 및 경로 데이터
        routeCoordinates: locationHook.routeCoordinates || [],
        totalDistance: locationHook.totalDistance || 0,
        
        // 수집한 쓰레기 목록 (useTrashData에서 관리되는 실제 데이터)
        collectedTrash: trashDataHook.getPickedTrashForDisplay(),
        
        // 현재 산책로 정보
        trailInfo: currentTrailInfo,
        
        // 쓰레기 관련 통계
        trashStatistics: trashDataHook.statusSummary,
      };
      
      // 각 서비스 정리
      locationHook.stopLocationTracking();
      ploggingHook.endPlogging();
      locationHook.setRouteCoordinates([]);
      locationHook.setTotalDistance(0);
      
      // 로컬 상태 초기화
      setCollectedTrash([]);
      setCurrentTrailInfo(null);
      
      // 🗑️ 쓰레기 데이터 정리
      trashDataHook.clearAllTrashData();

      console.log('✅ [PloggingContext] 플로깅 종료 완료, 결과:', {
        hasRoute: result.routeCoordinates?.length > 0,
        collectedTrashCount: result.collectedTrash?.length || 0,
        trailId: result.trailInfo?.id
      });

      return result;
    },

    /**
     * 쓰레기 줍기 (단순 카운트 증가)
     * 실제 쓰레기 데이터 관리는 useTrashData에서 담당
     */
    addTrash: () => {
      if (!contextRef.current.isActive) return;
      
      console.log('🗑️ [PloggingContext] 쓰레기 카운트 증가');
      ploggingHook.pickTrash(); // 단순 카운트 증가
    },

    /**
     * 레거시 호환성을 위한 함수 (실제로는 useTrashData에서 관리)
     * @param {Object} trash - 쓰레기 객체
     */
    addCollectedTrashItem: (trash) => {
      if (!contextRef.current.isActive) return;
      
      console.log('📝 [PloggingContext] 수집 쓰레기 추가 (레거시):', trash?.id);
      setCollectedTrash(prev => [...prev, trash]);
    },

    /**
     * 산책로 정보 설정
     * @param {Object} trailInfo - 산책로 정보
     */
    setCurrentTrailInfo: (trailInfo) => {
      if (!contextRef.current.isActive) return;
      
      console.log('🎯 [PloggingContext] 산책로 정보 업데이트:', trailInfo);
      setCurrentTrailInfo(trailInfo);
    },

    /**
     * 🗑️ 쓰레기 관련 액션들 (useTrashData 래핑)
     */
    // 쓰레기 줍기 (실제 서버 처리 포함)
    pickTrashItem: async (trashId) => {
      if (!contextRef.current.isActive) return false;
      
      console.log(`🎯 [PloggingContext] 쓰레기 ${trashId} 줍기 요청`);
      
      const success = await trashDataHook.pickTrash(trashId);
      if (success) {
        // 성공시 카운트도 증가
        ploggingHook.pickTrash();
      }
      
      return success;
    },

    // 쓰레기 상세 정보 조회
    getTrashDetails: (trashId) => {
      return trashDataHook.getTrashDetails(trashId);
    },

    // 산책로별 쓰레기 데이터 로드
    loadTrashDataForTrail: (trailId) => {
      return trashDataHook.loadTrashDataForTrail(trailId);
    },

    // 레거시 호환성 함수들
    setTrashLocations: (locations) => {
      console.warn('⚠️ [PloggingContext] setTrashLocations는 더 이상 사용되지 않습니다. useTrashData를 사용하세요.');
    },
    
    removeTrash: (trashId) => {
      console.warn('⚠️ [PloggingContext] removeTrash는 더 이상 사용되지 않습니다. pickTrashItem을 사용하세요.');
    },
  };

  // 🎯 컨텍스트 값 구성
  const value = {
    // 📊 기본 플로깅 상태
    status: ploggingHook.status,
    time: ploggingHook.time,
    trashCount: ploggingHook.trashCount, // 단순 카운트 (pickTrash 호출 시 증가)
    formatTime: ploggingHook.formatTime,

    // 📍 위치 및 경로 정보
    currentLocation: locationHook.currentLocation,
    routeCoordinates: locationHook.routeCoordinates || [],
    totalDistance: locationHook.totalDistance || 0,
    formatDistance: locationHook.formatDistance,
    mapRef: locationHook.mapRef,

    // 🗑️ 쓰레기 관련 데이터 (useTrashData에서 관리)
    trashLocations: trashDataHook.activeTrashList, // 지도에 표시할 활성 쓰레기
    pickedTrashList: trashDataHook.pickedTrashList, // 주운 쓰레기 목록
    trashStatistics: trashDataHook.statusSummary, // 쓰레기 통계
    isLoadingTrashData: trashDataHook.isLoading, // 쓰레기 데이터 로딩 상태

    // 📱 앱 상태
    isBackgroundMode,
    isContextActive: contextRef.current.isActive,

    // 레거시 호환성을 위한 데이터
    collectedTrash, // 기존 코드 호환성용 (실제로는 trashDataHook.pickedTrashList 사용 권장)
    
    // 🎯 현재 산책로 정보
    currentTrailInfo,

    // 🎮 모든 액션 함수들
    ...actions,
  };

  return (
    <PloggingContext.Provider value={value}>
      {children}
    </PloggingContext.Provider>
  );
};

/**
 * PloggingContext 사용을 위한 훅
 * @returns {Object} 플로깅 컨텍스트 값
 */
export const usePloggingContext = () => {
  const context = useContext(PloggingContext);
  if (!context) {
    throw new Error('usePloggingContext must be used within a PloggingProvider');
  }
  return context;
};