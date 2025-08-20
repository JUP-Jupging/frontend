// components/Plogging/PloggingMap.js - null ì°¸ì¡° ì˜¤ë¥˜ í•´ê²° ë²„ì „

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ðŸ”¥ í˜„ìž¬ ìœ„ì¹˜ ë§ˆì»¤ (ì•ˆì „í•œ ë²„ì „)
const CurrentLocationMarker = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    const pulse = () => {
      // ì»´í¬ë„ŒíŠ¸ê°€ ì‚´ì•„ìžˆì„ ë•Œë§Œ ì• ë‹ˆë©”ì´ì…˜ì„ ë°˜ë³µí•©ë‹ˆë‹¤.
      if (!isMounted.current) return;

      Animated.sequence([
        Animated.timing(pulseAnim, { 
          toValue: 1, 
          duration: 1500, 
          useNativeDriver: true 
        }),
        Animated.timing(pulseAnim, { 
          toValue: 0, 
          duration: 1500, 
          useNativeDriver: true 
        }),
      ]).start(pulse); // ì™„ë£Œë˜ë©´ ìžê¸° ìžì‹ (pulse)ì„ ë‹¤ì‹œ í˜¸ì¶œ
    };
    pulse();
    
    // 4. ì–¸ë§ˆìš´íŠ¸ë  ë•Œ refë¥¼ falseë¡œ ì„¤ì •í•´ ì• ë‹ˆë©”ì´ì…˜ ìž¬ê·€ í˜¸ì¶œì„ ë§‰ìŠµë‹ˆë‹¤.
    return () => {
      isMounted.current = false;
    };
  }, [pulseAnim]); // 3. ì˜ì¡´ì„± ë°°ì—´ì„ ìˆ˜ì •í•´ ìµœì´ˆ í•œ ë²ˆë§Œ ì‹¤í–‰ë˜ë„ë¡ í•©ë‹ˆë‹¤.

  const pulseScale = pulseAnim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [1, 2.5] 
  });
  const pulseOpacity = pulseAnim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [0.6, 0] 
  });
  return (
    <View style={styles.currentLocationContainer}>
      <Animated.View style={[
        styles.currentLocationPulse,
        {
          transform: [{ scale: pulseScale }],
          opacity: pulseOpacity,
        },
      ]} />
      
      <View style={styles.currentLocationMarker}>
        <View style={styles.currentLocationInner} />
      </View>
    </View>
  );
};

// ðŸ”¥ ì‚°ì±…ë¡œ ë§ˆì»¤ (ì•ˆì „í•œ ë²„ì „)
const CourseMarker = ({ course, isSelected }) => {
  return (
    <View style={styles.courseMarkerContainer}>
      <View style={[
        styles.courseMarker, 
        isSelected && styles.selectedCourseMarker
      ]}>
        <Icon 
          name="directions-walk" 
          size={20} 
          color={isSelected ? "#FFFFFF" : "#418663"} 
        />
      </View>
      
      {course.reportCount > 0 && (
        <View style={styles.reportBadge}>
          <Text style={styles.reportBadgeText}>{course.reportCount}</Text>
        </View>
      )}
    </View>
  );
};

