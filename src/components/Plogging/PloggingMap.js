import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        {/* 현재 위치 마커 (사용자 정의) */}
        <Marker 
          coordinate={currentLocation} 
          title="현재 위치"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.currentLocationMarker}>
            <View style={styles.currentLocationInner} />
          </View>
        </Marker>
        
        {/* 경로 표시 - 더 부드러운 라인 */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#418663"
            strokeWidth={5}
            lineJoin="round"
            lineCap="round"
          />
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
                <Icon name="delete" size={20} color="#418663" />
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
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4A90E2",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    marginTop: 3,
  },
  trashMarker: {
    width: 30,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#418663",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PloggingMap;
