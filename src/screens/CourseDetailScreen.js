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
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
// 제대로 작동하는 지도를 위해 MapView만 import
import MapView, { Marker } from 'react-native-maps'
import { getTrailDetail } from "../API/trails"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 더미 이미지 배열 (여러 이미지 지원)
const DUMMY_IMAGES = [
  "https://via.placeholder.com/360x200/4CAF50/FFFFFF?text=남산1",
  "https://via.placeholder.com/360x200/2196F3/FFFFFF?text=남산2",
  "https://via.placeholder.com/360x200/FF9800/FFFFFF?text=남산3",
];

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const HEADER_HEIGHT = screenHeight * 0.08
const IMAGE_HEIGHT = screenHeight * 0.3
const MAP_HEIGHT = screenHeight * 0.2

// 더미 코스 데이터 - 실제 좌표 추가
const DUMMY_COURSES_DATA = {
  "1": {
    id: "1",
    name: "국립 중앙 박물관",
    address: "서울 용산구 서빙고로 137 국립중앙박물관",
    region: "서울",
    duration: "1시간30분",
    length: "7.1km",
    level: "쉬움",
    images: ["../assets/course_detail1.jpg"],
    mapImage: "../assets/course_map.jpg",
    toilet: "박물관 내부, 어린이박물관, 야외 정원",
    sunsetInfo: "한강이 내려다보이는 전망대에서 석양을 감상할 수 있습니다",
    tip: "박물관 내부에 카페와 레스토랑이 있어 휴식하기 좋습니다",
    description: "국립중앙박물관을 중심으로 한 문화와 자연이 어우러진 산책로입니다. 박물관 정원과 한강 조망 포인트를 지나며, 도심 속에서 여유로운 플로깅을 즐길 수 있습니다.\n\n①박물관 정원길(2.5km) : 사계절 아름다운 조경과 야외 전시물을 감상할 수 있습니다.\n\n②한강 전망길(3.1km) : 한강과 도심의 파노라마 뷰를 즐길 수 있는 구간입니다.\n\n③문화거리(1.5km) : 주변 문화시설과 카페거리를 둘러보는 코스입니다.",
    // 실제 국립중앙박물관 좌표 추가
    spotLatitude: 37.5240,
    spotLongitude: 126.9803,
    trashReports: [
      {
        id: 1,
        title: "정원 벤치 주변 쓰레기",
        detail: "음료수병, 과자봉지 외 3개",
        location: "박물관 정원 2구역",
        reportedAt: "2024-01-15",
      },
      {
        id: 2,
        title: "전망대 쓰레기",
        detail: "담배꽁초, 휴지 외 2개",
        location: "한강 전망 포인트",
        reportedAt: "2024-01-14",
      }
    ]
  },
  "2": {
    id: "2",
    name: "남산",
    address: "서울 중구 회현동1가",
    region: "서울",
    duration: "2시간",
    length: "5.2km",
    level: "어려움",
    images: ["../assets/course_detail2.jpg"],
    mapImage: "../assets/course_map2.jpg",
    toilet: "남산공원 관리사무소, N서울타워 주변, 팔각정",
    sunsetInfo: "N서울타워 전망대에서 서울 전경과 함께 석양을 감상할 수 있습니다",
    tip: "경사가 있는 구간이 많으니 편한 운동화 착용을 권장합니다",
    description: "서울의 대표적인 산책로인 남산을 중심으로 한 플로깅 코스입니다. 도심 속 자연을 만끽하며 서울 전경을 감상할 수 있는 특별한 경험을 제공합니다.\n\n①순환로(2.2km) : 남산공원의 아름다운 자연길을 따라 걷는 구간입니다.\n\n②타워길(1.8km) : N서울타워까지 이어지는 약간의 경사가 있는 구간입니다.\n\n③전망길(1.2km) : 서울 시내를 한눈에 볼 수 있는 전망 포인트들을 지나는 구간입니다.",
    // 남산 좌표 추가
    spotLatitude: 37.5512,
    spotLongitude: 126.9882,
    trashReports: [
      {
        id: 1,
        title: "등산로 쓰레기",
        detail: "플라스틱병, 에너지바 포장지 외 5개",
        location: "남산 순환로 중간 지점",
        reportedAt: "2024-01-16",
      }
    ]
  },
  "3": {
    id: "3",
    name: "한강공원 여의도",
    address: "서울 영등포구 여의동로 330",
    region: "서울",
    duration: "2시간30분",
    length: "8.5km",
    level: "쉬움",
    images: ["../assets/course_detail3.jpg"],
    mapImage: "../assets/course_map3.jpg",
    toilet: "한강공원 화장실 여러 곳, 여의도 공원 내부",
    sunsetInfo: "한강을 바라보며 감상하는 석양이 매우 아름답습니다",
    tip: "자전거 도로와 구분되어 있으니 안전에 주의하세요. 편의점과 카페가 많아 휴식하기 좋습니다",
    description: "한강을 따라 이어지는 대표적인 도심 속 자연 산책로입니다. 넓은 강변과 여의도공원을 함께 즐길 수 있는 평탄한 코스로 초보자에게 추천합니다.\n\n①강변길(4.2km) : 한강을 바라보며 걷는 시원한 구간입니다.\n\n②여의도공원(2.8km) : 계절별 꽃과 나무를 감상할 수 있는 공원 구간입니다.\n\n③선착장길(1.5km) : 유람선과 카페가 있는 활기찬 구간입니다.",
    // 여의도 한강공원 좌표 추가
    spotLatitude: 37.5286,
    spotLongitude: 126.9334,
    trashReports: [
      {
        id: 1,
        title: "피크닉 쓰레기",
        detail: "일회용 그릇, 비닐봉지 외 8개",
        location: "여의도공원 잔디광장",
        reportedAt: "2024-01-17",
      },
      {
        id: 2,
        title: "강변 쓰레기",
        detail: "캔, 페트병 외 6개",
        location: "한강공원 벤치 구역",
        reportedAt: "2024-01-16",
      }
    ]
  },
  "4": {
    id: "4",
    name: "청계천 산책로",
    address: "서울 중구 청계천로 1",
    region: "서울",
    duration: "1시간45분",
    length: "6.3km",
    level: "쉬움",
    images: ["../assets/course_detail4.jpg"],
    mapImage: "../assets/course_map4.jpg",
    toilet: "청계천 곳곳의 공중화장실, 주변 상가 화장실 이용 가능",
    sunsetInfo: "도심 속 하천에서 감상하는 특별한 석양 풍경",
    tip: "주변에 맛집과 카페가 많아 플로깅 후 식사하기 좋습니다",
    description: "서울 도심을 가로지르는 청계천을 따라 걷는 도시형 산책로입니다. 역사와 현대가 공존하는 독특한 풍경을 감상하며 여유로운 플로깅을 즐길 수 있습니다.\n\n①광교구간(2.1km) : 청계천 복원의 시작점부터 시작하는 역사적 구간입니다.\n\n②문화구간(2.8km) : 다양한 조형물과 문화시설을 지나는 구간입니다.\n\n③자연구간(1.4km) : 상대적으로 녹지가 많은 상류 구간입니다.",
    // 청계천 좌표 추가
    spotLatitude: 37.5694,
    spotLongitude: 126.9785,
    trashReports: [
      {
        id: 1,
        title: "하천변 쓰레기",
        detail: "음식 포장지, 일회용컵 외 4개",
        location: "청계천 3교 근처",
        reportedAt: "2024-01-15",
      }
    ]
  }
};

