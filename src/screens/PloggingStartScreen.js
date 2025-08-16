"use client"
import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  SafeAreaView,
  Image,
  AppState,
  BackHandler,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import Config from "react-native-config"

// 🎯 플로깅 관련 컴포넌트 및 전역 상태
import { usePloggingContext } from "../contexts/PloggingContext"    // 플로깅 전역 상태 관리
import PloggingMap from "../components/Plogging/PloggingMap"        // 지도 및 마커 표시
import PloggingControls from "../components/Plogging/PloggingControls" // 플로깅 제어 버튼들
import TrashInfoModal from "../components/Plogging/TrashInfoModal"  // 쓰레기 정보 모달

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

/**
 * 👉 기능 요약
 * - 현재 위치 권한 요청
 * - 시작 버튼: 타이머 시작 + onUserLocationChange로 좌표 수집
 * - 이동 경로를 Polyline으로 그림
 * - 일시정지/재시작/종료/리셋 제공
 * - (안드로이드) 권한 거부 시 안내
 */

const INITIAL_REGION = {
  // 👉 초기 카메라(서울시청 근처). 첫 위치 이벤트 오면 자동으로 따라감
  latitude: 37.5665,
  longitude: 126.9780,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function PloggingStartScreen({ navigation }) {
  // ✅ UI/상태
  const [granted, setGranted] = useState(false);      // 위치 권한 여부
  const [tracking, setTracking] = useState(false);    // 트래킹 중 여부
  const [paused, setPaused] = useState(false);        // 일시정지 여부

  const [elapsed, setElapsed] = useState(0);          // 경과 시간(초)
  const [path, setPath] = useState([]);               // 지나간 좌표 배열 [{lat, lng}, ...]
  const [current, setCurrent] = useState(null);       // 현재 좌표

  // ✅ 타이머/맵 ref
  const timerRef = useRef(null);
  const startAtRef = useRef(null);
  const mapRef = useRef(null);

  // ---------------------------------------------
  // 권한 요청 (Android용). iOS는 Info.plist 설정으로 충분
  // ---------------------------------------------
  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== "android") {
      setGranted(true);
      return;
    }
    try {
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "위치 권한 요청",
          message: "플로깅 경로를 기록하려면 위치 권한이 필요합니다.",
          buttonPositive: "허용",
          buttonNegative: "거부",
        }
      );
      const coarse = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      const ok =
        fine === PermissionsAndroid.RESULTS.GRANTED &&
        coarse === PermissionsAndroid.RESULTS.GRANTED;

      setGranted(ok);

      if (!ok) {
        Alert.alert("권한 필요", "설정에서 위치 권한을 허용해주세요.");
      }
    } catch (e) {
      console.warn("권한 요청 실패:", e);
      setGranted(false);
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
    // 언마운트 시 타이머/상태 정리
    return () => stopAll();
  }, [requestLocationPermission]);

  // ---------------------------------------------
  // ---------------------------------------------
  // 유틸리티 함수들
  // ---------------------------------------------
  
  // 시간 포맷팅 (초 → HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 두 좌표 간의 거리 계산 (미터 단위)
  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 전체 경로의 총 거리 계산
  const calculateTotalDistance = (coordinates) => {
    if (coordinates.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += calculateDistance(coordinates[i - 1], coordinates[i]);
    }
    return totalDistance;
  };

  // 거리 포맷팅 (미터 → km 또는 m)
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(2)}km`;
    }
  };

  // ---------------------------------------------
  // 타이머 제어
  // ---------------------------------------------
  const startTimer = () => {
    // 👉 기준 시각 기록(일시정지 후 재시작도 누적되도록 보정)
    startAtRef.current = Date.now() - elapsed * 1000;
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - startAtRef.current) / 1000);
      setElapsed(diff);
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ---------------------------------------------
  // 시작/일시정지/재시작/종료/리셋
  // ---------------------------------------------
  const onPressStart = async () => {
    if (!granted) {
      await requestLocationPermission();
      if (!granted) return;
    }
    if (tracking && !paused) return; // 이미 진행 중이면 무시

    setTracking(true);
    setPaused(false);
    startTimer();
  };

  const onPressPause = () => {
    if (!tracking || paused) return;
    setPaused(true);
    clearTimer();
  };

  const onPressResume = () => {
    if (!tracking || !paused) return;
    setPaused(false);
    startTimer();
  };

  const stopAll = () => {
    setTracking(false);
    setPaused(false);
    clearTimer();
  };

  const onPressStop = () => {
    // 플로깅 데이터 준비
    const ploggingResult = {
      id: Date.now(),
      title: "플로깅 완료",
      date: new Date().toLocaleDateString('ko-KR'),
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: formatTime(elapsed),
      distance: calculateTotalDistance(path),
      route: path,
      trashCount: 0, // 기본값, 추후 쓰레기 수집 기능 연동
      calories: Math.round(calculateTotalDistance(path) * 0.05), // 대략적인 칼로리 계산
    };

    console.log('[PloggingStartScreen] 플로깅 완료, 결과:', ploggingResult);
    
    // 플로깅 중지
    stopAll();
    
    // 플로깅 기록 화면으로 이동
    navigation.navigate('PloggingRecord', { 
      result: ploggingResult 
    });
  };

  const onPressReset = () => {
    stopAll();
    setElapsed(0);
    setPath([]);
    setCurrent(null);
    // 카메라도 초기 위치로
    mapRef.current?.animateToRegion(INITIAL_REGION, 600);
  };

  // ---------------------------------------------
  // 위치 이벤트 (react-native-maps)
  // - showsUserLocation=true 일 때 onUserLocationChange가 주기적으로 발생
  // - tracking 모드일 때만 path에 누적
  // ---------------------------------------------
  const handleUserLocationChange = (e) => {
    const c = e?.nativeEvent?.coordinate;
    if (!c) return;

    const coord = { latitude: c.latitude, longitude: c.longitude };
    setCurrent(coord);

    // 👉 카메라를 따라가게(부드럽게)
    mapRef.current?.animateCamera(
      { center: { latitude: c.latitude, longitude: c.longitude }, zoom: 17 },
      { duration: 600 }
    );

    // 👉 트래킹 중이며 일시정지 상태가 아닐 때만 경로 누적
    if (tracking && !paused) {
      setPath((prev) => {
        // 중복 좌표/미세 좌표 변동 필터링(선택 로직)
        const last = prev[prev.length - 1];
        if (!last || last.latitude !== coord.latitude || last.longitude !== coord.longitude) {
          return [...prev, coord];
        }
        return prev;
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ 구글맵 */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation={granted}
        onUserLocationChange={handleUserLocationChange}
        // compassEnabled, rotateEnabled 등 필요시 조정
      >
        {/* 경로 선 */}
        {path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeWidth={6}
            // 색상은 플랫폼 기본을 사용(디자인 확정 시 지정)
          />
        )}

        {/* 출발/현재 마커(선택) */}
        {path[0] && <Marker coordinate={path[0]} title="출발" />}
        {current && <Marker coordinate={current} title="현재 위치" />}
      </MapView>

      {/* ✅ 상단 타이머 박스 */}
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
        <Text style={styles.subText}>
          {tracking ? (paused ? "일시정지" : "기록 중") : "대기 중"}
        </Text>
      </View>

      {/* ✅ 하단 컨트롤 버튼들 */}
      <View style={styles.controls}>
        {!tracking && (
          <Button onPress={onPressStart} label="시작" />
        )}
        {tracking && !paused && (
          <>
            <Button onPress={onPressPause} label="일시정지" />
            <Button onPress={onPressStop} label="종료" type="danger" />
          </>
        )}
        {tracking && paused && (
          <>
            <Button onPress={onPressResume} label="재시작" />
            <Button onPress={onPressStop} label="종료" type="danger" />
          </>
        )}
        <Button onPress={onPressReset} label="리셋" type="ghost" />
      </View>
    </View>
  );
}

/** 단순 버튼 컴포넌트(스타일 포함) */
function Button({ onPress, label, type = "primary" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.btn,
        type === "danger" && styles.btnDanger,
        type === "ghost" && styles.btnGhost,
      ]}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.btnText,
        type === "ghost" && styles.btnTextGhost
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  timerBox: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  timerText: { fontSize: 28, fontWeight: "700", color: "#fff" },
  subText: { marginTop: 4, color: "#ddd" },

  controls: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2e7d32",
  },
  btnDanger: { backgroundColor: "#c62828" },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  btnTextGhost: { color: "#fff" },
});
