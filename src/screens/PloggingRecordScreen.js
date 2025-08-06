"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import MapView, { Polyline, Marker } from "react-native-maps"
import Icon from "react-native-vector-icons/MaterialIcons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 더미 상세 데이터
const DUMMY_DETAIL_DATA = {
  id: 1,
  title: "쓰줍장의 쓰레기 기록",
  date: "2024.10.24 ~ 2024.10.26",
  location: "국립 중앙 박물관",
  duration: "1시간 30분",
  distance: "3.2km",
  trashCount: 15,
  calories: 180,
  route: [
    { latitude: 37.5665, longitude: 126.978 },
    { latitude: 37.5675, longitude: 126.979 },
    { latitude: 37.5685, longitude: 126.980 },
    { latitude: 37.5695, longitude: 126.981 },
  ],
  trashLocations: [
    { latitude: 37.5670, longitude: 126.9785, type: "플라스틱" },
    { latitude: 37.5680, longitude: 126.9795, type: "유리병" },
    { latitude: 37.5690, longitude: 126.9805, type: "캔" },
  ]
}

export default function PloggingRecordDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const [recordData, setRecordData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecordData()
  }, [])

  const loadRecordData = async () => {
    try {
      setIsLoading(true)
      
      // 실제 API 호출 시뮬레이션
      const hasRealData = Math.random() > 0.3 // 70% 확률로 더미 데이터 사용
      
      if (hasRealData) {
        console.log("Using dummy record data")
        setRecordData(DUMMY_DETAIL_DATA)
      } else {
        // 실제 API 호출
        // const response = await fetch(`/api/plogging-records/${route.params?.recordId}`)
        // const data = await response.json()
        setRecordData(DUMMY_DETAIL_DATA)
      }
    } catch (error) {
      console.error("Failed to load record data:", error)
      setRecordData(DUMMY_DETAIL_DATA)
    } finally {
      setIsLoading(false)
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
        {/* 지도 영역 */}
        <View style={styles.mapContainer}>
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
              <Text style={styles.statLabel}>칼로리</Text>
              <Text style={styles.statValue}>{recordData.calories}kcal</Text>
            </View>
          </View>
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
  mapContainer: {
    height: 300,
    backgroundColor: "#F5F5F5",
  },
  map: {
    flex: 1,
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
    paddingTop: 20,
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
})
