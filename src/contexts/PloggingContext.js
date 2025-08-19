// PloggingContext.js

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { usePlogging } from '../hooks/usePlogging';

const PloggingContext = createContext();

export const PloggingProvider = ({ children }) => {
  const ploggingHook = usePlogging();
  const locationHook = useLocation();
  
  const [trashLocations, setTrashLocations] = useState([]);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  
  // [로직 추가] 수집한 쓰레기 목록을 저장할 상태
  const [collectedTrash, setCollectedTrash] = useState([]);
  
  // 🔥 [새로 추가] 현재 플로깅 중인 산책로 정보
  const [currentTrailInfo, setCurrentTrailInfo] = useState(null);
  
  const contextRef = useRef({ isActive: true });
  
  useEffect(() => {
    contextRef.current.isActive = true;
    return () => {
      contextRef.current.isActive = false;
      if (ploggingHook.status === "running" || ploggingHook.status === "paused") {
        locationHook.stopLocationTracking();
      }
    };
  }, []);
  
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (!contextRef.current.isActive) return;
      if (ploggingHook.status === "running" || ploggingHook.status === "paused") {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          setIsBackgroundMode(true);
        } else if (nextAppState === 'active') {
          setIsBackgroundMode(false);
          if (ploggingHook.status === "running" && contextRef.current.isActive) {
            locationHook.startLocationTracking(true);
          }
        }
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [ploggingHook.status]);

  const actions = {
    // 🔥 [수정] 플로깅 시작 시 산책로 정보도 함께 저장
    startPlogging: async (trailInfo = null) => {
      if (!contextRef.current.isActive) return false;
      try {
        const location = await locationHook.getCurrentLocation();
        if (location && contextRef.current.isActive) {
          // 🔥 산책로 정보 저장
          if (trailInfo) {
            setCurrentTrailInfo(trailInfo);
            console.log('🎯 [PloggingContext] 산책로 정보 설정:', trailInfo);
          }
          
          ploggingHook.startPlogging();
          locationHook.startLocationTracking(true);
          return true;
        } else {
          Alert.alert('위치 오류', 'GPS 위치를 가져올 수 없습니다.');
          return false;
        }
      } catch (error) {
        Alert.alert('오류', '플로깅 시작 중 오류가 발생했습니다.');
        return false;
      }
    },
    pausePlogging: () => {
      if (!contextRef.current.isActive) return;
      ploggingHook.pausePlogging();
      locationHook.stopLocationTracking();
    },
    resumePlogging: () => {
      if (!contextRef.current.isActive) return;
      ploggingHook.resumePlogging();
      locationHook.startLocationTracking(true);
    },
    // 🔥 [수정] 플로깅 종료 시 산책로 정보도 초기화
    endPlogging: () => {
      const result = {
        // ... (기존 데이터)
        // [로직 수정] 수집한 쓰레기 목록을 최종 결과에 포함
        collectedTrash: [...collectedTrash],
        // 🔥 현재 산책로 정보도 결과에 포함
        trailInfo: currentTrailInfo,
      };
      
      locationHook.stopLocationTracking();
      ploggingHook.endPlogging();
      locationHook.setRouteCoordinates([]);
      locationHook.setTotalDistance(0);
      setTrashLocations([]);
      // [로직 추가] 플로깅 종료 시 수집한 쓰레기 목록 초기화
      setCollectedTrash([]);
      // 🔥 산책로 정보도 초기화
      setCurrentTrailInfo(null);

      return result;
    },
    addTrash: () => {
        if (!contextRef.current.isActive) return;
        ploggingHook.pickTrash(); // 단순 카운트 증가
    },
    // [로직 추가] 수집한 쓰레기 객체를 목록에 추가하는 함수
    addCollectedTrashItem: (trash) => {
        if (!contextRef.current.isActive) return;
        setCollectedTrash(prev => [...prev, trash]);
    },
    setTrashLocations: (locations) => {
      if (!contextRef.current.isActive) return;
      setTrashLocations(locations);
    },
    removeTrash: (trashId) => {
      if (!contextRef.current.isActive) return;
      setTrashLocations(prev => prev.filter(t => t.id !== trashId));
    },
    // 🔥 [새로 추가] 산책로 정보 설정 함수
    setCurrentTrailInfo: (trailInfo) => {
      if (!contextRef.current.isActive) return;
      setCurrentTrailInfo(trailInfo);
    }
  };

  const value = {
    status: ploggingHook.status,
    time: ploggingHook.time,
    trashCount: ploggingHook.trashCount,
    formatTime: ploggingHook.formatTime,
    currentLocation: locationHook.currentLocation,
    routeCoordinates: locationHook.routeCoordinates || [],
    totalDistance: locationHook.totalDistance || 0,
    formatDistance: locationHook.formatDistance,
    mapRef: locationHook.mapRef,
    trashLocations: trashLocations || [],
    isBackgroundMode,
    isContextActive: contextRef.current.isActive,

    // [로직 추가] 수집된 쓰레기 목록 상태를 외부로 노출
    collectedTrash,
    
    // 🔥 [새로 추가] 현재 산책로 정보 노출
    currentTrailInfo,

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