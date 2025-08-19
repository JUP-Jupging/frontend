"use client"

import { useState, useEffect, useCallback } from "react"
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { getMyPage } from "../api/mypage";
import { getMyReports } from "../api/report";
import { getMyPloggingRecords, getPloggingDetail } from "../api/plog"; // ✅ 상세 조회 API 추가
import { useAuth } from "../stores/useAuth";
import { formatUserFriendlyDate, formatPloggingTime, formatDistance, formatPloggingCardInfo } from "../utils/timeUtils"; // ✅ 시간 유틸리티 import

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function MyPloggingScreen() {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState("플로깅")
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [ploggingRecords, setPloggingRecords] = useState([]); // ✅ 플로깅 기록 상태
  const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가
  const accessToken = useAuth((s) => s.accessToken);

  // 🔥 이미지 컴포넌트 - 에러 처리 추가
  const ImageWithFallback = ({ source, style, ...props }) => {
    const [hasError, setHasError] = useState(false)
    
    if (hasError || !source?.uri) {
      return (
        <View style={[style, styles.fallbackImageContainer]}>
          <Icon name="image-not-supported" size={24} color="#CCCCCC" />
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

  useFocusEffect(
    useCallback(() => {
      async function fetchUser() {
        try {
          const data = await getMyPage(accessToken);
          setUser(data);
        } catch (e) {
          console.error("마이페이지 정보 불러오기 실패:", e);
        }
      }
      if (accessToken) fetchUser();
    }, [accessToken])
  );

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getMyReports(accessToken);
        setReports(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("제보 기록 불러오기 실패:", e);
        setReports([]);
      }
    }
    if (accessToken && activeTab === "신고") fetchReports();
  }, [accessToken, activeTab]);

  // ✅ 플로깅 기록 가져오기 - 시간 유틸리티 적용
  useEffect(() => {
    async function fetchPloggingRecords() {
      try {
        setIsLoading(true);
        console.log('📋 [MyPloggingScreen] 플로깅 기록 가져오기 시작');
        
        const data = await getMyPloggingRecords(accessToken);
        console.log('📋 [MyPloggingScreen] 가져온 원본 데이터:', data);
        
        // ✅ 시간 유틸리티를 사용해서 표시용 정보 생성
        const formattedRecords = (Array.isArray(data) ? data : []).map((record, index) => {
          
          // 🔥 ploggingTime 안전 처리
          const safePloggingTime = record.ploggingTime === "string" ? "0" : record.ploggingTime;
          
          const cardInfo = formatPloggingCardInfo({
            ...record,
            ploggingTime: safePloggingTime // 안전한 값으로 교체
          });
          
          console.log(`📋 [MyPloggingScreen] 기록 ${index + 1} 포맷팅:`, {
            original: record,
            safePloggingTime: safePloggingTime,
            formatted: cardInfo
          });
          
          return {
            ...record,
            ploggingTime: safePloggingTime, // 🔥 원본도 안전한 값으로 업데이트
            // 표시용 정보 추가
            displayInfo: cardInfo,
            // 기존 필드들도 유지하되 포맷된 버전 추가
            formattedDate: cardInfo.date,
            formattedTime: cardInfo.time,
            formattedDistance: cardInfo.distance
          };
        });
        
        console.log('✅ [MyPloggingScreen] 최종 포맷된 기록들:', formattedRecords);
        setPloggingRecords(formattedRecords);
      } catch (e) {
        console.error("❌ [MyPloggingScreen] 플로깅 기록 불러오기 실패:", e);
        setPloggingRecords([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (accessToken && activeTab === "플로깅") {
      fetchPloggingRecords();
    }
  }, [accessToken, activeTab]);

  // ✅ 플로깅 기록 클릭 핸들러 - 상세 조회 후 기록 페이지로 이동
  const handlePloggingRecordPress = async (record) => {
    try {
      console.log('🔍 [MyPloggingScreen] 플로깅 기록 클릭:', record.ploggingId);
      
      // 로딩 시작
      setIsLoading(true);
      
      // 상세 정보 가져오기 (memberId는 user 정보에서 가져오거나 record에서 추출)
      const memberId = user?.memberId || user?.id || 1; // 사용자 ID 가져오기
      console.log('👤 [MyPloggingScreen] 사용할 memberId:', memberId);
      
      const detailData = await getPloggingDetail(record.ploggingId, memberId, accessToken);
      console.log('📋 [MyPloggingScreen] 상세 데이터:', detailData);
      
      // ✅ PloggingRecordScreen에서 기대하는 형태로 데이터 변환
      const transformedData = {
        // 기본 정보
        title: detailData.trailTypeName || record.trailTypeName || "플로깅 기록",
        date: formatUserFriendlyDate(detailData.displayDate),
        location: detailData.trailTypeName || "플로깅 경로",
        
        // 운동 정보
        duration: formatPloggingTime(detailData.ploggingTime),
        distance: formatDistance(detailData.distance),
        difficulty: detailData.difficulty || "보통",
        
        // 경로 및 이미지 정보
        route: [], // 경로 좌표는 API에서 제공되지 않는 듯
        trashLocations: detailData.trashInfo || [],
        mapImage: detailData.imageUrl, // 플로깅 이미지
        routeImage: detailData.imageUrl,
        
        // 메타데이터
        trailId: detailData.trailId,
        ploggingId: detailData.ploggingId,
        startTime: detailData.ploggingDate2 || detailData.ploggingDate,
        endTime: detailData.ploggingDate2 || detailData.ploggingDate,
        
        // 쓰레기 정보
        trashCount: (detailData.trashInfo || []).length,
        collectedTrash: (detailData.trashInfo || []).map((trash, index) => ({
          id: trash.reportId || index,
          type: determineTrashType(trash), // 쓰레기 타입 결정
          amount: determineTrashAmount(trash), // 양 결정
          location: `위도: ${trash.lat || 0}, 경도: ${trash.lng || 0}`,
          title: determineTrashType(trash)
        })),
        
        // 원본 상세 데이터도 포함
        _detailData: detailData,
        _originalRecord: record
      };
      
      console.log('🎯 [MyPloggingScreen] 변환된 데이터:', transformedData);
      
      // PloggingRecordScreen으로 이동
      navigation.navigate("PloggingRecordScreen", {
        result: transformedData
      });
      
    } catch (error) {
      console.error('❌ [MyPloggingScreen] 플로깅 상세 조회 실패:', error);
      // 에러 발생 시에도 기본 정보로 이동
      const fallbackData = {
        title: record.trailTypeName || "플로깅 기록",
        date: formatUserFriendlyDate(record.displayDate),
        location: record.trailTypeName || "플로깅 경로",
        duration: formatPloggingTime(record.ploggingTime),
        distance: formatDistance(record.distance),
        difficulty: "보통",
        route: [],
        trashCount: record.trashCount || 0,
        collectedTrash: [],
        mapImage: record.imageUrl,
        _originalRecord: record,
        _error: error.message
      };
      
      navigation.navigate("PloggingRecordScreen", {
        result: fallbackData
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 쓰레기 타입 결정 함수
  const determineTrashType = (trash) => {
    const typeMapping = {
      paper: "종이류",
      can: "캔류",
      plastic: "플라스틱",
      vinyl: "비닐류",
      glass: "유리병",
      styro: "스티로폼",
      battery: "배터리"
    };
    
    // API 응답의 각 쓰레기 타입 필드를 확인
    for (const [key, koreanName] of Object.entries(typeMapping)) {
      if (trash[key] && trash[key] > 0) {
        return `${koreanName} ${trash[key]}개`;
      }
    }
    
    return "일반 쓰레기";
  };

  // ✅ 쓰레기 양 결정 함수
  const determineTrashAmount = (trash) => {
    const total = (trash.paper || 0) + (trash.can || 0) + (trash.plastic || 0) + 
                  (trash.vinyl || 0) + (trash.glass || 0) + (trash.styro || 0) + (trash.battery || 0);
    
    if (total > 10) return "많음";
    if (total > 5) return "보통";
    if (total > 0) return "적음";
    return "없음";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="rgba(19, 18, 20, 0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 프로필 상단 영역 */}
        <View style={styles.profileSection}>
          {user?.profileImageUrl ? (
            <ImageWithFallback source={{ uri: user.profileImageUrl }} style={styles.profileImage} />
          ) : (
            <ImageWithFallback source={require("../assets/profile.png")} style={styles.profileImage} />
          )}          
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>
              {user?.appNickname ? user.appNickname : "닉네임 없음"}
            </Text>          
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("MyPageMain")}>
            <Icon name="chevron-right" size={24} color="#131214" />
          </TouchableOpacity>
        </View>

        {/* 탭 영역 */}
        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("플로깅")}>
              <Text style={activeTab === "플로깅" ? styles.activeTab : styles.inactiveTab}>플로깅 기록</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("신고")}>
              <Text style={activeTab === "신고" ? styles.activeTab : styles.inactiveTab}>제보 기록</Text>
            </TouchableOpacity>
          </View>

          {/* 탭 인디케이터 */}
          <View style={styles.tabIndicatorContainer}>
            <View
              style={[
                styles.tabIndicator,
                { left: activeTab === "플로깅" ? 0 : (screenWidth - 40) / 2 },
              ]}
            />
            <View style={styles.tabUnderline} />
          </View>
        </View>

        {/* 탭에 따라 다른 내용 */}
        {activeTab === "플로깅" ? (
          <>
            {/* 플로깅 하러 가기 버튼 */}
            <TouchableOpacity style={styles.actionBox}>
              <Image source={require("../assets/square-plus.png")} style={styles.actionIcon} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>플로깅 하러 가기</Text>
                <Text style={styles.actionSubtitle}>플로깅을 통해 주위를 깨끗하게</Text>
              </View>
            </TouchableOpacity>

            {/* ✅ 로딩 상태 표시 */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
              </View>
            )}

            {/* 플로깅 기록 리스트 */}
            <View style={styles.recordSection}>
              <Text style={styles.recordTitle}>플로깅 기록</Text>
              {ploggingRecords.length === 0 ? (
                <Text style={styles.emptyText}>플로깅 기록이 없습니다.</Text>
              ) : (
                ploggingRecords.map((record) => (
                  <TouchableOpacity 
                    key={record.ploggingId} 
                    style={styles.recordCard}
                    onPress={() => handlePloggingRecordPress(record)}
                    disabled={isLoading}
                  >
                    <View style={styles.recordContent}>
                      <Text style={styles.recordMainTitle}>
                        {record.displayInfo?.title || record.trailTypeName || "플로깅 기록"}
                      </Text>
                      
                      {/* ✅ 개선된 시간 표시 */}
                      <Text style={styles.recordDate}>
                        {record.displayInfo?.date || "날짜 정보 없음"}
                      </Text>
                      
                      {/* ✅ 운동 정보 표시 개선 */}
                      <Text style={styles.recordLocation}>
                        {`거리: ${record.displayInfo?.distance || "0m"} / 시간: ${record.displayInfo?.time || "정보 없음"}`}
                      </Text>
                      
                      {/* ✅ 추가 정보 표시 */}
                      {record.trashCount > 0 && (
                        <Text style={styles.recordTrashInfo}>
                          🗑️ 수집한 쓰레기: {record.trashCount}개
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.recordImageContainer}>
                      <ImageWithFallback
                        source={
                          record.imageUrl
                            ? { uri: record.imageUrl }
                            : null
                        }
                        style={styles.recordMapImage}
                      />
                      <TouchableOpacity style={styles.trashIcon}>
                        <Image source={require("../assets/trash-02.png")} style={styles.trashIconImage} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            {/* 쓰레기 제보 하러 가기 버튼 */}
            <TouchableOpacity style={styles.actionBox}>
              <Image source={require("../assets/report-icon.png")} style={styles.actionIcon} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>쓰레기 제보 하러 가기</Text>
                <Text style={styles.actionSubtitle}>쓰레기 제보를 통해 동네를 깨끗하게</Text>
              </View>
            </TouchableOpacity>

            {/* 제보 기록 리스트 */}
            <View style={styles.recordSection}>
              <Text style={styles.recordTitle}>제보 기록</Text>
              {reports.length === 0 ? (
                <Text style={styles.emptyText}>제보 기록이 없습니다.</Text>
              ) : (
                reports.map((report) => (
                  <View key={report.reportId} style={styles.recordCard}>
                    <View style={styles.recordContent}>
                      <Text style={styles.recordMainTitle}>{report.title || "제목 없음"}</Text>
                      <Text style={styles.recordDate}>
                        {report.createdAt
                          ? formatUserFriendlyDate(report.createdAt)
                          : formatUserFriendlyDate(new Date().toISOString())}
                      </Text>
                      <Text style={styles.recordLocation}>{report.trailTypeName || "장소 정보 없음"}</Text>
                    </View>
                    <View style={styles.recordImageContainer}>
                      <ImageWithFallback
                        source={
                          report.imageUrl
                            ? { uri: report.imageUrl }
                            : null
                        }
                        style={styles.recordMapImage}
                      />
                      <TouchableOpacity style={styles.trashIcon}>
                        <Image source={require("../assets/trash-02.png")} style={styles.trashIconImage} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: screenHeight * 0.06,

    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 20,
  },
  
  // 🔥 Fallback 이미지 스타일 추가
  fallbackImageContainer: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  
  profileInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.1,
  },
  tabContainer: {
    marginBottom: 30,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  inactiveTab: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  tabIndicatorContainer: {
    position: "relative",
    height: 2,
    width: screenWidth - 40, // paddingHorizontal: 20 * 2
    alignSelf: "center",
  },
  tabIndicator: {
    position: "absolute",
    width: (screenWidth - 40) / 2,
    height: 2,
    backgroundColor: "#418663",
  },
  tabUnderline: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "rgba(153, 153, 153, 0.2)",
  },
  actionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(153, 153, 153, 0.05)",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  actionIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 10,
    fontWeight: "400",
    color: "rgba(51, 51, 51, 0.8)",
  },
  recordSection: {
    marginBottom: 20,
  },
  recordTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 20,
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    paddingTop: 16,
    marginTop: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  recordMainTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.8)",
    marginBottom: 8,
  },
  recordLocation: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.6)",
  },
  recordTrashInfo: {
    fontSize: 11,
    fontWeight: "500",
    color: "#4CAF50",
    marginTop: 4,
  },
  recordImageContainer: {
    position: "relative",
    alignItems: "center",
  },
  recordMapImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  trashIcon: {
    position: "absolute",
    top: -16,
    right: -16,
    width: 28,
    height: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  trashIconImage: {
    width: 24,
    height: 24,
    tintColor: "#418663",
  },
  emptyText: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
});