"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import MapView, { Polyline, Marker } from "react-native-maps"
import Icon from "react-native-vector-icons/MaterialIcons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 시간을 포맷하는 헬퍼 함수
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0분"
  
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hrs > 0) {
    return `${hrs}시간 ${mins}분 ${secs}초`
  } else if (mins > 0) {
    return `${mins}분 ${secs}초`
  } else {
    return `${secs}초`
  }
}

// 거리를 포맷하는 헬퍼 함수
const formatDistance = (meters) => {
  if (!meters || meters === 0) return "0m"
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`
  } else {
    return `${Math.round(meters)}m`
  }
}

export default function PloggingRecordScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const [recordData, setRecordData] = useState(null)
  const [trashList, setTrashList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecordData()
    loadTrashList()
  }, [])

  const loadRecordData = async () => {
    try {
      setIsLoading(true)
      
      // route.params에서 전달받은 데이터가 있는지 확인
      if (route.params?.result) {
        console.log("Using passed result data:", route.params.result)
        
        // 전달받은 플로깅 결과를 적절한 형태로 변환
        const result = route.params.result;
        const transformedData = {
          id: Date.now(),
          title: "오늘의 플로깅 기록",
          date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
          location: "플로깅 경로",
          duration: formatDuration(result.totalTime || 0), // 초 단위를 시:분:초로 변환
          distance: formatDistance(result.totalDistance || 0), // 미터를 적절한 단위로 변환
          trashCount: result.trashCount || 0,
          calories: Math.round((result.totalDistance || 0) * 0.05) || 0, // 대략적인 칼로리 계산
          route: result.routeCoordinates || [],
          trashLocations: result.trashLocations || [],
          mapImage: result.mapImage, // 캡처된 지도 이미지
          routeImage: result.routeImage, // 경로 이미지 (현재는 mapImage와 동일)
          routeImages: result.routeImages || (result.routeImage ? [result.routeImage] : null), // 이미지 배열
        };
        
        setRecordData(transformedData);
      } else if (route.params?.record) {
        console.log("Using passed record data:", route.params.record)
        setRecordData(route.params.record)
      } else {
        // 플로깅 데이터가 없는 경우 빈 데이터로 설정
        console.log("No plogging data available - showing empty state")
        const emptyData = {
          id: null,
          title: "플로깅 기록 없음",
          date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
          location: "기록된 경로가 없습니다",
          duration: "0분",
          distance: "0m",
          trashCount: 0,
          calories: 0,
          route: [],
          trashLocations: [],
          mapImage: null,
          routeImage: null,
        };
        setRecordData(emptyData);
      }
    } catch (error) {
      console.error("Failed to load record data:", error)
      // 에러 발생 시에도 빈 데이터로 설정
      const emptyData = {
        id: null,
        title: "플로깅 기록 없음",
        date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
        location: "기록된 경로가 없습니다",
        duration: "0분",
        distance: "0m",
        trashCount: 0,
        calories: 0,
        route: [],
        trashLocations: [],
        mapImage: null,
        routeImage: null,
      };
      setRecordData(emptyData);
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrashList = async () => {
    try {
      // route.params에서 전달받은 결과 데이터가 있는지 확인
      if (route.params?.result) {
        // 실제 플로깅 결과에서 수집된 쓰레기 목록 사용
        const result = route.params.result;
        if (result.collectedTrash && result.collectedTrash.length > 0) {
          console.log("Using collected trash data from plogging result")
          setTrashList(result.collectedTrash)
        } else {
          console.log("No trash collected during plogging")
          setTrashList([])
        }
      } else {
        // 플로깅 데이터가 없으면 빈 배열
        console.log("No plogging data available - empty trash list")
        setTrashList([])
      }
    } catch (error) {
      console.error("Failed to load trash list:", error)
      // 에러 발생 시 빈 배열
      setTrashList([])
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>기록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>플로깅 기록</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 산책로 대표 이미지 슬라이더 */}
        <View style={styles.imageSliderContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.imageSlider}
          >
            {recordData.routeImages && recordData.routeImages.length > 0 ? (
              recordData.routeImages.map((image, index) => (
                <View key={index} style={styles.imageSlide}>
                  <Image 
                    source={{ uri: image }} 
                    style={styles.routeImage}
                    resizeMode="cover"
                  />
                </View>
              ))
            ) : recordData.routeImage ? (
              <View style={styles.imageSlide}>
                <Image 
                  source={{ uri: recordData.routeImage }} 
                  style={styles.routeImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              // 이미지가 없는 경우
              <View style={[styles.imageSlide, styles.placeholderContainer]}>
                <Icon name="add-a-photo" size={48} color="#CCCCCC" />
                <Text style={styles.placeholderText}>이미지를 넣어주세요</Text>
              </View>
            )}
          </ScrollView>
          
          {/* 페이지 인디케이터 */}
          {recordData.routeImages && recordData.routeImages.length > 1 && (
            <View style={styles.pageIndicator}>
              {recordData.routeImages.map((_, index) => (
                <View key={index} style={styles.indicatorDot} />
              ))}
            </View>
          )}
        </View>

        {/* 기록 정보 */}
        <View style={styles.infoSection}>
          <Text style={styles.recordTitle}>{recordData.title}</Text>
          <Text style={styles.recordDate}>{recordData.date}</Text>
          <Text style={styles.recordLocation}>{recordData.location}</Text>

          {/* 통계 정보 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>시간</Text>
              <Text style={styles.statValue}>{recordData.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.statValue}>{recordData.distance}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>쓰레기</Text>
              <Text style={styles.statValue}>{recordData.trashCount}개</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>난이도</Text>
              <Text style={styles.statValue}>{recordData.difficultyLevel}</Text>
            </View>
          </View>

          {/* 경로 정보 */}
          {recordData.route && recordData.route.length > 0 && (
            <View style={styles.routeInfoContainer}>
              <Text style={styles.routeInfoTitle}>경로 정보</Text>
              <View style={styles.routeStats}>
                <View style={styles.routeStatItem}>
                  <Icon name="place" size={16} color="#418663" />
                  <Text style={styles.routeStatText}>
                    총 {recordData.route.length}개 지점 기록
                  </Text>
                </View>
                {recordData.mapImage && (
                  <View style={styles.routeStatItem}>
                    <Icon name="camera-alt" size={16} color="#418663" />
                    <Text style={styles.routeStatText}>경로 이미지 저장됨</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 지도 영역 - 경로정보 바로 아래로 이동 */}
          <View style={styles.mapContainer}>
            {recordData.mapImage ? (
              // 캡처된 지도 이미지 표시
              <Image 
                source={{ uri: recordData.mapImage }} 
                style={styles.mapImage}
                resizeMode="cover"
              />
            ) : recordData.route && recordData.route.length > 0 ? (
              // 구글맵 (기본 fallback) - 경로가 있을 때만
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: recordData.route[0].latitude,
                  longitude: recordData.route[0].longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                {/* 경로 표시 */}
                <Polyline
                  coordinates={recordData.route}
                  strokeColor="#418663"
                  strokeWidth={4}
                />
                
                {/* 시작점 */}
                <Marker coordinate={recordData.route[0]} title="시작점">
                  <View style={styles.startMarker}>
                    <Text style={styles.markerText}>시작</Text>
                  </View>
                </Marker>
                
                {/* 종료점 */}
                <Marker coordinate={recordData.route[recordData.route.length - 1]} title="종료점">
                  <View style={styles.endMarker}>
                    <Text style={styles.markerText}>종료</Text>
                  </View>
                </Marker>
                
                {/* 쓰레기 위치 */}
                {recordData.trashLocations.map((trash, index) => (
                  <Marker key={index} coordinate={trash}>
                    <View style={styles.trashMarker}>
                      <Icon name="delete" size={16} color="#418663" />
                    </View>
                  </Marker>
                ))}
              </MapView>
            ) : (
              // 경로가 없을 때 빈 상태 표시
              <View style={styles.emptyMapContainer}>
                <Icon name="map" size={64} color="#CCCCCC" />
                <Text style={styles.emptyMapText}>아직 플로깅 경로가 없습니다</Text>
                <Text style={styles.emptyMapSubtext}>플로깅을 시작하면 여기에 경로가 표시됩니다</Text>
              </View>
            )}
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.separator} />

        {/* 주운 쓰레기 섹션 */}
        <View style={styles.trashSection}>
          <View style={styles.trashSectionHeader}>
            <Text style={styles.trashSectionTitle}>주운 쓰레기</Text>
            <Text style={styles.trashSectionSubtitle}>플로깅중 주운 쓰레기 기록입니다</Text>
          </View>

          {/* 쓰레기 목록 */}
          {trashList.length > 0 ? (
            trashList.map((trash, index) => (
              <View key={trash.id} style={styles.trashCard}>
                <View style={styles.trashCardLeft}>
                  <View style={styles.trashNumber}>
                    <Text style={styles.trashNumberText}>{trash.number}</Text>
                  </View>
                  <View style={styles.trashInfo}>
                    <Text style={styles.trashTitle}>{trash.title}</Text>
                    <Text style={styles.trashDescription}>{trash.description}</Text>
                    <View style={styles.trashAmountContainer}>
                      <Text style={styles.trashAmountText}>#{trash.amount}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.trashImageContainer}>
                  <Image source={{ uri: trash.image }} style={styles.trashImage} />
                </View>
              </View>
            ))
          ) : (
            // 쓰레기 목록이 없을 때 빈 상태 표시
            <View style={styles.emptyTrashContainer}>
              <Icon name="delete-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTrashText}>아직 주운 쓰레기가 없습니다</Text>
              <Text style={styles.emptyTrashSubtext}>플로깅 중에 쓰레기를 주우면 여기에 기록됩니다</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: screenHeight * 0.05,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    letterSpacing: -0.1,
  },
  headerSpacer: {
    width: 34,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageSliderContainer: {
    height: 250,
    marginTop: 20,
    position: 'relative',
  },
  imageSlider: {
    height: '100%',
  },
  imageSlide: {
    width: screenWidth,
    height: '100%',
    paddingHorizontal: 20,
  },
  routeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999999',
    marginTop: 12,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  mapContainer: {
    height: 200,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  map: {
    flex: 1,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  emptyMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 40,
  },
  emptyMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMapSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  startMarker: {
    backgroundColor: "#418663",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  endMarker: {
    backgroundColor: "#FF3B30",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  trashMarker: {
    width: 24,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#418663",
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
  },
  recordTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.8)",
    marginBottom: 4,
  },
  recordLocation: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.6)",
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999999",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
  },
  routeInfoContainer: {
    marginTop: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
  },
  routeStats: {
    gap: 8,
  },
  routeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeStatText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  separator: {
    height: 4,
    backgroundColor: "rgba(170, 178, 200, 0.2)",
    marginVertical: 20,
  },
  trashSection: {
    paddingHorizontal: 20,
  },
  trashSectionHeader: {
    marginBottom: 20,
  },
  trashSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  trashSectionSubtitle: {
    fontSize: 10,
    fontWeight: "500",
    color: "#333333",
    lineHeight: 25,
  },
  trashCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },
  trashCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  trashNumber: {
    width: 20,
    height: 20,
    backgroundColor: "#418663",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  trashNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
  },
  trashInfo: {
    flex: 1,
  },
  trashTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  trashDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.6)",
    marginBottom: 8,
  },
  trashAmountContainer: {
    alignSelf: "flex-start",
  },
  trashAmountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#418663",
    backgroundColor: "#C8DECB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    textAlign: "center",
  },
  trashImageContainer: {
    width: 75,
    height: 75,
    borderRadius: 8,
    overflow: "hidden",
  },
  trashImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  emptyTrashContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTrashText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTrashSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
})