// src/utils/locationUtils.js

/**
 * 두 좌표 간의 거리 계산 (Haversine 공식 사용)
 * @param {number} lat1 - 첫 번째 지점의 위도
 * @param {number} lon1 - 첫 번째 지점의 경도
 * @param {number} lat2 - 두 번째 지점의 위도
 * @param {number} lon2 - 두 번째 지점의 경도
 * @returns {number} 거리 (미터 단위)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * 거리를 읽기 쉬운 형태로 포맷팅
 * @param {number} meters - 거리 (미터 단위)
 * @returns {string} 포맷팅된 거리 문자열
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(2)}km`;
  }
};

/**
 * 좌표 유효성 검사
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @returns {boolean} 유효한 좌표인지 여부
 */
export const isValidCoordinate = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * 위치 객체 유효성 검사
 * @param {object} location - 위치 객체 {latitude, longitude}
 * @returns {boolean} 유효한 위치 객체인지 여부
 */
export const isValidLocation = (location) => {
  return (
    location &&
    typeof location === 'object' &&
    isValidCoordinate(location.latitude, location.longitude)
  );
};

/**
 * 배열에서 가장 가까운 항목들을 찾기
 * @param {object} userLocation - 사용자 위치 {latitude, longitude}
 * @param {array} items - 검색할 항목들 배열
 * @param {function} getCoordinate - 항목에서 좌표를 추출하는 함수
 * @param {number} limit - 반환할 최대 개수
 * @returns {array} 거리 정보가 추가된 가까운 항목들
 */
export const findNearestItems = (userLocation, items, getCoordinate, limit = 5) => {
  if (!isValidLocation(userLocation) || !Array.isArray(items)) {
    return [];
  }

  const itemsWithDistance = items
    .map(item => {
      const coordinate = getCoordinate(item);
      if (!isValidCoordinate(coordinate.latitude, coordinate.longitude)) {
        return null;
      }

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        coordinate.latitude,
        coordinate.longitude
      );

      return {
        ...item,
        distanceFromUser: distance,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => a.distanceFromUser - b.distanceFromUser);

  return limit > 0 ? itemsWithDistance.slice(0, limit) : itemsWithDistance;
};

export default {
  calculateDistance,
  formatDistance,
  isValidCoordinate,
  isValidLocation,
  findNearestItems,
};