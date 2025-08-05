"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import DropDownPicker from "react-native-dropdown-picker"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const CARD_HEIGHT = screenHeight * 0.12
const ITEM_IMAGE_SIZE = screenHeight * 0.08

// 더미 코스 데이터
const DUMMY_COURSES = [
  {
    id: "1",
    name: "국립 중앙 박물관",
    address: "서울 용산구 서빙고로 137 국립중앙박물관",
    difficulty: "쉬움",
    region: "서울",
    image: "../assets/course1.jpg",
    distance: "7.1km",
    duration: "1시간30분",
    trashLevel: "보통",
  },
  {
    id: "2",
    name: "남산",
    address: "서울 중구 회현동1가",
    difficulty: "어려움",
    region: "서울",
    image: "../assets/course2.jpg",
    distance: "5.2km",
    duration: "2시간",
    trashLevel: "적음",
  },
  {
    id: "3",
    name: "한강공원 여의도",
    address: "서울 영등포구 여의동로 330",
    difficulty: "쉬움",
    region: "서울",
    image: "../assets/course3.jpg",
    distance: "8.5km",
    duration: "2시간30분",
    trashLevel: "많음",
  },
  {
    id: "4",
    name: "청계천 산책로",
    address: "서울 중구 청계천로 1",
    difficulty: "쉬움",
    region: "서울",
    image: "../assets/course4.jpg",
    distance: "6.3km",
    duration: "1시간45분",
    trashLevel: "보통",
  },
  {
    id: "5",
    name: "올림픽공원",
    address: "서울 송파구 올림픽로 424",
    difficulty: "보통",
    region: "서울",
    image: "../assets/course5.jpg",
    distance: "9.2km",
    duration: "2시간30분",
    trashLevel: "많음",
  },
  {
    id: "6",
    name: "북한산 둘레길",
    address: "서울 성북구 정릉동",
    difficulty: "어려움",
    region: "서울",
    image: "../assets/course6.jpg",
    distance: "12.1km",
    duration: "3시간",
    trashLevel: "적음",
  },
  {
    id: "7",
    name: "부산 해운대 해변",
    address: "부산 해운대구 우동",
    difficulty: "쉬움",
    region: "부산",
    image: "../assets/course7.jpg",
    distance: "4.5km",
    duration: "1시간",
    trashLevel: "많음",
  },
  {
    id: "8",
    name: "제주 올레길 1코스",
    address: "제주 서귀포시 성산읍",
    difficulty: "보통",
    region: "제주",
    image: "../assets/course8.jpg",
    distance: "15.1km",
    duration: "4시간",
    trashLevel: "적음",
  },
]

// 지역 옵션
const REGION_OPTIONS = [
  { label: "전체 지역", value: null },
  { label: "서울", value: "서울" },
  { label: "부산", value: "부산" },
  { label: "대구", value: "대구" },
  { label: "인천", value: "인천" },
  { label: "광주", value: "광주" },
  { label: "대전", value: "대전" },
  { label: "울산", value: "울산" },
  { label: "세종", value: "세종" },
  { label: "경기", value: "경기" },
  { label: "제주", value: "제주" },
]

// 난이도 옵션
const DIFFICULTY_OPTIONS = [
  { label: "전체 난이도", value: null },
  { label: "쉬움", value: "쉬움" },
  { label: "보통", value: "보통" },
  { label: "어려움", value: "어려움" },
]

