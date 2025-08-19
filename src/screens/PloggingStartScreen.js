// PloggingStartScreen.js - 뷰샷으로 간단 캡처 + 멀티파트 전송

"use client"
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Alert, SafeAreaView, BackHandler, Modal, Image
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import { usePloggingContext } from "../contexts/PloggingContext"
import PloggingMap from "../components/Plogging/PloggingMap"
import PloggingControls from "../components/Plogging/PloggingControls"
import TrashInfoModal from "../components/Plogging/TrashInfoModal"
import { getNearestTrail, getTrailDetail } from "../api/trails"
import { savePloggingRecord } from "../api/plog"
import ViewShot from 'react-native-view-shot' // 🔥 ViewShot 컴포넌트 사용
import { useAuth } from "../stores/useAuth"; // 🔥 [수정 1] useAuth 훅 import

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 거리 계산 함수
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

const MAX_DISTANCE_TO_START = 50000;

// 🔥 지도에 경로가 모두 보이도록 자동 줌 조절 함수
const fitPolylineToMap = (routeCoordinates, mapRef) => {
  if (!routeCoordinates || routeCoordinates.length === 0 || !mapRef.current) {
    return;
  }

  try {
    // 경계 계산
    let minLat = routeCoordinates[0].latitude;
    let maxLat = routeCoordinates[0].latitude;
    let minLng = routeCoordinates[0].longitude;
    let maxLng = routeCoordinates[0].longitude;

    routeCoordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    // 여백 추가 (10%)
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat + latPadding * 2),
      longitudeDelta: (maxLng - minLng + lngPadding * 2),
    };

    console.log("🎯 [지도 줌 조절]", {
      경로점수: routeCoordinates.length,
      중심: `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`,
      범위: `${region.latitudeDelta.toFixed(4)} x ${region.longitudeDelta.toFixed(4)}`
    });

    // 지도 영역 조절
    mapRef.current.animateToRegion(region, 1000);
  } catch (error) {
    console.error("❌ [지도 줌 조절 실패]:", error);
  }
};

