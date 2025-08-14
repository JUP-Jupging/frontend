import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { usePlogging } from '../hooks/usePlogging';

const PloggingContext = createContext();

export const PloggingProvider = ({ children }) => {
  console.log('[PloggingContext] Provider 초기화');

  // 플로깅 관련 훅들을 전역에서 관리
  const ploggingHook = usePlogging();
  const locationHook = useLocation();
  
  // 추가 상태들
  const [trashLocations, setTrashLocations] = useState([]);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  
  // AppState 관리
  useEffect(() => {
    console.log('[PloggingContext] AppState 리스너 등록');
    
    const handleAppStateChange = (nextAppState) => {
      console.log('[PloggingContext] AppState 변경:', nextAppState, '플로깅 상태:', ploggingHook.status);
      
      if (ploggingHook.status === "running" || ploggingHook.status === "paused") {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          console.log('[PloggingContext] ✅ 백그라운드 모드 활성화 - 플로깅 세션 유지');
          setIsBackgroundMode(true);
          // 플로깅 중일 때는 백그라운드에서도 모든 기능 유지
          // GPS 추적과 타이머가 계속 실행됨
        } else if (nextAppState === 'active') {
          console.log('[PloggingContext] ✅ 포그라운드 복귀');
          setIsBackgroundMode(false);
          // GPS 추적 재활성화 (혹시 중단되었을 경우를 대비)
          if (ploggingHook.status === "running") {
            console.log('[PloggingContext] GPS 추적 재활성화');
            locationHook.startLocationTracking(true);
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      console.log('[PloggingContext] AppState 리스너 해제');
      subscription?.remove();
    };
  }, [ploggingHook.status, locationHook.startLocationTracking]);

  // 플로깅 액션들
  const actions = {
    // 플로깅 시작
    startPlogging: async () => {
      console.log('[PloggingContext] 플로깅 시작 시도...');
      
      try {
        const location = await locationHook.getCurrentLocation();
        if (location) {
          console.log('[PloggingContext] 위치 획득 성공, 플로깅 시작');
          ploggingHook.startPlogging();
          locationHook.startLocationTracking(true);
          return true;
        } else {
          console.log('[PloggingContext] 위치 획득 실패');
          Alert.alert('위치 오류', 'GPS 위치를 가져올 수 없습니다.');
          return false;
        }
      } catch (error) {
        console.error('[PloggingContext] 플로깅 시작 오류:', error);
        Alert.alert('오류', '플로깅 시작 중 오류가 발생했습니다.');
        return false;
      }
    },

    // 플로깅 일시정지
    pausePlogging: () => {
      console.log('[PloggingContext] 플로깅 일시정지');
      ploggingHook.pausePlogging();
      locationHook.stopLocationTracking();
    },

    // 플로깅 재시작
    resumePlogging: () => {
      console.log('[PloggingContext] 플로깅 재시작');
      ploggingHook.resumePlogging();
      locationHook.startLocationTracking(true);
    },

    // 플로깅 종료
    endPlogging: () => {
      console.log('[PloggingContext] 플로깅 종료');
      
      const result = {
        id: Date.now(),
        title: "방금 완료한 플로깅",
        date: new Date().toLocaleDateString('ko-KR'),
        location: "마로니에 공원",
        duration: ploggingHook.formatTime(ploggingHook.time),
        distance: locationHook.formatDistance(locationHook.totalDistance),
        trashCount: ploggingHook.trashCount,
        routeCoordinates: locationHook.routeCoordinates,
      };

      // 상태 초기화
      locationHook.stopLocationTracking();
      ploggingHook.endPlogging();
      locationHook.setRouteCoordinates([]);
      locationHook.setTotalDistance(0);
      setTrashLocations([]);

      return result;
    },

    // 쓰레기 추가
    addTrash: () => {
      console.log('[PloggingContext] 쓰레기 개수 증가');
      ploggingHook.pickTrash();
    },

    // 쓰레기 위치 설정
    setTrashLocations,

    // 쓰레기 제거
    removeTrash: (trashId) => {
      console.log('[PloggingContext] 쓰레기 제거:', trashId);
      setTrashLocations(prev => prev.filter(t => t.id !== trashId));
    }
  };

  const value = {
    // 플로깅 상태
    status: ploggingHook.status,
    time: ploggingHook.time,
    trashCount: ploggingHook.trashCount,
    formatTime: ploggingHook.formatTime,

    // 위치 상태
    currentLocation: locationHook.currentLocation,
    routeCoordinates: locationHook.routeCoordinates,
    totalDistance: locationHook.totalDistance,
    formatDistance: locationHook.formatDistance,
    mapRef: locationHook.mapRef,

    // 추가 상태
    trashLocations,
    isBackgroundMode,

    // 액션들
    ...actions,
  };

  return (
    <PloggingContext.Provider value={value}>
      {children}
    </PloggingContext.Provider>
  );
};

export const usePloggingContext = () => {
  const context = useContext(PloggingContext);
  if (!context) {
    throw new Error('usePloggingContext must be used within a PloggingProvider');
  }
  return context;
};
