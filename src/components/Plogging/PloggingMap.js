import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 현재 위치 마커 컴포넌트 (심플한 원형)
const CurrentLocationMarker = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0],
  });

  return (
    <View style={styles.currentLocationContainer}>
      {/* 펄스 애니메이션 */}
      <Animated.View
        style={[
          styles.currentLocationPulse,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />
      
      {/* 메인 마커 - 간단한 원형 */}
      <View style={styles.currentLocationMarker} />
    </View>
  );
};

const PloggingMap = ({ 
  mapRef, 
  currentLocation, 
  routeCoordinates, 
  trashLocations, 
  isLoading, 
  mapReady, 
  onTrashMarkerPress 
}) => {
  console.log('[PloggingMap] 렌더링:', { 
    currentLocation: !!currentLocation, 
    routeCoordinatesLength: routeCoordinates?.length, 
    trashLocationsLength: trashLocations?.length,
    mapReady,
    isLoading 
  });

  // 기본 지역 설정 (서울 중심)
  const defaultRegion = {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // 초기 지역은 현재 위치가 있으면 사용하고, 없으면 기본값 사용
  const initialRegion = currentLocation || defaultRegion;

  console.log('[PloggingMap] 맵 렌더링 시작 - 항상 MapView 렌더링');

  return (
    <View style={styles.mapContainer}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        followsUserLocation={false} // 수동으로 카메라 제어
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => {
          console.log('[PloggingMap] 맵 준비 완료');
        }}
        onError={(error) => {
          console.error('[PloggingMap] 맵 오류:', error);
        }}
        mapType="standard"
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* 현재 위치 마커 - 위치가 있고 맵이 준비되었을 때만 렌더링 */}
        {mapReady && currentLocation && (
          <Marker 
            coordinate={currentLocation} 
            title="현재 위치"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <CurrentLocationMarker />
          </Marker>
        )}
        
        {/* 경로 표시 - 맵이 준비되고 경로 데이터가 있을 때만 렌더링 */}
        {mapReady && routeCoordinates && routeCoordinates.length > 1 && (
          (() => {
            console.log('[PloggingMap] 🗺️ Polyline 렌더링:', {
              좌표개수: routeCoordinates.length,
              시작점: routeCoordinates[0],
              끝점: routeCoordinates[routeCoordinates.length - 1]
            });
            return (
              <>
                {/* 그림자 효과를 위한 더 두꺼운 배경 라인 */}
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="rgba(65, 134, 99, 0.3)"
                  strokeWidth={8}
                  lineJoin="round"
                  lineCap="round"
                />
                {/* 메인 경로 라인 */}
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#418663"
                  strokeWidth={6}
                  lineJoin="round"
                  lineCap="round"
                  geodesic={true} // 지구의 곡률을 고려한 더 정확한 라인
                />
                {/* 하이라이트 라인 (중앙) */}
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#52C574"
                  strokeWidth={3}
                  lineJoin="round"
                  lineCap="round"
                  geodesic={true}
                />
              </>
            );
          })()
        )}
        
        {/* 쓰레기 위치 마커 - 맵이 준비되고 데이터가 있을 때만 렌더링 */}
        {mapReady && trashLocations && trashLocations.length > 0 && trashLocations.map((trash) => {
          console.log('[PloggingMap] 쓰레기 마커 렌더링:', trash.id);
          return (
            <Marker
              key={`trash-${trash.id}`}
              coordinate={trash.coordinate}
              onPress={() => {
                console.log('[PloggingMap] 쓰레기 마커 클릭:', trash.id);
                onTrashMarkerPress && onTrashMarkerPress(trash);
              }}
            >
              <View style={styles.trashMarker}>
                <Icon name="delete" size={22} color="#418663" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* 로딩 오버레이 */}
      {(isLoading || !mapReady) && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {isLoading ? "지도를 불러오는 중..." : "지도 준비 중..."}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
  },
  currentLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationPulse: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#4A90E2',
  },
  currentLocationMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  trashMarker: {
    width: 36,
    height: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#418663",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  },
});

export default PloggingMap;