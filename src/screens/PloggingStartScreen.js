// PloggingStartScreen.js

"use client"
import React, { useState, useEffect, useRef } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Alert, SafeAreaView, BackHandler,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import { usePloggingContext } from "../contexts/PloggingContext"
import PloggingMap from "../components/Plogging/PloggingMap"
import PloggingControls from "../components/Plogging/PloggingControls"
import TrashInfoModal from "../components/Plogging/TrashInfoModal"
import { getNearbyTrails } from "../API/trails"
import BASE_URL from '../API/apiconfig'

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 거리 계산 함수
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // 미터 단위
};

// 🔧 설정: 플로깅 시작 가능한 최대 거리 (미터)
const MAX_DISTANCE_TO_START = 500;

export default function PloggingStartScreen({ navigation, route }) {
  console.log("🚀 [PloggingStart] 컴포넌트 시작");

  // Context에서 필요한 값들 가져오기
  const {
    status, time, trashCount, formatTime, currentLocation, routeCoordinates,
    totalDistance, formatDistance, mapRef, trashLocations, startPlogging,
    pausePlogging, resumePlogging, endPlogging, addTrash, setTrashLocations,
    removeTrash, collectedTrash, addCollectedTrashItem
  } = usePloggingContext();

  // 로컬 상태들
  const [modalVisible, setModalVisible] = useState(false)
  const [trashInfoModalVisible, setTrashInfoModalVisible] = useState(false)
  const [selectedTrash, setSelectedTrash] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  
  // 산책로 관련 상태들
  const [nearbyCourses, setNearbyCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [canStartPlogging, setCanStartPlogging] = useState(false)
  const [distanceToTrail, setDistanceToTrail] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [trailStartCoords, setTrailStartCoords] = useState(null)
  const [initialTrailPath, setInitialTrailPath] = useState(null)
  const [distanceModalVisible, setDistanceModalVisible] = useState(false)
  const [courseInfo, setCourseInfo] = useState(null)

  console.log("📊 [PloggingStart] 현재 상태:", {
    status,
    currentLocation: !!currentLocation,
    nearbyCourses: nearbyCourses.length,
    canStartPlogging,
    mapReady
  });

  // 뒤로 가기 처리
  useEffect(() => {
    const backAction = () => {
      console.log("🔙 [PloggingStart] 뒤로 가기 처리");
      navigation.navigate("Main");
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [status, navigation]);

  // 초기화
  useEffect(() => {
    console.log("🎬 [PloggingStart] 초기화 useEffect 시작");
    initializeScreen();
  }, []);

  // 위치 변경 감지 (중복 실행 방지)
  useEffect(() => {
    console.log("📍 [PloggingStart] 위치 변경 useEffect 실행");
    
    // 이미 처리된 위치인지 확인하는 ref 추가가 필요하지만, 
    // 일단 간단하게 currentLocation이 유효할 때만 실행
    if (currentLocation?.latitude && currentLocation?.longitude) {
      console.log("📍 [PloggingStart] 유효한 위치 정보로 처리 시작");
      handleLocationChange();
    } else {
      console.log("📍 [PloggingStart] 위치 정보 없음 - 처리 건너뜀");
    }
  }, [currentLocation]);

  // 초기화 함수
  const initializeScreen = async () => {
    try {
      console.log("🚀 [PloggingStart] 화면 초기화 시작");
      
      // route params 확인
      const routeParams = route?.params || {};
      console.log("📋 [PloggingStart] Route params:", routeParams);
      
      // CourseDetailScreen에서 넘어온 경우
      if (routeParams.selectedRoute) {
        console.log("🎯 [PloggingStart] CourseDetail에서 진입");
        handleCourseDetailEntry(routeParams);
      } else {
        console.log("🏠 [PloggingStart] 메인에서 진입");
      }

      // 기본 데이터 초기화
      initializeData();
      
      // 지도 준비
      setTimeout(() => {
        console.log("🗺️ [PloggingStart] 지도 준비 완료");
        setMapReady(true);
      }, 100);
      
    } catch (error) {
      console.error("❌ [PloggingStart] 초기화 오류:", error);
      setMapReady(true); // 오류 시에도 지도는 준비된 것으로 처리
    }
  };

  // CourseDetail에서 진입한 경우 처리
  const handleCourseDetailEntry = (routeParams) => {
    const { selectedRoute, trailStartCoords, trailFullPath } = routeParams;
    
    if (selectedRoute) {
      setSelectedRoute(selectedRoute);
      setCourseInfo({
        name: selectedRoute.name,
        difficulty: selectedRoute.difficulty,
        distance: selectedRoute.distance,
        duration: selectedRoute.duration
      });
      setSelectedCourseId(selectedRoute.id);
    }
    
    if (trailStartCoords) {
      setTrailStartCoords(trailStartCoords);
    }
    
    if (trailFullPath) {
      setInitialTrailPath(trailFullPath);
    }
  };

  // 기본 데이터 초기화
  const initializeData = () => {
    try {
      console.log("📦 [PloggingStart] 데이터 초기화");
      
      if (!Array.isArray(trashLocations)) {
        console.log("⚠️ [PloggingStart] trashLocations 배열 초기화");
        setTrashLocations([]);
      }
      
    } catch (error) {
      console.error("❌ [PloggingStart] 데이터 초기화 오류:", error);
      setTrashLocations([]);
    }
  };

  // 위치 변경 처리
  const handleLocationChange = () => {
    if (!currentLocation) {
      console.log("📍 [PloggingStart] 위치 정보 없음");
      return;
    }

    console.log("📍 [PloggingStart] 위치 정보 확인됨:", {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      hasTrailCoords: !!trailStartCoords
    });

    if (trailStartCoords) {
      // CourseDetail에서 온 경우 - 거리 체크
      console.log("🎯 [PloggingStart] CourseDetail 모드 - 거리 체크");
      handleDistanceCheck();
    } else {
      // 메인에서 온 경우 - 근처 산책로 검색 (단, 중복 방지)
      console.log("🏠 [PloggingStart] 메인 모드 - 근처 산책로 검색");
      handleNearbySearch();
    }
  };

  // 거리 체크 (CourseDetail에서 온 경우)
  const handleDistanceCheck = () => {
    try {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        trailStartCoords.latitude,
        trailStartCoords.longitude
      );
      
      console.log(`📏 [PloggingStart] 산책로 거리: ${distance.toFixed(0)}m`);
      
      setDistanceToTrail(distance);
      setCanStartPlogging(distance <= MAX_DISTANCE_TO_START);
      
    } catch (error) {
      console.error("❌ [PloggingStart] 거리 계산 오류:", error);
    }
  };

  // 근처 산책로 검색 (메인에서 온 경우)
  const handleNearbySearch = async () => {
    // 이미 로딩 중이거나 데이터가 있으면 건너뛰기
    if (isLoading || nearbyCourses.length > 0) {
      console.log("🔍 [PloggingStart] 이미 로딩 중이거나 데이터 존재, 건너뜀");
      return;
    }

    try {
      console.log("🔍 [PloggingStart] 근처 산책로 검색 시작");
      
      if (!currentLocation?.latitude || !currentLocation?.longitude) {
        console.log("❌ [PloggingStart] 유효하지 않은 위치 정보");
        return;
      }

      setIsLoading(true);
      setCanStartPlogging(true); // 메인에서 온 경우 기본적으로 시작 가능

      console.log("📡 [PloggingStart] API 호출 시도 중...");
      
      const nearbyTrails = await getNearbyTrails(
        currentLocation.latitude,
        currentLocation.longitude
      );

      console.log("✅ [PloggingStart] 근처 산책로 검색 성공:", nearbyTrails?.length);

      if (Array.isArray(nearbyTrails)) {
        const formattedCourses = nearbyTrails.map(trail => ({
          id: trail.trailId,
          name: trail.trailName,
          coordinate: {
            latitude: parseFloat(trail.spotLatitude),
            longitude: parseFloat(trail.spotLongitude)
          },
          distance: trail.length,
          difficulty: trail.difficultyLevel,
          reportCount: trail.reportCount || 0,
          address: trail.lotNumberAddress,
          duration: trail.trackTime || "정보 없음"
        }));

        setNearbyCourses(formattedCourses);
        console.log(`🎯 [PloggingStart] ${formattedCourses.length}개 산책로 로드 완료`);
      }

    } catch (error) {
      console.error("❌ [PloggingStart] 근처 산책로 검색 실패:", error);
      
      // 502 오류의 경우 더 친숙한 메시지 표시
      if (error.message.includes('502')) {
        console.log("🔄 [PloggingStart] 서버 연결 문제 감지 - 사용자에게 알림");
        Alert.alert(
          "서버 연결 오류",
          "서버에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
          [
            { text: "확인", onPress: () => {
              // 기본 더미 데이터라도 제공하거나 다른 처리
              console.log("사용자가 서버 오류 알림 확인");
            }}
          ]
        );
      }
      
      setNearbyCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 플로깅 시작
  const handleStart = async () => {
    try {
      console.log("🚀 [PloggingStart] 플로깅 시작 요청");

      // 거리 체크 (CourseDetail에서 온 경우)
      if (!canStartPlogging && trailStartCoords) {
        console.log("⚠️ [PloggingStart] 거리가 너무 멀음");
        setDistanceModalVisible(true);
        return;
      }

      // 메인에서 온 경우 산책로 선택 확인
      if (!trailStartCoords && !selectedRoute) {
        Alert.alert("알림", "먼저 지도에서 산책로를 선택해주세요.");
        return;
      }

      // 플로깅 시작 API 호출
      await callPloggingStartAPI();

      // Context 플로깅 시작
      const result = await startPlogging();
      console.log("✅ [PloggingStart] 플로깅 시작 완료:", result);

    } catch (error) {
      console.error("❌ [PloggingStart] 플로깅 시작 실패:", error);
      
      Alert.alert(
        "알림",
        "서버 연결에 실패했지만 로컬에서 플로깅을 시작합니다.",
        [{ text: "확인", onPress: () => startPlogging() }]
      );
    }
  };

  // 플로깅 시작 API 호출
  const callPloggingStartAPI = async () => {
    try {
      const ploggingData = {
        memberId: 1,
        trailId: selectedRoute?.id || selectedCourseId,
        startLat: currentLocation?.latitude || 0,
        startLng: currentLocation?.longitude || 0,
        ploggingTime: new Date().toISOString(),
        distance: 0,
        reportIds: []
      };

      console.log("📡 [PloggingStart] API 호출:", ploggingData);

      const response = await fetch(`${BASE_URL}/plogging`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ploggingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ [PloggingStart] API 호출 성공:", result);

    } catch (error) {
      console.error("❌ [PloggingStart] API 호출 실패:", error);
      throw error;
    }
  };

  // 산책로 마커 클릭 처리
  const handleCourseMarkerPress = (course) => {
    console.log("🎯 [PloggingStart] 산책로 선택:", course.name);
    
    setSelectedCourseId(course.id);
    setCourseInfo({
      name: course.name,
      difficulty: course.difficulty,
      distance: course.distance,
      duration: course.duration,
      reportCount: course.reportCount
    });
    
    Alert.alert(
      course.name,
      `거리: ${course.distance}\n난이도: ${course.difficulty}\n소요시간: ${course.duration}\n쓰레기 신고: ${course.reportCount}개\n\n이 산책로로 플로깅을 시작하시겠습니까?`,
      [
        { text: "취소", style: "cancel", onPress: () => {
          setSelectedCourseId(null);
          setCourseInfo(null);
        }},
        { text: "선택", onPress: () => {
          setSelectedRoute({
            id: course.id,
            name: course.name,
            location: course.address,
            difficulty: course.difficulty,
            distance: course.distance,
            duration: course.duration
          });
          setTrailStartCoords(course.coordinate);
          console.log("✅ [PloggingStart] 산책로 선택 완료");
        }}
      ]
    );
  };

  // 기타 핸들러들
  const handlePause = () => pausePlogging();
  const handleResume = () => resumePlogging();
  const handleEnd = () => setModalVisible(true);

  const confirmEnd = async () => {
    setModalVisible(false);
    const ploggingResult = endPlogging();
    navigation.navigate("PloggingRecord", { result: ploggingResult });
  };

  const handleTrashMarkerPress = (trash) => {
    setSelectedTrash(trash);
    setTrashInfoModalVisible(true);
  };

  const handlePickTrash = (trash) => {
    try {
      addTrash();
      addCollectedTrashItem(trash);
      removeTrash(trash.id);
      setTrashInfoModalVisible(false);
      Alert.alert('성공', '쓰레기를 주웠습니다!', [{ text: '확인' }]);
    } catch (error) {
      console.error('쓰레기 줍기 오류:', error);
    }
  };

  const handleShowTrashList = () => {
    const collectedItems = collectedTrash.map(item =>
      `- ${item.title || '쓰레기'}: ${item.amount || '보통'}`
    ).join('\n');

    Alert.alert(
      "수집한 쓰레기 목록",
      collectedTrash.length > 0 ? collectedItems : "아직 수집한 쓰레기가 없습니다."
    );
  };

  // 거리 텍스트 생성
  const getDistanceText = () => {
    if (!distanceToTrail) return "";
    
    if (distanceToTrail <= MAX_DISTANCE_TO_START) {
      return `✅ 산책로와 ${distanceToTrail.toFixed(0)}m 거리 (시작 가능)`;
    } else {
      return `⚠️ 산책로와 ${distanceToTrail.toFixed(0)}m 거리 (너무 멀음)`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
          <Icon name="arrow-back" size={24} color="#418663" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>플로깅</Text>
        <TouchableOpacity onPress={() => navigation.navigate("내 플로깅 기록")}>
          <Icon name="person" size={24} color="#418663" />
        </TouchableOpacity>
      </View>

      {/* 거리 정보 표시 */}
      {trailStartCoords && (
        <View style={[styles.distanceInfo, !canStartPlogging && styles.distanceInfoWarning]}>
          <Text style={[styles.distanceText, !canStartPlogging && styles.distanceTextWarning]}>
            {getDistanceText()}
          </Text>
        </View>
      )}

      {/* 지도 컨테이너 */}
      <View style={styles.mapContainer}>
        <PloggingMap
          mapRef={mapRef}
          currentLocation={currentLocation}
          routeCoordinates={routeCoordinates || []}
          trashLocations={trashLocations || []}
          isLoading={isLoading}
          mapReady={mapReady}
          onTrashMarkerPress={handleTrashMarkerPress}
          nearbyCourses={nearbyCourses || []}
          onCourseMarkerPress={handleCourseMarkerPress}
          selectedCourseId={selectedCourseId}
          initialTrailPath={initialTrailPath || []}
        />

        {/* 오버레이 컨트롤 */}
        {status === "idle" ? (
          <View style={styles.overlayControls}>
  // 메인에서 진입 시 안내 (서버 오류 상황도 고려)
  const renderMainModeInstructions = () => {
    if (trailStartCoords) return null; // CourseDetail 모드면 표시 안함
    
    if (isLoading) {
      return (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>🔍 근처 산책로 검색 중...</Text>
          <Text style={styles.loadingText}>잠시만 기다려주세요</Text>
        </View>
      );
    }
    
    if (nearbyCourses.length > 0) {
      return (
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>🗺️ 주변 산책로 선택</Text>
          <Text style={styles.instructionText}>
            지도에서 산책로 마커를 터치하여{"\n"}플로깅할 코스를 선택해주세요
          </Text>
          <Text style={styles.instructionSubText}>
            반경 5km 내 {nearbyCourses.length}개 산책로 발견
          </Text>
        </View>
      );
    }
    
    // 검색 완료했지만 결과가 없거나 오류가 있는 경우
    return (
      <View style={styles.noDataCard}>
        <Text style={styles.noDataTitle}>📍 주변 산책로 없음</Text>
        <Text style={styles.noDataText}>
          현재 위치 주변 5km 내에{"\n"}등록된 산책로가 없습니다
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            console.log("🔄 [PloggingStart] 재검색 요청");
            setNearbyCourses([]);
            handleNearbySearch();
          }}
        >
          <Text style={styles.retryButtonText}>다시 검색</Text>
        </TouchableOpacity>
      </View>
    );
  };

            {/* 선택된 코스 정보 */}
            {courseInfo && (
              <View style={styles.courseInfoCard}>
                <Text style={styles.courseInfoTitle}>{courseInfo.name}</Text>
                <View style={styles.courseInfoDetails}>
                  <Text style={styles.courseInfoText}>난이도: {courseInfo.difficulty}</Text>
                  <Text style={styles.courseInfoText}>거리: {courseInfo.distance}</Text>
                  {courseInfo.duration && (
                    <Text style={styles.courseInfoText}>소요시간: {courseInfo.duration}</Text>
                  )}
                  {courseInfo.reportCount !== undefined && (
                    <Text style={styles.courseInfoText}>쓰레기 신고: {courseInfo.reportCount}개</Text>
                  )}
                </View>
              </View>
            )}

            {/* 시작 버튼 */}
            <TouchableOpacity 
              style={[
                styles.overlayStartButton, 
                !canStartPlogging && styles.overlayStartButtonDisabled
              ]} 
              onPress={handleStart}
              disabled={!canStartPlogging && trailStartCoords}
            >
              <Text style={[
                styles.overlayStartButtonText,
                !canStartPlogging && styles.overlayStartButtonTextDisabled
              ]}>
                {canStartPlogging ? "시작" : "거리가 너무 멀어요"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.runningControls}>
            <PloggingControls
              status={status}
              time={time}
              trashCount={trashCount}
              formatTime={formatTime}
              onPause={handlePause}
              onResume={handleResume}
              onEnd={handleEnd}
              onShowTrashList={handleShowTrashList}
            />
          </View>
        )}
      </View>

      {/* 모달들 */}
      <CommonModal
        visible={modalVisible}
        title="플로깅 종료"
        message={`플로깅을 종료하시겠습니까?\n주운 쓰레기: ${trashCount}개`}
        onConfirm={confirmEnd}
        onCancel={() => setModalVisible(false)}
        confirmText="종료"
        cancelText="취소"
      />

      <CommonModal
        visible={distanceModalVisible}
        title="산책로와의 거리가 너무 멉니다"
        message={`현재 산책로에서 ${distanceToTrail?.toFixed(0)}m 떨어져 있습니다.\n${MAX_DISTANCE_TO_START}m 이내로 가까이 이동해주세요.`}
        onConfirm={() => setDistanceModalVisible(false)}
        confirmText="확인"
        showCancel={false}
      />

      <TrashInfoModal
        visible={trashInfoModalVisible}
        trash={selectedTrash}
        onClose={() => setTrashInfoModalVisible(false)}
        onPickTrash={handlePickTrash}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  header: { 
    paddingTop: screenHeight * 0.05, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: "#FFFFFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E0E0E0", 
    zIndex: 10 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#212529" 
  },
  
  // 거리 정보
  distanceInfo: {
    backgroundColor: "#E8F5E8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  distanceInfoWarning: {
    backgroundColor: "#FFF3E0"
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#388E3C",
    textAlign: "center"
  },
  distanceTextWarning: {
    color: "#F57C00"
  },
  
  mapContainer: { 
    flex: 1, 
    position: 'relative' 
  },
  overlayControls: { 
    position: 'absolute', 
    bottom: screenHeight * 0.1, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 100,
    paddingHorizontal: 20,
  },

  // 안내 카드
  instructionCard: {
    backgroundColor: "rgba(66, 134, 99, 0.9)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  instructionSubText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },

  // 로딩 카드
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#418663",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },

  // 코스 정보 카드
  courseInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#418663",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  courseInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#418663",
    textAlign: "center",
    marginBottom: 8,
  },
  courseInfoDetails: {
    alignItems: "center",
  },
  courseInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },

  // 시작 버튼
  overlayStartButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#418663", 
    borderRadius: 25, 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8,
    width: '100%',
    justifyContent: 'center',
  },
  overlayStartButtonDisabled: {
    backgroundColor: "#CCCCCC"
  },
  overlayStartButtonText: { 
    color: "#FFFFFF", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  overlayStartButtonTextDisabled: {
    color: "#888888"
  },
  
  // 데이터 없음 카드
  noDataCard: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 193, 7, 0.3)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF8F00",
    textAlign: "center",
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#418663",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  
  runningControls: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    zIndex: 100 
  },
});