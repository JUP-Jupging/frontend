"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import MapView, { Polyline, Marker } from "react-native-maps"
import Icon from "react-native-vector-icons/MaterialIcons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 반응형 크기 상수 추가
const PADDING_H = screenWidth * 0.05
const HERO_HEIGHT = screenHeight * 0.3
const STAT_FONT_SIZE = screenWidth * 0.035
const TITLE_FONT_SIZE = screenWidth * 0.07

// 시간을 포맷하는 헬퍼 함수
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "00:00:00"
  
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 거리를 포맷하는 헬퍼 함수
const formatDistance = (meters) => {
  if (!meters || meters === 0) return "0km"
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)}km`
  } else {
    return `${(meters / 1000).toFixed(3)}km`
  }
}

export default function PloggingRecordScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const [recordData, setRecordData] = useState(null)
  const [trashList, setTrashList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 네비게이션 함수들
  const goToHome = () => navigation.navigate("Main")
  const goToMyPloggingRecords = () => navigation.navigate("내 플로깅 기록")
  const goToPloggingStart = () => navigation.navigate("PloggingStart")
  const goToTrashCanInfo = () => navigation.navigate("TrashCanInfo")

  useEffect(() => {
    loadRecordData()
    loadTrashList()
  }, [])
  

  const loadRecordData = async () => {
    try {
      setIsLoading(true)
      
      // route.params에서 전달받은 데이터가 있는지 확인
      if (route.params?.result) {
        console.log("✅ [PloggingRecord] 플로깅 결과 데이터 수신:", route.params.result)
        
        // 전달받은 플로깅 결과를 적절한 형태로 변환
        const result = route.params.result;
        const transformedData = {
          id: Date.now(),
          title: result.routeName || "플로깅 기록",
          date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, ''),
          location: result.routeLocation || "플로깅 경로",
          duration: formatDuration(result.totalTime || 0),
          distance: formatDistance(result.totalDistance || 0),
          trashCount: result.trashCount || 0,
          difficulty: "보통", // 기본값 설정
          route: result.routeCoordinates || [],
          trashLocations: result.trashLocations || [],
          mapImage: result.mapImage, // 🔥 캡처된 지도 이미지
          routeImage: result.routeImage || result.mapImage, // 🔥 경로 이미지
          startTime: result.startTime,
          endTime: result.endTime,
        };
        
        console.log("📋 [PloggingRecord] 변환된 데이터:", transformedData);
        setRecordData(transformedData);
        
        // 수집된 쓰레기 목록도 설정
        if (result.collectedTrash && result.collectedTrash.length > 0) {
          setTrashList(result.collectedTrash.map((trash, index) => ({
            ...trash,
            number: (index + 1).toString(),
            tag: "수집됨"
          })));
        }
        
        return;
      }
      
      // API 호출로 실제 데이터 로드 (route.params가 없는 경우)
      // const response = await fetch(`https://your-api.com/api/plogging/records/${recordId}`)
      // const data = await response.json()
      
      // 시뮬레이션: 더미 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const dummyData = {
        id: 1,
        title: "남산",
        date: "25.07.07",
        location: "서울",
        duration: "00:48:30",
        distance: "5.11km",
        trashCount: 0,
        difficulty: "쉬움",
        route: [
          { latitude: 37.5665, longitude: 126.9780 },
          { latitude: 37.5675, longitude: 126.9790 },
          { latitude: 37.5685, longitude: 126.9800 },
        ],
        routeImage: "https://example.com/route-image.jpg",
        mapImage: null,
      }
      
      setRecordData(dummyData)
    } catch (error) {
      console.error("❌ [PloggingRecord] 기록 데이터 로드 실패:", error)
      // 에러 시 빈 데이터
      const emptyData = {
        title: "플로깅 기록 없음",
        date: new Date().toLocaleDateString('ko-KR'),
        location: "기록된 경로가 없습니다",
        duration: "00:00:00",
        distance: "0km",
        trashCount: 0,
        difficulty: "없음",
        route: [],
      }
      setRecordData(emptyData)
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
          console.log("✅ [PloggingRecord] 수집된 쓰레기 데이터 사용:", result.collectedTrash)
          const formattedTrashList = result.collectedTrash.map((trash, index) => ({
            id: trash.id || (index + 1),
            number: (index + 1).toString(),
            type: trash.type || trash.title || "쓰레기",
            location: trash.location || `${trash.amount || '보통'} 크기`,
            tag: "수집됨",
            image: "https://via.placeholder.com/75x75/E8F5E8/4CAF50?text=Collected"
          }));
          setTrashList(formattedTrashList);
          return;
        } else {
          console.log("ℹ️ [PloggingRecord] 수집된 쓰레기 없음")
          setTrashList([]);
          return;
        }
      }
      
      // API 호출로 쓰레기 목록 로드 (route.params가 없는 경우에만)
      // const response = await fetch(`https://your-api.com/api/plogging/records/${recordId}/trash`)
      // const data = await response.json()
      
      // 시뮬레이션: 더미 데이터 (실제 플로깅 데이터가 없을 때만 사용)
      const dummyTrashList = [
        {
          id: 1,
          number: "1",
          type: "플라스틱 병",
          location: "플라스틱 병 외 7개",
          tag: "많음",
          image: "https://example.com/trash1.jpg"
        },
        {
          id: 2,
          number: "2",
          type: "나무 잎 쓰레기",
          location: "유리병 외 7개",
          tag: "적음",
          image: "https://example.com/trash2.jpg"
        }
      ];
      
      setTrashList(dummyTrashList);
    } catch (error) {
      console.error("❌ [PloggingRecord] 쓰레기 목록 로드 실패:", error)
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
        <TouchableOpacity style={styles.backButton} onPress={goToHome}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton} onPress={goToMyPloggingRecords}>
          <Image 
            source={require("../assets/user.png")} 
            style={styles.profileIcon} 
            resizeMode="contain" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* 🔥 캡처된 지도 이미지 또는 대표 이미지 */}
        <View style={styles.heroImageContainer}>
          {recordData.mapImage ? (
            <Image 
              source={{ uri: recordData.mapImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <Image 
              source={{ uri: "https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Plogging+Route" }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
          {/* 페이지 인디케이터 */}
          <View style={styles.pageIndicator}>
            <View style={[styles.indicatorDot, styles.activeDot]} />
            <View style={styles.indicatorDot} />
          </View>
        </View>

        {/* 기본 정보 */}
        <View style={styles.mainInfoSection}>
          <Text style={styles.recordTitle}>{recordData.title}</Text>
          
          {/* 통계 정보 그리드 */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>플로깅 일자</Text>
              <Text style={styles.statValue}>{recordData.date}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>플로깅 시간</Text>
              <Text style={styles.statValue}>{recordData.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>운동 거리</Text>
              <Text style={styles.statValue}>{recordData.distance}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>난이도</Text>
              <Text style={styles.statValue}>{recordData.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* 🔥 경로 이미지 섹션 - 통계 정보와 주운 쓰레기 사이에 추가 */}
        {recordData.mapImage && (
          <View style={styles.routeImageSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>플로깅 경로</Text>
              <Text style={styles.sectionSubtitle}>이번 플로깅에서 이동한 경로입니다</Text>
            </View>
            <View style={styles.routeImageContainer}>
              <Image 
                source={{ uri: recordData.mapImage }}
                style={styles.routeImage}
                resizeMode="cover"
              />
              <View style={styles.routeImageOverlay}>
                <Icon name="route" size={24} color="#FFFFFF" />
                <Text style={styles.routeImageText}>총 거리: {recordData.distance}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 주운 쓰레기 섹션 */}
        <View style={styles.trashSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>주운 쓰레기</Text>
            <Text style={styles.sectionSubtitle}>플로깅중 주운 쓰레기 기록입니다</Text>
          </View>

          {trashList.length > 0 ? (
            trashList.map((trash, index) => (
              <View key={trash.id} style={styles.trashCard}>
                <View style={styles.trashCardLeft}>
                  <View style={styles.trashNumber}>
                    <Text style={styles.trashNumberText}>{trash.number}</Text>
                  </View>
                  <View style={styles.trashInfo}>
                    <Text style={styles.trashType}>{trash.type}</Text>
                    <Text style={styles.trashLocation}>{trash.location}</Text>
                    <View style={styles.trashTagContainer}>
                      <Text style={styles.trashTag}>#{trash.tag}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.trashImageContainer}>
                  <Image 
                    source={{ uri: "https://via.placeholder.com/75x75/E8F5E8/4CAF50?text=Trash" }}
                    style={styles.trashImage} 
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyTrashContainer}>
              <Icon name="delete-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTrashText}>아직 주운 쓰레기가 없습니다</Text>
            </View>
          )}
        </View>

        {/* 하단 버튼들 */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.trashCanButton} onPress={goToTrashCanInfo}>
            <Icon name="delete-outline" size={24} color="#333333" />
            <Text style={styles.trashCanButtonText}>근처 쓰레기통 찾기</Text>
          </TouchableOpacity>
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
    paddingHorizontal: PADDING_H,
    paddingVertical: screenHeight * 0.02,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: screenWidth * 0.012,
  },
  profileButton: {
    padding: screenWidth * 0.012,
  },
  profileIcon: {
    width: screenWidth * 0.06,
    height: screenWidth * 0.06,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: screenHeight * 0.04,
  },
  heroImageContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: screenHeight * 0.02,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: screenWidth * 0.015,
  },
  indicatorDot: {
    width: screenWidth * 0.02,
    height: screenWidth * 0.02,
    borderRadius: screenWidth * 0.01,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  mainInfoSection: {
    paddingHorizontal: PADDING_H,
    paddingVertical: screenHeight * 0.03,
  },
  recordTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: "700",
    color: "#333333",
    marginBottom: screenHeight * 0.03,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: screenHeight * 0.025,
    paddingHorizontal: PADDING_H * 0.2,
  },
  statItem: {
    alignItems: "center",
    minWidth: screenWidth * 0.18,
  },
  statLabel: {
    fontSize: screenWidth * 0.04,
    fontWeight: "500",
    color: "#999999",
    marginBottom: screenHeight * 0.005,
    textAlign: "center",
  },
  statValue: {
    fontSize: STAT_FONT_SIZE,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
  },

  // 🔥 경로 이미지 섹션 스타일 추가
  routeImageSection: {
    paddingHorizontal: PADDING_H,
    paddingVertical: screenHeight * 0.02,
    backgroundColor: "#F8F9FA",
  },
  routeImageContainer: {
    borderRadius: screenWidth * 0.03,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  routeImage: {
    width: '100%',
    height: screenHeight * 0.25,
  },
  routeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: screenHeight * 0.015,
    paddingHorizontal: screenWidth * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeImageText: {
    color: '#FFFFFF',
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
    marginLeft: screenWidth * 0.02,
  },

  trashSection: {
    paddingHorizontal: PADDING_H,
    paddingTop: screenHeight * 0.02,
  },
  sectionHeader: {
    marginBottom: screenHeight * 0.025,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "700",
    color: "#333333",
    marginBottom: screenHeight * 0.005,
  },
  sectionSubtitle: {
    fontSize: screenWidth * 0.03,
    fontWeight: "500",
    color: "#666666",
  },
  trashCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: screenWidth * 0.03,
    padding: screenWidth * 0.04,
    marginBottom: screenHeight * 0.015,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trashCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  trashNumber: {
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
    backgroundColor: "#4CAF50",
    borderRadius: screenWidth * 0.04,
    justifyContent: "center",
    alignItems: "center",
    marginRight: screenWidth * 0.04,
  },
  trashNumberText: {
    color: "#FFFFFF",
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
  },
  trashInfo: {
    flex: 1,
  },
  trashType: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333333",
    marginBottom: screenHeight * 0.005,
  },
  trashLocation: {
    fontSize: screenWidth * 0.035,
    fontWeight: "400",
    color: "#666666",
    marginBottom: screenHeight * 0.01,
  },
  trashTagContainer: {
    alignSelf: "flex-start",
  },
  trashTag: {
    fontSize: screenWidth * 0.03,
    fontWeight: "500",
    color: "#4CAF50",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: screenWidth * 0.02,
    paddingVertical: screenHeight * 0.005,
    borderRadius: screenWidth * 0.03,
  },
  trashImageContainer: {
    width: screenWidth * 0.15,
    height: screenWidth * 0.15,
    borderRadius: screenWidth * 0.02,
    overflow: "hidden",
  },
  trashImage: {
    width: "100%",
    height: "100%",
  },
  emptyTrashContainer: {
    alignItems: 'center',
    paddingVertical: screenHeight * 0.05,
  },
  emptyTrashText: {
    fontSize: screenWidth * 0.04,
    fontWeight: '500',
    color: '#666666',
    marginTop: screenHeight * 0.02,
  },
  bottomButtons: {
    paddingHorizontal: PADDING_H,
    paddingTop: screenHeight * 0.03,
    gap: screenHeight * 0.015,
  },
  trashCanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: screenWidth * 0.03,
    paddingVertical: screenHeight * 0.02,
    gap: screenWidth * 0.02,
  },
  trashCanButtonText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    color: "#333333",
  },
});