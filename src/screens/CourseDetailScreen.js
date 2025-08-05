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
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const HEADER_HEIGHT = screenHeight * 0.08
const IMAGE_HEIGHT = screenHeight * 0.3
const MAP_HEIGHT = screenHeight * 0.2

// 더미 코스 데이터
const DUMMY_COURSE_DATA = {
  id: 1,
  name: "남산 녹색 둘레길",
  address: "충남 청양군 청양읍 적누리 산 18-52",
  region: "충남 청양군",
  duration: "4시간",
  length: "13.8km",
  level: "쉬움",
  images: ["../assets/course_detail1.jpg", "../assets/course_detail2.jpg", "../assets/course_detail3.jpg"],
  mapImage: "../assets/course_map.jpg",
  toilet: "생태공원, 적누리 마을회관, 벚꽃길 사거리",
  sunsetInfo: "서쪽으로 열린 해질녘 전망대에서 구경할 수 있습니다",
  tip: "식수보급처가 없으니 매점에서 구입하거나 사전준비",
  description:
    "357m의 남산을 중심으로 지형, 직누자수지, 급경, 탄천길 범위를 따라 형성된 또는 녹색 둘레길로 지역주민과 조깅족을 위한 길이다. 구간별 테마로 구분돼 4개 구간으로 구분하고 있다.\n\n①성곽길(4.2km) : 지형의 사계절 풍광,나비,청매,교교,희망이 등 설치물을 볼 수 있다.\n\n②녹색길(4.0km) : 직누자수지 따라 사면을 올라갈 수 있는 산책로가 감성 추억을 살 수 있다.\n\n③꽃길(1.8km) : 지하철 사당출입구에서 풍광까지 벚꽃이 장관이다.\n\n④고향길(2.9km) : 시원한 고향길을 느낄 수 있으며, 배웅의 터널과 청양 향교를 감상할 수 있다.",
  trashReports: [
    {
      id: 1,
      title: "풀숲 쓰레기",
      detail: "플라스틱병 외 7개",
      location: "성곽길 2km 지점",
      reportedAt: "2024-01-15",
    },
    {
      id: 2,
      title: "전봇대 옆 쓰레기",
      detail: "유리조각 외 3개",
      location: "녹색길 입구",
      reportedAt: "2024-01-14",
    },
    {
      id: 3,
      title: "길가 쓰레기",
      detail: "캔, 스낵 포장지 외 5개",
      location: "꽃길 중간 지점",
      reportedAt: "2024-01-13",
    },
  ],
}