// ðŸ”¥ ì“°ë ˆê¸° ë§ˆì»¤ (ì•ˆì „í•œ ë²„ì „)
const TrashMarker = ({ trash }) => {
  const getTrashColor = (amount) => {
    switch(amount) {
      case 'ë§ŽìŒ': return '#FF5722';
      case 'ë³´í†µ': return '#FF9800';
      case 'ì ìŒ': return '#4CAF50';
      default: return '#797982';
    }
  };

  return (
    <View style={styles.trashMarkerContainer}>
      <View style={[
        styles.trashMarker,
        { borderColor: getTrashColor(trash.amount) }
      ]}>
        <Icon 
          name="delete" 
          size={16} 
          color={getTrashColor(trash.amount)} 
        />
      </View>
      
      <View style={[
        styles.trashAmountBadge,
        { backgroundColor: getTrashColor(trash.amount) }
      ]}>
        <Text style={styles.trashAmountText}>{trash.amount || 'ë³´í†µ'}</Text>
      </View>
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
  nearbyCourses,
  onCourseMarkerPress,
  selectedCourseId,
  initialTrailPath 
}) => {
  // ðŸ”¥ ì•ˆì „í•œ ìƒíƒœ ê´€ë¦¬
  const [mapMounted, setMapMounted] = useState(false);
  const [safeMapReady, setSafeMapReady] = useState(false);

  console.log("ðŸ—ºï¸ [PloggingMap] === ë Œë”ë§ (ì•ˆì „í•œ ë²„ì „) ===");
  console.log("ðŸ—ºï¸ [PloggingMap] ì“°ë ˆê¸° ìœ„ì¹˜ ê°œìˆ˜:", trashLocations?.length || 0);
  console.log("ðŸ—ºï¸ [PloggingMap] ê²½ë¡œ í¬ì¸íŠ¸ ê°œìˆ˜:", routeCoordinates?.length || 0);
  console.log("ðŸ—ºï¸ [PloggingMap] ì‚°ì±…ë¡œ ê°œìˆ˜:", nearbyCourses?.length || 0);

  const defaultRegion = {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const initialRegion = currentLocation ? {
    ...currentLocation,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : defaultRegion;

  // ðŸ”¥ ì•ˆì „í•œ ë§ˆìš´íŠ¸ ì²˜ë¦¬
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setMapMounted(false);
    };
  }, []);

  // ðŸ”¥ ì•ˆì „í•œ ë§µ ì¤€ë¹„ ìƒíƒœ ì²˜ë¦¬
  const handleMapReady = () => {
    console.log('ðŸ—ºï¸ [PloggingMap] ì§€ë„ ì¤€ë¹„ ì™„ë£Œ');
    setSafeMapReady(true);
  };

  // ðŸ”¥ ì•ˆì „í•œ ë§ˆì»¤ ë Œë”ë§ í•¨ìˆ˜
  const renderCurrentLocationMarker = () => {
    if (!currentLocation || !mapMounted || !safeMapReady) return null;

    return (
      <Marker
        key="current-location"
        coordinate={currentLocation}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={1000}
        tracksViewChanges={false}
      >
        <CurrentLocationMarker />
      </Marker>
    );
  };

  const renderTrashMarkers = () => {
    if (!trashLocations || !mapMounted || !safeMapReady) return null;

    return trashLocations
      .filter(trash => !trash.isPicked)
      .filter(trash => {
        // ì¢Œí‘œ ìœ íš¨ì„± ê²€ì‚¬
        if (!trash.coordinate || 
            typeof trash.coordinate.latitude !== 'number' || 
            typeof trash.coordinate.longitude !== 'number') {
          console.warn(`âš ï¸ [PloggingMap] ì“°ë ˆê¸° ì¢Œí‘œ ë¬´íš¨:`, trash.coordinate);
          return false;
        }
        return true;
      })
      .map((trash, index) => {
        console.log(`ðŸ—‘ï¸ [PloggingMap] ì“°ë ˆê¸° ${index} ë Œë”ë§:`, {
          id: trash.id,
          lat: trash.coordinate.latitude,
          lng: trash.coordinate.longitude,
          amount: trash.amount
        });
        
        return (
          <Marker 
            key={`trash-${trash.id || index}-${Math.random()}`} 
            coordinate={trash.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={500}
            tracksViewChanges={false}
            onPress={() => {
              console.log(`ðŸŽ¯ [PloggingMap] === ì“°ë ˆê¸° ë§ˆì»¤ ì§ì ‘ í´ë¦­ ===`);
              console.log(`ðŸŽ¯ [PloggingMap] í´ë¦­ëœ ì“°ë ˆê¸° ID: ${trash.id}`);
              
              if (onTrashMarkerPress && typeof onTrashMarkerPress === 'function') {
                console.log(`ðŸŽ¯ [PloggingMap] onTrashMarkerPress í˜¸ì¶œ ì‹œìž‘`);
                try {
                  onTrashMarkerPress(trash);
                  console.log(`ðŸŽ¯ [PloggingMap] onTrashMarkerPress í˜¸ì¶œ ì™„ë£Œ`);
                } catch (error) {
                  console.error(`âŒ [PloggingMap] onTrashMarkerPress ì—ëŸ¬:`, error);
                }
              } else {
                console.warn(`âš ï¸ [PloggingMap] onTrashMarkerPress í•¨ìˆ˜ê°€ ì—†ìŒ`);
              }
            }}
          >
            <TrashMarker trash={trash} />
          </Marker>
        );
      });
  };

  const renderCourseMarkers = () => {
    if (!nearbyCourses || !mapMounted || !safeMapReady) return null;

    return nearbyCourses
      .filter(course => {
        if (!course.coordinate || 
            typeof course.coordinate.latitude !== 'number' || 
            typeof course.coordinate.longitude !== 'number') {
          console.warn(`âš ï¸ [PloggingMap] ì‚°ì±…ë¡œ ${course.id} ì¢Œí‘œ ë¬´íš¨:`, course.coordinate);
          return false;
        }
        return true;
      })
      .map((course) => (
        <Marker 
          key={`course-${course.id}`} 
          coordinate={course.coordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={300}
          tracksViewChanges={false}
          onPress={() => {
            console.log(`ðŸš¶ [PloggingMap] ì‚°ì±…ë¡œ ë§ˆì»¤ í´ë¦­: ${course.id}`);
            if (onCourseMarkerPress && typeof onCourseMarkerPress === 'function') {
              onCourseMarkerPress(course);
            }
          }}
        >
          <CourseMarker
            course={course}
            isSelected={selectedCourseId === course.id}
          />
        </Marker>
      ));
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
        loadingIndicatorColor="#418663"
        loadingBackgroundColor="#F5F5F5"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        // ðŸ”¥ ì¶”ê°€ ì•ˆì „ì„± ì˜µì…˜
        moveOnMarkerPress={false}
        showsPointsOfInterest={false}
        provider="google" // Google Maps ì‚¬ìš© (ë” ì•ˆì •ì )
      >
        {/* ðŸ”¥ ì•ˆì „í•œ ë Œë”ë§ ì¡°ê±´ */}
        {mapMounted && safeMapReady && (
          <>
            {/* í˜„ìž¬ ìœ„ì¹˜ ë§ˆì»¤ */}
            {renderCurrentLocationMarker()}

            {/* ì‚°ì±…ë¡œ ì „ì²´ ê²½ë¡œ (ì ì„ ) */}
            {initialTrailPath && initialTrailPath.length > 1 && (
              <Polyline
                coordinates={initialTrailPath}
                strokeColor="rgba(65, 134, 99, 0.5)"
                strokeWidth={4}
                lineDashPattern={[8, 4]}
                lineJoin="round"
                lineCap="round"
              />
            )}

            {/* í”Œë¡œê¹… ê²½ë¡œ (ì‹¤ì„ ) */}
            {routeCoordinates && routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#418663"
                strokeWidth={5}
                lineJoin="round"
                lineCap="round"
              />
            )}

            {/* ì“°ë ˆê¸° ë§ˆì»¤ë“¤ */}
            {renderTrashMarkers()}

            {/* ì‚°ì±…ë¡œ ë§ˆì»¤ë“¤ */}
            {renderCourseMarkers()}

            {/* ì„ íƒëœ ì‚°ì±…ë¡œ ì£¼ë³€ ë°˜ê²½ */}
            {selectedCourseId && nearbyCourses && (() => {
              const selectedCourse = nearbyCourses.find(c => c.id === selectedCourseId);
              if (!selectedCourse || !selectedCourse.coordinate) return null;
              
              return (
                <Circle
                  center={selectedCourse.coordinate}
                  radius={300}
                  strokeColor="rgba(65, 134, 99, 0.4)"
                  fillColor="rgba(65, 134, 99, 0.1)"
                  strokeWidth={2}
                />
              );
            })()}
          </>
        )}
      </MapView>

      {/* ë¡œë”© ì˜¤ë²„ë ˆì´ */}
      {(isLoading || !safeMapReady) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>
              {isLoading ? "ì§€ë„ë¥¼ ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘..." : "ì§€ë„ ì¤€ë¹„ ì¤‘..."}
            </Text>
          </View>
        </View>
      )}

      {/* ì§€ë„ í†µê³„ ì •ë³´ */}
      {safeMapReady && (
        <View style={styles.statsContainer}>
          {routeCoordinates && routeCoordinates.length > 0 && (
            <View style={styles.statItem}>
              <Icon name="timeline" size={14} color="#418663" />
              <Text style={styles.statText}>{routeCoordinates.length}ê°œ í¬ì¸íŠ¸</Text>
            </View>
          )}
          {trashLocations && trashLocations.length > 0 && (
            <View style={styles.statItem}>
              <Icon name="delete" size={14} color="#FF9800" />
              <Text style={styles.statText}>{trashLocations.filter(t => !t.isPicked).length}ê°œ ì“°ë ˆê¸°</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ê¸°ë³¸ ì»¨í…Œì´ë„ˆ
  mapContainer: { 
    flex: 1, 
    backgroundColor: "#F5F5F5",
  },
  map: { 
    flex: 1,
  },

  // ë¡œë”© ì˜¤ë²„ë ˆì´
  loadingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(245, 245, 245, 0.8)', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: { 
    fontSize: 16, 
    color: "#418663", 
    textAlign: 'center',
    fontWeight: '600',
  },

  // í˜„ìž¬ ìœ„ì¹˜ ë§ˆì»¤
  currentLocationContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  currentLocationPulse: { 
    position: 'absolute', 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    backgroundColor: '#4A90E2',
  },
  currentLocationMarker: { 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 3, 
    borderColor: '#4A90E2', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 3, 
    elevation: 5,
  },
  currentLocationInner: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    margin: 1,
  },

  // ì‚°ì±…ë¡œ ë§ˆì»¤
  courseMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseMarker: { 
    width: 36, 
    height: 36, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 18, 
    borderWidth: 2, 
    borderColor: "#418663", 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 4,
  },
  selectedCourseMarker: { 
    backgroundColor: "#418663",
    borderColor: "#2E5945",
    borderWidth: 3,
  },
  reportBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  reportBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // ì“°ë ˆê¸° ë§ˆì»¤
  trashMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashMarker: { 
    width: 32, 
    height: 32, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    borderWidth: 2, 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3, 
    elevation: 4,
  },
  trashAmountBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    minWidth: 12,
  },
  trashAmountText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // í†µê³„ ì •ë³´
  statsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  statText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
});

export default React.memo(PloggingMap);