// 산책로 정보 모달 컴포넌트
const TrailInfoModal = React.memo(({ visible, trail, onClose, onConfirm }) => {
  if (!trail) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{trail.trailName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 위치:</Text>
              <Text style={styles.infoValue}>{trail.lotNumberAddress || '주소 정보 없음'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📏 총 길이:</Text>
              <Text style={styles.infoValue}>{trail.length || '정보 없음'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⏱️ 소요시간:</Text>
              <Text style={styles.infoValue}>{trail.trackTime || '정보 없음'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏔️ 난이도:</Text>
              <Text style={styles.infoValue}>{trail.difficultyLevel || '보통'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🗑️ 쓰레기 신고:</Text>
              <Text style={styles.infoValue}>{trail.reportCount || 0}개</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📏 현재 위치에서:</Text>
              <Text style={styles.infoValue}>{trail.distanceToUser ? `${trail.distanceToUser.toFixed(0)}m` : '거리 계산 중'}</Text>
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => onConfirm(trail)}
            >
              <Text style={styles.confirmButtonText}>이 코스로 플로깅 시작</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

function PloggingStartScreen({ navigation, route }) {
  console.log("🚀 [PloggingStart] 컴포넌트 시작");
  const { accessToken } = useAuth();
  console.log('🔑 [PloggingStart] Zustand 스토어에서 가져온 token:', accessToken);
  
  // Context에서 필요한 값들만 가져오기
  const context = usePloggingContext();
  if (!context) {
    console.error('❌ PloggingContext가 없습니다. Provider로 감싸져 있는지 확인하세요.');
    return null;
  }

  const {
    status, time, trashCount, formatTime, currentLocation, routeCoordinates,
    totalDistance, formatDistance, mapRef, trashLocations, startPlogging,
    pausePlogging, resumePlogging, endPlogging, addTrash, setTrashLocations,
    removeTrash, collectedTrash, addCollectedTrashItem
  } = context;

  // 로컬 상태들
  const [modalVisible, setModalVisible] = useState(false)
  const [trashInfoModalVisible, setTrashInfoModalVisible] = useState(false)
  const [trailInfoModalVisible, setTrailInfoModalVisible] = useState(false)
  const [selectedTrash, setSelectedTrash] = useState(null)
  const [selectedTrailForModal, setSelectedTrailForModal] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  
 // 🔥 ViewShot ref로 변경
  const viewShotRef = useRef(null);
  
  // 단일 산책로 관련 상태들
  const [nearestTrail, setNearestTrail] = useState(null)
  const [canStartPlogging, setCanStartPlogging] = useState(false)
  const [distanceToTrail, setDistanceToTrail] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [trailStartCoords, setTrailStartCoords] = useState(null)
  const [initialTrailPath, setInitialTrailPath] = useState(null)
  const [distanceModalVisible, setDistanceModalVisible] = useState(false)
  const [courseInfo, setCourseInfo] = useState(null)
  
  // 진입 모드 구분
  const [entryMode, setEntryMode] = useState('main')
  
  // 중복 실행 방지를 위한 ref
  const searchInProgress = useRef(false);

  // 플로깅 세션 상태 추가
  const [ploggingSessionData, setPloggingSessionData] = useState({
    startTime: null,
    startLocation: null,
    selectedTrailId: null,
    memberId: 1
  });

  // 🔥 이미지 컴포넌트 - 에러 처리 추가
  const ImageWithFallback = ({ source, style, ...props }) => {
    const [hasError, setHasError] = useState(false)
    
    if (hasError || !source?.uri) {
      return (
        <View style={[style, styles.fallbackImageContainer]}>
          <Icon name="image-not-supported" size={32} color="#CCCCCC" />
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

  // 뒤로 가기 처리
  useEffect(() => {
    const backAction = () => {
      console.log("🔙 [PloggingStart] 뒤로 가기 처리");
      navigation.navigate("Main");
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // 초기화 - 한 번만 실행
  useEffect(() => {
    console.log("🎬 [PloggingStart] 초기화 useEffect 시작");
    initializeScreen();
  }, []);

  // 위치 변경 감지 - 메모이제이션된 함수 사용
  const handleLocationChange = useCallback(() => {
    if (!currentLocation?.latitude || !currentLocation?.longitude) {
      console.log("📍 [PloggingStart] 위치 정보 없음");
      return;
    }

    console.log("📍 [PloggingStart] 위치 정보 확인됨");

    if (entryMode === 'courseDetail' && trailStartCoords) {
      handleDistanceCheck();
    } else if (entryMode === 'main' && !searchInProgress.current) {
      handleNearestSearch();
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, entryMode, trailStartCoords]);

  // 위치 변경 감지 useEffect
  useEffect(() => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      handleLocationChange();
    }
  }, [handleLocationChange]);

  // 초기화 함수
  const initializeScreen = async () => {
    try {
      console.log("🚀 [PloggingStart] 화면 초기화 시작");
      
      const routeParams = route?.params || {};
      console.log("📋 [PloggingStart] Route params 확인");
      
      if (routeParams.selectedRoute) {
        console.log("🎯 [PloggingStart] CourseDetail에서 진입");
        setEntryMode('courseDetail');
        handleCourseDetailEntry(routeParams);
      } else {
        console.log("🏠 [PloggingStart] 메인에서 진입");
        setEntryMode('main');
      }

      initializeData();
      
      setTimeout(() => {
        console.log("🗺️ [PloggingStart] 지도 준비 완료");
        setMapReady(true);
      }, 100);
      
    } catch (error) {
      console.error("❌ [PloggingStart] 초기화 오류:", error);
      setMapReady(true);
    }
  };

  // CourseDetail에서 진입한 경우 처리
  const handleCourseDetailEntry = (routeParams) => {
    const { selectedRoute, trailStartCoords, trailFullPath } = routeParams;
    
    if (selectedRoute) {
      setSelectedRoute(selectedRoute);
      setCourseInfo({
        name: selectedRoute.name,
        difficulty: selectedRoute.difficulty,
        distance: selectedRoute.distance,
        duration: selectedRoute.duration
      });
    }
    
    if (trailStartCoords) {
      setTrailStartCoords(trailStartCoords);
    }
    
    if (trailFullPath) {
      setInitialTrailPath(trailFullPath);
    }
  };

  // 기본 데이터 초기화
  const initializeData = () => {
    try {
      console.log("📦 [PloggingStart] 데이터 초기화");
      
      if (!Array.isArray(trashLocations)) {
        console.log("⚠️ [PloggingStart] trashLocations 배열 초기화");
        setTrashLocations([]);
      }
      
    } catch (error) {
      console.error("❌ [PloggingStart] 데이터 초기화 오류:", error);
      setTrashLocations([]);
    }
  };

  // 거리 체크 (CourseDetail에서 온 경우)
  const handleDistanceCheck = useCallback(() => {
    try {
      if (!currentLocation || !trailStartCoords) return;
      
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        trailStartCoords.latitude,
        trailStartCoords.longitude
      );
      
      console.log(`📍 [PloggingStart] 산책로 거리: ${distance.toFixed(0)}m`);
      
      setDistanceToTrail(distance);
      setCanStartPlogging(distance <= MAX_DISTANCE_TO_START);
      
    } catch (error) {
      console.error("❌ [PloggingStart] 거리 계산 오류:", error);
    }
  }, [currentLocation, trailStartCoords]);

  // 가장 가까운 산책로 검색
  const handleNearestSearch = useCallback(async () => {
    if (searchInProgress.current || isLoading || nearestTrail) {
      return;
    }
    if (!currentLocation?.latitude || !currentLocation?.longitude) {
      console.log("❌ [PloggingStart] 현재 위치 정보가 없어 검색을 시작할 수 없습니다.");
      return;
    }

    try {
      searchInProgress.current = true;
      setIsLoading(true);
      console.log("🔍 [PloggingStart] 가장 가까운 산책로 검색 시작...");

      try {
        const nearestTrailData = await getNearestTrail(
          currentLocation.latitude,
          currentLocation.longitude
        );

        console.log("🔬 [Debug] API 원본 응답:", JSON.stringify(nearestTrailData, null, 2));

        if (!nearestTrailData || typeof nearestTrailData !== 'object') {
          console.log("🤷‍♂️ [PloggingStart] 주변에 검색된 산책로가 없습니다.");
          setNearestTrail(null);
          return;
        }

        const lat = parseFloat(nearestTrailData.spotLatitude);
        const lon = parseFloat(nearestTrailData.spotLongitude);

        if (isNaN(lat) || !isFinite(lat) || isNaN(lon) || !isFinite(lon)) {
          console.error("🔥 [오류] API 응답의 좌표 데이터가 유효하지 않습니다.");
          setNearestTrail(null);
          return;
        }
        
        console.log("✅ [PloggingStart] 좌표 데이터 유효성 검사 통과!");

        const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, lat, lon);
        const formattedTrail = {
          id: nearestTrailData.trailId,
          name: nearestTrailData.trailName || '이름 없는 산책로',
          coordinate: { latitude: lat, longitude: lon },
          distance: String(nearestTrailData.lengthDetail) || '정보 없음',
          difficulty: nearestTrailData.difficultyLevel || '보통',
          reportCount: nearestTrailData.reportCount || 0,
          address: nearestTrailData.lotNumberAddress || '주소 정보 없음',
          duration: nearestTrailData.trackTime || "정보 없음",
          distanceToUser: distance,
          originalData: nearestTrailData
        };
        
        setNearestTrail(formattedTrail);
        setDistanceToTrail(distance);
        setCanStartPlogging(distance <= MAX_DISTANCE_TO_START);

      } catch (apiError) {
        console.error("❌ [PloggingStart] API 호출 실패:", apiError);
        setNearestTrail(null);
      }
      
    } catch (error) {
      console.error("❌ [PloggingStart] 전체 오류:", error.message);
      setNearestTrail(null);
    } finally {
      setIsLoading(false);
      searchInProgress.current = false;
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, isLoading, nearestTrail]);

  // 산책로 마커 클릭 처리
  const handleTrailMarkerPress = useCallback(async () => {
    if (!nearestTrail) return;
    
    console.log("🎯 [PloggingStart] 산책로 마커 클릭:", nearestTrail.name);
    
    try {
      const trailDetail = await getTrailDetail(nearestTrail.id);
      const detailWithDistance = {
        ...trailDetail,
        distanceToUser: nearestTrail.distanceToUser
      };
      setSelectedTrailForModal(detailWithDistance);
      setTrailInfoModalVisible(true);
      
    } catch (error) {
      console.error("❌ [PloggingStart] 산책로 정보 가져오기 실패:", error);
      
      setSelectedTrailForModal({
        ...nearestTrail.originalData,
        distanceToUser: nearestTrail.distanceToUser
      });
      setTrailInfoModalVisible(true);
    }
  }, [nearestTrail]);

  // 산책로 선택 확인
  const handleTrailSelection = useCallback((trail) => {
    console.log("✅ [PloggingStart] 산책로 선택 확인:", trail.trailName);
    
    try {
      setSelectedRoute({
        id: trail.trailId,
        name: trail.trailName,
        location: trail.lotNumberAddress,
        difficulty: trail.difficultyLevel,
        distance: trail.length,
        duration: trail.trackTime
      });
      
      if (nearestTrail) {
        setTrailStartCoords(nearestTrail.coordinate);
        setCourseInfo({
          name: trail.trailName,
          difficulty: trail.difficultyLevel,
          distance: trail.length,
          duration: trail.trackTime,
          reportCount: trail.reportCount
        });
      }
      
      setTrailInfoModalVisible(false);
      console.log("🎯 [PloggingStart] 산책로 선택 완료");
    } catch (error) {
      console.error("❌ [PloggingStart] 산책로 선택 처리 오류:", error);
      setTrailInfoModalVisible(false);
    }
  }, [nearestTrail]);

  // 자동 선택 기능
  useEffect(() => {
    if (nearestTrail && !selectedRoute && entryMode === 'main') {
      if (nearestTrail.distanceToUser <= MAX_DISTANCE_TO_START) {
        console.log("🎯 [PloggingStart] 가까운 산책로 자동 선택");
        handleTrailSelection(nearestTrail.originalData);
      }
    }
  }, [nearestTrail, selectedRoute, entryMode, handleTrailSelection]);

  // 🔥 뷰샷으로 지도 캡처 (가장 간단한 방법)
 const captureMapImage = async () => {
    try {
      console.log("📸 [PloggingStart] 지도 캡처 시작");

      if (!viewShotRef.current) {
        console.warn("⚠️ [PloggingStart] ViewShot ref가 없습니다");
        return null;
      }

      // 🔥 경로가 모두 보이도록 지도 줌 조절
      if (routeCoordinates && routeCoordinates.length > 1 && mapRef.current) {
        console.log("🎯 [PloggingStart] 경로에 맞게 지도 줌 조절 중...");
        
        // 모든 좌표를 포함하는 영역 계산
        const coordinates = [...routeCoordinates];
        if (trashLocations && trashLocations.length > 0) {
          trashLocations.forEach(trash => {
            if (trash.coordinate) {
              coordinates.push(trash.coordinate);
            }
          });
        }

        // fitToCoordinates 사용하여 모든 마커와 경로가 보이도록 조정
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
        
        // 줌 조절 완료 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 🔥 ViewShot으로 캡처
      const imageUri = await viewShotRef.current.capture();
      
      console.log("✅ [PloggingStart] 지도 캡처 성공:", imageUri);
      return imageUri;

    } catch (error) {
      console.error("❌ [PloggingStart] 지도 캡처 실패:", error);
      return null;
    }
  };

 const createImageFormData = (imageUri, ploggingData) => {
    const formData = new FormData();
    
    // 🔥 백엔드 요구사항에 맞게 'image'로 키 변경
    if (imageUri) {
      const filename = `plogging_${Date.now()}.png`;
      formData.append('image', {  // 🔥 'imageFile'에서 'image'로 변경
        uri: imageUri,
        type: 'image/png',
        name: filename,
      });
      console.log("📎 [FormData] 이미지 파일 추가 (key: 'image'):", filename);
    }

    // 플로깅 데이터 추가
    formData.append('trailId', String(ploggingData.trailId || ''));
    formData.append('ploggingTime', ploggingData.ploggingTime);
    formData.append('distance', String(ploggingData.distance));
    formData.append('memberId', String(ploggingData.memberId));

    console.log("📋 [FormData] 생성 완료:");
    console.log("  - image: ", imageUri ? "있음" : "없음");
    console.log("  - trailId:", ploggingData.trailId);
    console.log("  - distance:", ploggingData.distance);
    
    return formData;
  };
  // 플로깅 시작 함수
  const handleStart = useCallback(async () => {
    try {
      console.log("🚀 [PloggingStart] 플로깅 시작 요청");

      if (entryMode === 'courseDetail' && !canStartPlogging && trailStartCoords) {
        setDistanceModalVisible(true);
        return;
      }

      if (entryMode === 'main' && !selectedRoute && !nearestTrail) {
        Alert.alert("알림", "산책로 정보가 없지만 플로깅을 시작할 수 있습니다.", [
          { text: "취소", style: "cancel" },
          { text: "시작", onPress: () => proceedWithStart() }
        ]);
        return;
      }

      await proceedWithStart();

    } catch (error) {
      console.error("❌ [PloggingStart] 플로깅 시작 실패:", error);
      Alert.alert("알림", "플로깅을 시작합니다.", [
        { text: "확인", onPress: () => startPlogging() }
      ]);
    }
  }, [entryMode, canStartPlogging, trailStartCoords, selectedRoute, nearestTrail]);

  // 실제 플로깅 시작 처리
  const proceedWithStart = async () => {
    const sessionData = {
      startTime: new Date().toISOString(),
      startLocation: currentLocation,
      selectedTrailId: selectedRoute?.id || nearestTrail?.id || null,
      memberId: ploggingSessionData.memberId
    };
    setPloggingSessionData(sessionData);

    const result = await startPlogging();
    console.log("✅ [PloggingStart] 플로깅 시작 완료");
  };

  // 기타 핸들러들
  const handlePause = useCallback(() => pausePlogging(), [pausePlogging]);
  const handleResume = useCallback(() => resumePlogging(), [resumePlogging]);
  const handleEnd = useCallback(() => setModalVisible(true), []);

// 🔥 플로깅 종료 함수 - 깔끔하게 정리
  const confirmEnd = useCallback(async () => {
    try {
      setModalVisible(false);
      console.log("🏁 [PloggingStart] 플로깅 종료 처리 시작");

      // 지도가 완전히 렌더링될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // 지도 캡처
      const capturedImageUri = await captureMapImage();
      
      if (!capturedImageUri) {
        console.warn("⚠️ [PloggingStart] 지도 캡처 실패, 계속 진행합니다");
      }

      // 플로깅 결과 가져오기
      const ploggingResult = endPlogging();

      // NULL 방지를 위한 데이터 검증
      const safeRouteCoordinates = Array.isArray(routeCoordinates) ? routeCoordinates : [];
      const safeCollectedTrash = Array.isArray(collectedTrash) ? collectedTrash : [];

      // 서버 저장 시도 (savePloggingRecord 함수 사용)
      try {
        console.log('🔑 [PloggingStart] Zustand 스토어에서 가져온 token:', accessToken);
        
        if (!accessToken || accessToken === 'null' || accessToken === 'undefined') {
          console.warn("⚠️ [PloggingStart] 유효한 Access token이 없습니다. 로그인 상태를 확인해주세요.");
        }

        // savePloggingRecord에 전달할 데이터 준비
        const ploggingData = {
          trailId: ploggingSessionData.selectedTrailId || null,
          ploggingTime: new Date().toISOString(),
          distance: Math.max(0, totalDistance || 0),
          memberId: ploggingSessionData.memberId || 1,
          imageFile: capturedImageUri ? {
            uri: capturedImageUri,
            type: 'image/png',
            name: `plogging_${Date.now()}.png`
          } : null
        };

        console.log("📤 [PloggingStart] savePloggingRecord 호출 준비:", {
          trailId: ploggingData.trailId,
          distance: ploggingData.distance,
          hasImage: !!ploggingData.imageFile,
          hasToken: !!accessToken
        });

        // plog.js의 savePloggingRecord 함수 호출
        await savePloggingRecord(ploggingData, accessToken || '');
        console.log("✅ [PloggingStart] 서버 저장 성공");
        
      } catch (saveError) {
        console.error("❌ [PloggingStart] 서버 저장 실패:", saveError);
        Alert.alert(
          "알림", 
          "서버 저장에 실패했지만 로컬 기록은 저장됩니다.",
          [{ text: "확인" }]
        );
      }

      // 최종 결과 데이터 구성 (화면 이동용)
      const finalResult = {
        ...ploggingResult,
        routeName: selectedRoute?.name || courseInfo?.name || "플로깅 기록",
        routeLocation: selectedRoute?.location || courseInfo?.address || "플로깅 경로",
        totalTime: Math.max(0, time || 0),
        totalDistance: Math.max(0, totalDistance || 0),
        trashCount: Math.max(0, trashCount || 0),
        collectedTrash: safeCollectedTrash,
        routeCoordinates: safeRouteCoordinates,
        trashLocations: trashLocations || [],
        mapImage: capturedImageUri,
        routeImage: capturedImageUri,
        startTime: ploggingSessionData.startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        trailId: ploggingSessionData.selectedTrailId || null, 

      };

      console.log("📋 [PloggingStart] 최종 결과:", {
        hasMapImage: !!finalResult.mapImage,
        routeLength: finalResult.routeCoordinates.length,
        trashCount: finalResult.trashCount,
        trailId: finalResult.trailId,
      });

      // 플로깅 기록 페이지로 이동
      navigation.navigate("PloggingRecord", { result: finalResult });

    } catch (error) {
      console.error("❌ [PloggingStart] 플로깅 종료 처리 오류:", error);
      
      // 오류가 발생해도 기본 결과로 이동
      const basicResult = {
        routeName: "플로깅 기록",
        routeLocation: "플로깅 경로", 
        totalTime: Math.max(0, time || 0),
        totalDistance: Math.max(0, totalDistance || 0),
        trashCount: Math.max(0, trashCount || 0),
        collectedTrash: Array.isArray(collectedTrash) ? collectedTrash : [],
        routeCoordinates: Array.isArray(routeCoordinates) ? routeCoordinates : [],
        mapImage: null,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };
      
      navigation.navigate("PloggingRecord", { result: basicResult });
    }
  }, [
    accessToken, 
    captureMapImage, 
    endPlogging, 
    routeCoordinates, 
    collectedTrash, 
    trashLocations,
    totalDistance, 
    time, 
    trashCount, 
    ploggingSessionData, 
    selectedRoute, 
    courseInfo, 
    navigation, 
    savePloggingRecord
  ]);

  const handleTrashMarkerPress = useCallback((trash) => {
    setSelectedTrash(trash);
    setTrashInfoModalVisible(true);
  }, []);

  const handlePickTrash = useCallback((trash) => {
    try {
      addTrash();
      addCollectedTrashItem(trash);
      removeTrash(trash.id);
      setTrashInfoModalVisible(false);
      Alert.alert('성공', '쓰레기를 주웠습니다!', [{ text: '확인' }]);
    } catch (error) {
      console.error('쓰레기 줍기 오류:', error);
    }
  }, [addTrash, addCollectedTrashItem, removeTrash]);

  const handleShowTrashList = useCallback(() => {
    const collectedItems = collectedTrash.map(item =>
      `- ${item.title || '쓰레기'}: ${item.amount || '보통'}`
    ).join('\n');

    Alert.alert(
      "수집한 쓰레기 목록",
      collectedTrash.length > 0 ? collectedItems : "아직 수집한 쓰레기가 없습니다."
    );
  }, [collectedTrash]);

  // 거리 텍스트 생성 - 메모이제이션
  const distanceText = useMemo(() => {
    if (!distanceToTrail) return "";
    
    if (distanceToTrail <= MAX_DISTANCE_TO_START) {
      return `✅ 산책로와 ${distanceToTrail.toFixed(0)}m 거리 (시작 가능)`;
    } else {
      return `⚠️ 산책로와 ${distanceToTrail.toFixed(0)}m 거리 (너무 멀음)`;
    }
  }, [distanceToTrail]);

  // 메인 모드 안내 렌더링
  const mainModeInstructions = useMemo(() => {
    if (entryMode !== 'main') return null;
    
    if (isLoading) {
      return (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>🔍 가장 가까운 산책로 검색 중...</Text>
          <Text style={styles.loadingText}>잠시만 기다려주세요</Text>
        </View>
      );
    }
    
    if (nearestTrail && !selectedRoute) {
      const distance = nearestTrail.distanceToUser;
      const isNear = distance <= MAX_DISTANCE_TO_START;
      
      return (
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>🎯 가장 가까운 산책로</Text>
          <Text style={styles.instructionText}>
            {nearestTrail.name}{"\n"}
            거리: {distance.toFixed(0)}m
          </Text>
          <Text style={[
            styles.instructionSubText,
            { color: isNear ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 193, 7, 0.9)" }
          ]}>
            {isNear ? "플로깅 시작 가능한 거리입니다" : "조금 더 가까이 이동해주세요"}
          </Text>
          {!isNear && (
            <TouchableOpacity 
              style={styles.selectTrailButton}
              onPress={handleTrailMarkerPress}
            >
              <Text style={styles.selectTrailButtonText}>산책로 정보 보기</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    if (!nearestTrail && !isLoading) {
      return (
        <View style={styles.noDataCard}>
          <Text style={styles.noDataTitle}>🔍 주변 산책로 없음</Text>
          <Text style={styles.noDataText}>
            현재 위치 주변에{"\n"}등록된 산책로가 없습니다
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              console.log("🔄 [PloggingStart] 재검색 요청");
              setNearestTrail(null);
              searchInProgress.current = false;
              handleNearestSearch();
            }}
          >
            <Text style={styles.retryButtonText}>다시 검색</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  }, [entryMode, isLoading, nearestTrail, selectedRoute, handleTrailMarkerPress, handleNearestSearch]);

  // 코스 정보 카드 - 메모이제이션
  const courseInfoCard = useMemo(() => {
    if (!courseInfo) return null;
    
    return (
      <View style={styles.courseInfoCard}>
        <Text style={styles.courseInfoTitle}>{courseInfo.name}</Text>
        <View style={styles.courseInfoDetails}>
          <Text style={styles.courseInfoText}>난이도: {courseInfo.difficulty}</Text>
          <Text style={styles.courseInfoText}>거리: {courseInfo.distance}</Text>
          {courseInfo.duration && (
            <Text style={styles.courseInfoText}>소요시간: {courseInfo.duration}</Text>
          )}
          {courseInfo.reportCount !== undefined && (
            <Text style={styles.courseInfoText}>쓰레기 신고: {courseInfo.reportCount}개</Text>
          )}
        </View>
      </View>
    );
  }, [courseInfo]);

  // 시작 버튼 - 메모이제이션
  const startButton = useMemo(() => {
    const isDisabled = (!canStartPlogging && trailStartCoords) || (entryMode === 'main' && !selectedRoute && !nearestTrail);
    const buttonText = (!canStartPlogging && trailStartCoords) ? "거리가 너무 멀어요" : 
                     (entryMode === 'main' && !selectedRoute && !nearestTrail) ? "산책로를 찾는 중..." : "시작";
    
    return (
      <TouchableOpacity 
        style={[
          styles.overlayStartButton, 
          isDisabled && styles.overlayStartButtonDisabled
        ]} 
        onPress={handleStart}
        disabled={isDisabled}
      >
        <Text style={[
          styles.overlayStartButtonText,
          isDisabled && styles.overlayStartButtonTextDisabled
        ]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    );
  }, [canStartPlogging, trailStartCoords, entryMode, selectedRoute, nearestTrail, handleStart]);

  // 오버레이 컨트롤 - 메모이제이션
  const overlayControls = useMemo(() => {
    if (status !== "idle") return null;
    
    return (
      <View style={styles.overlayControls}>
        {mainModeInstructions}
        {courseInfoCard}
        {startButton}
      </View>
    );
  }, [status, mainModeInstructions, courseInfoCard, startButton]);

  // 러닝 컨트롤 - 메모이제이션
  const runningControls = useMemo(() => {
    if (status === "idle") return null;
    
    return (
      <View style={styles.runningControls}>
        <PloggingControls
          status={status}
          time={time}
          trashCount={trashCount}
          formatTime={formatTime}
          onPause={handlePause}
          onResume={handleResume}
          onEnd={handleEnd}
          onShowTrashList={handleShowTrashList}
        />
      </View>
    );
  }, [status, time, trashCount, formatTime, handlePause, handleResume, handleEnd, handleShowTrashList]);

  // 지도에 표시할 산책로 데이터 - 단일 객체를 배열로 변환
  const mapTrails = useMemo(() => {
    return nearestTrail ? [nearestTrail] : [];
  }, [nearestTrail]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
          <Icon name="arrow-back" size={24} color="#418663" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>플로깅</Text>
        <TouchableOpacity onPress={() => navigation.navigate("내 플로깅 기록")}>
          <Icon name="person" size={24} color="#418663" />
        </TouchableOpacity>
      </View>

      {/* 거리 정보 표시 */}
      {trailStartCoords && distanceToTrail !== null && (
        <View style={[styles.distanceInfo, !canStartPlogging && styles.distanceInfoWarning]}>
          <Text style={[styles.distanceText, !canStartPlogging && styles.distanceTextWarning]}>
            {distanceText}
          </Text>
        </View>
      )}

      {/* 🔥 지도 컨테이너 - 캡처를 위한 ref 추가 */}
      <ViewShot 
        ref={viewShotRef}
        style={styles.mapContainer}
        options={{ 
          format: 'png', 
          quality: 0.9,
          result: 'tmpfile'  // 임시 파일로 저장
        }}
      >        
        <PloggingMap
          mapRef={mapRef}
          currentLocation={currentLocation}
          routeCoordinates={routeCoordinates || []}
          trashLocations={trashLocations || []}
          isLoading={isLoading}
          mapReady={mapReady}
          onTrashMarkerPress={handleTrashMarkerPress}
          nearbyCourses={mapTrails}
          onCourseMarkerPress={handleTrailMarkerPress}
          selectedCourseId={nearestTrail?.id}
          initialTrailPath={initialTrailPath || []}
        />

        {/* 컨트롤 렌더링 */}
        {overlayControls}
        {runningControls}
      </ViewShot>
      
      {/* 모달들 */}
      <CommonModal
        visible={modalVisible}
        title="플로깅 종료"
        message={`플로깅을 종료하시겠습니까?\n주운 쓰레기: ${trashCount}개`}
        onConfirm={confirmEnd}
        onCancel={() => setModalVisible(false)}
        confirmText="종료"
        cancelText="취소"
      />

      <CommonModal
        visible={distanceModalVisible}
        title="산책로와의 거리가 너무 멉니다"
        message={`현재 산책로에서 ${distanceToTrail?.toFixed(0)}m 떨어져 있습니다.\n${MAX_DISTANCE_TO_START}m 이내로 가까이 이동해주세요.`}
        onConfirm={() => setDistanceModalVisible(false)}
        confirmText="확인"
        showCancel={false}
      />

      <TrailInfoModal
        visible={trailInfoModalVisible}
        trail={selectedTrailForModal}
        onClose={() => setTrailInfoModalVisible(false)}
        onConfirm={handleTrailSelection}
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
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  header: { 
    paddingTop: screenHeight * 0.05, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: "#FFFFFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E0E0E0", 
    zIndex: 10 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#212529" 
  },
  
  // 거리 정보
  distanceInfo: {
    backgroundColor: "#E8F5E8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  distanceInfoWarning: {
    backgroundColor: "#FFF3E0"
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#388E3C",
    textAlign: "center"
  },
  distanceTextWarning: {
    color: "#F57C00"
  },
  
  mapContainer: { 
    flex: 1, 
    position: 'relative' 
  },
  overlayControls: { 
    position: 'absolute', 
    bottom: screenHeight * 0.1, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 100,
    paddingHorizontal: 20,
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

  // 안내 카드
  instructionCard: {
    backgroundColor: "rgba(66, 134, 99, 0.9)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  instructionSubText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },

  // 새로운 버튼 스타일
  selectTrailButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: "center",
  },
  selectTrailButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // 로딩 카드
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#418663",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },

  // 코스 정보 카드
  courseInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#418663",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  courseInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#418663",
    textAlign: "center",
    marginBottom: 8,
  },
  courseInfoDetails: {
    alignItems: "center",
  },
  courseInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },

  // 시작 버튼
  overlayStartButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#418663", 
    borderRadius: 25, 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8,
    width: '100%',
    justifyContent: 'center',
  },
  overlayStartButtonDisabled: {
    backgroundColor: "#CCCCCC"
  },
  overlayStartButtonText: { 
    color: "#FFFFFF", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  overlayStartButtonTextDisabled: {
    color: "#888888"
  },
  
  // 데이터 없음 카드
  noDataCard: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 193, 7, 0.3)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF8F00",
    textAlign: "center",
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#418663",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  
  runningControls: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    zIndex: 100 
  },

  // 산책로 정보 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    margin: 20,
    maxHeight: screenHeight * 0.8,
    width: screenWidth * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#418663',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default React.memo(PloggingStartScreen);