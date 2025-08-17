import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import Icon from 'react-native-vector-icons/MaterialIcons'

const windowDimensions = Dimensions.get('window');
const screenWidth = windowDimensions.width;
const screenHeight = windowDimensions.height;
/**
 * 🗺️ PloggingMap: 플로깅 지도 컴포넌트
 * 
 * 주요 기능:
 * 1. 현재 위치 마커 표시
 * 2. 이동 경로 polyline 실시간 그리기
 * 3. 쓰레기 위치 마커 표시
 * 4. 지도 캡처 지원
 * 
 * Props:
 * - mapRef: 지도 컴포넌트 참조 (캡처용)
 * - currentLocation: 현재 위치 좌표
 * - routeCoordinates: 이동 경로 좌표 배열
 * - trashLocations: 쓰레기 위치 배열
 * - isLoading: 로딩 상태
 * - mapReady: 지도 준비 완료 여부
 * - onTrashMarkerPress: 쓰레기 마커 클릭 핸들러
 */
export default function PloggingMap({
  mapRef,
  currentLocation,
  routeCoordinates = [],
  trashLocations = [],
  isLoading,
  mapReady,
  onTrashMarkerPress
}) {
  
  // 🔍 디버깅용 로그
  useEffect(() => {
    console.log('[PloggingMap] 컴포넌트 렌더링:', {
      currentLocation: currentLocation ? 'O' : 'X',
      routePointsCount: routeCoordinates?.length || 0,
      trashLocationsCount: trashLocations?.length || 0,
      mapReady
    });
    
    if (routeCoordinates && routeCoordinates.length > 0) {
      console.log('[PloggingMap] 🛤️ Polyline 좌표 업데이트:', {
        첫번째점: routeCoordinates[0],
        마지막점: routeCoordinates[routeCoordinates.length - 1],
        총점수: routeCoordinates.length
      });
    }
  }, [currentLocation, routeCoordinates, trashLocations, mapReady]);

  // 현재 위치가 변경될 때 지도 중심 이동
  useEffect(() => {
    if (mapRef.current && currentLocation && mapReady) {
      console.log('[PloggingMap] 📍 현재 위치로 지도 중심 이동:', currentLocation);
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [currentLocation, mapReady]);

  // 기본 지도 영역 설정
  const initialRegion = currentLocation ? {
    ...currentLocation,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={false}
        showsCompass={false}
        showsBuildings={true}
        showsTraffic={false}
        loadingEnabled={true}
        mapType="standard"
        onMapReady={() => {
          console.log('[PloggingMap] 지도 준비 완료');
        }}
      >
        {/* 🛤️ 이동 경로 Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4CAF50"
            strokeWidth={6}
            strokePattern={[1]}
            geodesic={true}
            lineCap="round"
            lineJoin="round"
            zIndex={1000}
          />
        )}

        {/* 📍 현재 위치 마커 (더 눈에 띄는 커스텀 마커) */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={2000}
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationInner} />
            </View>
          </Marker>
        )}

        {/* 🗑️ 쓰레기 위치 마커들 */}
        {trashLocations.map((trash) => (
          <Marker
            key={trash.id}
            coordinate={trash.coordinate}
            onPress={() => onTrashMarkerPress && onTrashMarkerPress(trash)}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={1500}
          >
            <View style={styles.trashMarker}>
              <Icon name="delete" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        ))}

        {/* 🎯 시작점 마커 (경로가 있을 때) */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Marker
            coordinate={routeCoordinates[0]}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1800}
          >
            <View style={styles.startMarker}>
              <Icon name="flag" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* 🏁 현재까지의 끝점 마커 (경로가 2개 이상일 때) */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Marker
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1900}
          >
            <View style={styles.endMarker}>
              <Icon name="location-on" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Icon name="map" size={32} color="#4CAF50" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  
  // 현재 위치 마커 스타일
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  
  // 쓰레기 마커 스타일
  trashMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // 시작점 마커 스타일
  startMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // 끝점 마커 스타일
  endMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // 로딩 오버레이
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});