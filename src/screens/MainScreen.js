"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const ICON_SIZE = screenWidth * 0.15
const BANNER_HEIGHT = screenHeight * 0.22
const PICK_CARD_WIDTH = screenWidth * 0.45
const PICK_IMAGE_HEIGHT = PICK_CARD_WIDTH * 0.7

// 더미 데이터
const DUMMY_TODAY_DATA = {
  timeSpent: 0,
  targetTime: 60, // 1시간 = 60분
  distance: 0.0,
  targetDistance: 3.0,
  trashCount: 0,
}

const DUMMY_REALTIME_DATA = {
  isActive: true,
  currentTime: 25, // 현재 25분
  targetTime: 60, // 목표 60분
  currentDistance: 1.2, // 현재 1.2km
  targetDistance: 3.0, // 목표 3km
  participants: 12, // 현재 참여자 수
}

// 추천 코스 더미 데이터
const DUMMY_RECOMMENDED_COURSES = [
  {
    id: 1,
    name: "국립 중앙 박물관",
    distance: "7.1km",
    duration: "1시간30분",
    image: "../assets/course1.jpg",
    tags: ["가까운 곳", "문화시설"],
    trashLevel: "보통",
    difficulty: "쉬움",
  },
  {
    id: 2,
    name: "남산 서울타워",
    distance: "5.2km",
    duration: "1시간15분",
    image: "../assets/course2.jpg",
    tags: ["가까운 곳", "관광명소"],
    trashLevel: "적음",
    difficulty: "보통",
  },
  {
    id: 3,
    name: "한강공원 여의도",
    distance: "8.5km",
    duration: "2시간",
    image: "../assets/course3.jpg",
    tags: ["쓰레기 많은 곳", "공원"],
    trashLevel: "많음",
    difficulty: "쉬움",
  },
  {
    id: 4,
    name: "청계천 산책로",
    distance: "6.3km",
    duration: "1시간45분",
    image: "../assets/course4.jpg",
    tags: ["가까운 곳", "도심"],
    trashLevel: "보통",
    difficulty: "쉬움",
  },
  {
    id: 5,
    name: "올림픽공원",
    distance: "9.2km",
    duration: "2시간30분",
    image: "../assets/course5.jpg",
    tags: ["쓰레기 많은 곳", "공원"],
    trashLevel: "많음",
    difficulty: "어려움",
  },
  {
    id: 6,
    name: "북한산 둘레길",
    distance: "12.1km",
    duration: "3시간",
    image: "../assets/course6.jpg",
    tags: ["자연", "산"],
    trashLevel: "적음",
    difficulty: "어려움",
  },
]

