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
  PermissionsAndroid,
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import Config from "react-native-config"
import Geolocation from 'react-native-geolocation-service';

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
  
  // 경로 추적 관련 상태
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [totalDistance, setTotalDistance] = useState(0)
  const [watchId, setWatchId] = useState(null)

  const key = Config.REACT_APP_GOOGLE_MAPS_API_KEY

  // 안드로이드 위치 권한 요청
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 권한이 필요합니다',
          message: '플로깅 경로를 추적하고 기록하기 위해 위치 권한이 필요합니다.\n\n권한을 허용해주세요.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '거부',
          buttonPositive: '허용',
        }
      )
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('위치 권한이 허용되었습니다.')
        return true
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        Alert.alert(
          '권한 거부됨', 
          '위치 권한이 거부되어 플로깅을 시작할 수 없습니다.\n\n설정에서 위치 권한을 허용해주세요.',
          [{ text: '확인' }]
        )
        return false
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          '권한 설정 필요', 
          '위치 권한이 영구적으로 거부되었습니다.\n\n설정 > 앱 > 권한에서 위치 권한을 허용해주세요.',
          [{ text: '확인' }]
        )
        return false
      }
      return false
    } catch (err) {
      console.warn('권한 요청 오류:', err)
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.')
      return false
    }
  }

  // 두 좌표 간의 거리 계산 (미터 단위)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // 거리 포맷팅
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(2)}km`
    }
  }

  // 위치 추적 시작
  const startLocationTracking = () => {
    const id = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newCoordinate = { latitude, longitude }

        setCurrentLocation(prev => ({
          ...prev,
          latitude,
          longitude
        }))

        setRouteCoordinates(prevRoute => {
          const newRoute = [...prevRoute, newCoordinate]
          
          // 거리 계산 (첫 번째 좌표가 아닌 경우에만)
          if (prevRoute.length > 0) {
            const lastCoordinate = prevRoute[prevRoute.length - 1]
            const distance = calculateDistance(
              lastCoordinate.latitude,
              lastCoordinate.longitude,
              latitude,
              longitude
            )
            // 5미터 이상 이동했을 때만 거리 추가 (GPS 오차 방지)
            if (distance >= 5) {
              setTotalDistance(prev => prev + distance)
            }
          }
          
          return newRoute
        })
      },
      (error) => {
        console.error('위치 추적 오류:', error)
        Alert.alert('위치 오류', '위치를 가져올 수 없습니다. GPS가 켜져있는지 확인해주세요.')
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // 5미터마다 업데이트
        interval: 2000, // 2초마다 체크
        fastestInterval: 1000, // 최소 1초 간격
        timeout: 15000,
        maximumAge: 10000,
      }
    )

    setWatchId(id)
  }

  // 위치 추적 중지
  const stopLocationTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId)
      setWatchId(null)
      console.log('위치 추적이 중지되었습니다.')
    }
  }

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

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const initializeApp = async () => {
      await loadData()
      setTimeout(() => {
        setMapReady(true)
      }, 100)
    }
    
    initializeApp()

    // 컴포넌트 언마운트 시 위치 추적 중지
    return () => {
      stopLocationTracking()
    }
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      console.log("데이터 로딩 시작...")
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 더미 데이터 설정
      setCurrentLocation(DUMMY_LOCATION)
      setTrashLocations(DUMMY_TRASH_LOCATIONS)
      setTrashCount(0)
      
      console.log("데이터 로딩 완료")
    } catch (error) {
      console.error("데이터 로딩 실패:", error)
      setCurrentLocation(DUMMY_LOCATION)
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

  // 플로깅 시작 - 위치 권한 체크 포함
  const handleStart = async () => {
    try {
      console.log('플로깅 시작 시도...')
      
      // 위치 권한 요청
      const hasPermission = await requestLocationPermission()
      
      if (!hasPermission) {
        console.log('위치 권한이 거부되어 플로깅 시작이 취소되었습니다.')
        return // 권한이 거부되면 시작 취소
      }

      console.log('위치 권한 허용됨. 플로깅을 시작합니다.')
      
      // 현재 위치 가져오기
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const startLocation = { latitude, longitude }
          
          setCurrentLocation({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })
          
          // 플로깅 시작
          setStatus("running")
          setTime(0)
          setTrashCount(0)
          setTotalDistance(0)
          setRouteCoordinates([startLocation]) // 시작점 추가
          startLocationTracking()
          
          console.log('플로깅이 시작되었습니다.')
        },
        (error) => {
          console.error('현재 위치 가져오기 실패:', error)
          Alert.alert(
            '위치 오류', 
            'GPS 위치를 가져올 수 없습니다.\n\nGPS가 켜져있는지 확인하고 다시 시도해주세요.',
            [{ text: '확인' }]
          )
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000 
        }
      )
      
    } catch (error) {
      console.error('플로깅 시작 오류:', error)
      Alert.alert('오류', '플로깅 시작 중 오류가 발생했습니다.')
    }
  }

  const handlePause = () => {
    console.log('플로깅 일시정지')
    setStatus("paused")
    stopLocationTracking()
  }

  const handleResume = () => {
    console.log('플로깅 재시작')
    setStatus("running")
    startLocationTracking()
  }

  const handleEnd = () => {
    try {
      setModalVisible(false)
      stopLocationTracking()

      console.log('플로깅 종료')

      // 플로깅 결과 데이터 생성
      const ploggingResult = {
        id: Date.now(),
        title: "방금 완료한 플로깅",
        date: new Date().toLocaleDateString('ko-KR'),
        location: "마로니에 공원",
        duration: formatTime(time),
        distance: formatDistance(totalDistance),
        trashCount: trashCount,
        calories: Math.max(Math.floor(time * 0.1), 10),
        route: routeCoordinates, // 실제 추적된 경로
        trashLocations: trashLocations.map(trash => ({
          latitude: trash.coordinate.latitude,
          longitude: trash.coordinate.longitude,
          type: trash.photos && trash.photos.length > 0 ? trash.photos[0].type : "쓰레기"
        }))
      }

      console.log("플로깅 결과:", ploggingResult)
      
      // 상태 초기화
      setStatus("idle")
      setTime(0)
      setTrashCount(0)
      setTotalDistance(0)
      setRouteCoordinates([])

      // 네비게이션 이동
      if (navigation && navigation.navigate) {
        navigation.navigate("PloggingRecordScreen", {
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
      // 진행 중인 추적이 있으면 중지
      if (status !== "idle") {
        Alert.alert(
          '플로깅 진행 중',
          '플로깅이 진행 중입니다. 종료하고 나가시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { 
              text: '종료하고 나가기', 
              style: 'destructive',
              onPress: () => {
                stopLocationTracking()
                setStatus("idle")
                setTime(0)
                setTrashCount(0)
                setTotalDistance(0)
                setRouteCoordinates([])
                if (navigation && navigation.goBack) {
                  navigation.goBack()
                }
              }
            }
          ]
        )
      } else {
        if (navigation && navigation.goBack) {
          navigation.goBack()
        }
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
            followsUserLocation={status === "running"}
            onMapReady={() => console.log("Map is ready")}
            onError={(error) => console.error("Map error:", error)}
          >
            {/* 현재 위치 마커 */}
            <Marker coordinate={currentLocation} title="현재 위치" />
            
            {/* 경로 표시 */}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#418663"
                strokeWidth={4}
                lineDashPattern={[0]}
              />
            )}
            
            {/* 쓰레기 위치 마커 */}
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
            <Text style={styles.distanceLabel}>거리: {formatDistance(totalDistance)}</Text>
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
            <Text style={styles.distanceLabel}>거리: {formatDistance(totalDistance)}</Text>
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
            <View style={styles.dragHandle} />
            <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.trashInfoHeader}>
                <Text style={styles.trashInfoTitle}>{selectedTrash?.title || "쓰레기 정보"}</Text>
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
        message={`플로깅을 종료하시겠습니까?\n주운 쓰레기: ${trashCount}개\n총 거리: ${formatDistance(totalDistance)}`}
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
    paddingTop: screenHeight * 0.05,
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
    marginBottom: 10,
  },
  pausedTimer: {
    color: "#D9D9D9",
  },
  distanceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#418663",
    marginBottom: 20,
    textAlign: "center",
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