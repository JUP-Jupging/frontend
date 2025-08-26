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
import Icon from "react-native-vector-icons/MaterialIcons" // MaterialCommunityIcons 대신 MaterialIcons 사용
// 🔥 trails.js에서 올바른 함수들 import
import { getTrailList, searchTrails } from "../api/trails"
import { useLocation } from "../hooks/useLocation"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const PADDING_H = screenWidth * 0.04
const SEARCH_HEIGHT = screenHeight * 0.06
const ITEM_HEIGHT = screenHeight * 0.1
const IMAGE_SIZE = ITEM_HEIGHT * 0.8

export default function WalkSearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [filters, setFilters] = useState({ cityName: "", difficultyLevel: "" })
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(false) // 🔥 검색 여부 추적
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

  // 🔥 필터 적용 검색
  const loadTrailsWithFilters = async (filterParams = {}) => {
    try {
      setLoading(true)
      console.log('🔍 [WalkSearchScreen] 필터 적용 검색:', filterParams);
      
      // trails.js의 getTrailList 함수 호출
      const data = await getTrailList(filterParams)
      console.log('📊 [WalkSearchScreen] 필터 검색 결과:', data?.length || 0, '개');

      let sortedData = Array.isArray(data) ? data : []

      // 현재 위치 기준으로 거리 계산 및 정렬
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

      setSearchResults(sortedData)
      setHasSearched(true) // 🔥 검색했음을 표시
    } catch (e) {
      console.error("❌ [WalkSearchScreen] 필터 검색 실패:", e)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    console.log('🎯 [WalkSearchScreen] 필터 적용:', filters);
    loadTrailsWithFilters(filters)
    setShowFilters(false)
  }

  const resetFilters = () => {
    console.log('🔄 [WalkSearchScreen] 필터 초기화');
    setFilters({ cityName: "", difficultyLevel: "" })
    setSearchResults([])
    setHasSearched(false) // 🔥 검색 상태 초기화
    setShowFilters(false)
  }

  // 🔥 키워드 검색
  const performSearch = async (query) => {
    const q = query.trim()
    if (!q) {
      console.log('🔍 [WalkSearchScreen] 검색어 없음 - 결과 초기화');
      setSearchResults([])
      setHasSearched(false) // 🔥 검색 상태 초기화
      return
    }
    
    try {
      setLoading(true)
      setHasSearched(true) // 🔥 검색 시작함을 표시
      console.log('🔍 [WalkSearchScreen] 키워드 검색 시작:', q);
      
      // trails.js의 searchTrails 함수 호출
      const data = await searchTrails(q)
      console.log('📊 [WalkSearchScreen] 키워드 검색 결과:', data?.length || 0, '개');
      
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("❌ [WalkSearchScreen] 키워드 검색 실패:", e)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // 🔥 debounced 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const handleTrailPress = (trailId, trailData) => {
    console.log('🎯 [WalkSearchScreen] 산책로 선택:', {
      trailId,
      trailName: trailData?.trailName || trailData?.name
    });
    
    // CourseDetail로 네비게이션
    navigation.navigate("CourseDetail", { 
      courseId: trailId,
      trailId: trailId,
      courseData: {
        id: trailId,
        name: trailData?.trailName || trailData?.name || "산책로",
        distance: trailData?.lengthDetail ? `${trailData.lengthDetail}km` : trailData?.length,
        difficulty: trailData?.difficultyLevel || trailData?.difficulty,
        reportCount: trailData?.reportCount || 0,
        latitude: parseFloat(trailData?.spotLatitude || trailData?.latitude || 37.5665),
        longitude: parseFloat(trailData?.spotLongitude || trailData?.longitude || 126.978),
        address: trailData?.lotNumberAddress || trailData?.address || '주소 정보 없음',
        region: trailData?.cityName || trailData?.region || '지역 정보 없음',
        duration: trailData?.trackTime || trailData?.duration || '1시간',
      }
    });
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
    <TouchableOpacity 
      style={styles.searchItem} 
      onPress={() => handleTrailPress(item.trailId, item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.trailName || item.name || "산책로 이름"}</Text>
        <Text style={styles.itemAddress}>{item.cityName || item.address || "위치 정보 없음"}</Text>
        {item.trailTypeName && (
          <Text style={styles.itemType}>유형: {item.trailTypeName}</Text>
        )}
        <View style={styles.itemInfo}>
          <View style={styles.infoItem}>
            <Icon name="place" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>
              {item.lengthDetail ? `${item.lengthDetail}km` : item.length || "거리 정보 없음"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="schedule" size={screenWidth * 0.03} color="#666" />
            <Text style={styles.infoText}>
              {item.trackTime || "소요시간 정보 없음"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficultyLevel || item.difficulty) }]}>
              {item.difficultyLevel || item.difficulty || "난이도 정보 없음"}
            </Text>
          </View>
          {item.reportCount !== undefined && (
            <View style={styles.infoItem}>
              <Icon name="delete" size={screenWidth * 0.03} color="#FF5722" />
              <Text style={styles.infoText}>{item.reportCount}개</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const goBack = () => navigation.goBack()
  const goToProfile = () => navigation.navigate("내 플로깅 기록")

  // 🔥 초기 상태 컴포넌트
  const renderInitialState = () => (
    <View style={styles.initialContainer}>
      <Icon name="search" size={screenWidth * 0.2} color="#E0E0E0" />
      <Text style={styles.initialTitle}>산책로를 검색해보세요</Text>
      <Text style={styles.initialSubText}>지역명이나 산책로 이름을 입력하거나{"\n"}필터를 사용해서 찾아보세요</Text>
      
      {/* 인기 검색어 예시 */}
      <View style={styles.popularKeywordsContainer}>
        <Text style={styles.popularKeywordsTitle}>인기 검색어</Text>
        <View style={styles.keywordsContainer}>
          {["한강공원", "남산", "올림픽공원", "청계천", "여의도"].map((keyword) => (
            <TouchableOpacity
              key={keyword}
              style={styles.keywordChip}
              onPress={() => setSearchQuery(keyword)}
            >
              <Text style={styles.keywordText}>{keyword}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* 검색바 + 마이페이지 분리 */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Icon name="arrow-back" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
          <Icon name="search" size={screenWidth * 0.05} color="#888" style={styles.searchIcon} />
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
              <Icon name="clear" size={screenWidth * 0.05} color="#888" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
            <Icon name="tune" size={screenWidth * 0.05} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileButtonContainer}>
          <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
            <Icon name="person" size={screenWidth * 0.06} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 필터 영역 */}
      {showFilters && (
        <View style={styles.filterContainer}>

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

      {/* 메인 컨텐츠 영역 */}
      <View style={styles.mainContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>검색 중...</Text>
          </View>
        ) : !hasSearched ? (
          // 🔥 검색하지 않은 초기 상태
          renderInitialState()
        ) : (
          // 🔥 검색 결과가 있는 상태
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>검색 결과 {searchResults.length}개</Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item, idx) => String(item.trailId ?? item.id ?? idx)}
              renderItem={renderSearchItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="search" size={screenWidth * 0.15} color="#CCC" />
                  <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                  <Text style={styles.emptySubText}>다른 검색어를 입력해보세요.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
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
  
  // 🔥 메인 컨텐츠 영역
  mainContent: {
    flex: 1,
    paddingHorizontal: PADDING_H,
  },
  
  // 🔥 초기 상태 스타일
  initialContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: screenHeight * 0.1,
  },
  initialTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "600",
    color: "#333",
    marginTop: PADDING_H,
    marginBottom: PADDING_H / 2,
  },
  initialSubText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    textAlign: "center",
    lineHeight: screenWidth * 0.05,
    marginBottom: PADDING_H * 2,
  },
  popularKeywordsContainer: {
    width: "100%",
    alignItems: "center",
  },
  popularKeywordsTitle: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333",
    marginBottom: PADDING_H,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: PADDING_H / 2,
    justifyContent: "center",
  },
  keywordChip: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: PADDING_H,
    paddingVertical: PADDING_H / 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  keywordText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    fontWeight: "500",
  },
  
  // 검색 결과 스타일
  resultsContainer: {
    flex: 1,
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
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: PADDING_H,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    flexWrap: "wrap",
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
})