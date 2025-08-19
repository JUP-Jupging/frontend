import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, Image, Dimensions, SafeAreaView, Linking, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { fetchClosestTrashCans, convertToMapMarkers } from '../services/trashCanService';
import { formatDistance } from '../utils/locationUtils';
import Icon from "react-native-vector-icons/MaterialIcons"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'; // 🔥 MaterialIcons 추가

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 37.5665,
  longitude: 126.9780,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// 지자체별 로고 매핑
const LOCAL_GOVERNMENT_LOGOS = {
  '서울특별시': require('../assets/logos/seoul_logo.png'),
  '부산광역시': require('../assets/logos/busan_logo.png'),
  '대구광역시': require('../assets/logos/daegu_logo.png'),
  '인천광역시': require('../assets/logos/incheon_logo.png'),
  '광주광역시': require('../assets/logos/gwangju_logo.png'),
  '대전광역시': require('../assets/logos/daejeon_logo.png'),
  '울산광역시': require('../assets/logos/ulsan_logo.png'),
  '세종특별자치시': require('../assets/logos/sejong_logo.png'),
  '경기도': require('../assets/logos/gyeonggi_logo.png'),
  '강원도': require('../assets/logos/gangwon_logo.png'),
  '충청북도': require('../assets/logos/chungbuk_logo.png'),
  '충청남도': require('../assets/logos/chungnam_logo.png'),
  '전라북도': require('../assets/logos/jeonbuk_logo.png'),
  '전라남도': require('../assets/logos/jeonnam_logo.png'),
  '경상북도': require('../assets/logos/gyeongbuk_logo.png'),
  '경상남도': require('../assets/logos/gyeongnam_logo.png'),
  '제주특별자치도': require('../assets/logos/jeju_logo.png'),
};

const getLocalGovernmentLogo = (location) => {
  if (!location) return require('../assets/image232.png');
  
  for (const [region, logo] of Object.entries(LOCAL_GOVERNMENT_LOGOS)) {
    if (location.includes(region)) {
      return logo;
    }
  }
  
  return require('../assets/image232.png');
};

// 🔥 커스텀 쓰레기통 마커 컴포넌트
const TrashCanMarker = ({ onPress, isSelected = false }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.markerContainer,
        isSelected && styles.selectedMarkerContainer
      ]}
    >
      <View style={[
        styles.markerBackground,
        isSelected && styles.selectedMarkerBackground
      ]}>
        <MaterialIcon 
          name="delete-outline" 
          size={isSelected ? 28 : 24} 
          color="#FFFFFF" 
        />
      </View>
      <View style={[
        styles.markerPointer,
        isSelected && styles.selectedMarkerPointer
      ]} />
    </TouchableOpacity>
  );
};

// 🔥 현재 위치 마커 컴포넌트
const MyLocationMarker = () => {
  return (
    <View style={styles.myLocationContainer}>
      <View style={styles.myLocationBackground}>
        <MaterialIcon 
          name="my-location" 
          size={20} 
          color="#FFFFFF" 
        />
      </View>
      <View style={styles.myLocationRing} />
    </View>
  );
};

