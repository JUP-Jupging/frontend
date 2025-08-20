"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import MapView, { Polyline, Marker } from "react-native-maps"
import Icon from "react-native-vector-icons/MaterialIcons"
import { getTrailDetail } from "../api/trails" // 🔥 산책로 상세정보 API 추가
import { formatUserFriendlyDate, formatPloggingTime, formatDistance } from "../utils/timeUtils" // ✅ 시간 유틸리티 import

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 반응형 크기 상수 추가
const PADDING_H = screenWidth * 0.05
const HERO_HEIGHT = screenHeight * 0.3
const STAT_FONT_SIZE = screenWidth * 0.035
const TITLE_FONT_SIZE = screenWidth * 0.07

export default function PloggingRecordScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const [recordData, setRecordData] = useState(null)
  const [trashList, setTrashList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [trailDetail, setTrailDetail] = useState(null) // 🔥 산책로 상세정보 상태 추가
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // 🔥 현재 이미지 인덱스
  const [dataSource, setDataSource] = useState('unknown') // ✅ 데이터 소스 추적

  // 네비게이션 함수들
  const goToHome = () => navigation.navigate("Main")
  const goToMyPloggingRecords = () => navigation.navigate("내 플로깅 기록")
  const goToPloggingStart = () => navigation.navigate("PloggingStart")
  const goToTrashCanInfo = () => navigation.navigate("TrashCanInfo")

  useEffect(() => {
    console.log("🎬 [PloggingRecord] useEffect 시작 - loadRecordData, loadTrashList 호출")
    loadRecordData()
    loadTrashList()
  }, [])
  

  // 🔥 trailDetail이 업데이트될 때마다 이미지 상태 로깅
  useEffect(() => {
    if (trailDetail) {
      console.log("📄 [PloggingRecord] trailDetail 업데이트됨:")
      console.log("  - img1:", trailDetail.img1)
      console.log("  - img2:", trailDetail.img2)
      console.log("  - 기타 이미지 필드들:", {
        imageUrl: trailDetail.imageUrl,
        image: trailDetail.image,
        images: trailDetail.images,
        picture: trailDetail.picture,
        photo: trailDetail.photo
      })
    }
  }, [trailDetail])

  // 🔥 산책로 상세정보 로드 함수 추가
  const loadTrailDetail = async (trailId) => {
    try {
      console.log("🔍 [PloggingRecord] 산책로 상세정보 로드 시작:", trailId)
      console.log("🔍 [PloggingRecord] trailId 타입:", typeof trailId)
      console.log("🔍 [PloggingRecord] trailId 값:", JSON.stringify(trailId))
      
      const detail = await getTrailDetail(trailId)
      console.log("✅ [PloggingRecord] 산책로 상세정보 로드 성공")
      console.log("📋 [PloggingRecord] 상세정보 전체:", JSON.stringify(detail, null, 2))
      console.log("🖼️ [PloggingRecord] img1:", detail?.img1)
      console.log("🖼️ [PloggingRecord] img2:", detail?.img2)
      console.log("🖼️ [PloggingRecord] imageUrl:", detail?.imageUrl)
      console.log("🖼️ [PloggingRecord] 모든 이미지 관련 필드:", {
        img1: detail?.img1,
        img2: detail?.img2,
        imageUrl: detail?.imageUrl,
        image: detail?.image,
        images: detail?.images,
        picture: detail?.picture,
        photo: detail?.photo
      })
      
      setTrailDetail(detail)
      return detail
    } catch (error) {
      console.error("❌ [PloggingRecord] 산책로 상세정보 로드 실패:", error)
      console.error("❌ [PloggingRecord] 에러 상세:", error.message)
      console.error("❌ [PloggingRecord] 에러 스택:", error.stack)
      return null
    }
  }

  // 🔥 이미지 컴포넌트 - 에러 처리 추가
  const ImageWithFallback = ({ source, style, ...props }) => {
    const [hasError, setHasError] = useState(false)
    
    if (hasError || !source?.uri) {
      return (
        <View style={[style, styles.fallbackImageContainer]}>
          <Icon name="image-not-supported" size={48} color="#CCCCCC" />
          <Text style={styles.fallbackImageText}>이미지 없음</Text>
        </View>
      )
    }
    
    return (
      <Image
        source={source}
        style={style}
        onError={() => setHasError(true)}
        {...props}
      />
    )
  }

  // 🔥 메인 히어로 이미지 생성 함수 (산책로 이미지 우선)
  const getHeroImages = () => {
    console.log("🖼️ [PloggingRecord] getHeroImages 호출")
    console.log("🔍 [PloggingRecord] trailDetail 상태:", !!trailDetail)
    console.log("🔍 [PloggingRecord] trailDetail 전체:", JSON.stringify(trailDetail, null, 2))
    
    const images = []
    
    // 🔥 산책로 이미지들만 추가 (img1, img2)
    if (trailDetail?.img1) {
      console.log("✅ [PloggingRecord] img1 추가:", trailDetail.img1)
      images.push({
        uri: trailDetail.img1,
        type: 'trail',
        label: '🏞️ 산책로 이미지 1'
      })
    } else {
      console.log("❌ [PloggingRecord] img1 없음")
    }
    
    if (trailDetail?.img2) {
      console.log("✅ [PloggingRecord] img2 추가:", trailDetail.img2)
      images.push({
        uri: trailDetail.img2,
        type: 'trail',
        label: '🏞️ 산책로 이미지 2'
      })
    } else {
      console.log("❌ [PloggingRecord] img2 없음")
    }
    
    // ✅ 플로깅 기록 이미지도 추가 (있는 경우)
    if (recordData?.mapImage && recordData.mapImage !== trailDetail?.img1 && recordData.mapImage !== trailDetail?.img2) {
      console.log("✅ [PloggingRecord] 플로깅 기록 이미지 추가:", recordData.mapImage)
      images.push({
        uri: recordData.mapImage,
        type: 'plogging',
        label: '📸 플로깅 기록 이미지'
      })
    }
    
    // 이미지가 없으면 기본 이미지 (이제 아이콘으로 대체됨)
    if (images.length === 0) {
      console.log("⚠️ [PloggingRecord] 이미지가 없어 기본 이미지 사용")
      images.push({
        uri: null, // null로 설정하면 ImageWithFallback에서 아이콘으로 대체
        type: 'placeholder',
        label: '🏞️ 플로깅 기록'
      })
    }
    
    console.log("📋 [PloggingRecord] 최종 이미지 배열:", images.map(img => ({
      type: img.type,
      label: img.label,
      hasUri: !!img.uri
    })))
    
    return images
  }

  const loadRecordData = async () => {
    try {
      setIsLoading(true)
      
      // ✅ route.params에서 전달받은 데이터가 있는지 확인
      if (route.params?.result) {
        console.log("✅ [PloggingRecord] 플로깅 결과 데이터 수신:", route.params.result)
        
        // ✅ 데이터 소스 확인
        const result = route.params.result;
        
        if (result._detailData) {
          console.log("📊 [PloggingRecord] 마이페이지에서 온 상세 데이터")
          setDataSource('mypage')
        } else {
          console.log("📊 [PloggingRecord] 플로깅 종료 후 실시간 데이터")
          setDataSource('realtime')
        }
        
        // 전달받은 플로깅 결과를 적절한 형태로 변환
        const transformedData = {
          id: result.ploggingId || Date.now(),
          title: result.title || result.routeName || "플로깅 기록",
          date: result.date || formatUserFriendlyDate(new Date().toISOString()),
          location: result.location || result.routeLocation || "플로깅 경로",
          duration: result.duration || formatPloggingTime(result.totalTime || 0),
          distance: result.distance || formatDistance(result.totalDistance || 0),
          trashCount: result.trashCount || 0,
          difficulty: result.difficulty || "보통",
          route: result.route || result.routeCoordinates || [],
          trashLocations: result.trashLocations || [],
          mapImage: result.mapImage, // 🔥 캡처된 지도 이미지
          routeImage: result.routeImage || result.mapImage, // 🔥 경로 이미지
          startTime: result.startTime,
          endTime: result.endTime,
        };
        
        console.log("📋 [PloggingRecord] 변환된 데이터:", transformedData);
        setRecordData(transformedData);
        
        // 🔥 산책로 ID가 있으면 상세정보 로드
        if (result.trailId) {
          console.log("🔍 [PloggingRecord] 산책로 ID 발견, 상세정보 로드:", result.trailId)
          await loadTrailDetail(result.trailId)
        }
        
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
      
      // ✅ API 호출로 실제 데이터 로드 (route.params가 없는 경우)
      console.log("⚠️ [PloggingRecord] route.params 없음, 기본 데이터 사용")
      setDataSource('fallback')
      
      // 시뮬레이션: 더미 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const dummyData = {
        id: 1,
        title: "남산",
        date: formatUserFriendlyDate(new Date().toISOString()),
        location: "서울",
        duration: formatPloggingTime("2910"), // 48분 30초
        distance: formatDistance(5110), // 5.11km
        trashCount: 0,
        difficulty: "쉬움",
        route: [
          { latitude: 37.5665, longitude: 126.9780 },
          { latitude: 37.5675, longitude: 126.9790 },
          { latitude: 37.5685, longitude: 126.9800 },
        ],
        routeImage: "https://example.com/route-image.jpg",
        mapImage: null,
        _dataSource: 'fallback'
      }
      
      setRecordData(dummyData)
    } catch (error) {
      console.error("❌ [PloggingRecord] 기록 데이터 로드 실패:", error)
      // 에러 시 빈 데이터
      const emptyData = {
        title: "플로깅 기록 없음",
        date: formatUserFriendlyDate(new Date().toISOString()),
        location: "기록된 경로가 없습니다",
        duration: formatPloggingTime(0),
        distance: formatDistance(0),
        trashCount: 0,
        difficulty: "없음",
        route: [],
        _dataSource: 'error'
      }
      setRecordData(emptyData)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrashList = async () => {
    try {
      // ✅ route.params에서 전달받은 결과 데이터가 있는지 확인
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
            image: "https://via.placeholder.com/75x75/E8F5E8/4CAF50?text=Collected",
            
            // ✅ 스웨거 응답의 쓰레기 세부 정보 추가
            details: {
              paper: trash.paper || 0,
              can: trash.can || 0,
              plastic: trash.plastic || 0,
              vinyl: trash.vinyl || 0,
              glass: trash.glass || 0,
              styro: trash.styro || 0,
              battery: trash.battery || 0
            }
          }));
          
          setTrashList(formattedTrashList);
          return;
        } else {
          console.log("ℹ️ [PloggingRecord] 수집된 쓰레기 없음")
          setTrashList([]);
          return;
        }
      }
      
      // ✅ API 호출로 쓰레기 목록 로드 (route.params가 없는 경우에만)
      console.log("⚠️ [PloggingRecord] route.params 없음, 더미 쓰레기 데이터 사용")
      
      // 시뮬레이션: 더미 데이터 (실제 플로깅 데이터가 없을 때만 사용)
      const dummyTrashList = [
        {
          id: 1,
          number: "1",
          type: "플라스틱 병",
          location: "플라스틱 병 외 7개",
          tag: "많음",
          image: "https://via.placeholder.com/75x75/E8F5E8/4CAF50?text=Trash",
          details: { plastic: 8, can: 0, paper: 0, vinyl: 0, glass: 0, styro: 0, battery: 0 }
        },
        {
          id: 2,
          number: "2",
          type: "나뭇잎 쓰레기",
          location: "유리병 외 7개",
          tag: "적음",
          image: "https://via.placeholder.com/75x75/E8F5E8/4CAF50?text=Trash",
          details: { glass: 8, can: 0, paper: 0, vinyl: 0, plastic: 0, styro: 0, battery: 0 }
        }
      ];
      
      setTrashList(dummyTrashList);
    } catch (error) {
      console.error("❌ [PloggingRecord] 쓰레기 목록 로드 실패:", error)
      setTrashList([])
    }
  }

  // ✅ 쓰레기 세부 정보를 한국어로 변환하는 함수
  const formatTrashDetails = (details) => {
    if (!details) return "상세 정보 없음";
    
    const typeMapping = {
      paper: "종이",
      can: "캔",
      plastic: "플라스틱",
      vinyl: "비닐",
      glass: "유리",
      styro: "스티로폼",
      battery: "배터리"
    };
    
    const items = [];
    for (const [key, koreanName] of Object.entries(typeMapping)) {
      if (details[key] && details[key] > 0) {
        items.push(`${koreanName} ${details[key]}개`);
      }
    }
    
    return items.length > 0 ? items.join(', ') : "수집된 쓰레기 없음";
  };

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
      {/* 🔥 수정된 헤더 - "플로깅 기록" 텍스트 추가 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goToHome}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        {/* 🔥 헤더 제목 추가 */}
        <Text style={styles.headerTitle}>플로깅 기록</Text>
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
        {/* 🔥 산책로 이미지를 우선으로 하는 히어로 이미지 */}
        <View style={styles.heroImageContainer}>
          <ImageWithFallback
            source={getHeroImages()[currentImageIndex]?.uri ? { uri: getHeroImages()[currentImageIndex].uri } : null}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* 페이지 인디케이터 */}
          <View style={styles.pageIndicator}>
            {getHeroImages().map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicatorDot, 
                  index === currentImageIndex && styles.activeDot
                ]} 
              />
            ))}
          </View>
        </View>

        {/* ✅ 데이터 소스 디버그 정보 (개발용) */}
        {__DEV__ && recordData?._dataSource && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              데이터 소스: {recordData._dataSource} | 이미지 수: {getHeroImages().length}
            </Text>
          </View>
        )}

        {/* 🔥 수정된 기본 정보 - 산책로 이름을 메인 타이틀로 표시 */}
        <View style={styles.mainInfoSection}>
          <Text style={styles.recordTitle}>
            {trailDetail?.trailName || trailDetail?.instlPlcNm || recordData.title}
          </Text>
          
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
              <Text style={styles.statValue}>{trailDetail?.difficultyLevel || recordData.difficulty}</Text>
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
              <ImageWithFallback
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
                    
                    {/* ✅ 쓰레기 세부 정보 표시 */}
                    {trash.details && (
                      <Text style={styles.trashDetails}>
                        {formatTrashDetails(trash.details)}
                      </Text>
                    )}
                    
                    <View style={styles.trashTagContainer}>
                      <Text style={styles.trashTag}>#{trash.tag}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.trashImageContainer}>
                  <ImageWithFallback
                    source={{ uri: trash.image || "https://via.placeholder.com/75x75/E8F5E8/4CAF50?text=Trash" }}
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
  // 🔥 헤더 제목 스타일 추가
  headerTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
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
  
  // 🔥 새로운 스크롤뷰 스타일들
  imageScrollView: {
    flex: 1,
  },
  imageSlide: {
    width: screenWidth,
    height: '100%',
    position: 'relative',
  },
  
  heroImage: {
    width: '100%',
    height: '100%',
  },
  
  // 🔥 Fallback 이미지 스타일 추가
  fallbackImageContainer: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  fallbackImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
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
  
  // 🔥 이미지 타입 라벨 스타일 수정
  imageTypeLabel: {
    position: 'absolute',
    top: screenHeight * 0.02,
    right: screenWidth * 0.04,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  trashDetails: {
    fontSize: screenWidth * 0.032,
    fontWeight: "400",
    color: "#888888",
    marginBottom: screenHeight * 0.008,
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
  
  // 🔥 디버그 정보 스타일 추가
  debugInfo: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    paddingHorizontal: PADDING_H,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  debugText: {
    fontSize: 12,
    color: "#FF8F00",
    fontWeight: "500",
    textAlign: "center",
  },
});