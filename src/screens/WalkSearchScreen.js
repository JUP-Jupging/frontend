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
import TrailAPI from "../API/trails"
import { useLocation } from "../hooks/useLocation"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const PADDING_H = screenWidth * 0.04
const SEARCH_HEIGHT = screenHeight * 0.06
const ITEM_HEIGHT = screenHeight * 0.1
const IMAGE_SIZE = ITEM_HEIGHT * 0.8

export default function WalkSearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [filters, setFilters] = useState({ cityName: "", difficultyLevel: "" })
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const debounceRef = useRef(null)
  const { currentLocation } = useLocation()

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const loadTrailsWithFilters = async (filterParams = {}) => {
    let isMounted = true
    try {
      setLoading(true)
      const data = await TrailAPI.getTrailList(filterParams)

      let sortedData = Array.isArray(data) ? data : []

      if (currentLocation && sortedData.length > 0) {
        const { latitude: userLat, longitude: userLng } = currentLocation
        sortedData = sortedData.map(item => {
          const trailLat = item.spotLatitude || item.latitude
          const trailLng = item.spotLongitude || item.longitude
          return {
            ...item,
            __distance: trailLat && trailLng
              ? calculateDistance(userLat, userLng, trailLat, trailLng)
              : Number.MAX_SAFE_INTEGER,
          }
        })
        sortedData.sort((a, b) => a.__distance - b.__distance)
      }

      if (isMounted) setAllCourses(sortedData)
    } catch (e) {
      console.error("❌ 산책로 목록 불러오기 실패:", e)
      if (isMounted) setAllCourses([])
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  const applyFilters = () => {
    loadTrailsWithFilters(filters)
    setShowFilters(false)
  }

  const resetFilters = () => {
    setFilters({ cityName: "", difficultyLevel: "" })
    loadTrailsWithFilters({})
    setShowFilters(false)
  }

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
      const data = await TrailAPI.searchTrails(q)
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("❌ 검색 실패:", e)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const handleTrailPress = (trailId) => {
    // ❗️StackNavigator에 등록한 이름("CourseDetail")으로 수정합니다.
    navigation.navigate("CourseDetail", { trailId });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "쉬움": return "#4CAF50"
      case "보통": return "#FF9800"
      case "어려움": return "#F44336"
      default: return "#666"
    }
  }

  const renderSearchItem = ({ item }) => (
<TouchableOpacity style={styles.searchItem} onPress={() => handleTrailPress(item.trailId)}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.trailName || item.name || "산책로 이름"}</Text>
        <Text style={styles.itemAddress}>{item.cityName || item.address || "위치 정보 없음"}</Text>
        <Text style={styles.itemType}>{item.trailTypeName && `유형: ${item.trailTypeName}`}</Text>
        <View style={styles.itemInfo}>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>{item.length ? `${item.length}` : "거리 정보 없음"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>{item.trackTime ? `${item.trackTime}` : "소요시간 정보 없음"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficultyLevel || item.difficulty) }]}> {item.difficultyLevel || item.difficulty || "난이도 정보 없음"} </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const goBack = () => navigation.goBack()
  const goToProfile = () => navigation.navigate("내 플로깅 기록")

  return (
    <View style={styles.container}>
      {/* 검색바 + 마이페이지 분리 */}
      <View style={styles.searchRow}>
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
        </View>
        <View style={styles.profileButtonContainer}>
          <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
            <Icon name="account" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
        </View>
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
              onChangeText={(text) => setFilters(prev => ({ ...prev, cityName: text }))}
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
          {loading ? (
            <View style={[styles.loadingContainer, { paddingVertical: PADDING_H }]}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>불러오는 중...</Text>
            </View>
          ) : (
            <FlatList
              data={allCourses || []}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING_H,
    paddingTop: screenHeight * 0.06,
    paddingBottom: PADDING_H,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: PADDING_H,
    height: SEARCH_HEIGHT,
  },
  profileButtonContainer: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
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
  listContainer: {
    paddingBottom: PADDING_H * 2,
  },
  recentListContainer: {
    paddingBottom: PADDING_H,
  },
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