export default function RecommendCourseScreen({ navigation }) {
  const [tab, setTab] = useState("전체")
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // 필터 상태
  const [regionOpen, setRegionOpen] = useState(false)
  const [regionValue, setRegionValue] = useState(null)
  const [regionItems, setRegionItems] = useState(REGION_OPTIONS)

  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const [difficultyValue, setDifficultyValue] = useState(null)
  const [difficultyItems, setDifficultyItems] = useState(DIFFICULTY_OPTIONS)

  // DB에서 코스 데이터 가져오기
  const fetchCourses = async () => {
    try {
      setLoading(true)

      // 실제 API 호출 (예시)
      // const response = await fetch('https://your-api.com/api/courses');
      // const data = await response.json();

      // 시뮬레이션: 90% 확률로 DB 데이터 존재
      const hasDataInDB = Math.random() > 0.1

      // 1초 로딩 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (hasDataInDB) {
        setCourses(DUMMY_COURSES)
        setFilteredCourses(DUMMY_COURSES)
      } else {
        setCourses([])
        setFilteredCourses([])
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      setCourses(DUMMY_COURSES)
      setFilteredCourses(DUMMY_COURSES)
    } finally {
      setLoading(false)
    }
  }

  // 필터 적용
  const applyFilters = () => {
    let filtered = [...courses]

    if (regionValue) {
      filtered = filtered.filter((course) => course.region === regionValue)
    }

    if (difficultyValue) {
      filtered = filtered.filter((course) => course.difficulty === difficultyValue)
    }

    setFilteredCourses(filtered)
  }

  // 필터 값 변경 시 필터 적용
  useEffect(() => {
    applyFilters()
  }, [regionValue, difficultyValue, courses])

  useEffect(() => {
    fetchCourses()
  }, [])

  const goBack = () => navigation.goBack()
  const goToSearch = () => navigation.navigate("코스 검색")
  const goToProfile = () => navigation.navigate("내 플로깅 기록")

  // 난이도별 색상 반환
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "쉬움":
        return "#4CAF50"
      case "보통":
        return "#FF9800"
      case "어려움":
        return "#F44336"
      default:
        return "#666"
    }
  }

  // 쓰레기 레벨별 색상 반환
  const getTrashLevelColor = (level) => {
    switch (level) {
      case "많음":
        return "#F44336"
      case "보통":
        return "#FF9800"
      case "적음":
        return "#4CAF50"
      default:
        return "#666"
    }
  }

  // 상단 탭 렌더링
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity style={[styles.tabButton, tab === "전체" && styles.activeTab]} onPress={() => setTab("전체")}>
        <Text style={[styles.tabText, tab === "전체" && styles.activeTabText]}>전체</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tabButton, tab === "AI" && styles.activeTab]} onPress={() => setTab("AI")}>
        <Text style={[styles.tabText, tab === "AI" && styles.activeTabText]}>AI 기반 추천</Text>
      </TouchableOpacity>
    </View>
  )

  // 코스 아이템 렌더링 (리스트 형태로 변경)
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => navigation.navigate("CourseDetail", { courseId: item.id })}
    >
      {/* <Image source={require(item.image)} style={styles.courseImage} /> */}
      <View style={styles.courseContent}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseAddress}>{item.address}</Text>
        <View style={styles.courseInfo}>
          <View style={styles.courseInfoItem}>
            <Icon name="map-marker" size={screenWidth * 0.035} color="#666" />
            <Text style={styles.courseInfoText}>{item.distance}</Text>
          </View>
          <View style={styles.courseInfoItem}>
            <Icon name="clock-outline" size={screenWidth * 0.035} color="#666" />
            <Text style={styles.courseInfoText}>{item.duration}</Text>
          </View>
        </View>
        <View style={styles.tagContainer}>
          
            
          </View>
        </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={goBack}>
          <Icon name="arrow-left" size={screenWidth * 0.06} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>산책로 추천</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={goToSearch}>
            <Icon name="magnify" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={goToProfile}>
            <Icon name="account" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {tab === "전체" ? (
        <View style={styles.contentContainer}>
          {/* Filters */}
          <View style={styles.filterContainer}>
            <View style={styles.filterItem}>
              <DropDownPicker
                placeholder="지역"
                open={regionOpen}
                value={regionValue}
                items={regionItems}
                setOpen={setRegionOpen}
                setValue={setRegionValue}
                setItems={setRegionItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
            <View style={styles.filterItem}>
              <DropDownPicker
                placeholder="난이도"
                open={difficultyOpen}
                value={difficultyValue}
                items={difficultyItems}
                setOpen={setDifficultyOpen}
                setValue={setDifficultyValue}
                setItems={setDifficultyItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={2000}
                zIndexInverse={1000}
              />
            </View>
          </View>

          {/* Course Count */}
          <Text style={styles.countText}>산책로 {filteredCourses.length}</Text>

          {/* Course List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>코스 정보 로딩중...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCourses}
              keyExtractor={(item) => item.id}
              renderItem={renderCourseItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="map-search" size={screenWidth * 0.15} color="#CCC" />
                  <Text style={styles.emptyText}>조건에 맞는 산책로가 없습니다.</Text>
                  <Text style={styles.emptySubText}>다른 조건으로 검색해보세요.</Text>
                </View>
              }
            />
          )}
        </View>
      ) : (
        /* AI Tab Content */
        <View style={styles.aiContainer}>
          <Text style={styles.aiTitle}>AI에게 산책로를 추천 받아보세요.</Text>
          <Text style={styles.aiQuestion}>나에게 맞는 산책로는?</Text>

          <View style={styles.aiImageContainer}>
            <Icon name="robot" size={screenWidth * 0.3} color="#4CAF50" />
          </View>

          <Text style={styles.aiSubtitle}>나의 플로깅 기록, 선호도를 바탕으로{"\n"}산책로를 추천 받아 보세요.</Text>

          <TouchableOpacity style={styles.aiButton}>
            <Icon name="brain" size={screenWidth * 0.05} color="#fff" />
            <Text style={styles.aiButtonText}>AI 분석하기</Text>
          </TouchableOpacity>

          <View style={styles.aiFeatures}>
            <View style={styles.aiFeature}>
              <Icon name="chart-line" size={screenWidth * 0.06} color="#4CAF50" />
              <Text style={styles.aiFeatureText}>개인 맞춤 분석</Text>
            </View>
            <View style={styles.aiFeature}>
              <Icon name="map-marker-path" size={screenWidth * 0.06} color="#4CAF50" />
              <Text style={styles.aiFeatureText}>최적 경로 추천</Text>
            </View>
            <View style={styles.aiFeature}>
              <Icon name="weather-sunny" size={screenWidth * 0.06} color="#4CAF50" />
              <Text style={styles.aiFeatureText}>날씨 기반 추천</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  headerButton: {
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
  headerRight: {
    flexDirection: "row",
  },

  // Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: PADDING_H,
  },
  tabButton: {
    flex: 1,
    paddingVertical: PADDING_H / 2,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#4CAF50",
  },

  // Content Styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: PADDING_H,
  },

  // Filter Styles
  filterContainer: {
    flexDirection: "row",
    gap: PADDING_H / 2,
    marginVertical: PADDING_H,
  },
  filterItem: {
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingHorizontal: PADDING_H / 2,
    minHeight: screenHeight * 0.05,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: screenWidth * 0.035,
    color: "#333",
  },
  dropdownPlaceholder: {
    fontSize: screenWidth * 0.035,
    color: "#888",
  },

  // Count Styles
  countText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
    marginBottom: PADDING_H,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    marginTop: PADDING_H / 2,
  },

  // List Styles
  listContainer: {
    paddingBottom: PADDING_H * 2,
  },

  // Course Item Styles (리스트 형태로 변경)
  courseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: PADDING_H,
    paddingHorizontal: PADDING_H,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  courseImage: {
    width: ITEM_IMAGE_SIZE,
    height: ITEM_IMAGE_SIZE,
    borderRadius: 8,
    marginRight: PADDING_H,
    resizeMode: "cover",
  },
  courseContent: {
    flex: 1,
  },
  courseName: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  courseAddress: {
    fontSize: screenWidth * 0.032,
    color: "#666",
    marginBottom: PADDING_H / 3,
  },
  courseInfo: {
    flexDirection: "row",
    gap: PADDING_H / 2,
    marginBottom: PADDING_H / 3,
  },
  courseInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  courseInfoText: {
    fontSize: screenWidth * 0.03,
    color: "#666",
  },
  tagContainer: {
    flexDirection: "row",
    gap: PADDING_H / 3,
    flexWrap: "wrap",
  },
  difficultyTag: {
    paddingHorizontal: PADDING_H / 3,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trashTag: {
    paddingHorizontal: PADDING_H / 3,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: screenWidth * 0.028,
    fontWeight: "500",
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: screenHeight * 0.1,
  },
  emptyText: {
    fontSize: screenWidth * 0.04,
    color: "#666",
    marginTop: PADDING_H,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: screenWidth * 0.035,
    color: "#999",
    marginTop: PADDING_H / 2,
    textAlign: "center",
  },

  // AI Tab Styles
  aiContainer: {
    flex: 1,
    paddingHorizontal: PADDING_H,
    paddingTop: PADDING_H * 2,
    alignItems: "center",
  },
  aiTitle: {
    fontSize: screenWidth * 0.035,
    color: "#777",
    marginBottom: PADDING_H / 2,
  },
  aiQuestion: {
    fontSize: screenWidth * 0.05,
    fontWeight: "700",
    color: "#333",
    marginBottom: PADDING_H * 2,
  },
  aiImageContainer: {
    marginBottom: PADDING_H * 2,
  },
  aiSubtitle: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    textAlign: "center",
    lineHeight: screenWidth * 0.05,
    marginBottom: PADDING_H * 2,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: PADDING_H * 2,
    paddingVertical: PADDING_H,
    borderRadius: 25,
    gap: PADDING_H / 2,
    marginBottom: PADDING_H * 2,
  },
  aiButtonText: {
    color: "#fff",
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
  },
  aiFeatures: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: PADDING_H,
  },
  aiFeature: {
    alignItems: "center",
    gap: PADDING_H / 3,
  },
  aiFeatureText: {
    fontSize: screenWidth * 0.03,
    color: "#666",
    textAlign: "center",
  },
})