export default function CourseDetailScreen({ navigation, route }) {
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // DB에서 코스 상세 데이터 가져오기
  const fetchCourseDetail = async () => {
    try {
      setLoading(true)

      // 실제 API 호출 (예시)
      // const courseId = route.params?.courseId || 1;
      // const response = await fetch(`https://your-api.com/api/courses/${courseId}`);
      // const data = await response.json();

      // 시뮬레이션: 80% 확률로 DB 데이터 존재
      const hasDataInDB = Math.random() > 0.2

      // 1.5초 로딩 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (hasDataInDB) {
        // DB에 데이터가 있는 경우
        setCourseData(DUMMY_COURSE_DATA)
      } else {
        // DB에 데이터가 없는 경우 기본 더미 데이터
        setCourseData({
          ...DUMMY_COURSE_DATA,
          name: "데이터를 불러올 수 없습니다",
          description: "네트워크 연결을 확인해주세요.",
        })
      }
    } catch (error) {
      console.error("Failed to fetch course detail:", error)
      setCourseData(DUMMY_COURSE_DATA)
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
          <Icon name="arrow-left" size={screenWidth * 0.06} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>산책로 정보</Text>
        <TouchableOpacity style={styles.userButton} onPress={goToMyPloggingRecords}>
          <Icon name="account" size={screenWidth * 0.06} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Course Images */}
        <View style={styles.imageContainer}>
          {/* <Image source={require(courseData.images[currentImageIndex])} style={styles.courseImage} /> */}
          {courseData.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {courseData.images.map((_, index) => (
                <View key={index} style={[styles.indicator, currentImageIndex === index && styles.activeIndicator]} />
              ))}
            </View>
          )}
        </View>

        {/* Course Info */}
        <View style={styles.courseInfoContainer}>
          <Text style={styles.courseName}>{courseData.name}</Text>
          <Text style={styles.courseAddress}>{courseData.address}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>지역</Text>
              <Text style={styles.infoValue}>{courseData.region}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>산책 소요시간</Text>
              <Text style={styles.infoValue}>{courseData.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>산책로 길이</Text>
              <Text style={styles.infoValue}>{courseData.length}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>난이도</Text>
              <Text style={[styles.infoValue, styles.difficultyValue]}>{courseData.level}</Text>
            </View>
          </View>
        </View>

        {/* Detail Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 정보</Text>

          {/* Map */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Icon name="map" size={screenWidth * 0.05} color="#666" />
              <Text style={styles.detailLabel}>지도</Text>
            </View>
            {/* <Image source={require(courseData.mapImage)} style={styles.mapImage} /> */}
            <Text style={styles.detailText}>{courseData.address}</Text>
          </View>

          {/* Sunset Info */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Icon name="weather-sunset" size={screenWidth * 0.05} color="#FF9800" />
              <Text style={styles.detailLabel}>해질 정보</Text>
            </View>
            <Text style={styles.detailText}>{courseData.sunsetInfo}</Text>
          </View>

          {/* Toilet Info */}
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Icon name="human-male-female" size={screenWidth * 0.05} color="#2196F3" />
              <Text style={styles.detailLabel}>화장실 정보</Text>
            </View>
            <Text style={styles.detailText}>{courseData.toilet}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설명</Text>
          <Text style={styles.description}>{courseData.description}</Text>
        </View>

        {/* Trash Reports */}
        <View style={styles.section}>
          <View style={styles.trashHeader}>
            <Icon name="delete" size={screenWidth * 0.05} color="#FF5722" />
            <Text style={styles.sectionTitle}>제보된 쓰레기 {courseData.trashReports.length}개</Text>
          </View>
          {courseData.trashReports.map((report) => (
            <View key={report.id} style={styles.trashCard}>
              <View style={styles.trashCardHeader}>
                <Text style={styles.trashTitle}>{report.title}</Text>
                <Text style={styles.trashDate}>{report.reportedAt}</Text>
              </View>
              <Text style={styles.trashDetail}>{report.detail}</Text>
              <Text style={styles.trashLocation}>📍 {report.location}</Text>
            </View>
          ))}
        </View>

        {/* Trash Bin Button */}
        <TouchableOpacity style={styles.trashBinButton} onPress={goToTrashInfo}>
          <Icon name="delete-outline" size={screenWidth * 0.05} color="#fff" />
          <Text style={styles.trashBinButtonText}>근처 쓰레기통 찾기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Loading & Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: screenWidth * 0.04,
    color: "#666",
    marginTop: PADDING_H / 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: PADDING_H,
  },
  errorText: {
    fontSize: screenWidth * 0.045,
    color: "#666",
    textAlign: "center",
    marginVertical: PADDING_H,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: PADDING_H,
    paddingVertical: PADDING_H / 2,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING_H,
    paddingTop: screenHeight * 0.06,
    paddingBottom: PADDING_H / 2,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "600",
    color: "#333",
  },
  userButton: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Scroll Container
  scrollContainer: {
    paddingBottom: PADDING_H * 2,
  },

  // Image Styles
  imageContainer: {
    position: "relative",
  },
  courseImage: {
    width: "100%",
    height: IMAGE_HEIGHT,
    resizeMode: "cover",
  },
  imageIndicators: {
    position: "absolute",
    bottom: PADDING_H,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeIndicator: {
    backgroundColor: "#4CAF50",
  },

  // Course Info Styles
  courseInfoContainer: {
    padding: PADDING_H,
    backgroundColor: "#fff",
  },
  courseName: {
    fontSize: screenWidth * 0.055,
    fontWeight: "700",
    color: "#333",
    marginBottom: PADDING_H / 4,
  },
  courseAddress: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    marginBottom: PADDING_H,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: PADDING_H / 2,
  },
  infoItem: {
    width: (screenWidth - PADDING_H * 2 - PADDING_H / 2) / 2,
    backgroundColor: "#F8F9FA",
    padding: PADDING_H / 2,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: screenWidth * 0.03,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
    color: "#333",
  },
  difficultyValue: {
    color: "#4CAF50",
  },

  // Section Styles
  section: {
    padding: PADDING_H,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "700",
    color: "#333",
    marginBottom: PADDING_H,
  },

  // Detail Item Styles
  detailItem: {
    marginBottom: PADDING_H,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: PADDING_H / 2,
  },
  detailLabel: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
    marginLeft: PADDING_H / 2,
  },
  detailText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    lineHeight: screenWidth * 0.05,
  },
  mapImage: {
    width: "100%",
    height: MAP_HEIGHT,
    borderRadius: 8,
    marginBottom: PADDING_H / 2,
    resizeMode: "cover",
  },

  // Description Styles
  description: {
    fontSize: screenWidth * 0.035,
    color: "#444",
    lineHeight: screenWidth * 0.05,
  },

  // Trash Report Styles
  trashHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: PADDING_H,
  },
  trashCard: {
    backgroundColor: "#F8F9FA",
    padding: PADDING_H,
    borderRadius: 12,
    marginBottom: PADDING_H / 2,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5722",
  },
  trashCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: PADDING_H / 3,
  },
  trashTitle: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
  },
  trashDate: {
    fontSize: screenWidth * 0.03,
    color: "#999",
  },
  trashDetail: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    marginBottom: PADDING_H / 3,
  },
  trashLocation: {
    fontSize: screenWidth * 0.03,
    color: "#888",
  },

  // Trash Bin Button Styles
  trashBinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    marginHorizontal: PADDING_H,
    paddingVertical: PADDING_H,
    borderRadius: 25,
    gap: PADDING_H / 2,
  },
  trashBinButtonText: {
    color: "#fff",
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
  },
})
