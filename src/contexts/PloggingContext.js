// 2. PloggingContext.js 개선사항

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
  
  // 생명주기 관리
  const contextRef = useRef({ isActive: true });
  
  useEffect(() => {
    contextRef.current.isActive = true;
    
    return () => {
      console.log('[PloggingContext] Context 정리 시작');
      contextRef.current.isActive = false;
      
      // 플로깅이 진행 중이면 안전하게 정리
      if (ploggingHook.status === "running" || ploggingHook.status === "paused") {
        console.log('[PloggingContext] 플로깅 진행 중 - 안전한 정리');
        locationHook.stopLocationTracking();
      }
    };
  }, []);
  
  // AppState 관리 개선
  useEffect(() => {
    console.log('[PloggingContext] AppState 리스너 등록');
    
    const handleAppStateChange = (nextAppState) => {
      // Context가 활성 상태일 때만 처리
      if (!contextRef.current.isActive) return;
      
      console.log('[PloggingContext] AppState 변경:', nextAppState, '플로깅 상태:', ploggingHook.status);
      
      if (ploggingHook.status === "running" || ploggingHook.status === "paused") {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          console.log('[PloggingContext] ✅ 백그라운드 모드 활성화 - 플로깅 세션 유지');
          setIsBackgroundMode(true);
        } else if (nextAppState === 'active') {
          console.log('[PloggingContext] ✅ 포그라운드 복귀');
          setIsBackgroundMode(false);
          
          // GPS 추적 재활성화 (안전하게)
          if (ploggingHook.status === "running" && contextRef.current.isActive) {
            console.log('[PloggingContext] GPS 추적 재활성화');
            try {
              locationHook.startLocationTracking(true);
            } catch (error) {
              console.error('[PloggingContext] GPS 재활성화 오류:', error);
            }
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

  // 안전한 플로깅 액션들
  const actions = {
    // 플로깅 시작 - 안전성 개선
    startPlogging: async () => {
      if (!contextRef.current.isActive) {
        console.log('[PloggingContext] Context 비활성 상태 - 플로깅 시작 취소');
        return false;
      }
      
      console.log('[PloggingContext] 플로깅 시작 시도...');
      
      try {
        const location = await locationHook.getCurrentLocation();
        if (location && contextRef.current.isActive) {
          console.log('[PloggingContext] 위치 획득 성공, 플로깅 시작');
          ploggingHook.startPlogging();
          
          // 위치 추적 시작 (에러 핸들링 포함)
          try {
            locationHook.startLocationTracking(true);
          } catch (trackingError) {
            console.error('[PloggingContext] 위치 추적 시작 오류:', trackingError);
            // 위치 추적 실패해도 플로깅은 시작
          }
          
          return true;
        } else {
          console.log('[PloggingContext] 위치 획득 실패 또는 Context 비활성');
          Alert.alert('위치 오류', 'GPS 위치를 가져올 수 없습니다.');
          return false;
        }
      } catch (error) {
        console.error('[PloggingContext] 플로깅 시작 오류:', error);
        Alert.alert('오류', '플로깅 시작 중 오류가 발생했습니다.');
        return false;
      }
    },

    // 플로깅 일시정지 - 안전성 개선
    pausePlogging: () => {
      if (!contextRef.current.isActive) return;
      
      console.log('[PloggingContext] 플로깅 일시정지');
      ploggingHook.pausePlogging();
      
      try {
        locationHook.stopLocationTracking();
      } catch (error) {
        console.error('[PloggingContext] 위치 추적 중지 오류:', error);
      }
    },

    // 플로깅 재시작 - 안전성 개선
    resumePlogging: () => {
      if (!contextRef.current.isActive) return;
      
      console.log('[PloggingContext] 플로깅 재시작');
      ploggingHook.resumePlogging();
      
      try {
        locationHook.startLocationTracking(true);
      } catch (error) {
        console.error('[PloggingContext] 위치 추적 재시작 오류:', error);
      }
    },

    // 플로깅 종료 - 안전성 개선
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
        routeCoordinates: [...locationHook.routeCoordinates], // 복사본 생성
        totalTime: ploggingHook.time,
        totalDistance: locationHook.totalDistance,
        collectedTrash: [...trashLocations], // 수집한 쓰레기 목록 포함
      };

      // 상태 안전하게 초기화
      try {
        locationHook.stopLocationTracking();
      } catch (error) {
        console.error('[PloggingContext] 위치 추적 중지 오류:', error);
      }
      
      ploggingHook.endPlogging();
      locationHook.setRouteCoordinates([]);
      locationHook.setTotalDistance(0);
      setTrashLocations([]);

      return result;
    },

    // 쓰레기 추가 - 안전성 개선
    addTrash: (location = null) => {
      if (!contextRef.current.isActive) return;
      
      console.log('[PloggingContext] 쓰레기 개수 증가');
      ploggingHook.pickTrash();
      
      // 현재 위치에 쓰레기 정보 추가
      if (location || locationHook.currentLocation) {
        const trashItem = {
          id: Date.now(),
          type: "일반 쓰레기",
          location: location || locationHook.currentLocation,
          timestamp: new Date().toISOString(),
          coordinates: location || locationHook.currentLocation,
        };
        
        setTrashLocations(prev => [...prev, trashItem]);
      }
    },

    // 쓰레기 위치 설정 - 안전성 개선
    setTrashLocations: (locations) => {
      if (!contextRef.current.isActive) return;
      setTrashLocations(locations);
    },

    // 쓰레기 제거 - 안전성 개선
    removeTrash: (trashId) => {
      if (!contextRef.current.isActive) return;
      
      console.log('[PloggingContext] 쓰레기 제거:', trashId);
      setTrashLocations(prev => prev.filter(t => t.id !== trashId));
    }
  };

  // Context value 안전하게 구성
  const value = {
    // 플로깅 상태
    status: ploggingHook.status,
    time: ploggingHook.time,
    trashCount: ploggingHook.trashCount,
    formatTime: ploggingHook.formatTime,

    // 위치 상태 (안전하게 접근)
    currentLocation: locationHook.currentLocation,
    routeCoordinates: locationHook.routeCoordinates || [],
    totalDistance: locationHook.totalDistance || 0,
    formatDistance: locationHook.formatDistance,
    mapRef: locationHook.mapRef,

    // 추가 상태
    trashLocations: trashLocations || [],
    isBackgroundMode,

    // Context 상태
    isContextActive: contextRef.current.isActive,

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
  
  // Context가 비활성 상태면 경고
  if (!context.isContextActive) {
    console.warn('[PloggingContext] Context가 비활성 상태입니다');
  }
  
  return context;
};