export default function CourseDetailScreen({ navigation, route }) {
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nearbyPlaces, setNearbyPlaces] = useState({ restaurants: [], toilets: [] }) // 구글맵 Places API 데이터
  const [markerData, setMarkerData] = useState({ restaurants: [], toilets: [] }) // 마커용 데이터

  // DB에서 코스 상세 데이터 가져오기
  const fetchCourseDetail = async () => {
    try {
      setLoading(true)
      const courseId = route.params?.courseId || route.params?.trailId
      const fallbackData = route.params?.courseData // 추천 화면에서 전달받은 더미 데이터

      console.log("📋 [CourseDetailScreen] 코스 상세 정보 로드 시작:")
      console.log("- route.params:", route.params)
      console.log("- courseId:", courseId)

      if (!courseId) {
        console.error("❌ [CourseDetailScreen] 코스 ID가 없습니다")
        setCourseData(null)
        return
      }

      try {
        // 먼저 API에서 데이터 시도
        const data = await getTrailDetail(courseId)
        
        console.log("✅ [CourseDetailScreen] API에서 코스 상세 정보 로드 성공!")
        console.log("- 원본 데이터:", data)
        
        // API 응답 데이터를 화면에서 사용할 형태로 변환
        const transformedData = {
          id: data.trailId,
          name: data.trailName || "산책로 이름 없음",
          address: data.lotNumberAddress || "주소 정보 없음",
          region: data.cityName || "지역 정보 없음",
          duration: data.trackTime || "소요시간 정보 없음",
          length: data.length || "거리 정보 없음",
          level: data.difficultyLevel || "난이도 정보 없음",
          images: [], // 이미지는 별도 처리 필요
          mapImage: null, // 지도 이미지는 별도 처리 필요
          toilet: data.toiletDescription || "화장실 정보 없음",
          sunsetInfo: data.optionDescription || "추가 정보 없음",
          tip: data.amenityDescription || "편의시설 정보 없음",
          description: data.descriptionDetail || "상세 설명 없음",
          trashReports: [], // 쓰레기 신고는 별도 API 필요
          // 추가 정보
          trailTypeName: data.trailTypeName,
          spotLatitude: data.spotLatitude,
          spotLongitude: data.spotLongitude,
          reportCount: data.reportCount
        }
        
        console.log("🔄 [CourseDetailScreen] API 데이터 변환 완료:", transformedData)
        setCourseData(transformedData)
        
      } catch (apiError) {
        console.log("⚠️ [CourseDetailScreen] API 호출 실패, 더미 데이터 사용:")
        console.log("- API 에러:", apiError?.message)
        
        // API 실패 시 더미 데이터 사용
        let dummyData = null;
        
        // 1. 먼저 더미 데이터베이스에서 찾기
        if (DUMMY_COURSES_DATA[courseId]) {
          dummyData = DUMMY_COURSES_DATA[courseId];
          console.log("✅ [CourseDetailScreen] 더미 데이터베이스에서 데이터 발견:", dummyData.name);
        }
        // 2. 추천 화면에서 전달받은 데이터 사용
        else if (fallbackData) {
          dummyData = {
            id: fallbackData.id,
            name: fallbackData.name,
            address: fallbackData.address,
            region: fallbackData.region,
            duration: fallbackData.duration,
            length: fallbackData.distance,
            level: fallbackData.difficulty,
            images: [fallbackData.image],
            mapImage: "../assets/course_map.jpg",
            toilet: "화장실 정보가 제공되지 않습니다.",
            sunsetInfo: "석양 감상 포인트 정보가 제공되지 않습니다.",
            tip: "편의시설 정보가 제공되지 않습니다.",
            description: `${fallbackData.name}에서 즐기는 플로깅 코스입니다. 아름다운 자연 경관과 함께 건강한 운동을 즐겨보세요.`,
            trashReports: [
              {
                id: 1,
                title: "일반 쓰레기",
                detail: `쓰레기 ${fallbackData.reportCount}개 신고됨`,
                location: fallbackData.name,
                reportedAt: "2024-01-15",
              }
            ],
            reportCount: fallbackData.reportCount
          };
          console.log("✅ [CourseDetailScreen] 추천 화면 데이터 사용:", dummyData.name);
        }
        // 3. 기본 더미 데이터 사용
        else {
          dummyData = DUMMY_COURSES_DATA["1"]; // 기본값으로 첫 번째 코스 사용
          console.log("✅ [CourseDetailScreen] 기본 더미 데이터 사용:", dummyData.name);
        }
        
        setCourseData(dummyData);
      }
      
    } catch (error) {
      console.error("❌ [CourseDetailScreen] 전체 처리 실패:")
      console.error("- 에러:", error)
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
      }, 4000) // 4초마다 이미지 변경

      return () => clearInterval(interval)
    }
  }, [courseData])

  useEffect(() => {
    fetchCourseDetail()
  }, [])

  const goToTrashInfo = () => navigation.navigate("TrashCanInfo")
  const goBack = () => navigation.goBack()
  const goToMyPloggingRecords = () => navigation.navigate("내 플로깅 기록")
  
  const startPlogging = () => {
    if (courseData) {
      navigation.navigate("PloggingStart", {
        selectedRoute: {
          id: courseData.id,
          name: courseData.name,
          location: courseData.address,
          difficulty: courseData.level,
          distance: courseData.length,
          duration: courseData.duration,
          latitude: courseData.spotLatitude || 37.5665, // 기본값 설정
          longitude: courseData.spotLongitude || 126.978 // 기본값 설정
        },
        routeName: courseData.name,
        routeLocation: courseData.address,
        courseName: courseData.name
      })
    }
  }

  // 구글 Places API를 사용한 실제 주변 시설 검색 - CORS 문제 해결
  const searchNearbyPlaces = async (latitude, longitude) => {
    try {
      console.log('[CourseDetailScreen] 구글 Places API로 주변 시설 검색 시작:', { latitude, longitude });
      
      // React Native에서는 직접 Places API 호출이 CORS 문제로 막힘
      // 대신 프록시 서버나 네이티브 라이브러리를 사용해야 함
      console.warn('[CourseDetailScreen] ⚠️ 브라우저 CORS 정책으로 인해 Places API 직접 호출 불가');
      console.log('[CourseDetailScreen] 📍 지역별 더미 데이터로 대체합니다');
      
      // 즉시 폴백 데이터 사용 (API 호출 시도하지 않음)
      throw new Error('CORS 정책으로 인한 API 호출 제한');
      
    } catch (error) {
      console.log('[CourseDetailScreen] 📍 폴백: 지역별 실제 정보 기반 더미 데이터 사용');
      
      const locationName = courseData?.name || "이 지역";
      
      // 실제 지역 정보를 바탕으로 한 더미 데이터
      let fallbackRestaurants, fallbackToilets, restaurantMarkers, toiletMarkers;
      
      if (courseData?.name?.includes('박물관') || courseData?.name?.includes('국립 중앙 박물관')) {
        fallbackRestaurants = "박물관 내부 카페테리아 ★4.2, GS25 박물관점, 용산 맛집거리 (도보 10분), 아이파크몰 푸드코트";
        fallbackToilets = "박물관 1층·2층·3층 화장실, 야외 정원 공중화장실, 용산가족공원 화장실";
        
        restaurantMarkers = [
          {
            id: 'museum_cafe_1',
            coordinate: { latitude: latitude + 0.0008, longitude: longitude + 0.0005 },
            title: '박물관 카페테리아',
            description: '내부 카페 • 평점: ★4.2',
            type: 'restaurant'
          },
          {
            id: 'museum_gs25_1',
            coordinate: { latitude: latitude - 0.0005, longitude: longitude + 0.0008 },
            title: 'GS25 박물관점',
            description: '편의점 • 24시간 운영',
            type: 'restaurant'
          },
          {
            id: 'museum_restaurant_1',
            coordinate: { latitude: latitude + 0.0012, longitude: longitude - 0.0003 },
            title: '용산 맛집거리',
            description: '음식점 • 도보 10분',
            type: 'restaurant'
          }
        ];
        
        toiletMarkers = [
          {
            id: 'museum_toilet_1',
            coordinate: { latitude: latitude + 0.0003, longitude: longitude - 0.0002 },
            title: '박물관 1층 화장실',
            description: '메인 화장실',
            type: 'toilet'
          },
          {
            id: 'museum_toilet_2',
            coordinate: { latitude: latitude - 0.0002, longitude: longitude + 0.0004 },
            title: '야외 정원 화장실',
            description: '공중화장실',
            type: 'toilet'
          }
        ];
        
      } else if (courseData?.name?.includes('남산')) {
        fallbackRestaurants = "N서울타워 레스토랑 ★4.1, 남산 매점 3곳, 케이블카 매점, 자판기 다수, 명동 맛집 (하산 후)";
        fallbackToilets = "N서울타워 화장실, 남산공원 관리사무소, 팔각정 화장실, 케이블카역 화장실";
        
        restaurantMarkers = [
          {
            id: 'namsan_tower_restaurant',
            coordinate: { latitude: latitude + 0.0005, longitude: longitude + 0.0003 },
            title: 'N서울타워 레스토랑',
            description: '레스토랑 • 평점: ★4.1',
            type: 'restaurant'
          },
          {
            id: 'namsan_store_1',
            coordinate: { latitude: latitude - 0.0008, longitude: longitude + 0.0006 },
            title: '남산 매점',
            description: '매점 • 등산용품',
            type: 'restaurant'
          }
        ];
        
        toiletMarkers = [
          {
            id: 'namsan_tower_toilet',
            coordinate: { latitude: latitude + 0.0004, longitude: longitude + 0.0002 },
            title: 'N서울타워 화장실',
            description: '타워 내부 화장실',
            type: 'toilet'
          },
          {
            id: 'namsan_management_toilet',
            coordinate: { latitude: latitude - 0.0006, longitude: longitude + 0.0005 },
            title: '남산공원 관리사무소',
            description: '공원 화장실',
            type: 'toilet'
          }
        ];
        
      } else if (courseData?.name?.includes('한강')) {
        fallbackRestaurants = "한강공원 매점 5곳, 편의점 3곳, 치킨·피자 배달 가능, 여의도 카페거리, 63빌딩 푸드코트";
        fallbackToilets = "한강공원 화장실 여러 곳, 여의도공원 내부 화장실, 63빌딩 공중화장실";
        
        restaurantMarkers = [
          {
            id: 'hangang_store_1',
            coordinate: { latitude: latitude + 0.0006, longitude: longitude + 0.0004 },
            title: '한강공원 매점',
            description: '매점 • 음료수, 라면',
            type: 'restaurant'
          },
          {
            id: 'hangang_convenience_1',
            coordinate: { latitude: latitude - 0.0004, longitude: longitude + 0.0007 },
            title: '편의점 CU',
            description: '편의점 • 24시간',
            type: 'restaurant'
          }
        ];
        
        toiletMarkers = [
          {
            id: 'hangang_toilet_1',
            coordinate: { latitude: latitude + 0.0003, longitude: longitude - 0.0003 },
            title: '한강공원 화장실',
            description: '공원 공중화장실',
            type: 'toilet'
          },
          {
            id: 'yeouido_toilet_1',
            coordinate: { latitude: latitude - 0.0005, longitude: longitude + 0.0006 },
            title: '여의도공원 화장실',
            description: '공원 내부 화장실',
            type: 'toilet'
          }
        ];
        
      } else {
        // 일반적인 경우
        fallbackRestaurants = `${locationName} 주변 매점·카페 정보 (실시간 데이터 로딩 중...)`;
        fallbackToilets = `${locationName} 주변 화장실 정보 (실시간 데이터 로딩 중...)`;
        
        restaurantMarkers = [
          {
            id: 'general_store_1',
            coordinate: { latitude: latitude + 0.0005, longitude: longitude + 0.0003 },
            title: '주변 편의점',
            description: '편의점 • 위치 확인 중',
            type: 'restaurant'
          }
        ];
        
        toiletMarkers = [
          {
            id: 'general_toilet_1',
            coordinate: { latitude: latitude - 0.0003, longitude: longitude + 0.0005 },
            title: '공중화장실',
            description: '화장실 • 위치 확인 중',
            type: 'toilet'
          }
        ];
      }
      
      setNearbyPlaces({
        restaurants: fallbackRestaurants,
        toilets: fallbackToilets
      });
      
      setMarkerData({
        restaurants: restaurantMarkers,
        toilets: toiletMarkers
      });
      
      console.log('[CourseDetailScreen] ✅ 지역별 더미 데이터 적용 완료:', {
        location: locationName,
        restaurantMarkers: restaurantMarkers.length,
        toiletMarkers: toiletMarkers.length
      });
    }
  };

  // 코스 데이터가 로드된 후 주변 시설 검색
  useEffect(() => {
    if (courseData?.spotLatitude && courseData?.spotLongitude) {
      searchNearbyPlaces(
        parseFloat(courseData.spotLatitude),
        parseFloat(courseData.spotLongitude)
      );
    }
  }, [courseData])

  // 이미지 렌더링 함수
  const renderImageItem = ({ item, index }) => (
    <Image 
      source={{ uri: item || DUMMY_IMAGES[index % DUMMY_IMAGES.length] }} 
      style={styles.courseImage} 
    />
  );

  // 구글맵 컴포넌트 - 매점/화장실 마커 추가
  const renderMap = () => {
    // DB에서 받은 좌표 또는 기본 좌표 사용
    const latitude = courseData?.spotLatitude ? parseFloat(courseData.spotLatitude) : 37.5665;
    const longitude = courseData?.spotLongitude ? parseFloat(courseData.spotLongitude) : 126.978;
    
    console.log('[CourseDetailScreen] 지도 렌더링:', { 
      latitude, 
      longitude,
      spotLatitude: courseData?.spotLatitude,
      spotLongitude: courseData?.spotLongitude,
      마커개수: {
        매점: markerData.restaurants.length,
        화장실: markerData.toilets.length
      }
    });
    
    return (
      <MapView
        style={styles.mapView}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        onMapReady={() => {
          console.log('[CourseDetailScreen] 지도 준비 완료');
        }}
        onError={(error) => {
          console.error('[CourseDetailScreen] 지도 오류:', error);
        }}
      >
        {/* 산책로 위치 마커 (메인) */}
        <Marker
          coordinate={{
            latitude: latitude,
            longitude: longitude,
          }}
          title={courseData?.name || "산책로"}
          description={courseData?.address || "위치"}
          pinColor="#418663"
        />

        {/* 매점/카페 마커들 */}
        {markerData.restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={restaurant.coordinate}
            title={restaurant.title}
            description={restaurant.description}
            pinColor="#FF9800" // 주황색으로 구분
          >
            <View style={styles.customMarker}>
              <Icon name="local-cafe" size={20} color="#FF9800" />
            </View>
          </Marker>
        ))}

        {/* 화장실 마커들 */}
        {markerData.toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            coordinate={toilet.coordinate}
            title={toilet.title}
            description={toilet.description}
            pinColor="#2196F3" // 파란색으로 구분
          >
            <View style={styles.customMarker}>
              <Icon name="wc" size={20} color="#2196F3" />
            </View>
          </Marker>
        ))}
      </MapView>
    );
  };

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
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          {/* Status bar icons would go here */}
        </View>
      </View>

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
        {/* Course Images with Horizontal Scroll */}
        <View style={styles.imageContainer}>
          <FlatList
            data={courseData.images.length > 0 ? courseData.images : DUMMY_IMAGES}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
          />
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {(courseData.images.length > 0 ? courseData.images : DUMMY_IMAGES).map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  currentImageIndex === index ? styles.activeIndicator : styles.inactiveIndicator
                ]} 
              />
            ))}
          </View>

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}
            </Text>
          </View>
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
            <View style={styles.mapContainer}>
              {renderMap()}
            </View>
            <Text style={styles.detailText}>{courseData.address}</Text>
          </View>

          {/* Amenity Info - 구글 Places API 실제 데이터 사용 */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Icon name="cube" size={20} color="#797982" />
              <Text style={styles.detailLabel}>주변 매점 정보</Text>
            </View>
            <Text style={styles.detailText}>
              {nearbyPlaces.restaurants}
            </Text>
            <Text style={styles.markerInfo}>
              🟠 지도에서 주황색 마커로 실제 위치를 확인하세요
            </Text>
          </View>

          {/* Toilet Info - 구글 Places API 실제 데이터 사용 */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Image 
                // source={require('../assets/toilet-pictogram.png')} 
                style={styles.toiletIcon}
              />
              <Text style={styles.detailLabel}>주변 화장실 정보</Text>
            </View>
            <Text style={styles.detailText}>
              {nearbyPlaces.toilets}
            </Text>
            <Text style={styles.markerInfo}>
              🔵 지도에서 파란색 마커로 실제 위치를 확인하세요
            </Text>
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
            <Text style={styles.trashCount}>{courseData.trashReports?.length || 0}개</Text>
          </View>
          
          {courseData.trashReports && courseData.trashReports.length > 0 ? (
            <View style={styles.trashCard}>
              {courseData.trashReports.map((report) => (
                <View key={report.id} style={styles.trashItem}>
                  <Text style={styles.trashItemTitle}>{report.title}</Text>
                  <Text style={styles.trashItemDetail}>{report.detail}</Text>
                  <Text style={styles.trashItemLocation}>📍 {report.location}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noTrashText}>현재 등록된 쓰레기 신고가 없습니다.</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.startPloggingButton} onPress={() => startPlogging()}>
            <Icon name="play" size={20} color="#fff" />
            <Text style={styles.startPloggingButtonText}>이 코스로 플로깅 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.trashBinButton} onPress={goToTrashInfo}>
            <Text style={styles.trashBinButtonText}>근처 쓰레기통 찾기</Text>
            <Image 
              source={require('../assets/Vector.png')} 
              style={styles.vectorIcon}
            />
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

  // Status Bar
  statusBar: {
    height: 44,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  statusTime: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    color: '#090A0A',
  },
  statusIcons: {
    flexDirection: "row",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 20,
    color: '#333333',
  },
  userButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Image Container
  imageContainer: {
    position: "relative",
  },
  courseImage: {
    width: screenWidth,
    height: 200,
    resizeMode: "cover",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 15,
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
    marginHorizontal: 6,
  },
  activeIndicator: {
    backgroundColor: "#418663",
  },
  inactiveIndicator: {
    backgroundColor: "#C8DECB",
  },
  imageCounter: {
    position: "absolute",
    left: 21,
    top: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  imageCounterText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Course Info
  courseInfoContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  courseName: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 25,
    color: '#333333',
    marginBottom: 8,
  },
  courseAddress: {
    fontFamily: 'Pretendard',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 30,
    color: '#999999',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontFamily: 'Pretendard',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 30,
    color: '#999999',
    textAlign: 'center',
  },
  infoValue: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 30,
    color: '#333333',
    textAlign: 'center',
  },

  // Divider
  divider: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(170, 178, 200, 0.2)',
  },

  // Detail Section
  detailSection: {
    paddingHorizontal: 19,
    paddingTop: 25,
    alignItems: 'center', // 전체 섹션 중앙정렬
  },
  sectionTitle: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 25,
    color: '#333333',
    marginBottom: 20,
    alignSelf: 'flex-start', // 제목은 왼쪽 정렬 유지
  },
  detailItem: {
    marginBottom: 25,
    alignItems: 'center', // 각 항목 중앙정렬
    width: '100%',
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: 'center', // 헤더 중앙정렬
  },
  detailLabel: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#797982',
    marginLeft: 8,
  },
  detailText: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 16,
    color: '#797982',
    textAlign: 'center', // 텍스트 중앙정렬
  },

  // Map - 크기 확대
  mapContainer: {
    width: screenWidth * 0.9, // 화면 너비의 90%로 확대
    height: 180, // 높이도 확대 (기존 108 → 180)
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
  },
  mapView: {
    flex: 1,
    borderRadius: 15,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
  },
  mapPlaceholderText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  // Toilet Icon
  toiletIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  // Description Section - 중앙정렬 추가
  descriptionSection: {
    paddingHorizontal: 19,
    paddingTop: 25,
    alignItems: 'center', // 설명 섹션도 중앙정렬
  },
  description: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 20,
    color: '#333333',
    width: 280,
    textAlign: 'center', // 설명 텍스트 중앙정렬
  },

  // 플로깅 시작 버튼 추가
  startPloggingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#418663",
    borderRadius: 30,
    paddingVertical: 15,
    width: 240,
    height: 50,
    marginBottom: 10,
  },
  startPloggingButtonText: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 5,
  },

  // Trash Section
  trashSection: {
    paddingHorizontal: 19,
    paddingTop: 25,
  },
  trashHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  trashTitle: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 30,
    color: '#999999',
    marginLeft: 8,
  },
  trashCount: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 30,
    color: '#2E2E2E',
    marginLeft: 8,
  },
  trashCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "rgba(190, 190, 190, 0.25)",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    width: 312,
    marginBottom: 20,
  },
  trashItem: {
    marginBottom: 15,
  },
  trashItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trashItemDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  trashItemLocation: {
    fontSize: 10,
    color: '#888',
  },
  noTrashText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Button Container
  buttonContainer: {
    paddingHorizontal: 59,
    paddingVertical: 30,
  },
  trashBinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333333",
    borderRadius: 30,
    paddingVertical: 15,
    width: 240,
    height: 50,
  },
  trashBinButtonText: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
    color: '#FFFFFF',
    marginRight: 10,
  },
  vectorIcon: {
    width: 24,
    height: 18,
    resizeMode: 'contain',
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // 커스텀 마커 스타일
  customMarker: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // 마커 안내 텍스트
  markerInfo: {
    fontFamily: 'Pretendard Variable',
    fontWeight: '500',
    fontSize: 9,
    lineHeight: 14,
    color: '#418663',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
