"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import MapView, { Marker } from "react-native-maps"
import Geolocation from 'react-native-geolocation-service'
import { getTrailDetail } from "../api/trails"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 거리 계산 함수 (haversine formula)
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
const MAX_DISTANCE_TO_START = 50000; // 500미터 이내에서만 플로깅 시작 가능

// 더미 이미지 배열 (이미지가 없을 때만 사용)
const DUMMY_IMAGES = [
  "https://via.placeholder.com/360x200/4CAF50/FFFFFF?text=산책로1",
  "https://via.placeholder.com/360x200/2196F3/FFFFFF?text=산책로2",
  "https://via.placeholder.com/360x200/FF9800/FFFFFF?text=산책로3",
]

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const HEADER_HEIGHT = screenHeight * 0.08
const IMAGE_HEIGHT = screenHeight * 0.3
const MAP_HEIGHT = screenHeight * 0.2

export default function CourseDetailScreen({ navigation, route }) {
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  // 위치 권한 요청
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "위치 권한 요청",
            message: "플로깅을 위해 위치 권한이 필요합니다.",
            buttonNeutral: "나중에",
            buttonNegative: "거부",
            buttonPositive: "허용",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert("위치 권한이 필요합니다", "설정에서 위치 권한을 허용해주세요.");
      return;
    }

    setLocationLoading(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLocationLoading(false);
        console.log("📍 현재 위치:", { latitude, longitude });
      },
      (error) => {
        console.error("위치 가져오기 실패:", error);
        setLocationLoading(false);
        Alert.alert("위치 오류", "현재 위치를 가져올 수 없습니다.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // 🖼️ 이미지 배열 생성 함수
  const buildImageArray = (data) => {
    console.log('🖼️ [CourseDetailScreen] 이미지 배열 생성:', {
      img1: data.img1 ? '있음' : '없음',
      img2: data.img2 ? '있음' : '없음'
    });

    const images = [];
    
    // img1이 있으면 추가
    if (data.img1) {
      images.push(data.img1);
    }
    
    // img2가 있으면 추가
    if (data.img2) {
      images.push(data.img2);
    }
    
    console.log('📸 [CourseDetailScreen] 최종 이미지 배열:', images.length, '개');
    
    // 이미지가 하나도 없으면 더미 이미지 사용
    return images.length > 0 ? images : DUMMY_IMAGES;
  };

  // 코스 상세 정보 가져오기
  const fetchCourseDetail = async () => {
    try {
      setLoading(true)
      const courseId = route.params?.courseId || route.params?.trailId
      const fallbackData = route.params?.courseData

      console.log("📋 [CourseDetailScreen] 코스 상세 정보 로드 시작:")
      console.log("- courseId:", courseId)
      console.log("- fallbackData:", fallbackData ? '있음' : '없음')

      if (!courseId) {
        console.error("⚠️ [CourseDetailScreen] 코스 ID가 없습니다")
        setCourseData(null)
        return
      }

      try {
        // API에서 데이터 시도
        const data = await getTrailDetail(courseId)

        console.log("✅ [CourseDetailScreen] API에서 코스 상세 정보 로드 성공!")
        console.log("🔍 [CourseDetailScreen] API 응답 데이터:", {
          trailId: data.trailId,
          trailName: data.trailName,
          img1: data.img1 ? '있음' : '없음',
          img2: data.img2 ? '있음' : '없음',
          lengthDetail: data.lengthDetail,
          spotLatitude: data.spotLatitude,
          spotLongitude: data.spotLongitude
        });

        // 🖼️ 이미지 배열 생성
        const imageArray = buildImageArray(data);

        // API 응답 데이터를 화면에서 사용할 형태로 변환
        const transformedData = {
          id: data.trailId,
          name: data.trailName || "산책로 이름 없음",
          address: data.lotNumberAddress || "주소 정보 없음",
          region: data.cityName || "지역 정보 없음",
          duration: data.trackTime || "소요시간 정보 없음",
          length: data.lengthDetail ? `${data.lengthDetail}km` : data.length || "거리 정보 없음",
          level: data.difficultyLevel || "난이도 정보 없음",
          images: imageArray, // 🔥 img1, img2에서 생성한 이미지 배열
          toilet: data.toiletDescription || "화장실 정보 없음",
          tip: data.amenityDescription || "편의시설 정보 없음",
          description: data.descriptionDetail || "상세 설명 없음",
          trashReports: [], // 쓰레기 신고는 별도 API 필요
          trailTypeName: data.trailTypeName,
          spotLatitude: parseFloat(data.spotLatitude),
          spotLongitude: parseFloat(data.spotLongitude),
          reportCount: data.reportCount || 0,
        }

        console.log("📄 [CourseDetailScreen] API 데이터 변환 완료:", {
          name: transformedData.name,
          imagesCount: transformedData.images.length,
          length: transformedData.length,
          reportCount: transformedData.reportCount
        });
        setCourseData(transformedData)
        
      } catch (apiError) {
        console.log("⚠️ [CourseDetailScreen] API 호출 실패:")
        console.log("- API 에러:", apiError?.message)

        // API 실패 시 fallback 데이터 사용
        if (fallbackData) {
          console.log("🔄 [CourseDetailScreen] fallback 데이터 사용 시작")
          
          const dummyData = {
            id: fallbackData.id,
            name: fallbackData.name,
            address: fallbackData.address || "주소 정보 없음",
            region: fallbackData.region || "지역 정보 없음",
            duration: fallbackData.duration || "소요시간 정보 없음",
            length: fallbackData.distance || "거리 정보 없음",
            level: fallbackData.difficulty || "난이도 정보 없음",
            images: DUMMY_IMAGES, // fallback 시에는 더미 이미지 사용
            toilet: "화장실 정보가 제공되지 않습니다.",
            tip: "편의시설 정보가 제공되지 않습니다.",
            description: `${fallbackData.name}에서 즐기는 플로깅 코스입니다. 아름다운 자연 경관과 함께 건강한 운동을 즐겨보세요.`,
            trashReports: [],
            spotLatitude: fallbackData.latitude || 37.5665,
            spotLongitude: fallbackData.longitude || 126.978,
            reportCount: fallbackData.reportCount || 0,
          }
          console.log("✅ [CourseDetailScreen] fallback 데이터 사용:", dummyData.name)
          setCourseData(dummyData)
        } else {
          console.log("❌ [CourseDetailScreen] fallback 데이터도 없음")
          setCourseData(null)
        }
      }
    } catch (error) {
      console.error("⚠️ [CourseDetailScreen] 전체 처리 실패:", error)
      setCourseData(null)
    } finally {
      setLoading(false)
    }
  }

  // 이미지 자동 슬라이드
  useEffect(() => {
    if (courseData && courseData.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % courseData.images.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [courseData])

  useEffect(() => {
    fetchCourseDetail()
    getCurrentLocation() // 컴포넌트 마운트 시 현재 위치 가져오기
  }, [])

  const goBack = () => navigation.goBack()
  const goToMyPloggingRecords = () => navigation.navigate("내 플로깅 기록")

  // 플로깅 시작 함수 (거리 체크 포함)
  const startPlogging = async () => {
    if (!courseData) {
      Alert.alert("오류", "코스 정보를 불러올 수 없습니다.")
      return
    }

    // 현재 위치 확인
    if (!currentLocation) {
      Alert.alert(
        "위치 정보 필요",
        "현재 위치를 확인해주세요.",
        [
          { text: "위치 새로고침", onPress: getCurrentLocation },
          { text: "취소", style: "cancel" }
        ]
      )
      return
    }

    // 거리 계산
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      courseData.spotLatitude,
      courseData.spotLongitude
    )

    console.log(`🎯 [CourseDetailScreen] 산책로와의 거리: ${distance.toFixed(0)}m`)

    // 거리 체크
    if (distance > MAX_DISTANCE_TO_START) {
      Alert.alert(
        "산책로와 거리가 너무 멉니다",
        `현재 산책로에서 ${distance.toFixed(0)}m 떨어져 있습니다.\n${MAX_DISTANCE_TO_START}m 이내로 가까이 이동해주세요.`,
        [{ text: "확인" }]
      )
      return
    }

    // 거리가 적절하면 플로깅 시작 화면으로 이동
    navigation.navigate("PloggingStart", {
      selectedRoute: {
        id: courseData.id,
        name: courseData.name,
        location: courseData.address,
        difficulty: courseData.level,
        distance: courseData.length,
        duration: courseData.duration,
        latitude: courseData.spotLatitude,
        longitude: courseData.spotLongitude,
      },
      trailStartCoords: {
        latitude: courseData.spotLatitude,
        longitude: courseData.spotLongitude,
      },
      courseName: courseData.name,
      // 추후 API에서 실제 경로 데이터를 가져와야 함
      trailFullPath: [], // TODO: API에서 실제 경로 데이터 가져오기
    })
  }

  // 이미지 렌더링 함수
  const renderImageItem = ({ item, index }) => (
    <Image 
      source={{ uri: item }} 
      style={styles.courseImage}
      onError={(error) => {
        console.log('❌ [CourseDetailScreen] 이미지 로드 실패:', item, error);
      }}
      onLoad={() => {
        console.log('✅ [CourseDetailScreen] 이미지 로드 성공:', item);
      }}
    />
  )

  // 지도 렌더링 함수
  const renderMap = () => {
    const latitude = courseData?.spotLatitude || 37.5665
    const longitude = courseData?.spotLongitude || 126.978

    return (
      <MapView
        style={styles.mapView}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* 산책로 위치 마커 */}
        <Marker
          coordinate={{
            latitude: latitude,
            longitude: longitude,
          }}
          title={courseData?.name || "산책로"}
          description={courseData?.address || "위치"}
          pinColor="#418663"
        />
      </MapView>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>코스 정보 로딩중...</Text>
      </View>
    )
  }

  if (!courseData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={screenWidth * 0.15} color="#FF5722" />
        <Text style={styles.errorText}>코스 정보를 불러올 수 없습니다</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCourseDetail}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>산책로 정보</Text>
        <TouchableOpacity style={styles.userButton} onPress={goToMyPloggingRecords}>
          <Icon name="account" size={24} color="rgba(19, 18, 20, 0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Course Images */}
        <View style={styles.imageContainer}>
          <FlatList
            data={courseData.images}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth)
              setCurrentImageIndex(index)
            }}
          />

          {/* Image Indicators - 이미지가 2개 이상일 때만 표시 */}
          {courseData.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {courseData.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index ? styles.activeIndicator : styles.inactiveIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Course Info */}
        <View style={styles.courseInfoContainer}>
          <Text style={styles.courseName}>{courseData.name}</Text>
          <Text style={styles.courseAddress}>{courseData.address}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>지역</Text>
              <Text style={styles.infoValue}>{courseData.region}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>산책 소요시간</Text>
              <Text style={styles.infoValue}>{courseData.duration}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>산책로 길이</Text>
              <Text style={styles.infoValue}>{courseData.length}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>난이도</Text>
              <Text style={styles.infoValue}>{courseData.level}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Detail Info */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>상세 정보</Text>

          {/* Map */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Icon name="compass" size={20} color="#797982" />
              <Text style={styles.detailLabel}>지도</Text>
            </View>
            <View style={styles.mapContainer}>{renderMap()}</View>
            <Text style={styles.detailText}>{courseData.address}</Text>
          </View>

          {/* Toilet Info */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Icon name="human-male-female" size={20} color="#797982" />
              <Text style={styles.detailLabel}>화장실 정보</Text>
            </View>
            <Text style={styles.detailText}>{courseData.toilet}</Text>
          </View>

          {/* Amenity Info */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Icon name="cube" size={20} color="#797982" />
              <Text style={styles.detailLabel}>편의시설 정보</Text>
            </View>
            <Text style={styles.detailText}>{courseData.tip}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>설명</Text>
          <Text style={styles.description}>{courseData.description}</Text>
        </View>

        {/* Trash Reports */}
        <View style={styles.trashSection}>
          <View style={styles.trashHeader}>
            <Icon name="menu" size={24} color="#418663" />
            <Text style={styles.trashTitle}>제보된 쓰레기</Text>
            <Text style={styles.trashCount}>{courseData.reportCount}개</Text>
          </View>

          {courseData.reportCount > 0 ? (
            <Text style={styles.trashDescription}>
              이 산책로에 총 {courseData.reportCount}개의 쓰레기가 신고되었습니다.
            </Text>
          ) : (
            <Text style={styles.noTrashText}>현재 등록된 쓰레기 신고가 없습니다.</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* 위치 새로고침 버튼 */}
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            <Icon name="crosshairs-gps" size={20} color="#418663" />
            <Text style={styles.locationButtonText}>
              {locationLoading ? "위치 확인중..." : "내 위치 새로고침"}
            </Text>
          </TouchableOpacity>

          {/* 플로깅 시작 버튼 */}
          <TouchableOpacity style={styles.startPloggingButton} onPress={startPlogging}>
            <Icon name="play" size={20} color="#fff" />
            <Text style={styles.startPloggingButtonText}>이 코스로 플로깅 시작하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header Styles
  header: {
    height: HEADER_HEIGHT + 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING_H,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingTop: screenHeight * 0.05,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Pretendard",
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 30,
    color: "#333333",
    textAlign: "center",
  },
  userButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Image Container Styles
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: "relative",
  },
  courseImage: {
    width: screenWidth,
    height: IMAGE_HEIGHT,
    resizeMode: "cover",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#418663",
  },
  inactiveIndicator: {
    backgroundColor: "#C8DECB",
  },

  // Course Info Styles
  courseInfoContainer: {
    paddingHorizontal: PADDING_H,
    paddingVertical: 20,
  },
  courseName: {
    fontFamily: "Pretendard Variable",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 30,
    color: "#333333",
    marginBottom: 8,
  },
  courseAddress: {
    fontFamily: "Pretendard",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#999999",
    marginBottom: 20,
  },

  // Info Grid Styles
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoColumn: {
    width: "48%",
    marginBottom: 16,
  },
  infoLabel: {
    fontFamily: "Pretendard",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#999999",
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: "Pretendard",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
  },

  // Divider
  divider: {
    height: 4,
    backgroundColor: "rgba(170, 178, 200, 0.2)",
    marginVertical: 0,
  },

  // Detail Section Styles
  detailSection: {
    paddingHorizontal: PADDING_H,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontFamily: "Pretendard Variable",
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 25,
    color: "#333333",
    marginBottom: 20,
  },
  detailItem: {
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 16,
    color: "#797982",
    marginLeft: 8,
  },
  detailText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
    marginTop: 8,
  },

  // Map Styles
  mapContainer: {
    height: MAP_HEIGHT,
    borderRadius: 15,
    overflow: "hidden",
    marginVertical: 8,
  },
  mapView: {
    flex: 1,
  },

  // Description Section
  descriptionSection: {
    paddingHorizontal: PADDING_H,
    paddingVertical: 24,
    borderTopWidth: 4,
    borderTopColor: "rgba(170, 178, 200, 0.2)",
  },
  description: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
  },

  // Trash Section Styles
  trashSection: {
    paddingHorizontal: PADDING_H,
    paddingVertical: 24,
  },
  trashHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  trashTitle: {
    fontFamily: "Pretendard",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 24,
    color: "#999999",
    marginLeft: 8,
    flex: 1,
  },
  trashCount: {
    fontFamily: "Pretendard",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 24,
    color: "#2E2E2E",
  },
  trashDescription: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
    textAlign: "center",
    paddingVertical: 20,
  },
  noTrashText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: "#999999",
    textAlign: "center",
    paddingVertical: 20,
  },

  // Button Styles
  buttonContainer: {
    paddingHorizontal: PADDING_H,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  locationButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#418663",
  },
  locationButtonText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
    color: "#418663",
    marginLeft: 8,
  },
  startPloggingButton: {
    backgroundColor: "#418663",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(65, 134, 99, 0.3)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  startPloggingButtonText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
    marginLeft: 8,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: PADDING_H,
  },
  errorText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 18,
    color: "#FF5722",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#418663",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontFamily: "Pretendard Variable",
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
  },
});