export default function TrashCanMapScreen({ navigation }) {
  const { currentLocation, mapRef } = useLocation();
  const [selectedTrashCan, setSelectedTrashCan] = useState(null);
  const [trashCans, setTrashCans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapMarkers, setMapMarkers] = useState([]);

  const handleCloseSheet = () => setSelectedTrashCan(null);
  const goBack = () => navigation.goBack();
  const goToProfile = () => navigation.navigate("내 플로깅 기록");

  // 근처 쓰레기통 데이터 가져오기
  const loadNearbyTrashCans = async () => {
    if (!currentLocation) {
      console.log('[TrashCanMap] 현재 위치가 없어 쓰레기통 조회를 건너뜁니다');
      return;
    }

    setLoading(true);
    try {
      console.log('[TrashCanMap] 쓰레기통 데이터 로딩 시작');
      console.log('- 현재 위치:', currentLocation);
      
      // 서비스를 통해 가장 가까운 쓰레기통 5개 가져오기
      const closestTrashCans = await fetchClosestTrashCans(currentLocation);
      setTrashCans(closestTrashCans);
      
      console.log('[TrashCanMap] 받아온 쓰레기통 데이터:', closestTrashCans);
      
      // 지도 마커용 데이터로 변환
      const markers = convertToMapMarkers(closestTrashCans);
      setMapMarkers(markers);
      
      console.log('[TrashCanMap] 지도 마커 데이터:', markers);
      
    } catch (error) {
      console.error('[TrashCanMap] 데이터 로딩 실패:', error);
      Alert.alert(
        '데이터 로딩 실패',
        '쓰레기통 정보를 가져오는데 실패했습니다. 네트워크 연결을 확인해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '다시 시도', onPress: loadNearbyTrashCans }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // 현재 위치로 카메라 이동
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      console.log('[TrashCanMap] 지도 카메라 이동:', currentLocation);
      mapRef.current.animateCamera({
        center: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        zoom: 17,
      }, { duration: 1000 });
    }
  }, [currentLocation]);

  // 현재 위치가 변경될 때마다 쓰레기통 데이터 새로 가져오기
  useEffect(() => {
    loadNearbyTrashCans();
  }, [currentLocation]);

  // 마커 클릭 핸들러
  const handleMarkerPress = (marker) => {
    console.log('[TrashCanMap] 마커 클릭:', marker);
    setSelectedTrashCan(marker.originalData);
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    if (!currentLocation) {
      Alert.alert('위치 정보 없음', '현재 위치를 확인할 수 없습니다. 위치 서비스를 활성화해주세요.');
      return;
    }
    loadNearbyTrashCans();
  };

  // 길찾기 핸들러
  const handleNavigate = () => {
    if (currentLocation && selectedTrashCan) {
      const lat = selectedTrashCan.latitude;
      const lon = selectedTrashCan.longitude;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${lat},${lon}&travelmode=walking`;
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          내 주변 쓰레기통 ({trashCans.length}개)
        </Text>
        <View style={styles.rightButtons}>
          <TouchableOpacity 
            onPress={handleRefresh} 
            style={styles.refreshButton}
            disabled={loading}
          >
            <Icon 
              name={loading ? "loading" : "refresh"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToProfile}>
            <Icon name="person" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 지도 */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false} // 🔥 기본 내 위치 표시 끄기
        showsMyLocationButton={true}
        initialRegion={INITIAL_REGION}
      >
        {/* 🔥 현재 위치 커스텀 마커 */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1000}
          >
            <MyLocationMarker />
          </Marker>
        )}

        {/* 🔥 쓰레기통 커스텀 마커들 */}
        {mapMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker)}
            anchor={{ x: 0.5, y: 1 }} // 🔥 마커 하단 중앙이 좌표점
            zIndex={selectedTrashCan?.id === marker.id ? 999 : 1}
          >
            <TrashCanMarker 
              onPress={() => handleMarkerPress(marker)}
              isSelected={selectedTrashCan?.id === marker.originalData?.id}
            />
          </Marker>
        ))}
      </MapView>

      {/* 로딩 오버레이 */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#418663" />
            <Text style={styles.loadingText}>근처 쓰레기통을 찾는 중...</Text>
          </View>
        </View>
      )}

      {/* 쓰레기통 정보 모달 */}
      <Modal
        visible={!!selectedTrashCan}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseSheet}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCloseSheet}>
          <View style={styles.infoBox}>
            <View style={styles.headerRow}>
              <Text style={styles.trashType}>
                {selectedTrashCan?.categoryName || selectedTrashCan?.type || '쓰레기통'}
              </Text>
              <Image 
                source={getLocalGovernmentLogo(
                  selectedTrashCan?.location || 
                  selectedTrashCan?.cityName || 
                  selectedTrashCan?.address
                )} 
                style={styles.trashLogo} 
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>위치</Text>
              <Text style={styles.value}>
                {selectedTrashCan?.location || 
                 selectedTrashCan?.cityName || 
                 selectedTrashCan?.address || 
                 '정보 없음'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>설치장소명</Text>
              <Text style={styles.value}>
                {selectedTrashCan?.placeName || 
                 selectedTrashCan?.detailLocation || 
                 selectedTrashCan?.installationSite || 
                 '정보 없음'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>세부위치</Text>
              <Text style={styles.value}>
                {selectedTrashCan?.details || 
                 selectedTrashCan?.description || 
                 selectedTrashCan?.detailAddress ||
                 '정보 없음'}
              </Text>
            </View>

            {selectedTrashCan?.distanceFromUser && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>거리</Text>
                <Text style={styles.value}>
                  {formatDistance(selectedTrashCan.distanceFromUser)}
                </Text>
              </View>
            )}

            {selectedTrashCan?.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>관리기관 전화번호</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.phone}>{selectedTrashCan.phone}</Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.navigateBtn}
              onPress={handleNavigate}
            >
              <MaterialIcon name="directions-walk" size={20} color="#FFFFFF" />
              <Text style={styles.navigateText}>길찾기 안내</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 4,
  },
  map: {
    flex: 1,
  },
  
  // 🔥 쓰레기통 마커 스타일
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarkerContainer: {
    transform: [{ scale: 1.1 }],
  },
  markerBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedMarkerBackground: {
    backgroundColor: '#FF4444',
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF6B6B',
    marginTop: -3,
  },
  selectedMarkerPointer: {
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderTopColor: '#FF4444',
    marginTop: -4,
  },
  
  // 🔥 현재 위치 마커 스타일
  myLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  myLocationBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  trashType: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  trashLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  label: {
    fontWeight: '600',
    color: '#AAB2C8',
    fontSize: 16,
    width: 110,
  },
  value: {
    color: '#333',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  phone: {
    color: '#797982',
    backgroundColor: 'rgba(153,153,153,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(170,178,200,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#418663',
    borderRadius: 30,
    height: 48,
    width: '80%',
    alignSelf: 'center',
    gap: 8,
  },
  navigateText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});