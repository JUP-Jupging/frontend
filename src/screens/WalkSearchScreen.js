// 예: src/screens/WalkSearchScreen.js
"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

// ✅ API 모듈 임포트 (경로는 프로젝트 구조에 맞춰 조정하세요)
// 현재 파일이 src/screens에 있고, trails.js가 src/API에 있다면 아래 경로가 맞습니다.
import { getTrails, searchTrails } from "../API/trails"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Responsive size constants (기존 UI 유지)
const PADDING_H = screenWidth * 0.04
const SEARCH_HEIGHT = screenHeight * 0.06
const ITEM_HEIGHT = screenHeight * 0.1
const IMAGE_SIZE = ITEM_HEIGHT * 0.8

export default function WalkSearchScreen({ navigation }) {
  // 🔹 검색어 상태
  const [searchQuery, setSearchQuery] = useState("")
  // 🔹 검색 결과 목록 (검색 시에만 사용)
  const [searchResults, setSearchResults] = useState([])
  // 🔹 전체 코스 목록 (초기 표시 및 "최근 검색한 산책로" 영역)
  const [allCourses, setAllCourses] = useState([])
  // 🔹 필터 상태
  const [filters, setFilters] = useState({
    cityName: "",
    difficultyLevel: ""
  })
  // 🔹 로딩/보여주기 상태
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // 내부적으로 디바운스를 제어하기 위한 ref (중복 타이머 방지)
  const debounceRef = useRef(null)

  /**
   * 👉 컴포넌트 마운트 시점에 전체 산책로 목록을 1회 로드합니다.
   * - UI: 최근 목록 영역에 사용
   * - 실패 시 콘솔에만 남기고 빈 목록 유지(화면은 기존 Empty UI가 처리)
   */
  useEffect(() => {
    loadTrailsWithFilters()
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  /**
   * 👉 필터를 적용하여 산책로 목록을 로드합니다.
   */
  const loadTrailsWithFilters = async (appliedFilters = {}) => {
    let isMounted = true
    try {
      setLoading(true)
      console.log("산책로 목록 로드 시작...", appliedFilters)
      const data = await getTrails(appliedFilters)
      console.log("받은 데이터:", data)
      if (isMounted) {
        setAllCourses(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error("산책로 로드 실패:", e?.response?.data || e?.message)
      if (isMounted) {
        setAllCourses([]) // 실패 시 빈 배열
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  /**
   * 👉 필터 적용 함수
   */
  const applyFilters = () => {
    const activeFilters = {}
    if (filters.cityName) activeFilters.cityName = filters.cityName
    if (filters.difficultyLevel) activeFilters.difficultyLevel = filters.difficultyLevel
    
    loadTrailsWithFilters(activeFilters)
    setShowFilters(false)
  }

  /**
   * 👉 필터 초기화 함수
   */
  const resetFilters = () => {
    setFilters({ cityName: "", difficultyLevel: "" })
    loadTrailsWithFilters({})
    setShowFilters(false)
  }

  /**
   * 👉 검색 실행 함수
   * - 입력이 공백이면 검색 결과 영역을 닫고 목록 초기화
   * - 검색어가 있으면 API 호출
   * - 로딩/에러는 기존 UI 흐름을 유지
   */
  const performSearch = async (query) => {
    const q = query.trim()
    if (!q) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      setLoading(true)
      setShowResults(true)
      console.log("검색 실행:", q)
      const data = await searchTrails(q)
      console.log("검색 결과:", data)
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("검색 실패:", e?.response?.data || e?.message)
      setSearchResults([]) // 실패 시 빈 배열
    } finally {
      setLoading(false)
    }
  }

  /**
   * 👉 검색어 변경 시 디바운스로 performSearch 호출
   * - 300ms 지연 후 최신 검색어로 API 호출
   * - 타이핑 중 과도한 네트워크 호출 방지
   */
  useEffect(() => {
    // 기존 타이머 제거
    if (debounceRef.current) clearTimeout(debounceRef.current)
    // 새 타이머 설정
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)
    // 언마운트 혹은 검색어 재변경 시 클린업
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  // 검색 결과 아이템 클릭 → 상세 화면으로 이동 (기존 흐름 유지)
  const handleResultPress = (item) => {
    // 백엔드에서 내려오는 키 이름에 맞춰 trailId 사용
    navigation.navigate("CourseDetail", { courseId: item.trailId || item.id })
  }

  // 🔹 검색 결과 아이템 렌더링 (API 응답 데이터 구조에 맞춰 필드 매핑)
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity style={styles.searchItem} onPress={() => handleResultPress(item)}>
      {/* 
        이미지 경로/URL이 백엔드에서 내려온다면 아래처럼 사용:
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        현재는 디자인 보존을 위해 주석 유지 
      */}
      <View style={styles.itemContent}>
        {/* API 응답 데이터 구조에 맞춰 필드명 매핑 */}
        <Text style={styles.itemName}>
          {item.trailName || item.name || "산책로 이름"}
        </Text>
        <Text style={styles.itemAddress}>
          {item.cityName || item.address || "위치 정보 없음"}
        </Text>
        <Text style={styles.itemType}>
          {item.trailTypeName && `유형: ${item.trailTypeName}`}
        </Text>
        <View style={styles.itemInfo}>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>
              {item.distance ? `${item.distance}km` : 
               item.distanceText || 
               (item.distanceKm ? `${item.distanceKm}km` : "거리 정보 없음")}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>
              {item.duration ? `${item.duration}분` : 
               item.durationText || 
               (item.durationMinutes ? `${item.durationMinutes}분` : "소요시간 정보 없음")}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficultyLevel || item.difficulty) }]}>
              {item.difficultyLevel || item.difficulty || "난이도 정보 없음"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  // 난이도별 색상 반환 (기존 로직 유지)
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

  const goBack = () => navigation.goBack()
  const goToProfile = () => navigation.navigate("내 플로깅 기록")

  return (
    <View style={styles.container}>
      {/* 검색바 (UI 원형 유지) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Icon name="arrow-left" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
            <Icon name="tune" size={screenWidth * 0.05} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={goToProfile}>
            <Icon name="account" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* 필터 영역 */}
        {showFilters && (
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>지역:</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="예: 서울, 부산"
                value={filters.cityName}
                onChangeText={(text) => setFilters(prev => ({...prev, cityName: text}))}
              />
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>난이도:</Text>
              <View style={styles.difficultyContainer}>
                {["쉬움", "보통", "어려움"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyChip,
                      filters.difficultyLevel === level && styles.difficultyChipActive
                    ]}
                    onPress={() => setFilters(prev => ({
                      ...prev, 
                      difficultyLevel: prev.difficultyLevel === level ? "" : level
                    }))}
                  >
                    <Text style={[
                      styles.difficultyChipText,
                      filters.difficultyLevel === level && styles.difficultyChipTextActive
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>적용</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 검색 결과 또는 초기 목록(최근) */}
      {showResults ? (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultsCount}>검색 결과 {searchResults.length}개</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item, idx) => String(item.trailId ?? item.id ?? idx)}
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
          {/* ✅ "최근 검색한 산책로" 자리는 초기 로딩 목록 3개로 대체 표시 */}
          <Text style={styles.recentTitle}>최근 검색한 산책로</Text>
          {loading ? (
            <View style={[styles.loadingContainer, { paddingVertical: PADDING_H }]}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>불러오는 중...</Text>
            </View>
          ) : (
            <FlatList
              data={(allCourses || []).slice(0, 3)}
              keyExtractor={(item, idx) => String(item.trailId ?? item.id ?? idx)}
              renderItem={renderSearchItem}
              contentContainerStyle={styles.recentListContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="map-search-outline" size={screenWidth * 0.15} color="#CCC" />
                  <Text style={styles.emptyText}>표시할 산책로가 없습니다.</Text>
                  <Text style={styles.emptySubText}>검색어로 찾아보세요.</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  )
}

/* ✅ 스타일 정의는 전혀 수정하지 않았습니다. */
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
  backButton: {
    marginRight: PADDING_H / 2,
  },
  filterButton: {
    marginLeft: PADDING_H / 2,
    marginRight: PADDING_H / 2,
  },
  headerButton: {
    marginLeft: PADDING_H / 2,
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: "#F8F9FA",
    padding: PADDING_H,
    marginTop: PADDING_H / 2,
    borderRadius: 10,
  },
  filterRow: {
    marginBottom: PADDING_H,
  },
  filterLabel: {
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
    color: "#333",
    marginBottom: PADDING_H / 3,
  },
  filterInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: PADDING_H,
    paddingVertical: PADDING_H / 2,
    fontSize: screenWidth * 0.035,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: PADDING_H / 2,
  },
  difficultyChip: {
    paddingHorizontal: PADDING_H,
    paddingVertical: PADDING_H / 3,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  difficultyChipActive: {
    backgroundColor: "#418663",
    borderColor: "#418663",
  },
  difficultyChipText: {
    fontSize: screenWidth * 0.032,
    color: "#666",
    fontWeight: "500",
  },
  difficultyChipTextActive: {
    color: "#FFFFFF",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: PADDING_H / 2,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: PADDING_H / 2,
    marginRight: PADDING_H / 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resetButtonText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#418663",
    borderRadius: 8,
    paddingVertical: PADDING_H / 2,
    marginLeft: PADDING_H / 2,
  },
  applyButtonText: {
    fontSize: screenWidth * 0.035,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  searchIcon: {
    marginRight: PADDING_H / 2,
  },
  searchInput: {
    flex: 1,
    fontSize: screenWidth * 0.04,
    color: "#333",
    paddingVertical: 0,
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
    marginBottom: PADDING_H / 4,
  },
  itemType: {
    fontSize: screenWidth * 0.03,
    color: "#418663",
    marginBottom: PADDING_H / 3,
    fontWeight: "500",
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
