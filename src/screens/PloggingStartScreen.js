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
  Modal,
  ScrollView,
} from "react-native"
import MapView, { Marker } from "react-native-maps"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 더미 데이터
const DUMMY_LOCATION = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

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
    // image: require("../assets/trash-background.png"),
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
    // image: require("../assets/trash-background.png"),
  },
]

export default function PloggingStartScreen({ navigation }) {
  const [status, setStatus] = useState("idle") // idle, running, paused
  const [time, setTime] = useState(0) // 초 단위
  const [trashCount, setTrashCount] = useState(0)
  const [currentLocation, setCurrentLocation] = useState(DUMMY_LOCATION)
  const [trashLocations, setTrashLocations] = useState(DUMMY_TRASH_LOCATIONS)
  const [modalVisible, setModalVisible] = useState(false)
  const [trashInfoModalVisible, setTrashInfoModalVisible] = useState(false)
  const [selectedTrash, setSelectedTrash] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // 타이머 관리
  useEffect(() => {
    let interval = null
    if (status === "running") {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    } else if (status === "paused") {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [status])

  // 데이터 로딩
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadData()
        // 맵 데이터 로딩 후 맵 준비 상태로 설정
        setTimeout(() => {
          setMapReady(true)
        }, 100)
      } catch (error) {
        console.error("맵 초기화 오류:", error)
        setMapReady(true) // 오류가 있어도 맵을 표시
      }
    }
    
    initializeMap()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      console.log("데이터 로딩 시작...")

      // 실제 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 안전한 데이터 설정
      const safeLocation = {
        latitude: 37.5665,
        longitude: 126.978,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
      
      const safeTrashLocations = [
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
          // image: require("../assets/trash-background.png"),
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
          // image: require("../assets/trash-background.png"),
        },
      ]

      setCurrentLocation(safeLocation)
      setTrashLocations(safeTrashLocations)
      setTrashCount(0)
      
      console.log("데이터 로딩 완료")
    } catch (error) {
      console.error("데이터 로딩 실패:", error)
      // 기본값 설정
      setCurrentLocation({
        latitude: 37.5665,
        longitude: 126.978,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
      setTrashLocations([])
      setTrashCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // 시간 포맷팅 (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const handleStart = () => {
    setStatus("running")
    setTime(0)
    setTrashCount(0)
  }

  const handlePause = () => {
    setStatus("paused")
  }

  const handleResume = () => {
    setStatus("running")
  }

  const handleEnd = () => {
    try {
      setModalVisible(false)
      
      // 플로깅 결과 데이터 생성
      const ploggingResult = {
        id: Date.now(),
        title: "방금 완료한 플로깅",
        date: new Date().toLocaleDateString('ko-KR'),
        location: "마로니에 공원",
        duration: formatTime(time),
        distance: "3.2km",
        trashCount: trashCount,
        calories: Math.max(Math.floor(time * 0.1), 10),
        route: [
          { latitude: 37.5665, longitude: 126.978 },
          { latitude: 37.5675, longitude: 126.979 },
          { latitude: 37.5685, longitude: 126.980 },
        ],
        trashLocations: trashLocations.map(trash => ({
          latitude: trash.coordinate.latitude,
          longitude: trash.coordinate.longitude,
          type: trash.photos && trash.photos.length > 0 ? trash.photos[0].type : "쓰레기"
        }))
      }

      console.log("플로깅 결과:", ploggingResult)

      // 네비게이션 이동
      if (navigation && navigation.navigate) {
        navigation.navigate("PloggingRecordDetail", {
          recordId: ploggingResult.id,
          record: ploggingResult
        })
      } else {
        console.error("Navigation이 정의되지 않음")
        Alert.alert("오류", "화면 이동에 실패했습니다.")
      }
    } catch (error) {
      console.error("플로깅 종료 처리 오류:", error)
      Alert.alert("오류", "플로깅 종료 처리 중 오류가 발생했습니다.")
    }
  }

  const handleTrashMarkerPress = (trash) => {
    try {
      setSelectedTrash(trash)
      setTrashInfoModalVisible(true)
    } catch (error) {
      console.error("쓰레기 마커 선택 오류:", error)
    }
  }

  const handlePickTrash = () => {
    try {
      setTrashCount((prev) => prev + 1)
      setTrashInfoModalVisible(false)
      Alert.alert("완료", "쓰레기를 주웠습니다!")
    } catch (error) {
      console.error("쓰레기 줍기 오류:", error)
    }
  }

  const goBack = () => {
    try {
      if (navigation && navigation.goBack) {
        navigation.goBack()
      }
    } catch (error) {
      console.error("뒤로가기 오류:", error)
    }
  }

  const goToReportList = () => {
    try {
      if (navigation && navigation.navigate) {
        navigation.navigate("ReportRecord")
      }
    } catch (error) {
      console.error("제보 목록 이동 오류:", error)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>위치 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {status === "idle" ? "플로깅" : "마로니에 공원"}
        </Text>
        <View style={styles.headerRight}>
          {status === "idle" && (
            <>
              <TouchableOpacity style={styles.headerButton}>
                <Icon name="search" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Icon name="person" size={24} color="#333" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        {currentLocation && mapReady ? (
          <MapView 
            style={styles.map} 
            initialRegion={currentLocation} 
            showsUserLocation={true}
            onMapReady={() => console.log("Map is ready")}
            onError={(error) => console.error("Map error:", error)}
          >
            <Marker coordinate={currentLocation} title="현재 위치" />
            {trashLocations && trashLocations.length > 0 && trashLocations.map((trash) => (
              <Marker
                key={`trash-${trash.id}`}
                coordinate={trash.coordinate}
                onPress={() => handleTrashMarkerPress(trash)}
              >
                <View style={styles.trashMarker}>
                  <Icon name="delete" size={20} color="#418663" />
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              {isLoading ? "지도를 불러오는 중..." : "[지도 영역 - Google Map]"}
            </Text>
          </View>
        )}
      </View>

      {/* 하단 컨트롤 영역 */}
      <View style={styles.bottomContainer}>
        {/* 시작 전 상태 */}
        {status === "idle" && (
          <View style={styles.idleControls}>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Image source={require("../assets/play.png")} style={styles.playIcon} />
              <Text style={styles.startButtonText}>시작</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton} onPress={goToReportList}>
              <Icon name="list" size={15} color="#418663" />
              <Text style={styles.reportButtonText}>제보목록 보기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 진행 중 상태 */}
        {status === "running" && (
          <View style={styles.runningControls}>
            <Text style={styles.timeLabel}>플로깅 시간</Text>
            <Text style={styles.timer}>{formatTime(time)}</Text>
            <TouchableOpacity style={styles.stopButton} onPress={handlePause}>
              <Text style={styles.stopButtonText}>정지</Text>
              <Image source={require("../assets/tablet.png")} style={styles.tabletIcon} />
            </TouchableOpacity>
          </View>
        )}

        {/* 일시정지 상태 */}
        {status === "paused" && (
          <View style={styles.pausedControls}>
            <Text style={styles.timeLabel}>플로깅 시간</Text>
            <Text style={[styles.timer, styles.pausedTimer]}>{formatTime(time)}</Text>
            <View style={styles.trashInfo}>
              <Text style={styles.trashLabel}>현재 주운 쓰레기</Text>
              <Text style={styles.trashCount}>{trashCount}개</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.pausedButtons}>
              <TouchableOpacity style={styles.endButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.endButtonText}>종료</Text>
                <Image source={require("../assets/tablet.png")} style={styles.tabletIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
                <Text style={styles.resumeButtonText}>재시작</Text>
                <Image source={require("../assets/play.png")} style={styles.playIconSmall} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#418663" />
          <Text style={[styles.navText, styles.activeNavText]}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="route" size={22} color="#797982" />
          <Text style={styles.navText}>추천 코스</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="search" size={24} color="#797982" />
          <Text style={styles.navText}>코스 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="report" size={24} color="#797982" />
          <Text style={styles.navText}>쓰레기 제보</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person" size={24} color="#797982" />
          <Text style={styles.navText}>나의 활동</Text>
        </TouchableOpacity>
      </View>

      {/* 쓰레기 정보 바텀 시트 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={trashInfoModalVisible}
        onRequestClose={() => setTrashInfoModalVisible(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity
            style={styles.bottomSheetBackground}
            activeOpacity={1}
            onPress={() => setTrashInfoModalVisible(false)}
          />
          <View style={styles.bottomSheetContainer}>
            {/* 드래그 핸들 */}
            <View style={styles.dragHandle} />

            {/* 쓰레기 정보 섹션 */}
            <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.trashInfoHeader}>
                <Text style={styles.trashInfoTitle}>{selectedTrash?.title || "쓰레기 정보"}</Text>
                {/* <Image source={selectedTrash?.image || require("../assets/trash-background.png")} style={styles.trashInfoImage} /> */}
              </View>

              <View style={styles.trashInfoDetails}>
                <View style={styles.trashInfoRow}>
                  <Text style={styles.trashInfoLabel}>위치</Text>
                  <Text style={styles.trashInfoValue}>{selectedTrash?.location || "위치 정보 없음"}</Text>
                </View>
                <View style={styles.trashInfoRow}>
                  <Text style={styles.trashInfoLabel}>쓰레기 양</Text>
                  <Text style={styles.trashInfoValue}>{selectedTrash?.amount || "정보 없음"}</Text>
                </View>
                <View style={styles.trashInfoRow}>
                  <Text style={styles.trashInfoLabel}>사진</Text>
                  <View style={styles.trashPhotoTags}>
                    {selectedTrash?.photos && selectedTrash.photos.length > 0 ? (
                      selectedTrash.photos.map((photo, index) => (
                        <View key={index} style={[styles.photoTag, { backgroundColor: `${photo.color}20` }]}>
                          <Text style={[styles.photoTagText, { color: photo.color }]}>
                            {photo.type} {photo.count}개
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noPhotoText}>사진 정보 없음</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.currentTrashInfo}>
                <Icon name="menu" size={24} color="#418663" />
                <Text style={styles.currentTrashLabel}>현재 주운 쓰레기</Text>
                <Text style={styles.currentTrashCount}>{trashCount}개</Text>
              </View>

              <View style={styles.trashModalSeparator} />

              <TouchableOpacity style={styles.pickButton} onPress={handlePickTrash}>
                <Text style={styles.pickButtonText}>줍기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 종료 확인 모달 */}
      <CommonModal
        visible={modalVisible}
        message={`플로깅을 종료하시겠습니까?\n주운 쓰레기: ${trashCount}개`}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleEnd}
        cancelText="계속하기"
        confirmText="종료"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 5,
    marginLeft: 10,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: "#666",
  },
  trashMarker: {
    width: 30,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#418663",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  // 시작 전 상태 스타일
  idleControls: {
    alignItems: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#418663",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginBottom: 15,
  },
  playIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: "#FFFFFF",
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#999999",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  reportButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333333",
    marginLeft: 5,
    letterSpacing: -0.24,
  },
  // 진행 중 상태 스타일
  runningControls: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999999",
    marginBottom: 5,
  },
  timer: {
    fontSize: 30,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 20,
  },
  pausedTimer: {
    color: "#D9D9D9",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2E2E",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  stopButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
    letterSpacing: -0.24,
  },
  tabletIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  // 일시정지 상태 스타일
  pausedControls: {
    alignItems: "center",
  },
  trashInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  trashLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999999",
    marginRight: 10,
  },
  trashCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  separator: {
    width: screenWidth * 0.889,
    height: 2,
    backgroundColor: "rgba(170, 178, 200, 0.2)",
    marginVertical: 15,
  },
  pausedButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2E2E",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  endButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
    letterSpacing: -0.24,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#418663",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  resumeButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
    letterSpacing: -0.24,
  },
  playIconSmall: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
  },
  // 하단 네비게이션
  bottomNavigation: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 33,
    paddingVertical: 7,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  navText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#797982",
    marginTop: 5,
    letterSpacing: -0.24,
    textAlign: "center",
  },
  activeNavText: {
    color: "#418663",
  },
  // 바텀 시트 스타일
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetBackground: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.6,
    paddingTop: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  trashInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  trashInfoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
  },
  trashInfoImage: {
    width: 65,
    height: 50,
    borderRadius: 5,
  },
  trashInfoDetails: {
    marginBottom: 30,
  },
  trashInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 21,
  },
  trashInfoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#AAB2C8",
  },
  trashInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  trashPhotoTags: {
    flexDirection: "row",
    gap: 10,
  },
  photoTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  photoTagText: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  noPhotoText: {
    fontSize: 12,
    color: "#999999",
  },
  currentTrashInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  currentTrashLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999999",
    marginLeft: 10,
    marginRight: 10,
  },
  currentTrashCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  trashModalSeparator: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(170, 178, 200, 0.2)",
    marginBottom: 30,
  },
  pickButton: {
    backgroundColor: "#418663",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 40,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
  },
  pickButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
})
