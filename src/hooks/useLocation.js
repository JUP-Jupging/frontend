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
        const { latitude, longitude } = position.coords;
        const newCoordinate = { latitude, longitude };
        
        console.log('[useLocation] 새 위치 수신:', newCoordinate);

        // 현재 위치 업데이트
        setCurrentLocation(prev => ({
          ...prev,
          latitude,
          longitude
        }));

        // 맵 카메라를 새 위치로 이동 (플로깅 중일 때만)
        if (isRunning && mapRef.current) {
          console.log('[useLocation] 플로깅 중 - 맵 카메라 이동');
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }

        setRouteCoordinates(prevRoute => {
          const newRoute = [...prevRoute, newCoordinate];
          
          // 거리 계산 (첫 번째 좌표가 아닌 경우에만)
          if (prevRoute.length > 0) {
            const lastCoordinate = prevRoute[prevRoute.length - 1];
            const distance = calculateDistance(
              lastCoordinate.latitude,
              lastCoordinate.longitude,
              latitude,
              longitude
            );
            // 3미터 이상 이동했을 때만 거리 추가 및 경로 업데이트 (GPS 오차 방지)
            if (distance >= 3) {
              setTotalDistance(prev => prev + distance);
              return newRoute;
            } else {
              // 3미터 미만이면 마지막 좌표만 업데이트 (부드러운 라인을 위해)
              const updatedRoute = [...prevRoute];
              updatedRoute[updatedRoute.length - 1] = newCoordinate;
              return updatedRoute;
            }
          }
          
          return newRoute;
        });
      },
      (error) => {
        console.error('위치 추적 오류:', error);
        Alert.alert('위치 오류', 'GPS 신호가 약합니다. 야외로 이동해주세요.');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 2,
        interval: 1000,
        fastestInterval: 500,
        timeout: 15000,
        maximumAge: 5000,
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
