import BASE_URL from './apiconfig';

export const getTrailDetail = async (trailId) => {
  try {
    const response = await fetch(`${BASE_URL}/trails/${trailId}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[API] 산책로 상세 정보 요청 실패:', error.message);
    throw error;
  }
};

// trails.js
export const getTrailList = async (filters = {}) => {
  const { cityName, difficultyLevel } = filters
  const params = new URLSearchParams()
  if (cityName) params.append('cityName', cityName)
  if (difficultyLevel) params.append('difficultyLevel', difficultyLevel)

  const response = await fetch(`${BASE_URL}/trails?${params.toString()}`)
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
  return await response.json()
}
export const searchTrails = async (keyword) => {
  try {
    const response = await fetch(`${BASE_URL}/trails/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[API] 산책로 검색 실패:', error.message);
    throw error;
  }
};

export const getNearbyTrails = async (latitude, longitude) => {
  try {
    const response = await fetch(`${BASE_URL}/trails/nearby?userLatitude=${latitude}&userLongitude=${longitude}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[API] 근처 산책로 조회 실패:', error.message);
    throw error;
  }
};

export const getNearestTrail = async (latitude, longitude) => {
  try {
    const response = await fetch(`${BASE_URL}/trails/nearest?userLatitude=${latitude}&userLongitude=${longitude}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[API] 가장 가까운 산책로 조회 실패:', error.message);
    throw error;
  }
};

export default {
  getTrailDetail,
  getTrailList,
  searchTrails,
  getNearbyTrails,
  getNearestTrail,
};
