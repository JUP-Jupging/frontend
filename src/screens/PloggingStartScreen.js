"use client"
import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  SafeAreaView,
  Image,
  AppState,
  BackHandler,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import Config from "react-native-config"

// 🎯 플로깅 관련 컴포넌트 및 전역 상태
import { usePloggingContext } from "../contexts/PloggingContext"    // 플로깅 전역 상태 관리
import PloggingMap from "../components/Plogging/PloggingMap"        // 지도 및 마커 표시
import PloggingControls from "../components/Plogging/PloggingControls" // 플로깅 제어 버튼들
import TrashInfoModal from "../components/Plogging/TrashInfoModal"  // 쓰레기 정보 모달

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

/**
 * 🗑️ 더미 쓰레기 위치 데이터
 * - 실제 API가 연동되면 이 데이터는 서버에서 받아옴
 * - 지도에 마커로 표시되며, 클릭 시 쓰레기 정보 모달 표시
 */
const DUMMY_TRASH_LOCATIONS = [
  {
    id: 1,
    coordinate: { latitude: 37.5665, longitude: 126.978 },
    title: "마로니에 공원 쓰레기",
    location: "마로니에 공원",
    amount: "많음",
    photos: [
      { type: "유리병", count: 3, color: "#797982" },
      { type: "플라스틱", count: 4, color: "#007AFF" },
    ],
  },
  {
    id: 2,
    coordinate: { latitude: 37.5675, longitude: 126.979 },
    title: "벤치 근처 쓰레기",
    location: "마로니에 공원",
    amount: "보통",
    photos: [
      { type: "캔", count: 2, color: "#797982" },
      { type: "종이", count: 1, color: "#34C759" },
    ],
  },
]

/**
 * 🏃‍♂️ PloggingStartScreen: 플로깅 시작 및 진행 화면
 * 
 * 주요 기능:
 * 1. 플로깅 시작/일시정지/재시작/종료 제어
 * 2. 실시간 지도 표시 (현재 위치, 이동 경로, 쓰레기 위치)
 * 3. 플로깅 통계 실시간 표시 (시간, 거리, 쓰레기 개수)
 * 4. 백그라운드 실행 지원 (다른 화면으로 이동해도 플로깅 계속)
 * 5. 쓰레기 마커 클릭 시 정보 모달 표시 및 수집 기능
 * 
 * 백그라운드 실행:
 * - PloggingContext를 통해 전역 상태 관리
 * - 화면을 벗어나도 위치 추적과 시간 측정 계속
 * - FloatingPloggingIndicator를 통해 다른 화면에서도 진행 상황 확인 가능
 */
