// PloggingStartScreen.js - 완전히 리팩토링된 깔끔한 버전

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, 
  BackHandler, Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ViewShot from 'react-native-view-shot';

// 컴포넌트 imports
import CommonModal from "../components/CommonModal";
import PloggingMap from "../components/Plogging/PloggingMap";
import PloggingHeader from "../components/Plogging/PloggingHeader";
import PloggingEndModal from "../components/Plogging/PloggingEndModal";
import CollapsiblePloggingControls from "../components/Plogging/CollapsiblePloggingControls";
import EnhancedTrashInfoModal from "../components/Plogging/EnhancedTrashInfoModal";
import TrailInfoModal from "../components/Plogging/TrailInfoModal";
import { 
  DistanceInfo, 
  TrashLoadingInfo, 
  MainOverlayContainer,
  PloggingStatusRenderer 
} from "../components/Plogging/UIOverlayComponents";

// 서비스 imports
import { trailSearchService } from "../services/TrailSearchService";
import { ploggingSessionManager } from "../services/PloggingSessionManager";
import { mapCaptureService } from "../services/MapCaptureService";

// 훅과 컨텍스트 imports
import { usePloggingContext } from "../contexts/PloggingContext";
import { useAuth } from "../stores/useAuth";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const MAX_DISTANCE_TO_START = 50000;