export default function MainScreen({ navigation }) {
  const [selectedTag, setSelectedTag] = useState("가까운 곳")
  const [todayData, setTodayData] = useState(DUMMY_TODAY_DATA)
  const [realtimeData, setRealtimeData] = useState(DUMMY_REALTIME_DATA)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)

  // Progress Bar 컴포넌트
  const ProgressBar = ({ progress, color = "#4CAF50", height = 6 }) => {
    return (
      <View style={[styles.progressBarContainer, { height }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    )
  }

  // 네비게이션 함수들
  const goToRealtimePlogging = () => navigation.navigate("RealtimePlogging")
  const goToRecommend = () => navigation.navigate("추천 코스")
  const goToReport = () => navigation.navigate("쓰레기 제보")
  const goToPlogging = () => navigation.navigate("PloggingStart")
  const goToTrashBin = () => navigation.navigate("TrashCanInfo")
  const goToMyPloggingRecords = () => navigation.navigate("내 플로깅 기록")

  // DB에서 오늘의 플로깅 데이터 가져오기
  const fetchTodayData = async () => {
    try {
      setLoading(true)

      // 실제 API 호출 (예시)
      // const response = await fetch('https://your-api.com/api/plogging/today');
      // const data = await response.json();

      // 시뮬레이션: 50% 확률로 DB 데이터 존재
      const hasDataInDB = Math.random() > 0.5

      // 2초 로딩 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (hasDataInDB) {
        // DB에 데이터가 있는 경우
        const dbData = {
          timeSpent: 45, // 45분
          targetTime: 60,
          distance: 2.3,
          targetDistance: 3.0,
          trashCount: 7,
        }
        setTodayData(dbData)
      } else {
        // DB에 데이터가 없으면 더미 데이터 사용
        setTodayData(DUMMY_TODAY_DATA)
      }
    } catch (error) {
      console.error("Failed to fetch today data:", error)
      // 에러 발생시 더미 데이터 사용
      setTodayData(DUMMY_TODAY_DATA)
    } finally {
      setLoading(false)
    }
  }

  // DB에서 추천 코스 데이터 가져오기
  const fetchRecommendedCourses = async () => {
    try {
      setCoursesLoading(true)

      // 실제 API 호출 (예시)
      // const response = await fetch('https://your-api.com/api/courses/recommended');
      // const data = await response.json();

      // 시뮬레이션: 70% 확률로 DB 데이터 존재
      const hasCoursesInDB = Math.random() > 0.3

      // 1.5초 로딩 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (hasCoursesInDB) {
        // DB에 데이터가 있는 경우 (실제로는 API에서 받아온 데이터)
        const dbCourses = [
          {
            id: 1,
            name: "국립 중앙 박물관",
            distance: "7.1km",
            duration: "1시간30분",
            image: "../assets/course1.jpg",
            tags: ["가까운 곳", "문화시설"],
            trashLevel: "보통",
            difficulty: "쉬움",
          },
          {
            id: 2,
            name: "남산 서울타워",
            distance: "5.2km",
            duration: "1시간15분",
            image: "../assets/course2.jpg",
            tags: ["가까운 곳", "관광명소"],
            trashLevel: "적음",
            difficulty: "보통",
          },
          {
            id: 3,
            name: "한강공원 여의도",
            distance: "8.5km",
            duration: "2시간",
            image: "../assets/course3.jpg",
            tags: ["쓰레기 많은 곳", "공원"],
            trashLevel: "많음",
            difficulty: "쉬움",
          },
          {
            id: 4,
            name: "청계천 산책로",
            distance: "6.3km",
            duration: "1시간45분",
            image: "../assets/course4.jpg",
            tags: ["가까운 곳", "도심"],
            trashLevel: "보통",
            difficulty: "쉬움",
          },
        ]
        setRecommendedCourses(dbCourses)
      } else {
        // DB에 데이터가 없으면 더미 데이터 사용
        setRecommendedCourses(DUMMY_RECOMMENDED_COURSES)
      }
    } catch (error) {
      console.error("Failed to fetch recommended courses:", error)
      // 에러 발생시 더미 데이터 사용
      setRecommendedCourses(DUMMY_RECOMMENDED_COURSES)
    } finally {
      setCoursesLoading(false)
    }
  }

  // 실시간 플로깅 데이터 업데이트
  const updateRealtimeData = () => {
    setRealtimeData((prev) => ({
      ...prev,
      currentTime: Math.min(prev.currentTime + 0.2, prev.targetTime),
      currentDistance: Math.min(prev.currentDistance + 0.02, prev.targetDistance),
    }))
  }

  // 태그별 코스 필터링
  const getFilteredCourses = () => {
    if (selectedTag === "가까운 곳") {
      return recommendedCourses.filter((course) => course.tags.includes("가까운 곳"))
    } else if (selectedTag === "쓰레기 많은 곳") {
      return recommendedCourses.filter((course) => course.tags.includes("쓰레기 많은 곳"))
    }
    return recommendedCourses
  }

  useEffect(() => {
    fetchTodayData()
    fetchRecommendedCourses()
  }, [])

  useEffect(() => {
    const interval = setInterval(updateRealtimeData, 3000) // 3초마다 업데이트
    return () => clearInterval(interval)
  }, [])

  const timeProgress = (realtimeData.currentTime / realtimeData.targetTime) * 100
  const distanceProgress = (realtimeData.currentDistance / realtimeData.targetDistance) * 100
  const filteredCourses = getFilteredCourses()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: PADDING_H * 2 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image source={require("../assets/logo.png")} style={styles.logoImage} />
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate("코스 검색")}>
          <Icon name="magnify" size={screenWidth * 0.04} color="#888" />
          <Text style={styles.searchPlaceholder}>산책로 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.userBox} onPress={goToMyPloggingRecords}>
          <Image source={require("../assets/user.png")} style={styles.userIcon} />
        </TouchableOpacity>
      </View>

      {/* Top Section */}
      <View style={styles.topRow}>
        {/* Left Banner */}
        <View style={styles.leftBannerWrapper}>
          <Image source={require("../assets/trash_background.png")} style={styles.leftBanner} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerText}>주변 산책로를{"\n"}정리하고 싶다면</Text>
          </View>
        </View>

        {/* Right Cards */}
        <View style={styles.rightCards}>
          {/* 실시간 플로깅 카드 */}
          <TouchableOpacity style={styles.realtimePloggingCard} onPress={goToRealtimePlogging}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>진행중인 플로깅</Text>
              <Text style={styles.participantsText}>{realtimeData.participants}명 참여중</Text>
            </View>
            <Text style={styles.cardLink}>실시간 플로깅 {">"}</Text>

            {/* Progress Bars */}
            <View style={styles.progressSection}>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>시간</Text>
                  <Text style={styles.progressValue}>
                    {Math.round(realtimeData.currentTime)}분 / {realtimeData.targetTime}분
                  </Text>
                </View>
                <ProgressBar progress={timeProgress} color="#4CAF50" />
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>거리</Text>
                  <Text style={styles.progressValue}>
                    {realtimeData.currentDistance.toFixed(1)}km / {realtimeData.targetDistance}km
                  </Text>
                </View>
                <ProgressBar progress={distanceProgress} color="#2196F3" />
              </View>
            </View>
          </TouchableOpacity>

          {/* 오늘의 플로깅 카드 */}
          <View style={styles.todayPloggingCard}>
            <Text style={styles.cardTitle}>오늘의 플로깅</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>데이터 로딩중...</Text>
              </View>
            ) : (
              <View style={styles.todayDataContainer}>
                <Text style={styles.cardDetail}>
                  {todayData.timeSpent} / {todayData.targetTime}분
                </Text>
                <Text style={styles.cardDetail}>
                  {todayData.distance.toFixed(1)} / {todayData.targetDistance}km
                </Text>
                <Text style={styles.cardDetail}>
                  주운 쓰레기 수: <Text style={styles.trashCount}>{todayData.trashCount}개</Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Icon Row */}
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={goToRecommend} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
            <Image source={require("../assets/social-media2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>추천 코스</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToPlogging} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#E8F5E8" }]}>
            <Image source={require("../assets/road2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>플로깅 시작</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToReport} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
            <Image source={require("../assets/medical-prescription2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>쓰레기 제보</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToTrashBin} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
            <Image source={require("../assets/garbage2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>쓰레기통</Text>
        </TouchableOpacity>
      </View>

      {/* Mission Banner */}
      <View style={styles.missionBanner}>
        <Image source={require("../assets/road.png")} style={styles.missionImage} />
        <View style={styles.missionTextContainer}>
          <Text style={styles.missionText}>산책로를 깨끗하게{"\n"}만드는데 동참하세요.</Text>
        </View>
      </View>

      {/* Pick Section */}
      <View style={styles.pickWrapper}>
        <Text style={styles.pickTitle}>줍깅 PICK 추천코스 🎉</Text>

        <View style={styles.pickTags}>
          <TouchableOpacity
            onPress={() => setSelectedTag("가까운 곳")}
            style={[styles.tag, selectedTag === "가까운 곳" && styles.tagSelected]}
          >
            <Text style={[styles.tagText, selectedTag === "가까운 곳" && styles.tagSelectedText]}># 가까운 곳</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTag("쓰레기 많은 곳")}
            style={[styles.tag, selectedTag === "쓰레기 많은 곳" && styles.tagSelected]}
          >
            <Text style={[styles.tagText, selectedTag === "쓰레기 많은 곳" && styles.tagSelectedText]}>
              # 쓰레기 많은 곳
            </Text>
          </TouchableOpacity>
        </View>

        {coursesLoading ? (
          <View style={styles.coursesLoadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.coursesLoadingText}>추천 코스 로딩중...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickScrollView}>
            {filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.pickCard}
                onPress={() => navigation.navigate("코스 상세", { courseId: course.id })}
              >
                {/* <Image source={require(course.image)} style={styles.pickImage} /> */}
                <Text style={styles.pickCourseName}>{course.name}</Text>
                <View style={styles.pickInfoRow}>
                  <Icon name="map-marker" size={screenWidth * 0.03} color="#797982" />
                  <Text style={styles.pickDistance}>{course.distance}</Text>
                  <Text style={styles.pickSeparator}>|</Text>
                  <Icon name="clock-outline" size={screenWidth * 0.03} color="#797982" />
                  <Text style={styles.pickDistance}>{course.duration}</Text>
                </View>
                <View style={styles.pickTagsRow}>
                  <View
                    style={[
                      styles.pickTag,
                      {
                        backgroundColor:
                          course.trashLevel === "많음"
                            ? "#FFE0E0"
                            : course.trashLevel === "보통"
                              ? "#FFF3E0"
                              : "#E8F5E8",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickTagText,
                        {
                          color:
                            course.trashLevel === "많음"
                              ? "#D32F2F"
                              : course.trashLevel === "보통"
                                ? "#F57C00"
                                : "#388E3C",
                        },
                      ]}
                    >
                      쓰레기 {course.trashLevel}
                    </Text>
                  </View>
                  <View style={[styles.pickTag, { backgroundColor: "#E3F2FD" }]}>
                    <Text style={[styles.pickTagText, { color: "#1976D2" }]}>{course.difficulty}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {!coursesLoading && filteredCourses.length === 0 && (
          <View style={styles.noCoursesContainer}>
            <Icon name="map-search" size={screenWidth * 0.1} color="#CCC" />
            <Text style={styles.noCoursesText}>선택한 태그에 해당하는 코스가 없습니다.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header Styles
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING_H,
    paddingTop: screenHeight * 0.06,
    paddingBottom: PADDING_H / 2,
  },
  logoImage: {
    width: screenWidth * 0.35,
    height: screenHeight * 0.04,
    resizeMode: "contain",
    marginRight: PADDING_H / 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: screenHeight * 0.012,
    paddingHorizontal: PADDING_H / 2,
    borderRadius: 20,
    marginRight: PADDING_H / 2,
  },
  searchPlaceholder: {
    fontSize: screenWidth * 0.035,
    color: "#888",
    marginLeft: PADDING_H / 3,
  },
  userBox: {
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
    justifyContent: "center",
    alignItems: "center",
  },
  userIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  // Top Section Styles
  topRow: {
    flexDirection: "row",
    paddingHorizontal: PADDING_H,
    marginBottom: PADDING_H,
    height: screenHeight * 0.28,
  },
  leftBannerWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: PADDING_H / 2,
  },
  leftBanner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerTextContainer: {
    position: "absolute",
    top: PADDING_H,
    left: PADDING_H / 2,
    right: PADDING_H / 2,
  },
  bannerText: {
    color: "#fff",
    fontSize: screenWidth * 0.038,
    fontWeight: "700",
    padding: PADDING_H / 2,
    borderRadius: 8,
    textAlign: "center",
    lineHeight: screenWidth * 0.05,
  },
  rightCards: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Realtime Plogging Card
  realtimePloggingCard: {
    flex: 1,
    backgroundColor: "rgba(76, 175, 80, 0.05)",
    borderRadius: 12,
    padding: PADDING_H / 2,
    marginBottom: PADDING_H / 3,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: screenWidth * 0.028,
    fontWeight: "600",
    color: "#666",
  },
  participantsText: {
    fontSize: screenWidth * 0.025,
    color: "#4CAF50",
    fontWeight: "600",
  },
  cardLink: {
    fontSize: screenWidth * 0.032,
    fontWeight: "700",
    color: "#333",
    marginBottom: PADDING_H / 3,
  },
  progressSection: {
    gap: PADDING_H / 4,
  },
  progressItem: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: screenWidth * 0.025,
    color: "#666",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: screenWidth * 0.025,
    color: "#333",
    fontWeight: "600",
  },

  // Progress Bar Styles
  progressBarContainer: {
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    borderRadius: 3,
  },

  // Today Plogging Card
  todayPloggingCard: {
    flex: 1,
    backgroundColor: "rgba(121,121,130,0.08)",
    borderRadius: 12,
    padding: PADDING_H / 2,
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: PADDING_H / 3,
  },
  loadingText: {
    fontSize: screenWidth * 0.03,
    color: "#666",
  },
  todayDataContainer: {
    gap: 4,
  },
  cardDetail: {
    fontSize: screenWidth * 0.032,
    fontWeight: "700",
    color: "#333333",
  },
  trashCount: {
    fontSize: screenWidth * 0.036,
    color: "#4CAF50",
    fontWeight: "800",
  },

  // Icon Row Styles
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: screenHeight * 0.025,
    paddingHorizontal: PADDING_H / 2,
    backgroundColor: "#fff",
  },
  iconBox: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: screenHeight * 0.008,
  },
  icon: {
    width: ICON_SIZE * 0.5,
    height: ICON_SIZE * 0.5,
    resizeMode: "contain",
  },
  iconLabel: {
    fontSize: screenWidth * 0.032,
    fontWeight: "600",
    color: "#797982",
    textAlign: "center",
  },

  // Mission Banner Styles
  missionBanner: {
    marginTop: screenHeight * 0.02,
    marginHorizontal: PADDING_H,
    borderRadius: 12,
    overflow: "hidden",
    height: BANNER_HEIGHT,
  },
  missionImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  missionTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  missionText: {
    fontSize: screenWidth * 0.048,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: screenWidth * 0.06,
  },

  // Pick Section Styles
  pickWrapper: {
    marginTop: screenHeight * 0.03,
    paddingHorizontal: PADDING_H,
  },
  pickTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "700",
    color: "#333333",
    marginBottom: PADDING_H / 2,
  },
  pickTags: {
    flexDirection: "row",
    gap: PADDING_H / 3,
    marginBottom: PADDING_H / 2,
  },
  tag: {
    paddingHorizontal: PADDING_H / 2,
    paddingVertical: PADDING_H / 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  tagSelected: {
    backgroundColor: "#000022",
    borderColor: "#000022",
  },
  tagText: {
    fontSize: screenWidth * 0.03,
    color: "#797982",
    fontWeight: "500",
  },
  tagSelectedText: {
    color: "#fff",
  },

  // Courses Loading Styles
  coursesLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: screenHeight * 0.05,
  },
  coursesLoadingText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    marginTop: PADDING_H / 2,
  },

  // Pick Cards Styles
  pickScrollView: {
    marginHorizontal: -PADDING_H / 4,
  },
  pickCard: {
    width: PICK_CARD_WIDTH,
    marginHorizontal: PADDING_H / 4,
  },
  pickImage: {
    width: "100%",
    height: PICK_IMAGE_HEIGHT,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: screenHeight * 0.008,
  },
  pickCourseName: {
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  pickInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  pickDistance: {
    fontSize: screenWidth * 0.028,
    color: "#797982",
  },
  pickSeparator: {
    fontSize: screenWidth * 0.028,
    color: "#797982",
    marginHorizontal: 4,
  },
  pickTagsRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  pickTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pickTagText: {
    fontSize: screenWidth * 0.025,
    fontWeight: "500",
  },

  // No Courses Styles
  noCoursesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: screenHeight * 0.05,
  },
  noCoursesText: {
    fontSize: screenWidth * 0.035,
    color: "#999",
    marginTop: PADDING_H / 2,
    textAlign: "center",
  },
})