export default function PloggingStartScreen({ navigation }) {
  console.log('[PloggingStartScreen] 컴포넌트 렌더링 시작');
  
  // 🎯 플로깅 전역 상태에서 필요한 데이터와 함수들 추출
  const {
    status,             // 플로깅 상태 (idle/running/paused)
    time,               // 경과 시간 (초)
    trashCount,         // 수집한 쓰레기 개수
    formatTime,         // 시간 포맷팅 함수 (초 → HH:MM:SS)
    currentLocation,    // 현재 위치 좌표
    routeCoordinates,   // 이동 경로 좌표 배열
    totalDistance,      // 총 이동 거리 (미터)
    formatDistance,     // 거리 포맷팅 함수 (미터 → km)
    mapRef,             // 지도 컴포넌트 참조
    trashLocations,     // 쓰레기 위치 목록
    isBackgroundMode,   // 백그라운드 모드 여부
    startPlogging,      // 플로깅 시작 함수
    pausePlogging,      // 플로깅 일시정지 함수
    resumePlogging,     // 플로깅 재시작 함수
    endPlogging,        // 플로깅 종료 함수
    addTrash,           // 쓰레기 수집 카운트 증가 함수
    setTrashLocations,  // 쓰레기 위치 설정 함수
    removeTrash,        // 특정 쓰레기 위치 제거 함수
  } = usePloggingContext();

  // 🗺️ 컴포넌트 내부 상태 관리 (UI 전용)
  const [modalVisible, setModalVisible] = useState(false)               // 플로깅 종료 확인 모달
  const [trashInfoModalVisible, setTrashInfoModalVisible] = useState(false) // 쓰레기 정보 모달
  const [selectedTrash, setSelectedTrash] = useState(null)             // 선택된 쓰레기 정보
  const [isLoading, setIsLoading] = useState(false)                    // 로딩 상태
  const [mapReady, setMapReady] = useState(false)                      // 지도 초기화 완료 여부

  // 🧹 가상의 쓰레기 위치 데이터 (개발/테스트용)
  // 실제 서비스에서는 API에서 받아온 실제 쓰레기 위치 데이터로 대체
  const dummyTrashData = [
    {
      id: 1,
      coordinate: { latitude: 37.541, longitude: 126.986 }, // 강남역 근처
      type: '일반쓰레기',    // 쓰레기 유형
      description: '길가에 버려진 플라스틱 병',
      isCollected: false   // 수집 여부
    },
    {
      id: 2,
      coordinate: { latitude: 37.542, longitude: 126.987 },
      type: '재활용',
      description: '공원 벤치 옆 캔',
      isCollected: false
    },
    {
      id: 3,
      coordinate: { latitude: 37.543, longitude: 126.985 },
      type: '유해폐기물',
      description: '담배꽁초',
      isCollected: false
    }
  ];

  // ⬅️ 뒤로가기 버튼 처리 - 백그라운드 모드로 전환
  // 플로깅 진행 중에도 다른 화면으로 이동 가능하도록 처리
  useEffect(() => {
    console.log('[PloggingStartScreen] 뒤로가기 핸들러 등록');
    
    const backAction = () => {
      console.log('[PloggingStartScreen] 뒤로가기 버튼 클릭, 현재 상태:', status);
      
      // 플로깅 상태와 관계없이 항상 메인 화면으로 이동
      // 플로깅은 백그라운드에서 계속 실행되며, FloatingPloggingIndicator로 확인 가능
      console.log('[PloggingStartScreen] 메인 화면으로 이동 (플로깅 세션 유지)');
      navigation.navigate("Main");
      return true; // 기본 뒤로가기 동작 방지 (앱 종료 방지)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      console.log('[PloggingStartScreen] 뒤로가기 핸들러 해제');
      backHandler.remove();
    };
  }, [status, navigation]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    console.log('[PloggingStartScreen] 컴포넌트 마운트');
    
    const initializeApp = async () => {
      console.log('[PloggingStartScreen] 앱 초기화 시작');
      await loadData()
      setTimeout(() => {
        console.log('[PloggingStartScreen] 맵 준비 완료 설정');
        setMapReady(true)
      }, 100)
    }
    
    initializeApp()

    // 컴포넌트 언마운트 시에는 위치 추적을 중지하지 않음 (백그라운드 실행 유지)
    return () => {
      console.log('[PloggingStartScreen] 컴포넌트 언마운트 - 플로깅 세션 유지');
      // stopLocationTracking() - 제거됨: 백그라운드에서도 계속 실행되어야 함
    }
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      console.log('[PloggingStartScreen] 데이터 로딩 시작...')
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 더미 데이터 설정 (이미 쓰레기가 있는 경우 덮어쓰지 않음)
      if (trashLocations.length === 0) {
        setTrashLocations(DUMMY_TRASH_LOCATIONS)
      }
      
      console.log('[PloggingStartScreen] 데이터 로딩 완료')
    } catch (error) {
      console.error('[PloggingStartScreen] 데이터 로딩 실패:', error)
      if (trashLocations.length === 0) {
        setTrashLocations([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 플로깅 시작 핸들러
  const handleStart = async () => {
    console.log('[PloggingStartScreen] 플로깅 시작 시도...')
    const success = await startPlogging();
    if (!success) {
      console.log('[PloggingStartScreen] 플로깅 시작 실패');
    }
  }

  const handlePause = () => {
    console.log('[PloggingStartScreen] 플로깅 일시정지')
    pausePlogging();
  }

  const handleResume = () => {
    console.log('[PloggingStartScreen] 플로깅 재시작')
    resumePlogging();
    
    // 현재 위치로 맵 이동
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }

  const handleEnd = () => {
    console.log('[PloggingStartScreen] 플로깅 종료 요청')
    setModalVisible(true);
  }

  const confirmEnd = () => {
    console.log('[PloggingStartScreen] 플로깅 종료 확정')
    try {
      setModalVisible(false);
      
      // 플로깅 결과 데이터 생성 및 상태 초기화
      const ploggingResult = endPlogging();

      console.log('[PloggingStartScreen] 플로깅 결과:', ploggingResult);

      // 결과 화면으로 이동
      navigation.navigate("PloggingRecord", {
        result: ploggingResult,
      });
    } catch (error) {
      console.error('[PloggingStartScreen] 플로깅 종료 처리 오류:', error);
    }
  }

  const handleTrashMarkerPress = (trash) => {
    console.log('[PloggingStartScreen] 쓰레기 마커 클릭:', trash.id);
    setSelectedTrash(trash);
    setTrashInfoModalVisible(true);
  }

  const handlePickTrash = (trash) => {
    console.log('[PloggingStartScreen] 쓰레기 줍기:', trash.id);
    try {
      addTrash();
      setTrashInfoModalVisible(false);
      
      // 해당 쓰레기를 목록에서 제거
      removeTrash(trash.id);
      
      Alert.alert('성공', '쓰레기를 주웠습니다!', [{ text: '확인' }]);
    } catch (error) {
      console.error('[PloggingStartScreen] 쓰레기 줍기 오류:', error);
    }
  }

  const handleGoToMain = () => {
    console.log('[PloggingStartScreen] 메인 화면으로 이동');
    navigation.navigate("Main");
  }

  const handleBackPress = () => {
    console.log('[PloggingStartScreen] 헤더 뒤로가기 버튼 클릭, 현재 상태:', status);
    
    // 플로깅 중이라면 백그라운드 실행 안내
    if (status === "running" || status === "paused") {
      console.log('[PloggingStartScreen] 플로깅 진행 중 - 백그라운드 실행 안내');
      Alert.alert(
        '플로깅 진행 중',
        '플로깅이 백그라운드에서 계속 실행됩니다.\n언제든 다시 돌아올 수 있습니다.',
        [
          { text: '확인', onPress: () => navigation.navigate("Main") }
        ]
      );
    } else {
      // 플로깅 중이 아니면 바로 메인 화면으로 이동
      console.log('[PloggingStartScreen] 메인 화면으로 이동');
      navigation.navigate("Main");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="#418663" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>플로깅</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="help-outline" size={20} color="#418663" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 지도 영역 */}
      <PloggingMap
        mapRef={mapRef}
        currentLocation={currentLocation}
        routeCoordinates={routeCoordinates}
        trashLocations={trashLocations}
        isLoading={isLoading}
        mapReady={mapReady}
        onTrashMarkerPress={handleTrashMarkerPress}
      />

      {/* 하단 컨트롤 */}
      <PloggingControls
        status={status}
        time={time}
        trashCount={trashCount}
        totalDistance={totalDistance}
        formatTime={formatTime}
        formatDistance={formatDistance}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onEnd={handleEnd}
        onGoToMain={handleGoToMain}
      />

      {/* 종료 확인 모달 */}
      <CommonModal
        visible={modalVisible}
        title="플로깅 종료"
        message={`플로깅을 종료하시겠습니까?\n주운 쓰레기: ${trashCount}개\n총 거리: ${formatDistance(totalDistance)}`}
        onConfirm={confirmEnd}
        onCancel={() => setModalVisible(false)}
        confirmText="종료"
        cancelText="취소"
      />

      {/* 쓰레기 정보 모달 */}
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 5,
    marginLeft: 10,
  },
})
