// components/Plogging/PloggingMap.js

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 현재 위치 마커 컴포넌트 (개선된 애니메이션)
const CurrentLocationMarker = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
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
      ]).start(() => pulse());
    };

    const breathe = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, { 
          toValue: 1.15, 
          duration: 800, 
          useNativeDriver: true 
        }),
        Animated.timing(scaleAnim, { 
          toValue: 1, 
          duration: 800, 
          useNativeDriver: true 
        }),
      ]).start(() => breathe());
    };

    pulse();
    breathe();
  }, [pulseAnim, scaleAnim]);

  const pulseScale = pulseAnim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [1, 3.5] 
  });
  const pulseOpacity = pulseAnim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [0.8, 0] 
  });

  return (
    <View style={styles.currentLocationContainer}>
      {/* 외부 펄스 효과 */}
      <Animated.View style={[
        styles.currentLocationPulse,
        {
          transform: [{ scale: pulseScale }],
          opacity: pulseOpacity,
        },
      ]} />
      
      {/* 메인 마커 */}
      <Animated.View style={[
        styles.currentLocationMarker,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}>
        <View style={styles.currentLocationInner} />
      </Animated.View>
    </View>
  );
};

// 개선된 산책로 마커 컴포넌트
const CourseMarker = ({ course, isSelected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, { 
          toValue: 1.3, 
          duration: 200, 
          useNativeDriver: true 
        }),
        Animated.timing(scaleAnim, { 
          toValue: 1.2, 
          duration: 200, 
          useNativeDriver: true 
        }),
      ]).start();

      // 선택된 마커는 지속적으로 bounce
      const bounce = () => {
        Animated.sequence([
          Animated.timing(bounceAnim, { 
            toValue: 1, 
            duration: 1000, 
            useNativeDriver: true 
          }),
          Animated.timing(bounceAnim, { 
            toValue: 0, 
            duration: 1000, 
            useNativeDriver: true 
          }),
        ]).start(() => isSelected && bounce());
      };
      bounce();
    } else {
      Animated.timing(scaleAnim, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: true 
      }).start();
    }
  }, [isSelected, scaleAnim, bounceAnim]);

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <TouchableOpacity onPress={() => onPress(course)} activeOpacity={0.7}>
      <Animated.View style={[
        styles.courseMarkerContainer,
        { 
          transform: [
            { scale: scaleAnim },
            { translateY: isSelected ? bounceTranslate : 0 }
          ] 
        }
      ]}>
        <View style={[
          styles.courseMarker, 
          isSelected && styles.selectedCourseMarker
        ]}>
          <Icon 
            name="directions-walk" 
            size={24} 
            color={isSelected ? "#FFFFFF" : "#418663"} 
          />
        </View>
        
        {/* 쓰레기 신고 수 배지 */}
        {course.reportCount > 0 && (
          <View style={styles.reportBadge}>
            <Text style={styles.reportBadgeText}>{course.reportCount}</Text>
          </View>
        )}
        
        {/* 마커 레이블 (선택된 경우만 표시) */}
        {isSelected && (
          <View style={styles.courseLabel}>
            <Text style={styles.courseLabelText} numberOfLines={1}>
              {course.name}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// 개선된 쓰레기 마커 컴포넌트
const TrashMarker = ({ trash, onPress }) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, { 
          toValue: 1.2, 
          duration: 1200, 
          useNativeDriver: true 
        }),
        Animated.timing(bounceAnim, { 
          toValue: 1, 
          duration: 1200, 
          useNativeDriver: true 
        }),
      ]).start(() => bounce());
    };

    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { 
          toValue: 1, 
          duration: 800, 
          useNativeDriver: true 
        }),
        Animated.timing(pulseAnim, { 
          toValue: 0, 
          duration: 800, 
          useNativeDriver: true 
        }),
      ]).start(() => pulse());
    };

    bounce();
    pulse();
  }, [bounceAnim, pulseAnim]);

  const getTrashColor = (amount) => {
    switch(amount) {
      case '많음': return '#FF5722';
      case '보통': return '#FF9800';
      case '적음': return '#4CAF50';
      default: return '#797982';
    }
  };

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <TouchableOpacity onPress={() => onPress(trash)} activeOpacity={0.7}>
      <Animated.View style={[
        styles.trashMarkerContainer,
        { transform: [{ scale: bounceAnim }] }
      ]}>
        {/* 펄스 효과 */}
        <Animated.View style={[
          styles.trashPulse,
          {
            backgroundColor: getTrashColor(trash.amount),
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }
        ]} />
        
        <View style={[
          styles.trashMarker,
          { borderColor: getTrashColor(trash.amount) }
        ]}>
          <Icon 
            name="delete" 
            size={20} 
            color={getTrashColor(trash.amount)} 
          />
        </View>
        
        {/* 쓰레기 양 표시 배지 */}
        <View style={[
          styles.trashAmountBadge,
          { backgroundColor: getTrashColor(trash.amount) }
        ]}>
          <Text style={styles.trashAmountText}>{trash.amount}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
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

  const defaultRegion = {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.008, // 더 확대된 뷰
    longitudeDelta: 0.008,
  };

  const initialRegion = currentLocation ? {
    ...currentLocation,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  } : defaultRegion;

  return (
    <View style={styles.mapContainer}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false} // 커스텀 마커 사용
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        rotateEnabled={true}
        pitchEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        mapType="standard"
        onMapReady={() => console.log('지도 준비 완료')}
        loadingEnabled={true}
        loadingIndicatorColor="#418663"
        loadingBackgroundColor="#F5F5F5"
      >
        {/* 현재 위치 커스텀 마커 */}
        {mapReady && currentLocation && (
          <Marker 
            coordinate={currentLocation} 
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1000}
          >
            <CurrentLocationMarker />
          </Marker>
        )}
        
        {/* 선택된 산책로의 전체 경로 표시 (점선) */}
        {mapReady && initialTrailPath && initialTrailPath.length > 1 && (
          <Polyline
            coordinates={initialTrailPath}
            strokeColor="rgba(65, 134, 99, 0.6)"
            strokeWidth={5}
            lineDashPattern={[10, 5]} // 점선 패턴
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* 사용자가 이동한 경로 (플로깅 중) - 실선 */}
        {mapReady && routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#418663" // 앱 메인 컬러
            strokeWidth={7}
            lineJoin="round"
            lineCap="round"
          />
        )}
        
        {/* 쓰레기 위치 마커 (개선된 디자인) */}
        {mapReady && trashLocations && trashLocations.map((trash) => (
          <Marker 
            key={`trash-${trash.id}`} 
            coordinate={trash.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={100}
          >
            <TrashMarker 
              trash={trash} 
              onPress={onTrashMarkerPress} 
            />
          </Marker>
        ))}

        {/* 근처 산책로 마커 (개선된 디자인) */}
        {mapReady && nearbyCourses && nearbyCourses.map((course) => (
          <Marker 
            key={`course-${course.id}`} 
            coordinate={course.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={selectedCourseId === course.id ? 200 : 50}
          >
            <CourseMarker 
              course={course} 
              isSelected={selectedCourseId === course.id}
              onPress={onCourseMarkerPress} 
            />
          </Marker>
        ))}

        {/* 선택된 산책로 주변 반경 표시 */}
        {mapReady && selectedCourseId && nearbyCourses && (
          (() => {
            const selectedCourse = nearbyCourses.find(c => c.id === selectedCourseId);
            return selectedCourse ? (
              <Circle
                center={selectedCourse.coordinate}
                radius={500} // 500미터 반경
                strokeColor="rgba(65, 134, 99, 0.3)"
                fillColor="rgba(65, 134, 99, 0.1)"
                strokeWidth={2}
              />
            ) : null;
          })()
        )}

      </MapView>

      {/* 로딩 오버레이 */}
      {(isLoading || !mapReady) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>
              {isLoading ? "지도를 불러오는 중..." : "지도 준비 중..."}
            </Text>
          </View>
        </View>
      )}

      {/* 지도 범례 */}
      {mapReady && (nearbyCourses?.length > 0 || trashLocations?.length > 0) && (
        <View style={styles.legendContainer}>
          {nearbyCourses?.length > 0 && (
            <View style={styles.legendItem}>
              <Icon name="directions-walk" size={16} color="#418663" />
              <Text style={styles.legendText}>산책로</Text>
            </View>
          )}
          {trashLocations?.length > 0 && (
            <View style={styles.legendItem}>
              <Icon name="delete" size={16} color="#FF9800" />
              <Text style={styles.legendText}>쓰레기</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // 기본 맵 컨테이너
  mapContainer: { 
    flex: 1, 
    backgroundColor: "#F5F5F5",
  },
  map: { 
    flex: 1,
  },

  // 로딩 오버레이
  loadingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(245, 245, 245, 0.9)', 
    justifyContent: 'center', 
    alignItems: 'center',
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

  // 현재 위치 마커
  currentLocationContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  currentLocationPulse: { 
    position: 'absolute', 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: '#4A90E2',
  },
  currentLocationMarker: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 4, 
    borderColor: '#4A90E2', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 4, 
    elevation: 8,
  },
  currentLocationInner: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
    margin: 2,
  },

  // 산책로 마커
  courseMarkerContainer: {
    alignItems: 'center',
  },
  courseMarker: { 
    width: 48, 
    height: 48, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 24, 
    borderWidth: 3, 
    borderColor: "#418663", 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 6, 
    elevation: 8,
  },
  selectedCourseMarker: { 
    backgroundColor: "#418663",
    borderColor: "#2E5945",
    borderWidth: 4,
  },
  reportBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  reportBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  courseLabel: {
    marginTop: 5,
    backgroundColor: 'rgba(65, 134, 99, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 120,
  },
  courseLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // 쓰레기 마커
  trashMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  trashMarker: { 
    width: 40, 
    height: 40, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 20, 
    borderWidth: 3, 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 6,
  },
  trashAmountBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  trashAmountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // 범례
  legendContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});

export default PloggingMap;