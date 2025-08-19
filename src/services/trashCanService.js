// src/services/trashCanService.js
import { getNearbyTrashCans } from '../api/trashcan';

/**
 * 두 좌표 간의 거리 계산 (미터 단위)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
 * 백엔드에서 쓰레기통 데이터를 가져와서 거리순으로 정렬 후 가장 가까운 N개 반환
 */
export const fetchClosestTrashCans = async (currentLocation, limit = 5) => {
  try {
    console.log('[trashCanService] 쓰레기통 데이터 요청 시작:', currentLocation);
    
    // 백엔드 API 호출
    const response = await getNearbyTrashCans(
      currentLocation.latitude, 
      currentLocation.longitude
    );
    
    console.log('[trashCanService] 전체 데이터 요청 완료, 전체 위치 기준으로 요청:', response);
    
    // 응답 구조 확인
    let trashCans = [];
    if (response && response.body && response.body.items) {
      trashCans = response.body.items;
    } else if (response && response.items) {
      trashCans = response.items;
    } else if (Array.isArray(response)) {
      trashCans = response;
    } else if (response && response.body && Array.isArray(response.body)) {
      trashCans = response.body;
    }
    
    console.log('[trashCanService] 받아온 전체 쓰레기통 개수:', trashCans?.length || 0);
    
    if (!Array.isArray(trashCans) || trashCans.length === 0) {
      console.log('[trashCanService] 쓰레기통 데이터가 없습니다');
      return [];
    }

    // 각 쓰레기통에 대해 거리 계산
    const trashCansWithDistance = trashCans.map((trashCan, index) => {
      // 좌표값 확인 및 파싱
      const trashCanLat = parseFloat(trashCan.latitude || trashCan.lat);
      const trashCanLon = parseFloat(trashCan.longitude || trashCan.lot);
      
      console.log(`[trashCanService] 쓰레기통 ${index + 1}:`, {
        장소: trashCan.placeName || trashCan.instllPcNm,
        위도: trashCanLat,
        경도: trashCanLon,
        원본좌표: { lat: trashCan.lat, lot: trashCan.lot }
      });
      
      // 좌표값이 유효한지 확인
      if (isNaN(trashCanLat) || isNaN(trashCanLon)) {
        console.warn(`[trashCanService] 유효하지 않은 좌표:`, trashCan);
        return null;
      }
      
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        trashCanLat,
        trashCanLon
      );

      return {
        ...trashCan,
        latitude: trashCanLat,
        longitude: trashCanLon,
        distanceFromUser: distance,
        // 필드명 통일
        categoryName: trashCan.trashCanType || trashCan.categoryName || '쓰레기통',
        location: trashCan.roadAddress || trashCan.lotNumberAddress || trashCan.location,
        placeName: trashCan.instllPcNm || trashCan.placeName,
        details: trashCan.institution || trashCan.details,
        phone: trashCan.institutionTel || trashCan.phone,
        cityName: trashCan.ctpNm || trashCan.cityName,
        address: trashCan.roadAddress || trashCan.address
      };
    }).filter(item => item !== null); // null 값 제거

    // 거리순으로 정렬
    trashCansWithDistance.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
    
    // 가장 가까운 N개 반환
    const closestTrashCans = trashCansWithDistance.slice(0, limit);
    
    console.log('[trashCanService] 가장 가까운 쓰레기통들:', closestTrashCans.map(tc => ({
      거리: (tc.distanceFromUser / 1000).toFixed(2) + 'km',
      위치: tc.location,
      장소명: tc.placeName
    })));

    return closestTrashCans;
    
  } catch (error) {
    console.error('[trashCanService] 쓰레기통 데이터 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 쓰레기통 데이터를 지도 마커 형태로 변환
 */
export const convertToMapMarkers = (trashCans) => {
  return trashCans.map((trashCan, index) => ({
    id: trashCan.trashCanId || trashCan.instPlcNm || trashCan.id || `trashcan_${index}`,
    coordinate: {
      latitude: trashCan.latitude,
      longitude: trashCan.longitude,
    },
    title: trashCan.categoryName || trashCan.trashCanType || '쓰레기통',
    description: trashCan.placeName || trashCan.instllPcNm || '위치 정보 없음',
    originalData: trashCan, // 원본 데이터 보관 (모달에서 사용)
  }));
};