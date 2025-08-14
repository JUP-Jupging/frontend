import { useState, useEffect, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [watchId, setWatchId] = useState(null);
  const mapRef = useRef(null);

  // 위치 권한 요청
  const requestLocationPermission = async () => {
    console.log('[useLocation] 위치 권한 요청 시작');
    
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 요청',
            message: '현재 위치를 사용하려면 위치 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('[useLocation] 위치 권한 결과:', hasPermission ? '허용됨' : '거부됨');
        return hasPermission;
      } catch (error) {
        console.error('[useLocation] 위치 권한 요청 오류:', error);
        return false;
      }
    }
    
    console.log('[useLocation] iOS - 위치 권한 자동 허용');
    return true;
  };

  // 두 좌표 간의 거리 계산 (미터 단위)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    console.log('[useLocation] 거리 계산:', { lat1, lon1, lat2, lon2 });
    
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    console.log('[useLocation] 계산된 거리:', distance, 'm');
    return distance;
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    console.log('[useLocation] 현재 위치 가져오기 시작');
    
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('[useLocation] 위치 권한 없음 - 현재 위치 가져오기 중단');
      return false;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('[useLocation] 현재 위치 획득 성공:', { latitude, longitude });
          
          const newLocation = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setCurrentLocation(newLocation);
          resolve(newLocation);
        },
        (error) => {
          console.error('[useLocation] 현재 위치 가져오기 실패:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  // 위치 추적 시작
  const startLocationTracking = (isRunning) => {
    console.log('[useLocation] 위치 추적 시작, isRunning:', isRunning);
    
    const id = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        const newCoordinate = { latitude, longitude, accuracy, speed };
        
        console.log('[useLocation] 새 위치 수신:', { 
          ...newCoordinate, 
          정확도: accuracy?.toFixed(1) + 'm',
          속도: speed?.toFixed(1) + 'm/s'
        });

        // GPS 정확도가 너무 낮으면 무시 (50미터 이상 오차)
        if (accuracy && accuracy > 50) {
          console.log('[useLocation] ⚠️ GPS 정확도 낮음 - 위치 무시:', accuracy.toFixed(1) + 'm');
          return;
        }

        // 현재 위치 업데이트
        setCurrentLocation(prev => ({
          ...prev,
          latitude,
          longitude
        }));

        // 맵 카메라를 새 위치로 이동 (플로깅 중일 때만)
        if (isRunning && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }

        setRouteCoordinates(prevRoute => {
          // 거리 계산 (첫 번째 좌표가 아닌 경우에만)
          if (prevRoute.length > 0) {
            const lastCoordinate = prevRoute[prevRoute.length - 1];
            const distance = calculateDistance(
              lastCoordinate.latitude,
              lastCoordinate.longitude,
              latitude,
              longitude
            );
            
            console.log('[useLocation] 📏 거리 계산:', {
              이전위치: lastCoordinate,
              현재위치: newCoordinate,
              계산된거리: distance.toFixed(2) + 'm',
              GPS정확도: accuracy?.toFixed(1) + 'm'
            });
            
            // 더 세밀한 거리 체크: 1.5미터 이상 이동했을 때만 새로운 점 추가
            if (distance >= 1.5) {
              console.log('[useLocation] ✅ 의미있는 이동 감지 - 새 좌표 추가');
              const newRoute = [...prevRoute, newCoordinate];
              
              setTotalDistance(prev => {
                const newTotal = prev + distance;
                console.log('[useLocation] 📊 총 거리 업데이트:', prev.toFixed(2) + 'm → ' + newTotal.toFixed(2) + 'm');
                return newTotal;
              });
              
              return newRoute;
            } else {
              console.log('[useLocation] ⚠️ 미세한 이동 (' + distance.toFixed(2) + 'm) - 무시');
              // 미세한 움직임은 무시하여 polyline이 떨리는 것을 방지
              return prevRoute;
            }
          }
          
          console.log('[useLocation] 🎯 첫 번째 좌표 추가');
          return [newCoordinate];
        });
      },
      (error) => {
        console.error('[useLocation] 위치 추적 오류:', error);
        Alert.alert('위치 오류', 'GPS 신호가 약합니다. 야외로 이동해주세요.');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1, // 1미터마다 업데이트 (더 세밀한 추적)
        interval: 2000, // 2초마다 위치 확인
        fastestInterval: 1000, // 최소 1초 간격
        timeout: 20000, // 타임아웃 시간 증가
        maximumAge: 3000, // 캐시된 위치 사용 시간 단축
        forceRequestLocation: true, // 강제로 새 위치 요청
        showLocationDialog: true, // 위치 서비스 활성화 다이얼로그 표시
      }
    );

    setWatchId(id);
  };

  // 위치 추적 중지
  const stopLocationTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
      console.log('위치 추적이 중지되었습니다.');
    }
  };

  // 거리 포맷팅
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(2)}km`;
    }
  };

  // 초기 위치 설정
  useEffect(() => {
    getCurrentLocation().catch(console.error);
    
    return () => {
      stopLocationTracking();
    };
  }, []);

  return {
    currentLocation,
    routeCoordinates,
    totalDistance,
    mapRef,
    requestLocationPermission,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    formatDistance,
    setCurrentLocation,
    setRouteCoordinates,
    setTotalDistance,
  };
};
