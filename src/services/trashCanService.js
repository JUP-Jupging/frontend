import { getNearbyTrashCans } from '../api/trashcan';
import { calculateDistance, formatDistance, isValidLocation } from '../utils/locationUtils';

// 현재 위치에서 가장 가까운 쓰레기통들 조회
export const fetchClosestTrashCans = async (currentLocation) => {
  try {
    console.log('📡 [trashCanService] fetchClosestTrashCans 호출 시작');
    console.log('- currentLocation:', currentLocation);
    
    if (!isValidLocation(currentLocation)) {
      throw new Error('현재 위치 정보가 없습니다');
    }
    
    // API 호출
    const response = await getNearbyTrashCans(
      currentLocation.latitude, 
      currentLocation.longitude
    );
    
    console.log('- API 응답:', response);
    
    // items 배열 확인
    const trashCans = response?.items || response || [];
    
    if (!Array.isArray(trashCans)) {
      console.error('예상치 못한 응답 형식:', response);
      return [];
    }
    
    // 각 쓰레기통에 거리 정보 추가
    const trashCansWithDistance = trashCans.map(trashCan => {
      // API 응답에서 경도는 'lot'으로 내려온다고 명시되어 있음
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        trashCan.lat || trashCan.latitude,
        trashCan.lot || trashCan.longitude
      );
      
      return {
        ...trashCan,
        distanceFromUser: distance,
        // 좌표 정규화 (다양한 필드명 대응)
        latitude: trashCan.lat || trashCan.latitude,
        longitude: trashCan.lot || trashCan.longitude,
      };
    });
    
    // 거리순으로 정렬하고 상위 5개만 반환
    const sortedTrashCans = trashCansWithDistance
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
      .slice(0, 5);
    
    console.log('✅ [trashCanService] 가까운 쓰레기통 조회 완료');
    console.log('- 총 개수:', sortedTrashCans.length);
    console.log('- 가장 가까운 거리:', sortedTrashCans[0]?.distanceFromUser?.toFixed(2) + 'm');
    
    return sortedTrashCans;
    
  } catch (error) {
    console.error('❌ [trashCanService] fetchClosestTrashCans 실패:', error);
    throw error;
  }
};

// 지도 마커용 데이터로 변환
export const convertToMapMarkers = (trashCans) => {
  return trashCans.map((trashCan, index) => ({
    id: trashCan.trashCanId || trashCan.id || `trash-${index}`,
    coordinate: {
      latitude: trashCan.latitude,
      longitude: trashCan.longitude,
    },
    title: trashCan.placeName || trashCan.categoryName || '쓰레기통',
    description: trashCan.location || trashCan.cityName || '위치 정보 없음',
    originalData: trashCan, // 원본 데이터 보관
  }));
};

export default {
  fetchClosestTrashCans,
  convertToMapMarkers,
  formatDistance,
};