function PloggingStartScreen({ navigation, route }) {
  console.log("🚀 [PloggingStart] 컴포넌트 시작");
  
  // 🔐 인증 정보
  const { accessToken } = useAuth();
  
  // 🎯 플로깅 컨텍스트
  const {
    status, time, trashCount, formatTime, currentLocation, routeCoordinates,
    totalDistance, mapRef, trashLocations, isLoadingTrashData,
    startPlogging, pausePlogging, resumePlogging, endPlogging, addTrash,
    collectedTrash, addCollectedTrashItem, pickTrashItem, // 🔥 실제 쓰레기 줍기 함수 사용
    getTrashDetails // 🔥 쓰레기 상세 정보 조회 함수 추가
  } = usePloggingContext();

  // 📱 로컬 상태 관리 - pickedTrashIds 제거 (컨텍스트에서 관리)
  const [state, setState] = useState({
    // 모달 상태
    modalVisible: false,
    trashInfoModalVisible: false,
    trailInfoModalVisible: false,
    distanceModalVisible: false,
    
    // 데이터 상태
    isLoading: false,
    mapReady: false,
    
    // 선택된 항목들
    selectedTrashId: null,
    selectedTrailForModal: null,
    
    // 플로깅 컨트롤 상태
    isControlsCollapsed: false,
    forceCollapseControls: false,
    
    // 산책로 관련 상태
    nearestTrail: null,
    selectedRoute: null,
    courseInfo: null,
    trailStartCoords: null,
    initialTrailPath: null,
    distanceToTrail: null,
    canStartPlogging: false,
    
    // 진입 모드
    entryMode: 'main'
  });

  // 🔧 참조 관리
  const viewShotRef = useRef(null);
  const initializeOnce = useRef(false);

  // 📊 상태 업데이트 헬퍼
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 🎬 초기화 및 생명주기 관리
  useEffect(() => {
    if (initializeOnce.current) return;
    initializeOnce.current = true;

    console.log("🎬 [PloggingStart] 초기화 시작");
    initializeScreen();
    setupServices();

    // 뒤로 가기 처리
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate("Main");
      return true;
    });

    return () => {
      backHandler.remove();
      cleanupServices();
    };
  }, []);

  // 🌍 위치 변경 감지
  useEffect(() => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      handleLocationChange();
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, state.entryMode]);

  // 🗃️ 서비스 설정
  const setupServices = () => {
    console.log("🔧 [PloggingStart] 서비스 설정");
    
    // 산책로 검색 서비스 리스너
    trailSearchService.addListener(handleTrailSearchEvent);
    
    // 플로깅 세션 매니저 리스너
    ploggingSessionManager.addListener(handleSessionEvent);
  };

  // 🧹 서비스 정리
  const cleanupServices = () => {
    console.log("🧹 [PloggingStart] 서비스 정리");
    trailSearchService.removeListener(handleTrailSearchEvent);
    ploggingSessionManager.removeListener(handleSessionEvent);
  };

  // 🔍 산책로 검색 이벤트 처리
  const handleTrailSearchEvent = useCallback((type, data) => {
    console.log(`🔔 [TrailSearch] ${type}:`, data);
    
    switch (type) {
      case 'search_started':
        updateState({ isLoading: true });
        break;
        
      case 'search_completed':
        const trail = data.trail;
        if (trail) {
          const distance = trail.distanceToUser;
          updateState({
            nearestTrail: trail,
            distanceToTrail: distance,
            canStartPlogging: distance <= MAX_DISTANCE_TO_START,
            isLoading: false
          });
        } else {
          updateState({ nearestTrail: null, isLoading: false });
        }
        break;
        
      case 'search_error':
        updateState({ isLoading: false });
        console.error("❌ [TrailSearch] 검색 오류:", data.error);
        break;
    }
  }, [updateState]);

  // 📊 세션 이벤트 처리
  const handleSessionEvent = useCallback((type, data) => {
    console.log(`🔔 [Session] ${type}:`, data);
    
    switch (type) {
      case 'save_error':
        Alert.alert(
          "알림", 
          "서버 저장에 실패했지만 로컬 기록은 저장됩니다.",
          [{ text: "확인" }]
        );
        break;
    }
  }, []);

  // 🎬 화면 초기화
  const initializeScreen = async () => {
    try {
      const routeParams = route?.params || {};
      
      if (routeParams.selectedRoute) {
        console.log("🎯 [PloggingStart] CourseDetail에서 진입");
        updateState({ entryMode: 'courseDetail' });
        handleCourseDetailEntry(routeParams);
      } else {
        console.log("🏠 [PloggingStart] 메인에서 진입");
        updateState({ entryMode: 'main' });
      }

      // 지도 준비
      setTimeout(() => {
        updateState({ mapReady: true });
      }, 100);
      
    } catch (error) {
      console.error("❌ [PloggingStart] 초기화 오류:", error);
      updateState({ mapReady: true });
    }
  };

  // 🎯 CourseDetail 진입 처리
  const handleCourseDetailEntry = (routeParams) => {
    const { selectedRoute, trailStartCoords, trailFullPath } = routeParams;
    
    const updates = {};
    
    if (selectedRoute) {
      updates.selectedRoute = selectedRoute;
      updates.courseInfo = {
        name: selectedRoute.name,
        difficulty: selectedRoute.difficulty,
        distance: selectedRoute.distance,
        duration: selectedRoute.duration
      };
    }
    
    if (trailStartCoords) {
      updates.trailStartCoords = trailStartCoords;
    }
    
    if (trailFullPath) {
      updates.initialTrailPath = trailFullPath;
    }
    
    updateState(updates);
  };

  // 🌍 위치 변경 처리
  const handleLocationChange = async () => {
    if (state.entryMode === 'courseDetail' && state.trailStartCoords) {
      handleDistanceCheck();
    } else if (state.entryMode === 'main') {
      await handleNearestTrailSearch();
    }
  };

  // 📏 거리 체크 (CourseDetail 모드)
  const handleDistanceCheck = () => {
    if (!currentLocation || !state.trailStartCoords) return;
    
    const result = trailSearchService.canStartPlogging(
      currentLocation, 
      state.trailStartCoords, 
      MAX_DISTANCE_TO_START
    );
    
    updateState({
      distanceToTrail: result.distance,
      canStartPlogging: result.canStart
    });
  };

  // 🔍 가장 가까운 산책로 검색
  const handleNearestTrailSearch = async () => {
    if (state.isLoading || state.nearestTrail) return;
    
    await trailSearchService.searchNearestTrail(currentLocation);
  };

  // 🗺️ 산책로 마커 클릭 처리
  const handleTrailMarkerPress = useCallback(async () => {
    if (!state.nearestTrail) return;
    
    try {
      const trailDetail = await trailSearchService.getTrailDetails(state.nearestTrail.id);
      const detailWithDistance = {
        ...trailDetail,
        distanceToUser: state.nearestTrail.distanceToUser
      };
      
      updateState({
        selectedTrailForModal: detailWithDistance,
        trailInfoModalVisible: true
      });
      
    } catch (error) {
      console.error("❌ [PloggingStart] 산책로 정보 가져오기 실패:", error);
      
      updateState({
        selectedTrailForModal: {
          ...state.nearestTrail.originalData,
          distanceToUser: state.nearestTrail.distanceToUser
        },
        trailInfoModalVisible: true
      });
    }
  }, [state.nearestTrail]);

  // ✅ 산책로 선택 확인
  const handleTrailSelection = useCallback((trail) => {
    console.log("✅ [PloggingStart] 산책로 선택 확인:", trail.trailName);
    
    const updates = {
      selectedRoute: {
        id: trail.trailId,
        name: trail.trailName,
        location: trail.lotNumberAddress,
        difficulty: trail.difficultyLevel,
        distance: trail.length,
        duration: trail.trackTime
      },
      trailInfoModalVisible: false
    };
    
    if (state.nearestTrail) {
      updates.trailStartCoords = state.nearestTrail.coordinate;
      updates.courseInfo = {
        name: trail.trailName,
        difficulty: trail.difficultyLevel,
        distance: trail.length,
        duration: trail.trackTime,
        reportCount: trail.reportCount
      };
    }
    
    updateState(updates);
  }, [state.nearestTrail]);

  // 🚀 플로깅 시작 처리
  const handleStart = useCallback(async () => {
    try {
      console.log("🚀 [PloggingStart] 플로깅 시작 요청");

      // 거리 체크
      if (state.entryMode === 'courseDetail' && !state.canStartPlogging && state.trailStartCoords) {
        updateState({ distanceModalVisible: true });
        return;
      }

      // 산책로 없을 때 확인
      if (state.entryMode === 'main' && !state.selectedRoute && !state.nearestTrail) {
        Alert.alert("알림", "산책로 정보가 없지만 플로깅을 시작할 수 있습니다.", [
          { text: "취소", style: "cancel" },
          { text: "시작", onPress: () => proceedWithStart() }
        ]);
        return;
      }

      await proceedWithStart();

    } catch (error) {
      console.error("❌ [PloggingStart] 플로깅 시작 실패:", error);
    }
  }, [state.entryMode, state.canStartPlogging, state.trailStartCoords, state.selectedRoute, state.nearestTrail]);

  // 🏃 실제 플로깅 시작
  const proceedWithStart = async () => {
    // 세션 시작
    ploggingSessionManager.startSession({
      currentLocation,
      selectedTrailId: state.selectedRoute?.id || state.nearestTrail?.id || null,
      memberId: 1
    });

    // 플로깅 컨텍스트에서 시작
    const trailInfo = state.selectedRoute || (state.nearestTrail ? {
      id: state.nearestTrail.id,
      name: state.nearestTrail.name,
      location: state.nearestTrail.address
    } : null);

    await startPlogging(trailInfo);
    console.log("✅ [PloggingStart] 플로깅 시작 완료");
  };

  // ⏸️ 플로깅 컨트롤 핸들러들
  const handlePause = useCallback(() => pausePlogging(), [pausePlogging]);
  const handleResume = useCallback(() => resumePlogging(), [resumePlogging]);
  const handleEnd = useCallback(() => updateState({ modalVisible: true }), []);

  // 🔙 헤더 뒤로가기 처리 (스마트한 처리)
  const handleHeaderBack = useCallback(() => {
    // PloggingHeader에서 알아서 플로깅 상태를 체크하고 처리
    navigation.navigate("Main");
  }, [navigation]);

  // ▶️ 플로깅 계속하기 처리 (엔드 모달에서)
  const handleContinuePlogging = useCallback(() => {
    console.log("▶️ [PloggingStart] 플로깅 계속하기");
    updateState({ modalVisible: false });
  }, []);

  // 🏁 플로깅 종료 처리
  const confirmEnd = useCallback(async () => {
    try {
      updateState({ modalVisible: false });
      console.log("🏁 [PloggingStart] 플로깅 종료 처리 시작");

      // 지도 캡처
      const capturedImageUri = await mapCaptureService.captureOptimalView({
        viewShotRef,
        mapRef,
        routeCoordinates,
        trashLocations,
        options: {
          adjustWaitTime: 2000,
          captureWaitTime: 500
        }
      });

      // 플로깅 결과 가져오기
      const ploggingResult = endPlogging();

      // 결과 데이터 준비
      const resultData = ploggingSessionManager.prepareResultData({
        time,
        totalDistance,
        trashCount,
        collectedTrash,
        routeCoordinates,
        trashLocations,
        selectedRoute: state.selectedRoute,
        courseInfo: state.courseInfo,
        capturedImageUri
      });

      // 서버 저장 시도
      try {
        await ploggingSessionManager.saveToServer(resultData, accessToken);
      } catch (saveError) {
        // 에러는 sessionManager에서 리스너를 통해 처리됨
        console.warn("⚠️ [PloggingStart] 서버 저장 실패했지만 계속 진행");
      }

      // 세션 종료
      ploggingSessionManager.endSession();

      // 결과 화면으로 이동
      navigation.navigate("PloggingRecord", { result: resultData });

    } catch (error) {
      console.error("❌ [PloggingStart] 플로깅 종료 처리 오류:", error);
      
      // 기본 결과로 이동
      const basicResult = {
        routeName: "플로깅 기록",
        totalTime: Math.max(0, time || 0),
        totalDistance: Math.max(0, totalDistance || 0),
        trashCount: Math.max(0, trashCount || 0),
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };
      
      navigation.navigate("PloggingRecord", { result: basicResult });
    }
  }, [
    viewShotRef, mapRef, routeCoordinates, trashLocations, endPlogging,
    time, totalDistance, trashCount, collectedTrash, state.selectedRoute, 
    state.courseInfo, accessToken, navigation
  ]);

  // 🗑️ 쓰레기 관련 핸들러들 - 🔥 마커 제거 로직 추가
  const handleTrashMarkerPress = useCallback((trash) => {
    console.log("🗑️ [PloggingStartScreen] === 쓰레기 마커 클릭 ===");
    console.log("🗑️ [PloggingStartScreen] 클릭된 쓰레기 데이터:", trash);
    console.log("🗑️ [PloggingStartScreen] 쓰레기 ID:", trash?.id);
    console.log("🗑️ [PloggingStartScreen] 쓰레기 객체 키들:", trash ? Object.keys(trash) : 'null');
    console.log("🗑️ [PloggingStartScreen] 현재 모달 상태:", {
      trashInfoModalVisible: state.trashInfoModalVisible,
      selectedTrashId: state.selectedTrashId
    });
    
    if (!trash) {
      console.warn("⚠️ [PloggingStartScreen] 쓰레기 데이터가 없습니다");
      return;
    }
    
    if (!trash.id) {
      console.warn("⚠️ [PloggingStartScreen] 쓰레기 ID가 없습니다");
      console.log("🗑️ [PloggingStartScreen] 전체 쓰레기 데이터:", JSON.stringify(trash, null, 2));
      
      // ID가 없어도 다른 고유 식별자가 있는지 확인
      const fallbackId = trash.reportId || trash.trashId || trash.key || `temp_${Date.now()}`;
      console.log("🗑️ [PloggingStartScreen] 대체 ID 사용:", fallbackId);
      
      updateState({
        selectedTrashId: fallbackId,
        trashInfoModalVisible: true
      });
      return;
    }
    
    console.log("✅ [PloggingStartScreen] 모달 상태 업데이트 시작");
    updateState({
      selectedTrashId: trash.id,
      trashInfoModalVisible: true
    });
    console.log("✅ [PloggingStartScreen] 모달 상태 업데이트 완료");
  }, [state.trashInfoModalVisible, state.selectedTrashId, updateState]);

  const handlePickTrashSuccess = useCallback(async (trashData) => {
    console.log("✅ [PloggingStartScreen] === 쓰레기 줍기 성공 ===");
    console.log("✅ [PloggingStartScreen] 수거된 쓰레기:", trashData);
    
    try {
      // 🔥 컨텍스트의 pickTrashItem 함수로 실제 서버 처리 + 마커 제거
      const success = await pickTrashItem(trashData.id);
      
      if (success) {
        console.log("✅ [PloggingStartScreen] 컨텍스트에서 쓰레기 처리 완료");
        
        // 레거시 호환성을 위한 추가 처리
        addCollectedTrashItem(trashData);
        
        console.log("✅ [PloggingStartScreen] 쓰레기 수거 처리 완료");
      } else {
        console.warn("⚠️ [PloggingStartScreen] 컨텍스트에서 쓰레기 처리 실패");
      }
    } catch (error) {
      console.error("❌ [PloggingStartScreen] 쓰레기 처리 중 오류:", error);
    }
  }, [pickTrashItem, addCollectedTrashItem]);

  const handleTrashModalStateChange = useCallback((isModalVisible) => {
    console.log(`🗑️ [PloggingStartScreen] 쓰레기 모달 상태 변경: ${isModalVisible ? '열림' : '닫힘'}`);
    // 🔥 모달이 열릴 때만 컨트롤을 접고, 닫힐 때는 자동으로 펼치지 않음
    if (isModalVisible) {
      updateState({ forceCollapseControls: true });
    } else {
      // 🔥 모달이 닫힐 때는 강제 접힘 해제만 하고, 사용자가 직접 펼치도록 함
      updateState({ forceCollapseControls: false });
    }
  }, [updateState]);

  const handleControlsCollapseChange = useCallback((collapsed) => {
    console.log(`🎮 [PloggingStartScreen] 컨트롤 접힘 상태: ${collapsed ? '접힘' : '펼침'}`);
    updateState({ isControlsCollapsed: collapsed });
  }, [updateState]);

  const handleShowTrashList = useCallback(() => {
    console.log("📋 [PloggingStartScreen] 수집한 쓰레기 목록 표시");
    const collectedItems = collectedTrash.map(item =>
      `- ${item.title || '쓰레기'}: ${item.amount || '보통'}`
    ).join('\n');

    Alert.alert(
      "수집한 쓰레기 목록",
      collectedTrash.length > 0 ? collectedItems : "아직 수집한 쓰레기가 없습니다."
    );
  }, [collectedTrash]);

  // 🔄 재검색 처리
  const handleRetrySearch = useCallback(() => {
    console.log("🔄 [PloggingStartScreen] 재검색 요청");
    updateState({ nearestTrail: null });
    trailSearchService.reset();
    handleNearestTrailSearch();
  }, []);

  // 🗺️ 지도에 표시할 산책로 데이터
  const mapTrails = state.nearestTrail ? [state.nearestTrail] : [];
  
  // 🔥 trashLocations는 이미 컨텍스트에서 activeTrashList로 필터링됨
  console.log("🗺️ [PloggingStartScreen] 쓰레기 마커 개수:", trashLocations?.length || 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* 📍 헤더 - PloggingHeader 사용 */}
      <PloggingHeader 
        status={status}
        onBack={handleHeaderBack}
      />

      {/* 📏 거리 정보 표시 */}
      {state.trailStartCoords && state.distanceToTrail !== null && (
        <DistanceInfo
          distance={state.distanceToTrail}
          maxDistance={MAX_DISTANCE_TO_START}
          isWarning={!state.canStartPlogging}
        />
      )}

      {/* 🗑️ 쓰레기 데이터 로딩 표시 */}
      {isLoadingTrashData && <TrashLoadingInfo />}

      {/* 🗺️ 지도 컨테이너 */}
      <ViewShot 
        ref={viewShotRef}
        style={styles.mapContainer}
        options={{ 
          format: 'png', 
          quality: 0.9,
          result: 'tmpfile'
        }}
      >        
        <PloggingMap
          mapRef={mapRef}
          currentLocation={currentLocation}
          routeCoordinates={routeCoordinates || []}
          trashLocations={trashLocations || []} // 🔥 컨텍스트에서 이미 필터링된 데이터 사용
          isLoading={state.isLoading}
          mapReady={state.mapReady}
          onTrashMarkerPress={handleTrashMarkerPress}
          nearbyCourses={mapTrails}
          onCourseMarkerPress={handleTrailMarkerPress}
          selectedCourseId={state.nearestTrail?.id}
          initialTrailPath={state.initialTrailPath || []}
        />

        {/* 🎮 상태별 오버레이 UI */}
        <MainOverlayContainer status={status}>
          <PloggingStatusRenderer
            entryMode={state.entryMode}
            isLoading={state.isLoading}
            nearestTrail={state.nearestTrail}
            selectedRoute={state.selectedRoute}
            courseInfo={state.courseInfo}
            canStartPlogging={state.canStartPlogging}
            trailStartCoords={state.trailStartCoords}
            onTrailPress={handleTrailMarkerPress}
            onRetrySearch={handleRetrySearch}
            onStart={handleStart}
            MAX_DISTANCE_TO_START={MAX_DISTANCE_TO_START}
          />
        </MainOverlayContainer>

        {/* 🏃 플로깅 컨트롤 */}
        {status !== "idle" && (
          <View style={styles.runningControls}>
            <CollapsiblePloggingControls
              status={status}
              time={time}
              trashCount={trashCount}
              formatTime={formatTime}
              onPause={handlePause}
              onResume={handleResume}
              onEnd={handleEnd}
              onShowTrashList={handleShowTrashList}
              isCollapsed={state.isControlsCollapsed}
              onCollapseChange={handleControlsCollapseChange}
              forceCollapse={state.forceCollapseControls}
            />
          </View>
        )}
      </ViewShot>
      
      {/* 📱 모달들 */}
      {/* 🔥 PloggingEndModal 사용 - 더 플로깅에 특화된 디자인 */}
      <PloggingEndModal
        visible={state.modalVisible}
        trashCount={trashCount}
        onContinue={handleContinuePlogging}
        onEnd={confirmEnd}
      />

      <CommonModal
        visible={state.distanceModalVisible}
        title="산책로와의 거리가 너무 멉니다"
        message={`현재 산책로에서 ${state.distanceToTrail?.toFixed(0)}m 떨어져 있습니다.\n${MAX_DISTANCE_TO_START}m 이내로 가까이 이동해주세요.`}
        onConfirm={() => updateState({ distanceModalVisible: false })}
        confirmText="확인"
        showCancel={false}
      />

      <TrailInfoModal
        visible={state.trailInfoModalVisible}
        trail={state.selectedTrailForModal}
        onClose={() => updateState({ trailInfoModalVisible: false })}
        onConfirm={handleTrailSelection}
      />

      {/* 🔥 쓰레기 정보 모달 - 디버깅 로그 추가 */}
      {console.log("🗑️ [PloggingStartScreen] 쓰레기 모달 렌더링:", {
        visible: state.trashInfoModalVisible,
        selectedTrashId: state.selectedTrashId,
        hasOnPickSuccess: !!handlePickTrashSuccess,
        hasOnModalStateChange: !!handleTrashModalStateChange
      })}
      
      <EnhancedTrashInfoModal
        visible={state.trashInfoModalVisible}
        trashId={state.selectedTrashId}
        onClose={() => {
          console.log("🗑️ [PloggingStartScreen] 쓰레기 모달 닫기 요청");
          updateState({ trashInfoModalVisible: false, selectedTrashId: null });
        }}
        onPickSuccess={handlePickTrashSuccess}
        onModalStateChange={handleTrashModalStateChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  // 🔥 헤더 스타일 제거 (PloggingHeader 사용)
  mapContainer: { 
    flex: 1, 
    position: 'relative' 
  },
  runningControls: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    zIndex: 50
  },
});

export default React.memo(PloggingStartScreen);