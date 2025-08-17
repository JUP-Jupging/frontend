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
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import Config from "react-native-config"

// 분리된 컴포넌트와 훅들 import
import { useLocation } from "../hooks/useLocation"
import { usePlogging } from "../hooks/usePlogging"
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
  
  // 분리된 훅들 사용
  const {
    status,
    time,
    trashCount,
    formatTime,
    startPlogging,
    pausePlogging,
    resumePlogging,
    endPlogging,
    addTrash
  } = usePlogging();

  const {
    currentLocation,
    routeCoordinates,
    totalDistance,
    mapRef,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    formatDistance,
    resetLocation,
  } = useLocation();

  // 로컬 상태들
  const [trashLocations, setTrashLocations] = useState(DUMMY_TRASH_LOCATIONS)
  const [modalVisible, setModalVisible] = useState(false)
  const [trashInfoModalVisible, setTrashInfoModalVisible] = useState(false)
  const [selectedTrash, setSelectedTrash] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)

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

    // 컴포넌트 언마운트 시 위치 추적 중지
    return () => {
      console.log('[PloggingStartScreen] 컴포넌트 언마운트 - 위치 추적 중지');
      stopLocationTracking()
    }
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      console.log('[PloggingStartScreen] 데이터 로딩 시작...')
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 더미 데이터 설정
      setTrashLocations(DUMMY_TRASH_LOCATIONS)
      
      console.log('[PloggingStartScreen] 데이터 로딩 완료')
    } catch (error) {
      console.error('[PloggingStartScreen] 데이터 로딩 실패:', error)
      setTrashLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  // 플로깅 시작 핸들러
  const handleStart = async () => {
    console.log('[PloggingStartScreen] 플로깅 시작 시도...')
    
    try {
      const location = await getCurrentLocation();
      if (location) {
        console.log('[PloggingStartScreen] 위치 획득 성공, 플로깅 시작');
        startPlogging();
        startLocationTracking(status === "running");
      } else {
        console.log('[PloggingStartScreen] 위치 획득 실패');
        Alert.alert('위치 오류', 'GPS 위치를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('[PloggingStartScreen] 플로깅 시작 오류:', error);
      Alert.alert('오류', '플로깅 시작 중 오류가 발생했습니다.');
    }
  }

  const handlePause = () => {
    console.log('[PloggingStartScreen] 플로깅 일시정지')
    pausePlogging();
    stopLocationTracking();
  }

  const handleResume = () => {
    console.log('[PloggingStartScreen] 플로깅 재시작')
    resumePlogging();
    startLocationTracking(true);
    
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
      stopLocationTracking();
      
      // 플로깅 결과 데이터 생성
      const ploggingResult = {
        id: Date.now(),
        title: "방금 완료한 플로깅",
        date: new Date().toLocaleDateString('ko-KR'),
        location: "마로니에 공원",
        duration: formatTime(time),
        distance: formatDistance(totalDistance),
        trashCount: trashCount,
        routeCoordinates: routeCoordinates,
      };

      console.log('[PloggingStartScreen] 플로깅 결과:', ploggingResult);

      // 상태 초기화
      endPlogging();
      resetLocation();

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
      setTrashLocations(prev => prev.filter(t => t.id !== trash.id));
      
      Alert.alert('성공', '쓰레기를 주웠습니다!', [{ text: '확인' }]);
    } catch (error) {
      console.error('[PloggingStartScreen] 쓰레기 줍기 오류:', error);
    }
  }

  const handleGoToMain = () => {
    console.log('[PloggingStartScreen] 메인 화면으로 이동');
    navigation.navigate("Main");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            console.log('[PloggingStartScreen] 뒤로가기 버튼 클릭');
            navigation.goBack();
          }}
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
<View style={styles.mapContainer}>
  {mapReady && currentLocation && (
    <PloggingMap
      mapRef={mapRef}
      currentLocation={currentLocation}
      routeCoordinates={routeCoordinates}
      trashLocations={trashLocations}
      isLoading={isLoading}
      mapReady={mapReady}
      onTrashMarkerPress={handleTrashMarkerPress}
    />
  )}
</View>

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
