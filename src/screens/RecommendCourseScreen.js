"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DropDownPicker from "react-native-dropdown-picker"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 더미 코스 데이터 (reportCount 추가)
const DUMMY_COURSES = [
  {
    id: "1",
    name: "국립 중앙 박물관",
    address: "서울 용산구 서빙고로 137 국립중앙박물관",
    difficulty: "쉬움",
    region: "서울",
    image: "/placeholder.svg?height=50&width=50",
    distance: "7.1", // km
    duration: "1시간30분",
    reportCount: 5,
  },
  {
    id: "2",
    name: "남산",
    address: "서울 중구 회현동1가",
    difficulty: "어려움",
    region: "서울",
    image: "/placeholder.svg?height=50&width=50",
    distance: "5.2",
    duration: "2시간",
    reportCount: 2,
  },
  {
    id: "3",
    name: "한강공원 여의도",
    address: "서울 영등포구 여의동로 330",
    difficulty: "쉬움",
    region: "서울",
    image: "/placeholder.svg?height=50&width=50",
    distance: "8.5",
    duration: "2시간30분",
    reportCount: 10,
  },
  {
    id: "4",
    name: "청계천 산책로",
    address: "서울 중구 청계천로 1",
    difficulty: "쉬움",
    region: "서울",
    image: "/placeholder.svg?height=50&width=50",
    distance: "6.3",
    duration: "1시간45분",
    reportCount: 7,
  },
]

// 지역 옵션
const REGION_OPTIONS = [
  { label: "지역", value: null },
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
  { label: "난이도", value: null },
  { label: "쉬움", value: "쉬움" },
  { label: "보통", value: "보통" },
  { label: "어려움", value: "어려움" },
]

