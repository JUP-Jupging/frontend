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
// 현재 파일이 src/screens에 있고, trails.js가 src/api에 있다면 아래 경로가 맞습니다.
import { getTrails, searchTrails } from "../api/trails"

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
  // 🔹 로딩/보여주기 상태
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // 내부적으로 디바운스를 제어하기 위한 ref (중복 타이머 방지)
  const debounceRef = useRef(null)

  /**
   * 👉 컴포넌트 마운트 시점에 전체 산책로 목록을 1회 로드합니다.
   * - UI: 최근 목록 영역에 사용
   * - 실패 시 콘솔에만 남기고 빈 목록 유지(화면은 기존 Empty UI가 처리)
   */
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await getTrails() // 필터 없이 전체
        if (isMounted) {
          setAllCourses(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        // 콘솔 로깅만 하고 UI 붕괴 방지
        console.error("초기 산책로 로드 실패:", e?.response?.data || e?.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

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
      const data = await searchTrails(q)
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
    // 백엔드에서 내려오는 키 이름에 맞춰 id/uuid 등으로 조정하세요.
    navigation.navigate("CourseDetail", { courseId: item.id })
  }

  // 🔹 검색 결과 아이템 렌더링 (UI 원형 유지, 이미지 주석은 그대로)
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity style={styles.searchItem} onPress={() => handleResultPress(item)}>
      {/* 
        이미지 경로/URL이 백엔드에서 내려온다면 아래처럼 사용:
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        현재는 디자인 보존을 위해 주석 유지 
      */}
      <View style={styles.itemContent}>
        {/* 백엔드 응답 키에 맞춰 필드명 매핑 필요 (예: trailName/address/difficulty/distance/duration 등) */}
        <Text style={styles.itemName}>{item.trailName || item.name}</Text>
        <Text style={styles.itemAddress}>{item.address || item.cityName}</Text>
        <View style={styles.itemInfo}>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>{item.distance || item.distanceText || "-"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>{item.duration || item.durationText || "-"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty || item.difficultyLevel) }]}>
              {item.difficulty || item.difficultyLevel || "정보없음"}
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
          <TouchableOpacity style={styles.headerButton} onPress={goToProfile}>
            <Icon name="account" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
        </View>
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
                keyExtractor={(item, idx) => String(item.id ?? item.trailId ?? idx)}
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
              keyExtractor={(item, idx) => String(item.id ?? item.trailId ?? idx)}
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
