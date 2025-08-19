"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DropDownPicker from "react-native-dropdown-picker"
import { usePloggingContext } from "../contexts/PloggingContext"
import { useLocation } from "../hooks/useLocation" // 위치 훅 추가
import { getNearbyTrails, getTrailList } from "../api/trails" // API 함수들 추가

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Responsive size constants
const PADDING_H = screenWidth * 0.04
const ICON_SIZE = screenWidth * 0.15
const BANNER_HEIGHT = screenHeight * 0.15
const PICK_CARD_WIDTH = screenWidth * 0.45
const PICK_IMAGE_HEIGHT = PICK_CARD_WIDTH * 0.7

// 더미 데이터 (오늘의 플로깅용)
const DUMMY_TODAY_DATA = {
  timeSpent: 0,
  targetTime: 60,
  distance: 0.0,
  targetDistance: 3.0,
  trashCount: 0,
}

export default function MainScreen({ navigation }) {
  // 플로깅 전역 상태 확인
  const { 
    status, 
    time, 
    formatTime, 
    trashCount, 
    totalDistance, 
    formatDistance,
    isBackgroundMode 
  } = usePloggingContext();
  
  // 위치 훅 사용
  const { currentLocation, getCurrentLocation } = useLocation();
  
  const [selectedTag, setSelectedTag] = useState("가까운 곳")
  const [todayData, setTodayData] = useState(DUMMY_TODAY_DATA)
  const [nearbyTrails, setNearbyTrails] = useState([]) // 가까운 산책로들
  const [trashyTrails, setTrashyTrails] = useState([]) // 쓰레기 많은 산책로들
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)

  // Progress Bar 컴포넌트
  const ProgressBar = ({ progress, color = "#4CAF50", height = 4 }) => {
    return (
      <View style={[styles.progressBarContainer, { height }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    )
  }

  // 네비게이션 함수들
  const goToRealtimePlogging = () => navigation.navigate("RealtimePlogging")
  const goToRecommend = () => navigation.navigate("추천 코스")
  const goToReport = () => navigation.navigate("쓰레기 제보")
  const goToPlogging = () => navigation.navigate("PloggingStart")
  const goToTrashBin = () => navigation.navigate("TrashCanInfo")
  const goToMyPloggingRecords = () => navigation.navigate("내 플로깅 기록")
  const goToRecommendCourse = () => navigation.navigate("RecommendCourse")

  // 플로깅 화면으로 이동 (진행 중일 때)
  const goToPloggingScreen = () => {
    if (status === "running" || status === "paused") {
      navigation.navigate("PloggingStart");
    } else {
      goToRealtimePlogging();
    }
  };

  // 가까운 산책로 5개 가져오기
  const fetchNearbyTrails = async () => {
    try {
      console.log('📍 [MainScreen] 가까운 산책로 조회 시작');
      console.log('- 현재 위치:', currentLocation);
      
      if (!currentLocation?.latitude || !currentLocation?.longitude) {
        console.log('⚠️ [MainScreen] 현재 위치 정보 없음 - 위치 재조회');
        await getCurrentLocation();
        return;
      }

      // trails.js의 getNearbyTrails 함수 사용
      const nearbyData = await getNearbyTrails(currentLocation.latitude, currentLocation.longitude);
      console.log('✅ [MainScreen] 가까운 산책로 조회 성공:', nearbyData?.length || 0, '개');
      
      // 🔥 받아온 데이터 상세 로깅
      if (nearbyData && nearbyData.length > 0) {
        console.log('🔍 [MainScreen] 가까운 산책로 상세 정보:');
        nearbyData.slice(0, 5).forEach((trail, index) => {
          console.log(`  ${index + 1}. ${trail.trailName || trail.instlPlcNm}`, {
            trailId: trail.trailId,
            거리: trail.lengthDetail ? `${trail.lengthDetail}km` : trail.length,
            난이도: trail.difficultyLevel,
            쓰레기제보: trail.reportCount,
            위치: `${trail.spotLatitude}, ${trail.spotLongitude}`,
            이미지1: trail.img1 ? '있음' : '없음',
            이미지2: trail.img2 ? '있음' : '없음',
            도시: trail.cityName,
            관리기관: trail.mngInstNm
          });
        });
      }
      
      // 상위 5개만 선택
      const trails = nearbyData.slice(0, 5);
      setNearbyTrails(trails);
      
    } catch (error) {
      console.error('❌ [MainScreen] 가까운 산책로 조회 실패:', error);
      setNearbyTrails([]);
    }
  };

  // 쓰레기 많은 산책로 5개 가져오기
  const fetchTrashyTrails = async () => {
    try {
      console.log('🗑️ [MainScreen] 쓰레기 많은 산책로 조회 시작');
      
      // 전체 산책로 목록 조회
      const allTrails = await getTrailList();
      console.log('📊 [MainScreen] 전체 산책로 수:', allTrails?.length || 0);
      
      if (!allTrails || allTrails.length === 0) {
        setTrashyTrails([]);
        return;
      }

      // 1. reportCount 기준으로 정렬 (내림차순)
      // 2. reportCount가 같으면 현재 위치에서 가까운 순으로 정렬
      const sortedTrails = allTrails
        .filter(trail => trail.reportCount !== undefined && trail.reportCount !== null)
        .sort((a, b) => {
          // 먼저 reportCount로 정렬 (많은 순)
          if (b.reportCount !== a.reportCount) {
            return b.reportCount - a.reportCount;
          }
          
          // reportCount가 같으면 거리순으로 정렬 (가까운 순)
          if (currentLocation?.latitude && currentLocation?.longitude && 
              a.spotLatitude && a.spotLongitude && 
              b.spotLatitude && b.spotLongitude) {
            
            const distanceA = calculateDistance(
              currentLocation.latitude, 
              currentLocation.longitude,
              parseFloat(a.spotLatitude),
              parseFloat(a.spotLongitude)
            );
            
            const distanceB = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude, 
              parseFloat(b.spotLatitude),
              parseFloat(b.spotLongitude)
            );
            
            return distanceA - distanceB;
          }
          
          return 0;
        });

      console.log('🏆 [MainScreen] 쓰레기 많은 산책로 정렬 완료');
      
      // 🔥 상위 5개 산책로 상세 정보 로깅
      const top5 = sortedTrails.slice(0, 5);
      console.log('🔍 [MainScreen] 쓰레기 많은 산책로 TOP 5 상세:');
      top5.forEach((trail, index) => {
        const distance = currentLocation?.latitude && currentLocation?.longitude && 
                        trail.spotLatitude && trail.spotLongitude 
          ? calculateDistance(
              currentLocation.latitude, 
              currentLocation.longitude,
              parseFloat(trail.spotLatitude),
              parseFloat(trail.spotLongitude)
            )
          : null;
        
        console.log(`  ${index + 1}. ${trail.trailName || trail.instlPlcNm}`, {
          trailId: trail.trailId,
          쓰레기제보: trail.reportCount,
          거리: trail.lengthDetail ? `${trail.lengthDetail}km` : trail.length,
          난이도: trail.difficultyLevel,
          위치: `${trail.spotLatitude}, ${trail.spotLongitude}`,
          현재위치로부터거리: distance ? `${(distance/1000).toFixed(1)}km` : '계산불가',
          이미지1: trail.img1 ? '있음' : '없음',
          이미지2: trail.img2 ? '있음' : '없음',
          도시: trail.cityName,
          관리기관: trail.mngInstNm
        });
      });
      
      // 상위 5개만 선택
      setTrashyTrails(top5);
      
    } catch (error) {
      console.error('❌ [MainScreen] 쓰레기 많은 산책로 조회 실패:', error);
      setTrashyTrails([]);
    }
  };

  // 두 좌표 간의 거리 계산 (미터 단위)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // DB에서 오늘의 플로깅 데이터 가져오기 (완료된 플로깅 기록만)
  const fetchTodayData = async () => {
    try {
      setLoading(true)

      // 오늘 날짜 생성 (YYYY-MM-DD 형식)
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]

      // 실제 API 호출 - 오늘 날짜로 완료된 플로깅 기록 조회
      // const response = await fetch(`https://your-api.com/api/plogging/records/today?date=${todayString}`);
      // const data = await response.json();

      // 시뮬레이션: API 호출 대신 더미 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 확인용 더미 데이터 - 항상 데이터가 있는 것으로 표시
      const todayRecord = {
        timeSpent: 75, // 1시간 15분
        targetTime: 60,
        distance: 2.8, // 2.8km
        targetDistance: 3.0,
        trashCount: 12, // 12개
      }
      setTodayData(todayRecord)
    } catch (error) {
      console.error("Failed to fetch today's plogging data:", error)
      // 에러 발생시 초기값 사용
      setTodayData(DUMMY_TODAY_DATA)
    } finally {
      setLoading(false)
    }
  }

  // 추천 코스 데이터 가져오기 (실제 API 사용)
  const fetchRecommendedCourses = async () => {
    try {
      setCoursesLoading(true)
      console.log('🔄 [MainScreen] 추천 코스 조회 시작');

      // 현재 위치 확인
      if (!currentLocation?.latitude || !currentLocation?.longitude) {
        console.log('⚠️ [MainScreen] 위치 정보 없음 - 위치 재조회');
        await getCurrentLocation();
      }

      // 병렬로 두 API 호출
      await Promise.all([
        fetchNearbyTrails(),
        fetchTrashyTrails()
      ]);

      console.log('✅ [MainScreen] 모든 추천 코스 조회 완료');
      
    } catch (error) {
      console.error('❌ [MainScreen] 추천 코스 조회 실패:', error);
    } finally {
      setCoursesLoading(false)
    }
  }

  // 태그별 코스 필터링
  const getFilteredCourses = () => {
    if (selectedTag === "가까운 곳") {
      return nearbyTrails;
    } else if (selectedTag === "쓰레기 많은 곳") {
      return trashyTrails;
    }
    return [];
  }

  // 거리 포맷팅 함수
  const formatTrailDistance = (lengthDetail) => {
    if (!lengthDetail) return "거리 정보 없음";
    
    // lengthDetail이 km 단위인 경우 (예: 3.6)
    if (typeof lengthDetail === 'number') {
      if (lengthDetail < 1) {
        return `${Math.round(lengthDetail * 1000)}m`;
      } else {
        return `${lengthDetail.toFixed(1)}km`;
      }
    }
    
    // 문자열인 경우 그대로 반환
    return lengthDetail;
  };

  // 난이도 한글 변환
  const getDifficultyText = (level) => {
    switch(level) {
      case '쉬움': return '쉬움';
      case '보통': return '보통'; 
      case '어려움': return '어려움';
      default: return '보통';
    }
  };

  // 쓰레기 레벨 계산
  const getTrashLevel = (reportCount) => {
    if (!reportCount || reportCount === 0) return '적음';
    if (reportCount >= 10) return '많음';
    if (reportCount >= 5) return '보통';
    return '적음';
  };

  useEffect(() => {
    fetchTodayData()
    fetchRecommendedCourses()
  }, [currentLocation]) // 현재 위치가 변경되면 다시 조회

  const filteredCourses = getFilteredCourses()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: PADDING_H * 2 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image source={require("../assets/logo.png")} style={styles.logoImage} />
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate("코스 검색")}>
          <Icon name="search" size={screenWidth * 0.04} color="#888" />
          <Text style={styles.searchPlaceholder}>산책로 검색</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={goToMyPloggingRecords}>
          <View style={styles.userIconContainer}>
            <Image 
              source={require("../assets/user.png")} 
              style={styles.userIcon} 
              resizeMode="contain" 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Top Section */}
      <View style={styles.topRow}>
        {/* Left Banner */}
        <View style={styles.leftBannerWrapper}>
          <Image source={require("../assets/trash_background.png")} style={styles.leftBanner} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerText}>주변 산책로를{"\n"}정리하고 싶다면</Text>
          </View>
        </View>

        {/* Right Cards */}
        <View style={styles.rightCards}>
          {/* 실시간 플로깅 카드 */}
          <TouchableOpacity style={styles.realtimePloggingCard} onPress={goToPloggingScreen}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {status === "running" || status === "paused" ? "플로깅 진행중" : "진행중인 플로깅"}
              </Text>
              {(status === "running" || status === "paused") && (
                <View style={[styles.statusIndicator, { backgroundColor: status === "running" ? "#4CAF50" : "#FFC107" }]} />
              )}
            </View>
            <Text style={styles.cardLink}>
              {status === "running" || status === "paused" ? "플로깅 화면으로 >" : "실시간 플로깅 >"}
            </Text>

            {/* Progress Bars */}
            <View style={styles.progressSection}>
              {(status === "running" || status === "paused") ? (
                // 플로깅 진행 중일 때만 실제 데이터 표시
                <>
                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>시간</Text>
                      <Text style={styles.progressValue}>{formatTime(time)} / 1시간</Text>
                    </View>
                    <ProgressBar 
                      progress={(time / 3600) * 100} 
                      color="#4CAF50" 
                    />
                  </View>

                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>거리</Text>
                      <Text style={styles.progressValue}>{formatDistance(totalDistance)} / 3.0km</Text>
                    </View>
                    <ProgressBar 
                      progress={(totalDistance / 3000) * 100} 
                      color="#2196F3" 
                    />
                  </View>

                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.trashCountText}>{trashCount}개</Text>
                    </View>
                  </View>
                </>
              ) : (
                // 플로깅 진행 중이 아닐 때는 빈 progress bar 표시
                <>
                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>시간</Text>
                      <Text style={styles.progressValue}>0분 / 1시간</Text>
                    </View>
                    <ProgressBar 
                      progress={0} 
                      color="#4CAF50" 
                    />
                  </View>

                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>거리</Text>
                      <Text style={styles.progressValue}>0.0km / 3.0km</Text>
                    </View>
                    <ProgressBar 
                      progress={0} 
                      color="#2196F3" 
                    />
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* 오늘의 플로깅 카드 - DB에서 오늘 완료된 플로깅 기록 표시 */}
          <View style={styles.todayPloggingCard}>
            {/* 상단 헤더 */}
            <View style={styles.todayCardHeader}>
              <Text style={styles.cardTitle}>오늘의 플로깅</Text>
              <Text style={styles.trashTitle}>주운 쓰레기 수</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>오늘 기록 조회중...</Text>
              </View>
            ) : (
              <View style={styles.todayDataContainer}>
                {(todayData.timeSpent === 0 && todayData.distance === 0 && todayData.trashCount === 0) ? (
                  // 오늘 플로깅 기록이 없는 경우
                  <View style={styles.noTodayDataContainer}>
                    <Text style={styles.noTodayDataText}>오늘 아직 플로깅을{"\n"}시작하지 않았어요</Text>
                    <Text style={styles.noTodayDataSubText}>플로깅을 시작해보세요!</Text>
                  </View>
                ) : (
                  // 오늘 플로깅 기록이 있는 경우
                  <View style={styles.todayMainRow}>
                    {/* 왼쪽: 시간과 거리 */}
                    <View style={styles.leftSection}>
                      <Text style={styles.timeText}>
                        {Math.floor(todayData.timeSpent / 60)}시간 {todayData.timeSpent % 60}분
                      </Text>
                      <Text style={styles.distanceText}>
                        {todayData.distance.toFixed(1)}km
                      </Text>
                    </View>
                    
                    {/* 오른쪽: 쓰레기 개수 */}
                    <View style={styles.rightSection}>
                      <Text style={styles.trashCountInline}>{todayData.trashCount}개</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Icon Row */}
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={goToRecommend} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
            <Image source={require("../assets/social-media2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>추천 코스</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToPlogging} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#E8F5E8" }]}>
            <Image source={require("../assets/road2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>플로깅 시작</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToReport} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
            <Image source={require("../assets/medical-prescription2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>쓰레기 제보</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToTrashBin} style={styles.iconBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
            <Image source={require("../assets/garbage2.png")} style={styles.icon} />
          </View>
          <Text style={styles.iconLabel}>쓰레기통</Text>
        </TouchableOpacity>
      </View>

      {/* Mission Banner */}
      <View style={styles.missionBanner}>
        <Image source={require("../assets/road.png")} style={styles.missionImage} />
        <View style={styles.missionTextContainer}>
          <Text style={styles.missionText}>산책로를 깨끗하게{"\n"}만드는데 동참하세요.</Text>
        </View>
      </View>

      {/* Pick Section */}
      <View style={styles.pickWrapper}>
        <Text style={styles.pickTitle}>줍깅 PICK 추천코스 🎉</Text>

        <View style={styles.pickTags}>
          <TouchableOpacity
            onPress={() => setSelectedTag("가까운 곳")}
            style={[styles.tag, selectedTag === "가까운 곳" && styles.tagSelected]}
          >
            <Text style={[styles.tagText, selectedTag === "가까운 곳" && styles.tagSelectedText]}># 가까운 곳</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTag("쓰레기 많은 곳")}
            style={[styles.tag, selectedTag === "쓰레기 많은 곳" && styles.tagSelected]}
          >
            <Text style={[styles.tagText, selectedTag === "쓰레기 많은 곳" && styles.tagSelectedText]}>
              # 쓰레기 많은 곳
            </Text>
          </TouchableOpacity>

          <View style={styles.tagSpacer} />

          <TouchableOpacity onPress={goToRecommend} style={styles.moreButton}>
            <Text style={styles.moreButtonText}>더보기</Text>
            <Icon name="chevron-right" size={screenWidth * 0.035} color="#666" />
          </TouchableOpacity>
        </View>

        {coursesLoading ? (
          <View style={styles.coursesLoadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.coursesLoadingText}>추천 코스 로딩중...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickScrollView}>
            {filteredCourses.map((course, index) => (
              <TouchableOpacity
                key={course.trailId || index}
                style={styles.pickCard}
                onPress={() => {
                  console.log('🎯 [MainScreen] 코스 카드 클릭:', {
                    trailId: course.trailId,
                    trailName: course.trailName || course.instlPlcNm,
                    selectedTag: selectedTag
                  });
                  console.log('📍 [MainScreen] CourseDetail로 네비게이션 시도...');
                  navigation.navigate("CourseDetail", { 
                    courseId: course.trailId,
                    trailId: course.trailId, // 호환성을 위한 중복
                    courseData: {
                      id: course.trailId,
                      name: course.trailName || course.instlPlcNm,
                      distance: course.lengthDetail ? `${course.lengthDetail}km` : course.length,
                      difficulty: course.difficultyLevel,
                      reportCount: course.reportCount,
                      latitude: parseFloat(course.spotLatitude),
                      longitude: parseFloat(course.spotLongitude),
                      address: course.lotNumberAddress || '주소 정보 없음',
                      region: course.cityName || '지역 정보 없음',
                      duration: course.trackTime || '1시간',
                    }
                  });
                }}
              >
                {/* 🖼️ 산책로 이미지 표시 */}
                {(course.img1 || course.img2) ? (
                  <Image 
                    source={{ uri: course.img1 || course.img2 }} 
                    style={styles.pickImage}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log('❌ 이미지 로드 실패:', course.img1 || course.img2, error);
                    }}
                  />
                ) : (
                  <View style={styles.pickImagePlaceholder}>
                    <Icon name="landscape" size={screenWidth * 0.08} color="#CCC" />
                    <Text style={styles.pickImagePlaceholderText}>이미지 없음</Text>
                  </View>
                )}
                
                <Text style={styles.pickCourseName}>{course.trailName || course.instlPlcNm}</Text>
                <View style={styles.pickInfoRow}>
                  <Text style={styles.pickInfoLabel}>거리:</Text>
                  <Text style={styles.pickDistance}>
                    {course.lengthDetail ? formatTrailDistance(course.lengthDetail) : course.length || "정보없음"}
                  </Text>
                  <Text style={styles.pickSeparator}>|</Text>
                  <Text style={styles.pickInfoLabel}>시간:</Text>
                  <Text style={styles.pickDistance}>{course.trackTime || "1시간"}</Text>
                </View>
                <View style={styles.pickTagsRow}>
                  <View
                    style={[
                      styles.pickTag,
                      {
                        backgroundColor:
                          getTrashLevel(course.reportCount) === "많음"
                            ? "#FFE0E0"
                            : getTrashLevel(course.reportCount) === "보통"
                              ? "#FFF3E0"
                              : "#E8F5E8",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickTagText,
                        {
                          color:
                            getTrashLevel(course.reportCount) === "많음"
                              ? "#D32F2F"
                              : getTrashLevel(course.reportCount) === "보통"
                                ? "#F57C00"
                                : "#388E3C",
                        },
                      ]}
                    >
                      쓰레기 {course.reportCount || 0}개
                    </Text>
                  </View>
                  <View style={[styles.pickTag, { backgroundColor: "#E3F2FD" }]}>
                    <Text style={[styles.pickTagText, { color: "#1976D2" }]}>
                      {getDifficultyText(course.difficultyLevel)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {!coursesLoading && filteredCourses.length === 0 && (
          <View style={styles.noCoursesContainer}>
            <Icon name="search" size={screenWidth * 0.1} color="#CCC" />
            <Text style={styles.noCoursesText}>
              {selectedTag === "가까운 곳" 
                ? "근처에 추천할 산책로가 없습니다." 
                : "쓰레기 제보가 있는 산책로가 없습니다."
              }
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header Styles
  headerRow: {

    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING_H,
    paddingTop: screenHeight * 0.05,
    paddingBottom: PADDING_H / 2,
  },
  logoImage: {
    width: screenWidth * 0.35,
    height: screenHeight * 0.04,
    resizeMode: "contain",
    marginRight: PADDING_H / 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: screenHeight * 0.012,
    paddingHorizontal: PADDING_H / 2,
    borderRadius: 20,
    marginRight: PADDING_H / 2,
  },
  searchPlaceholder: {
    fontSize: screenWidth * 0.035,
    color: "#888",
    marginLeft: PADDING_H / 3,
  },
  headerButton: {
    padding: 5,
  },
  userIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  userIcon: {
    width: 20,
    height: 20,
  },

  // Top Section Styles
  topRow: {
    flexDirection: "row",
    paddingHorizontal: PADDING_H,
    marginTop: PADDING_H,
    marginBottom: PADDING_H,
    height: screenHeight * 0.28,
  },
  leftBannerWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: PADDING_H / 2,
  },
  leftBanner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerTextContainer: {
    position: "absolute",
    top: PADDING_H,
    left: PADDING_H,
    right: PADDING_H,
  },
  bannerText: {
    color: "#fff",
    fontSize: screenWidth * 0.038,
    fontWeight: "700",
    paddingLeft: PADDING_H / 2,
    paddingRight: PADDING_H / 2,
    paddingTop: PADDING_H / 2,
    paddingBottom: PADDING_H / 2,
    borderRadius: 8,
    textAlign: "left",
    lineHeight: screenWidth * 0.05,
  },
  rightCards: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Realtime Plogging Card
  realtimePloggingCard: {
    flex: 1,
    backgroundColor: "rgba(76, 175, 80, 0.05)",
    borderRadius: 12,
    padding: PADDING_H / 2.5,
    marginBottom: PADDING_H / 2,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: screenWidth * 0.027, // 10px 상당
    fontWeight: "700",
    color: "#AAB2C8",
    flex: 1,
    lineHeight: screenWidth * 0.054, // 20px 상당
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  participantsText: {
    fontSize: screenWidth * 0.025,
    color: "#4CAF50",
    fontWeight: "600",
  },
  cardLink: {
    fontSize: screenWidth * 0.032,
    fontWeight: "700",
    color: "#333",
    marginBottom: PADDING_H / 4,
  },
  progressSection: {
    gap: PADDING_H / 6,
  },
  progressItem: {
    gap: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: screenWidth * 0.04,
    color: "#666",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: screenWidth * 0.025,
    color: "#333",
    fontWeight: "600",
  },
  trashCountText: {
    fontSize: screenWidth * 0.02,
    color: "#333",
    fontWeight: "200",
    textAlign: "center",
    lineHeight: screenWidth * 0.03,
  },

  // Progress Bar Styles
  progressBarContainer: {
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    borderRadius: 3,
  },

  // Today Plogging Card
  todayPloggingCard: {
    flex: 1,
    backgroundColor: "rgba(121, 121, 130, 0.1)",
    borderRadius: 10,
    padding: PADDING_H / 3,
    justifyContent: "flex-start",
  },
  todayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  trashTitle: {
    fontSize: screenWidth * 0.024, // 크기 증가 (6px -> 9px 상당)
    fontWeight: "700",
    color: "#AAB2C8",
    lineHeight: screenWidth * 0.054, // 20px 상당
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: PADDING_H / 1.5,
    flex: 1,
  },
  loadingText: {
    fontSize: screenWidth * 0.05,
    alignItems: 4,
    color: "#666",
  },
  todayDataContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  todayMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flex: 1,
    paddingHorizontal: 2,
  },
  leftSection: {
    flex: 1,
    justifyContent: "center",
  },
  rightSection: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  timeText: {
    fontSize: screenWidth * 0.035, // 12px 상당
    fontWeight: "700",
    color: "#333333",
    lineHeight: screenWidth * 0.1, // 20px 상당
  },
  distanceText: {
    fontSize: screenWidth * 0.032, // 12px 상당
    fontWeight: "700",
    color: "#333333",
    lineHeight: screenWidth * 0.054, // 20px 상당
  },
  trashCountBig: {
    fontSize: screenWidth * 0.08,
    fontWeight: "800",
    color: "#333",
    lineHeight: screenWidth * 0.1,
  },
  trashCountInline: {
    fontSize: screenWidth * 0.038, // 14px 상당
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    lineHeight: screenWidth * 0.06, // 20px 상당
  },
  trashLabel: {
    fontSize: screenWidth * 0.03,
    color: "#666",
    textAlign: "center",
    marginTop: -4,
  },
  noTodayDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  noTodayDataText: {
    fontSize: screenWidth * 0.032,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    lineHeight: screenWidth * 0.04,
    marginBottom: 4,
  },
  noTodayDataSubText: {
    fontSize: screenWidth * 0.028,
    color: "#999",
    textAlign: "center",
  },
  subTitle: {
    fontSize: screenWidth * 0.025,
    color: "#666",
    textAlign: "left",
    marginTop: 8,
  },
  cardDetail: {
    fontSize: screenWidth * 0.032,
    fontWeight: "700",
    color: "#333333",
  },
  trashCount: {
    fontSize: screenWidth * 0.036,
    color: "#4CAF50",
    fontWeight: "800",
  },

  // Icon Row Styles
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: screenHeight * 0.025,
    paddingHorizontal: PADDING_H / 2,
    backgroundColor: "#fff",
  },
  iconBox: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: screenHeight * 0.008,
  },
  icon: {
    width: ICON_SIZE * 0.5,
    height: ICON_SIZE * 0.5,
    resizeMode: "contain",
  },
  iconLabel: {
    fontSize: screenWidth * 0.032,
    fontWeight: "600",
    color: "#000000ff",
    textAlign: "center",
  },

  // Mission Banner Styles
  missionBanner: {
    marginTop: screenHeight * 0.02,
    overflow: "hidden",
    height: BANNER_HEIGHT,
  },
  missionImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  missionTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  missionText: {
    fontSize: screenWidth * 0.048,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: screenWidth * 0.06,
  },

  // Pick Section Styles
  pickWrapper: {
    marginTop: screenHeight * 0.03,
    paddingHorizontal: PADDING_H,
  },
  pickTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "700",
    color: "#333333",
    marginBottom: PADDING_H / 2,
  },
  pickTags: {
    flexDirection: "row",
    gap: PADDING_H / 3,
    marginBottom: PADDING_H / 2,
    alignItems: "center",
  },
  tag: {
    paddingHorizontal: PADDING_H / 2,
    paddingVertical: PADDING_H / 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  tagSelected: {
    backgroundColor: "#000022",
    borderColor: "#000022",
  },
  tagText: {
    fontSize: screenWidth * 0.03,
    color: "#797982",
    fontWeight: "500",
  },
  tagSelectedText: {
    color: "#fff",
  },

  // Tag Spacer and More Button Styles
  tagSpacer: {
    flex: 1,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING_H / 3,
    paddingVertical: PADDING_H / 4,
  },
  moreButtonText: {
    fontSize: screenWidth * 0.03,
    color: "#666",
    fontWeight: "500",
    marginRight: 2,
  },

  // Courses Loading Styles
  coursesLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: screenHeight * 0.05,
  },
  coursesLoadingText: {
    fontSize: screenWidth * 0.035,
    color: "#666",
    marginTop: PADDING_H / 2,
  },

  // Pick Cards Styles
  pickScrollView: {
    marginHorizontal: -PADDING_H / 4,
  },
  pickCard: {
    width: PICK_CARD_WIDTH,
    marginHorizontal: PADDING_H / 4,
  },
  pickImage: {
    width: "100%",
    height: PICK_IMAGE_HEIGHT,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: screenHeight * 0.008,
  },
  pickImagePlaceholder: {
    width: "100%",
    height: PICK_IMAGE_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: screenHeight * 0.008,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickImagePlaceholderText: {
    fontSize: screenWidth * 0.025,
    color: "#999",
    marginTop: 4,
  },
  pickCourseName: {
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  pickInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  pickInfoLabel: {
    fontSize: screenWidth * 0.028,
    color: "#797982",
    fontWeight: "500",
    marginRight: 4,
  },
  pickDistance: {
    fontSize: screenWidth * 0.028,
    color: "#797982",
  },
  pickSeparator: {
    fontSize: screenWidth * 0.028,
    color: "#797982",
    marginHorizontal: 4,
  },
  pickTagsRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  pickTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pickTagText: {
    fontSize: screenWidth * 0.025,
    fontWeight: "500",
  },

  // No Courses Styles
  noCoursesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: screenHeight * 0.05,
  },
  noCoursesText: {
    fontSize: screenWidth * 0.035,
    color: "#999",
    marginTop: PADDING_H / 2,
    textAlign: "center",
  },
})