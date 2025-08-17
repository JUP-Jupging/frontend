// PloggingStartScreen.js

"use client"
import React, { useState, useEffect, useRef } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Alert, SafeAreaView, BackHandler,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import { usePloggingContext } from "../contexts/PloggingContext"
import PloggingMap from "../components/Plogging/PloggingMap"
import PloggingControls from "../components/Plogging/PloggingControls"
import TrashInfoModal from "../components/Plogging/TrashInfoModal"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const DUMMY_TRASH_LOCATIONS = [
  { id: 1, coordinate: { latitude: 37.5665, longitude: 126.978 }, title: "마로니에 공원 쓰레기", location: "마로니에 공원", amount: "많음", photos: [{ type: "유리병", count: 3, color: "#797982" }, { type: "플라스틱", count: 4, color: "#007AFF" }], },
  { id: 2, coordinate: { latitude: 37.5675, longitude: 126.979 }, title: "벤치 근처 쓰레기", location: "마로니에 공원", amount: "보통", photos: [{ type: "캔", count: 2, color: "#797982" }, { type: "종이", count: 1, color: "#34C759" }], },
]

export default function PloggingStartScreen({ navigation, route }) {
  const {
    status, time, trashCount, formatTime, currentLocation, routeCoordinates,
    totalDistance, formatDistance, mapRef, trashLocations, startPlogging,
    pausePlogging, resumePlogging, endPlogging, addTrash, setTrashLocations,
    removeTrash,
    // [로직 추가] Context에서 새로운 상태와 함수 가져오기
    collectedTrash, addCollectedTrashItem
  } = usePloggingContext();

  const [modalVisible, setModalVisible] = useState(false)
  const [trashInfoModalVisible, setTrashInfoModalVisible] = useState(false)
  const [selectedTrash, setSelectedTrash] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Main");
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [status, navigation]);

  useEffect(() => {
    const initializeApp = async () => {
      await loadData();
      setTimeout(() => setMapReady(true), 100);
    }
    initializeApp();
  }, []);

  const loadData = async () => {
    if (trashLocations.length === 0) {
      setTrashLocations(DUMMY_TRASH_LOCATIONS);
    }
  };

  const handleStart = async () => await startPlogging();
  const handlePause = () => pausePlogging();
  const handleResume = () => resumePlogging();
  const handleEnd = () => setModalVisible(true);

  const confirmEnd = async () => {
    setModalVisible(false);
    const ploggingResult = endPlogging();
    navigation.navigate("PloggingRecord", { result: ploggingResult });
  };

  const handleTrashMarkerPress = (trash) => {
    setSelectedTrash(trash);
    setTrashInfoModalVisible(true);
  };

  // [로직 수정] 쓰레기 줍기 핸들러
  const handlePickTrash = (trash) => {
    try {
      addTrash();
      addCollectedTrashItem(trash); // 수집 목록에 추가
      removeTrash(trash.id);
      setTrashInfoModalVisible(false);
      Alert.alert('성공', '쓰레기를 주웠습니다!', [{ text: '확인' }]);
    } catch (error) {
      console.error('쓰레기 줍기 오류:', error);
    }
  };

  // [로직 수정] 주운 쓰레기 목록 보기 핸들러
  const handleShowTrashList = () => {
    const collectedItems = collectedTrash.map(item =>
      `- ${item.title || '쓰레기'}: ${item.amount || '보통'}`
    ).join('\n');

    Alert.alert(
      "수집한 쓰레기 목록",
      collectedTrash.length > 0 ? collectedItems : "아직 수집한 쓰레기가 없습니다."
    );
  };

  const handleGoToMain = () => navigation.navigate("Main");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
          <Icon name="arrow-back" size={24} color="#418663" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>플로깅</Text>
        <TouchableOpacity onPress={() => navigation.navigate("내 플로깅 기록")}>
          <Icon name="person" size={24} color="#418663" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <PloggingMap
          mapRef={mapRef}
          currentLocation={currentLocation}
          routeCoordinates={routeCoordinates}
          trashLocations={trashLocations}
          isLoading={isLoading}
          mapReady={mapReady}
          onTrashMarkerPress={handleTrashMarkerPress}
        />

        {status === "idle" ? (
          <View style={styles.overlayControls}>
            <TouchableOpacity style={styles.overlayStartButton} onPress={handleStart}>
              <Text style={styles.overlayStartButtonText}>시작</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.runningControls}>
            <PloggingControls
              status={status}
              time={time}
              trashCount={trashCount}
              formatTime={formatTime}
              onPause={handlePause}
              onResume={handleResume}
              onEnd={handleEnd}
              onShowTrashList={handleShowTrashList} // 수정된 핸들러 전달
            />
          </View>
        )}
      </View>

      <CommonModal
        visible={modalVisible}
        title="플로깅 종료"
        message={`플로깅을 종료하시겠습니까?\n주운 쓰레기: ${trashCount}개`}
        onConfirm={confirmEnd}
        onCancel={() => setModalVisible(false)}
        confirmText="종료"
        cancelText="취소"
      />

      <TrashInfoModal
        visible={trashInfoModalVisible}
        trash={selectedTrash}
        onClose={() => setTrashInfoModalVisible(false)}
        onPickTrash={handlePickTrash}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingTop: screenHeight * 0.05, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E0E0E0", zIndex: 10 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#212529" },
  mapContainer: { flex: 1, position: 'relative' },
  overlayControls: { position: 'absolute', bottom: screenHeight * 0.1, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  overlayStartButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#418663", borderRadius: 20, paddingVertical: 10, paddingHorizontal: 32, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  overlayStartButtonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "500" },
  runningControls: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
});