// 정렬 옵션
const SORT_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "가까운순", value: "distance" },
  { label: "쓰레기 많은순", value: "trash" },
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

  const [sortOpen, setSortOpen] = useState(false)
  const [sortValue, setSortValue] = useState("all")
  const [sortItems, setSortItems] = useState(SORT_OPTIONS)

  // DB에서 코스 데이터 가져오기
  const fetchCourses = async () => {
    try {
      setLoading(true)
      // 실제 API 호출 (예시)
      // const response = await fetch('https://your-api.com/api/courses');
      // const data = await response.json();

      // 시뮬레이션: 항상 더미 데이터 사용 (테스트용)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCourses(DUMMY_COURSES)
      setFilteredCourses(DUMMY_COURSES)
    } catch (error) {
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
    // 정렬
    if (sortValue === "distance") {
      filtered = filtered.sort((a, b) => {
        const aDist = parseFloat(a.distance)
        const bDist = parseFloat(b.distance)
        return aDist - bDist
      })
    } else if (sortValue === "trash") {
      filtered = filtered.sort((a, b) => b.reportCount - a.reportCount)
    }
    // 전체는 필터만 적용, 정렬 없음
    setFilteredCourses(filtered)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [regionValue, difficultyValue, sortValue, courses])

  const goBack = () => navigation.goBack()
  const goToProfile = () => navigation.navigate("내 플로깅 기록")

  const getDifficultyColor = (difficulty) => "#418663"

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setTab("전체")}>
          <Text style={[styles.tabText, tab === "전체" && styles.activeTabText]}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setTab("AI")}>
          <Text style={[styles.tabText, tab === "AI" && styles.activeTabText]}>AI 기반 추천</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabIndicatorContainer}>
        <View style={styles.tabUnderline} />
        <View style={[styles.tabIndicator, { left: tab === "전체" ? 0 : screenWidth * 0.5 }]} />
      </View>
    </View>
  )

  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => navigation.navigate("CourseDetail", { courseId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      <View style={styles.courseContent}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseAddress}>{item.address}</Text>
        <View style={styles.tagContainer}>
          <View style={[styles.difficultyTag, { backgroundColor: "#C8DECB" }]}>
            <Text style={[styles.tagText, { color: getDifficultyColor(item.difficulty) }]}># {item.difficulty}</Text>
          </View>
          <View style={[styles.reportTag, { backgroundColor: "#F5E6E6", marginLeft: 8 }]}>
            <Text style={[styles.tagText, { color: "#C94A4A" }]}>쓰레기 {item.reportCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={goBack}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>산책로 추천</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={goToProfile}>
            <Icon name="person" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ marginBottom: 15 }}>
        {renderTabs()}
      </View>

      {tab === "전체" ? (
        <View style={styles.contentContainer}>
          {/* Filters */}
          <View style={styles.filterBar}>
            <View style={styles.filterLeft}>
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
            <View style={styles.filterRight}>
              <DropDownPicker
                placeholder="정렬"
                open={sortOpen}
                value={sortValue}
                items={sortItems}
                setOpen={setSortOpen}
                setValue={setSortValue}
                setItems={setSortItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={1000}
                zIndexInverse={1000}
              />
            </View>
          </View>

          {/* Course Count */}
          <Text style={[styles.countText, { marginTop: 25 }]}>산책로 {filteredCourses.length}</Text>

          {/* Course List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#418663" />
              <Text style={styles.loadingText}>코스 정보 로딩중...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCourses}
              keyExtractor={(item) => item.id}
              renderItem={renderCourseItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="search" size={screenWidth * 0.15} color="#CCC" />
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
          <Text style={styles.aiSubtitle}>AI에게 산책로를 추천 받아보세요.</Text>
          <Text style={styles.aiTitle}>나에게 맞는 산책로는?</Text>
          <View style={styles.aiCard}>
            <View style={styles.aiImageContainer}>
              <Image
                source={require("../assets/ai-assistant2.png")}
                style={styles.aiRobotImage}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.aiAnalysisButton}>
              <Text style={styles.aiAnalysisButtonText}>나에게 맞는 산책로 분석</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aiDescription}>나의 플로깅 기록, 선호도를 바탕으로{"\n"}산책로를 추천 받아 보세요.</Text>
          <TouchableOpacity style={styles.aiButton}>
            <Text style={styles.aiButtonText}>AI 분석하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: screenHeight * 0.05,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: screenWidth * 0.078,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
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
  tabContainer: {
    backgroundColor: "#FFFFFF",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  activeTabText: {
    color: "#333333",
  },
  tabIndicatorContainer: {
    position: "relative",
    height: 4,
  },
  tabUnderline: {
    position: "absolute",
    width: "100%",
    height: 4,
    backgroundColor: "rgba(170, 178, 200, 0.2)",
  },
  tabIndicator: {
    position: "absolute",
    width: screenWidth * 0.5,
    height: 4,
    backgroundColor: "#418663",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.075,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    zIndex: 10,
  },
  filterLeft: {
    flexDirection: "row",
    flex: 2,
    gap: 10,
  },
  filterRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  filterItem: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderColor: "#999999",
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 25,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderColor: "#999999",
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 12,
    color: "#333333",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    fontSize: 12,
    color: "#333333",
    fontWeight: "500",
  },
  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  courseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  courseImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  courseContent: {
    flex: 1,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  courseAddress: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.6)",
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyTag: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 20,
  },
  reportTag: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    marginVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: "#CCC",
    marginTop: 5,
  },
  // AI Tab Styles
  aiContainer: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.067,
    paddingTop: 20,
    alignItems: "center",
  },
  aiSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
    marginBottom: 10,
    textAlign: "center",
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 30,
    textAlign: "center",
  },
  aiCard: {
    width: screenWidth * 0.867,
    height: screenHeight * 0.386,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#BEBEBE",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 30,
  },
  aiImageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  aiRobotImage: {
    width: 200,
    height: 200,
  },
  aiAnalysisButton: {
    backgroundColor: "#C8DECB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  aiAnalysisButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#418663",
  },
  aiDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  aiButton: {
    backgroundColor: "#418663",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    width: screenWidth * 0.889,
  },
  aiButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})