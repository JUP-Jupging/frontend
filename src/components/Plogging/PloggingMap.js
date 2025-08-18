// components/Plogging/PloggingMap.js

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

// í˜„ìž¬ ìœ„ì¹˜ ë§ˆì»¤ ì»´í¬ë„ŒíŠ¸
const CurrentLocationMarker = () => {
  // ... (ë‚´ë¶€ ì½”ë“œëŠ” ë³€ê²½ ì—†ìŒ)
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true, }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1200, useNativeDriver: true, }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5], });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0], });

  return (
    <View style={styles.currentLocationContainer}>
      <Animated.View style={[ styles.currentLocationPulse, { transform: [{ scale: pulseScale }], opacity: pulseOpacity, }, ]} />
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
  onTrashMarkerPress,
  // [ì¶”ê°€] MainScreenì—ì„œ ì§„ìž… ì‹œ ì£¼ë³€ ì‚°ì±…ë¡œ í‘œì‹œìš© props
  nearbyCourses,
  onCourseMarkerPress,
  selectedCourseId,
  // [ì¶”ê°€] CourseDetailScreenì—ì„œ ì§„ìž… ì‹œ ì „ì²´ ê²½ë¡œ í‘œì‹œìš© prop
  initialTrailPath 
}) => {

  const defaultRegion = {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const initialRegion = currentLocation || defaultRegion;

  return (
    <View style={styles.mapContainer}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false} // ì»¤ìŠ¤í…€ ë§ˆì»¤ë¥¼ ì‚¬ìš©í•˜ë¯€ë¡œ false
        // ... (ê¸°íƒ€ MapView ì†ì„±)
      >
        {/* í˜„ìž¬ ìœ„ì¹˜ ì»¤ìŠ¤í…€ ë§ˆì»¤ */}
        {mapReady && currentLocation && (
          <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }} >
            <CurrentLocationMarker />
          </Marker>
        )}
        
        {/* [ì¶”ê°€] ìƒì„¸ íŽ˜ì´ì§€ì—ì„œ ë„˜ì–´ì˜¨ ê²½ìš°, ì‚°ì±…ë¡œ ì „ì²´ ê²½ë¡œ í‘œì‹œ */}
        {mapReady && initialTrailPath && initialTrailPath.length > 1 && (
            <Polyline
                coordinates={initialTrailPath}
                strokeColor="rgba(0, 0, 0, 0.4)" // íšŒìƒ‰
                strokeWidth={4}
                lineDashPattern={[5, 5]} // ì ì„ 
            />
        )}

        {/* ì‚¬ìš©ìžê°€ ì´ë™í•œ ê²½ë¡œ (í”Œë¡œê¹… ì¤‘) */}
        {mapReady && routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#418663" // ì•± ë©”ì¸ ì»¬ëŸ¬
            strokeWidth={6}
          />
        )}
        
        {/* ì“°ë ˆê¸° ìœ„ì¹˜ ë§ˆì»¤ */}
        {mapReady && trashLocations && trashLocations.map((trash) => (
            <Marker key={`trash-${trash.id}`} coordinate={trash.coordinate} onPress={() => onTrashMarkerPress && onTrashMarkerPress(trash)} >
              <View style={styles.trashMarker}>
                <Icon name="delete" size={22} color="#418663" />
              </View>
            </Marker>
        ))}

        {/* [ì¶”ê°€] ì£¼ë³€ ì‚°ì±…ë¡œ ë§ˆì»¤ */}
        {mapReady && nearbyCourses && nearbyCourses.map((course) => (
            <Marker key={`course-${course.id}`} coordinate={course.coordinate} onPress={() => onCourseMarkerPress && onCourseMarkerPress(course)} >
                <View style={[styles.courseMarker, selectedCourseId === course.id && styles.selectedCourseMarker]}>
                    <Icon name="directions-walk" size={22} color={selectedCourseId === course.id ? "#FFFFFF" : "#418663"} />
                </View>
            </Marker>
        ))}

      </MapView>

      {(isLoading || !mapReady) && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {isLoading ? "ì§€ë„ë¥¼ ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘..." : "ì§€ë„ ì¤€ë¹„ ì¤‘..."}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (ê¸°ì¡´ ìŠ¤íƒ€ì¼ì€ ê·¸ëŒ€ë¡œ ìœ ì§€)
  mapContainer: { flex: 1, backgroundColor: "#F5F5F5", },
  map: { flex: 1, },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(245, 245, 245, 0.8)', justifyContent: 'center', alignItems: 'center', },
  loadingText: { fontSize: 16, color: "#666", textAlign: 'center', },
  currentLocationContainer: { alignItems: 'center', justifyContent: 'center', },
  currentLocationPulse: { position: 'absolute', width: 25, height: 25, borderRadius: 12.5, backgroundColor: '#4A90E2', },
  currentLocationMarker: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: '#4A90E2', shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 6, },
  trashMarker: { width: 36, height: 36, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 3, borderColor: "#418663", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 6, },
  // [ì¶”ê°€] ì‚°ì±…ë¡œ ë§ˆì»¤ ìŠ¤íƒ€ì¼
  courseMarker: { width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 3, borderColor: "#418663", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 6, },
  selectedCourseMarker: { backgroundColor: "#418663", }
});

export default PloggingMap;