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
import Icon from "react-native-vector-icons/MaterialIcons"
import DropDownPicker from "react-native-dropdown-picker"
import { usePloggingContext } from "../contexts/PloggingContext" // 플로깅 상태 확인용

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const ICON_SIZE = screenWidth * 0.15
const BANNER_HEIGHT = screenHeight * 0.15
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
  // 플로깅 전역 상태 확인
  const { 
    status, 
    time, 
    formatTime, 
    trashCount, 
    totalDistance, 
    formatDistance,
    isBackgroundMode 
  } = usePloggingContext();
  
  const [selectedTag, setSelectedTag] = useState("가까운 곳")
  const [todayData, setTodayData] = useState(DUMMY_TODAY_DATA)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)

  // Progress Bar 컴포넌트
  const ProgressBar = ({ progress, color = "#4CAF50", height = 4 }) => {
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
  const goToRecommendCourse = () => navigation.navigate("RecommendCourse")

  // 플로깅 화면으로 이동 (진행 중일 때)
  const goToPloggingScreen = () => {
    if (status === "running" || status === "paused") {
      navigation.navigate("PloggingStart");
    } else {
      goToRealtimePlogging();
    }
  };

  // DB에서 오늘의 플로깅 데이터 가져오기 (완료된 플로깅 기록만)
  const fetchTodayData = async () => {
    try {
      setLoading(true)

      // 오늘 날짜 생성 (YYYY-MM-DD 형식)
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]

      // 실제 API 호출 - 오늘 날짜로 완료된 플로깅 기록 조회
      // const response = await fetch(`https://your-api.com/api/plogging/records/today?date=${todayString}`);
      // const data = await response.json();

      // 시뮬레이션: API 호출 대신 더미 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 확인용 더미 데이터 - 항상 데이터가 있는 것으로 표시
      const todayRecord = {
        timeSpent: 75, // 1시간 15분
        targetTime: 60,
        distance: 2.8, // 2.8km
        targetDistance: 3.0,
        trashCount: 12, // 12개
      }
      setTodayData(todayRecord)
    } catch (error) {
      console.error("Failed to fetch today's plogging data:", error)
      // 에러 발생시 초기값 사용
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

  const filteredCourses = getFilteredCourses()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: PADDING_H * 2 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image source={require("../assets/logo.png")} style={styles.logoImage} />
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate("코스 검색")}>
          <Icon name="search" size={screenWidth * 0.04} color="#888" />
          <Text style={styles.searchPlaceholder}>산책로 검색</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={goToMyPloggingRecords}>
          <View style={styles.userIconContainer}>
            <Image 
              source={require("../assets/user.png")} 
              style={styles.userIcon} 
              resizeMode="contain" 
            />
          </View>
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
          <TouchableOpacity style={styles.realtimePloggingCard} onPress={goToPloggingScreen}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {status === "running" || status === "paused" ? "플로깅 진행중" : "진행중인 플로깅"}
              </Text>
              {(status === "running" || status === "paused") && (
                <View style={[styles.statusIndicator, { backgroundColor: status === "running" ? "#4CAF50" : "#FFC107" }]} />
              )}
            </View>
            <Text style={styles.cardLink}>
              {status === "running" || status === "paused" ? "플로깅 화면으로 >" : "실시간 플로깅 >"}
            </Text>

            {/* Progress Bars */}
            <View style={styles.progressSection}>
              {(status === "running" || status === "paused") ? (
                // 플로깅 진행 중일 때만 실제 데이터 표시
                <>
                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>시간</Text>
                      <Text style={styles.progressValue}>{formatTime(time)} / 1시간</Text>
                    </View>
                    <ProgressBar 
                      progress={(time / 3600) * 100} 
                      color="#4CAF50" 
                    />
                  </View>

                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>거리</Text>
                      <Text style={styles.progressValue}>{formatDistance(totalDistance)} / 3.0km</Text>
                    </View>
                    <ProgressBar 
                      progress={(totalDistance / 3000) * 100} 
                      color="#2196F3" 
                    />
                  </View>

                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.trashCountText}>{trashCount}개</Text>
                    </View>
                  </View>
                </>
              ) : (
                // 플로깅 진행 중이 아닐 때는 빈 progress bar 표시
                <>
                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>시간</Text>
                      <Text style={styles.progressValue}>0분 / 1시간</Text>
                    </View>
                    <ProgressBar 
                      progress={0} 
                      color="#4CAF50" 
                    />
                  </View>

                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>거리</Text>
                      <Text style={styles.progressValue}>0.0km / 3.0km</Text>
                    </View>
                    <ProgressBar 
                      progress={0} 
                      color="#2196F3" 
                    />
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* 오늘의 플로깅 카드 - DB에서 오늘 완료된 플로깅 기록 표시 */}
          <View style={styles.todayPloggingCard}>
            {/* 상단 헤더 */}
            <View style={styles.todayCardHeader}>
              <Text style={styles.cardTitle}>오늘의 플로깅</Text>
              <Text style={styles.trashTitle}>주운 쓰레기 수</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>오늘 기록 조회중...</Text>
              </View>
            ) : (
              <View style={styles.todayDataContainer}>
                {(todayData.timeSpent === 0 && todayData.distance === 0 && todayData.trashCount === 0) ? (
                  // 오늘 플로깅 기록이 없는 경우
                  <View style={styles.noTodayDataContainer}>
                    <Text style={styles.noTodayDataText}>오늘 아직 플로깅을{"\n"}시작하지 않았어요</Text>
                    <Text style={styles.noTodayDataSubText}>플로깅을 시작해보세요!</Text>
                  </View>
                ) : (
                  // 오늘 플로깅 기록이 있는 경우
                  <View style={styles.todayMainRow}>
                    {/* 왼쪽: 시간과 거리 */}
                    <View style={styles.leftSection}>
                      <Text style={styles.timeText}>
                        {Math.floor(todayData.timeSpent / 60)}시간 {todayData.timeSpent % 60}분
                      </Text>
                      <Text style={styles.distanceText}>
                        {todayData.distance.toFixed(1)}km
                      </Text>
                    </View>
                    
                    {/* 오른쪽: 쓰레기 개수 */}
                    <View style={styles.rightSection}>
                      <Text style={styles.trashCountInline}>{todayData.trashCount}개</Text>
                    </View>
                  </View>
                )}
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

          <View style={styles.tagSpacer} />

          <TouchableOpacity onPress={goToRecommend} style={styles.moreButton}>
            <Text style={styles.moreButtonText}>더보기</Text>
            <Icon name="chevron-right" size={screenWidth * 0.035} color="#666" />
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
                  <Text style={styles.pickInfoLabel}>거리:</Text>
                  <Text style={styles.pickDistance}>{course.distance}</Text>
                  <Text style={styles.pickSeparator}>|</Text>
                  <Text style={styles.pickInfoLabel}>시간:</Text>
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
                      쓰레기 {course.trashCount || 0}개
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
    paddingTop: screenHeight * 0.05,
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
  headerButton: {
    padding: 5,
  },
  userIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  userIcon: {
    width: 20,
    height: 20,
  },

  // Top Section Styles
  topRow: {
    flexDirection: "row",
    paddingHorizontal: PADDING_H,
    marginTop: PADDING_H,
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
    left: PADDING_H,
    right: PADDING_H,
  },
  bannerText: {
    color: "#fff",
    fontSize: screenWidth * 0.038,
    fontWeight: "700",
    paddingLeft: PADDING_H / 2,
    paddingRight: PADDING_H / 2,
    paddingTop: PADDING_H / 2,
    paddingBottom: PADDING_H / 2,
    borderRadius: 8,
    textAlign: "left",
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
    padding: PADDING_H / 2.5,
    marginBottom: PADDING_H / 2,
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
    fontSize: screenWidth * 0.027, // 10px 상당
    fontWeight: "700",
    color: "#AAB2C8",
    flex: 1,
    lineHeight: screenWidth * 0.054, // 20px 상당
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
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
    marginBottom: PADDING_H / 4,
  },
  progressSection: {
    gap: PADDING_H / 6,
  },
  progressItem: {
    gap: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: screenWidth * 0.04,
    color: "#666",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: screenWidth * 0.025,
    color: "#333",
    fontWeight: "600",
  },
  trashCountText: {
    fontSize: screenWidth * 0.02,
    color: "#333",
    fontWeight: "200",
    textAlign: "center",
    lineHeight: screenWidth * 0.03,
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
    backgroundColor: "rgba(121, 121, 130, 0.1)",
    borderRadius: 10,
    padding: PADDING_H / 3,
    justifyContent: "flex-start",
  },
  todayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: screenWidth * 0.027, // 10px 상당
    fontWeight: "700",
    color: "#AAB2C8",
    lineHeight: screenWidth * 0.054, // 20px 상당
  },
  trashTitle: {
    fontSize: screenWidth * 0.024, // 크기 증가 (6px -> 9px 상당)
    fontWeight: "700",
    color: "#AAB2C8",
    lineHeight: screenWidth * 0.054, // 20px 상당
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: PADDING_H / 1.5,
    flex: 1,
  },
  loadingText: {
    fontSize: screenWidth * 0.05,
    alignItems: 4,
    color: "#666",
  },
  todayDataContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  todayMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flex: 1,
    paddingHorizontal: 2,
  },
  leftSection: {
    flex: 1,
    justifyContent: "center",
  },
  rightSection: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  timeText: {
    fontSize: screenWidth * 0.035, // 12px 상당
    fontWeight: "700",
    color: "#333333",
    lineHeight: screenWidth * 0.1, // 20px 상당
  },
  distanceText: {
    fontSize: screenWidth * 0.032, // 12px 상당
    fontWeight: "700",
    color: "#333333",
    lineHeight: screenWidth * 0.054, // 20px 상당
  },
  trashCountBig: {
    fontSize: screenWidth * 0.08,
    fontWeight: "800",
    color: "#333",
    lineHeight: screenWidth * 0.1,
  },
  trashCountInline: {
    fontSize: screenWidth * 0.038, // 14px 상당
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    lineHeight: screenWidth * 0.06, // 20px 상당
  },
  trashLabel: {
    fontSize: screenWidth * 0.03,
    color: "#666",
    textAlign: "center",
    marginTop: -4,
  },
  noTodayDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  noTodayDataText: {
    fontSize: screenWidth * 0.032,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    lineHeight: screenWidth * 0.04,
    marginBottom: 4,
  },
  noTodayDataSubText: {
    fontSize: screenWidth * 0.028,
    color: "#999",
    textAlign: "center",
  },
  subTitle: {
    fontSize: screenWidth * 0.025,
    color: "#666",
    textAlign: "left",
    marginTop: 8,
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
    color: "#000000ff",
    textAlign: "center",
  },

  // Mission Banner Styles
  missionBanner: {
    marginTop: screenHeight * 0.02,
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
    alignItems: "center",
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

  // Tag Spacer and More Button Styles
  tagSpacer: {
    flex: 1,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING_H / 3,
    paddingVertical: PADDING_H / 4,
  },
  moreButtonText: {
    fontSize: screenWidth * 0.03,
    color: "#666",
    fontWeight: "500",
    marginRight: 2,
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
  pickInfoLabel: {
    fontSize: screenWidth * 0.028,
    color: "#797982",
    fontWeight: "500",
    marginRight: 4,
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

