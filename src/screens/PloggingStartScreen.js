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

// 전역 상태 및 컴포넌트들 import
import { usePloggingContext } from "../contexts/PloggingContext"
import PloggingMap from "../components/Plogging/PloggingMap"
import PloggingControls from "../components/Plogging/PloggingControls"
import TrashInfoModal from "../components/Plogging/TrashInfoModal"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 더미 데이터
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

export default function PloggingStartScreen({ navigation }) {
  console.log('[PloggingStartScreen] 컴포넌트 렌더링 시작');
  
  // 전역 플로깅 상태 사용
  const {
    status,
    time,
    trashCount,
    formatTime,
    currentLocation,
    routeCoordinates,
    totalDistance,
    formatDistance,
    mapRef,
    trashLocations,
    isBackgroundMode,
    startPlogging,
    pausePlogging,
    resumePlogging,
    endPlogging,
    addTrash,
    setTrashLocations,
    removeTrash,
  } = usePloggingContext();

  // 로컬 상태들 (UI 관련만)
  const [modalVisible, setModalVisible] = useState(false)
  const [trashInfoModalVisible, setTrashInfoModalVisible] = useState(false)
  const [selectedTrash, setSelectedTrash] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // 뒤로가기 버튼 처리 - 직접 네비게이션 제어
  useEffect(() => {
    console.log('[PloggingStartScreen] 뒤로가기 핸들러 등록');
    
    const backAction = () => {
      console.log('[PloggingStartScreen] 뒤로가기 버튼 클릭, 현재 상태:', status);
      
      // 플로깅 상태와 관계없이 항상 메인 화면으로 이동
      // 플로깅은 백그라운드에서 계속 실행됨
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
