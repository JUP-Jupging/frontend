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

  if (!currentLocation || !mapReady) {
    console.log('[PloggingMap] 맵 준비되지 않음 - 플레이스홀더 표시');
    return (
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            {isLoading ? "지도를 불러오는 중..." : "[지도 영역 - Google Map]"}
          </Text>
        </View>
      </View>
    );
  }

  console.log('[PloggingMap] 맵 렌더링 시작');

  return (
    <View style={styles.mapContainer}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        initialRegion={currentLocation}
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
        {/* 현재 위치 마커 (개선된 디자인) */}
        <Marker 
          coordinate={currentLocation} 
          title="현재 위치"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <CurrentLocationMarker />
        </Marker>
        
        {/* 경로 표시 - 더 부드럽고 예쁜 라인 */}
        {routeCoordinates && routeCoordinates.length > 1 && (
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
        
        {/* 쓰레기 위치 마커 */}
        {trashLocations && trashLocations.length > 0 && trashLocations.map((trash) => {
          console.log('[PloggingMap] 쓰레기 마커 렌더링:', trash.id);
          return (
            <Marker
              key={`trash-${trash.id}`}
              coordinate={trash.coordinate}
              onPress={() => {
                console.log('[PloggingMap] 쓰레기 마커 클릭:', trash.id);
                onTrashMarkerPress(trash);
              }}
            >
              <View style={styles.trashMarker}>
                <Icon name="delete" size={22} color="#418663" />
              </View>
            </Marker>
          );
        })}
      </MapView>
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
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: "#666",
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
