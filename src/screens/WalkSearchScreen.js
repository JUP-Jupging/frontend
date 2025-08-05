"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const SEARCH_HEIGHT = screenHeight * 0.06
const ITEM_HEIGHT = screenHeight * 0.1
const IMAGE_SIZE = ITEM_HEIGHT * 0.8

// 더미 검색 데이터
const DUMMY_SEARCH_RESULTS = [
  {
    id: "1",
    name: "국립 중앙 박물관",
    address: "서울 용산구 서빙고로 137 국립중앙박물관",
    image: "../assets/course1.jpg",
    region: "서울",
    difficulty: "쉬움",
    distance: "7.1km",
    duration: "1시간30분",
  },
  {
    id: "2",
    name: "남산",
    address: "서울 중구 회현동1가",
    image: "../assets/course2.jpg",
    region: "서울",
    difficulty: "어려움",
    distance: "5.2km",
    duration: "2시간",
  },
  {
    id: "3",
    name: "한강공원 여의도",
    address: "서울 영등포구 여의동로 330",
    image: "../assets/course3.jpg",
    region: "서울",
    difficulty: "쉬움",
    distance: "8.5km",
    duration: "2시간30분",
  },
  {
    id: "4",
    name: "청계천 산책로",
    address: "서울 중구 청계천로 1",
    image: "../assets/course4.jpg",
    region: "서울",
    difficulty: "쉬움",
    distance: "6.3km",
    duration: "1시간45분",
  },
  {
    id: "5",
    name: "올림픽공원",
    address: "서울 송파구 올림픽로 424",
    image: "../assets/course5.jpg",
    region: "서울",
    difficulty: "보통",
    distance: "9.2km",
    duration: "2시간30분",
  },
  {
    id: "6",
    name: "북한산 둘레길",
    address: "서울 성북구 정릉동",
    image: "../assets/course6.jpg",
    region: "서울",
    difficulty: "어려움",
    distance: "12.1km",
    duration: "3시간",
  },
]

// 인기 검색어
const POPULAR_KEYWORDS = ["남산", "한강", "청계천", "올림픽공원", "북한산", "국립중앙박물관"]

export default function WalkSearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [allCourses, setAllCourses] = useState(DUMMY_SEARCH_RESULTS)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // 검색 실행
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    setShowResults(true)

    // 검색 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      const filtered = allCourses.filter(
        (course) =>
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.address.toLowerCase().includes(query.toLowerCase()) ||
          course.region.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchResults(filtered)
      setLoading(false)
    }, 500)
  }

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery)
    }, 300) // 300ms 디바운스

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // 인기 검색어 클릭
  const handlePopularKeyword = (keyword) => {
    setSearchQuery(keyword)
  }

  // 검색 결과 아이템 클릭
  const handleResultPress = (item) => {
    navigation.navigate("CourseDetail", { courseId: item.id })
  }

  // 검색 결과 아이템 렌더링
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity style={styles.searchItem} onPress={() => handleResultPress(item)}>
      {/* <Image source={require(item.image)} style={styles.itemImage} /> */}
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemAddress}>{item.address}</Text>
        <View style={styles.itemInfo}>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>{item.distance}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>{item.duration}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
              {item.difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  // 인기 검색어 아이템 렌더링
  const renderPopularKeyword = (keyword, index) => (
    <TouchableOpacity key={index} style={styles.keywordChip} onPress={() => handlePopularKeyword(keyword)}>
      <Text style={styles.keywordText}>{keyword}</Text>
    </TouchableOpacity>
  )

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

  return (
    <View style={styles.container}>
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={screenWidth * 0.05} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="산책로 검색"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Icon name="close-circle" size={screenWidth * 0.05} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 검색 결과 또는 인기 검색어 */}
      {showResults ? (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultsCount}>검색 결과 {searchResults.length}개</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderSearchItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="map-search-outline" size={screenWidth * 0.15} color="#CCC" />
                    <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                    <Text style={styles.emptySubText}>다른 검색어를 입력해보세요.</Text>
                  </View>
                }
              />
            </>
          )}
        </View>
      ) : (
        <View style={styles.popularContainer}>
          <Text style={styles.popularTitle}>인기 검색어</Text>
          <View style={styles.keywordsContainer}>
            {POPULAR_KEYWORDS.map((keyword, index) => renderPopularKeyword(keyword, index))}
          </View>

          <Text style={styles.recentTitle}>최근 검색한 산책로</Text>
          <FlatList
            data={allCourses.slice(0, 3)} // 최근 3개만 표시
            keyExtractor={(item) => item.id}
            renderItem={renderSearchItem}
            contentContainerStyle={styles.recentListContainer}
            showsVerticalScrollIndicator={false}
          />
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

  // Search Container Styles
  searchContainer: {
    paddingHorizontal: PADDING_H,
    paddingTop: screenHeight * 0.06,
    paddingBottom: PADDING_H,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: PADDING_H,
    height: SEARCH_HEIGHT,
  },
  searchIcon: {
    marginRight: PADDING_H / 2,
  },
  searchInput: {
    flex: 1,
    fontSize: screenWidth * 0.04,
    color: "#333",
    paddingVertical: 0, // Remove default padding
  },
  clearButton: {
    marginLeft: PADDING_H / 2,
  },

  // Results Container Styles
  resultsContainer: {
    flex: 1,
    paddingHorizontal: PADDING_H,
  },
  resultsCount: {
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
    color: "#333",
    marginVertical: PADDING_H,
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
  recentListContainer: {
    paddingBottom: PADDING_H,
  },

  // Search Item Styles
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: PADDING_H,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    marginRight: PADDING_H,
    resizeMode: "cover",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemAddress: {
    fontSize: screenWidth * 0.032,
    color: "#666",
    marginBottom: PADDING_H / 3,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: PADDING_H / 2,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  infoText: {
    fontSize: screenWidth * 0.028,
    color: "#666",
  },
  difficultyText: {
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

  // Popular Container Styles
  popularContainer: {
    flex: 1,
    paddingHorizontal: PADDING_H,
  },
  popularTitle: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
    marginTop: PADDING_H,
    marginBottom: PADDING_H,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: PADDING_H / 2,
    marginBottom: PADDING_H * 2,
  },
  keywordChip: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: PADDING_H,
    paddingVertical: PADDING_H / 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  keywordText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    fontWeight: "500",
  },
  recentTitle: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
    marginBottom: PADDING_H,
  },
})
