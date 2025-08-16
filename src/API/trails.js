// Mock API for trail details
// 실제 프로덕션에서는 실제 API 엔드포인트로 교체해야 합니다

const API_BASE_URL = "https://api.example.com" // 실제 API URL로 교체 필요

// 더미 데이터 - 실제 API 응답 형태
const MOCK_TRAIL_DATA = {
  1: {
    trailId: "1",
    trailName: "국립 중앙 박물관",
    lotNumberAddress: "서울 용산구 서빙고로 137 국립중앙박물관",
    cityName: "서울",
    trackTime: "1시간30분",
    length: "7.1km",
    difficultyLevel: "쉬움",
    toiletDescription: "박물관 내부, 어린이박물관, 야외 정원",
    optionDescription: "한강이 내려다보이는 전망대에서 석양을 감상할 수 있습니다",
    amenityDescription: "박물관 내부에 카페와 레스토랑이 있어 휴식하기 좋습니다",
    descriptionDetail:
      "국립중앙박물관을 중심으로 한 문화와 자연이 어우러진 산책로입니다. 박물관 정원과 한강 조망 포인트를 지나며, 도심 속에서 여유로운 플로깅을 즐길 수 있습니다.\n\n①박물관 정원길(2.5km) : 사계절 아름다운 조경과 야외 전시물을 감상할 수 있습니다.\n\n②한강 전망길(3.1km) : 한강과 도심의 파노라마 뷰를 즐길 수 있는 구간입니다.\n\n③문화거리(1.5km) : 주변 문화시설과 카페거리를 둘러보는 코스입니다.",
    trailTypeName: "도심형",
    spotLatitude: 37.524,
    spotLongitude: 126.9803,
    reportCount: 2,
  },
  2: {
    trailId: "2",
    trailName: "남산",
    lotNumberAddress: "서울 중구 회현동1가",
    cityName: "서울",
    trackTime: "2시간",
    length: "5.2km",
    difficultyLevel: "어려움",
    toiletDescription: "남산공원 관리사무소, N서울타워 주변, 팔각정",
    optionDescription: "N서울타워 전망대에서 서울 전경과 함께 석양을 감상할 수 있습니다",
    amenityDescription: "경사가 있는 구간이 많으니 편한 운동화 착용을 권장합니다",
    descriptionDetail:
      "서울의 대표적인 산책로인 남산을 중심으로 한 플로깅 코스입니다. 도심 속 자연을 만끽하며 서울 전경을 감상할 수 있는 특별한 경험을 제공합니다.\n\n①순환로(2.2km) : 남산공원의 아름다운 자연길을 따라 걷는 구간입니다.\n\n②타워길(1.8km) : N서울타워까지 이어지는 약간의 경사가 있는 구간입니다.\n\n③전망길(1.2km) : 서울 시내를 한눈에 볼 수 있는 전망 포인트들을 지나는 구간입니다.",
    trailTypeName: "산악형",
    spotLatitude: 37.5512,
    spotLongitude: 126.9882,
    reportCount: 1,
  },
  3: {
    trailId: "3",
    trailName: "한강공원 여의도",
    lotNumberAddress: "서울 영등포구 여의동로 330",
    cityName: "서울",
    trackTime: "2시간30분",
    length: "8.5km",
    difficultyLevel: "쉬움",
    toiletDescription: "한강공원 화장실 여러 곳, 여의도 공원 내부",
    optionDescription: "한강을 바라보며 감상하는 석양이 매우 아름답습니다",
    amenityDescription: "자전거 도로와 구분되어 있으니 안전에 주의하세요. 편의점과 카페가 많아 휴식하기 좋습니다",
    descriptionDetail:
      "한강을 따라 이어지는 대표적인 도심 속 자연 산책로입니다. 넓은 강변과 여의도공원을 함께 즐길 수 있는 평탄한 코스로 초보자에게 추천합니다.\n\n①강변길(4.2km) : 한강을 바라보며 걷는 시원한 구간입니다.\n\n②여의도공원(2.8km) : 계절별 꽃과 나무를 감상할 수 있는 공원 구간입니다.\n\n③선착장길(1.5km) : 유람선과 카페가 있는 활기찬 구간입니다.",
    trailTypeName: "강변형",
    spotLatitude: 37.5286,
    spotLongitude: 126.9334,
    reportCount: 2,
  },
  4: {
    trailId: "4",
    trailName: "청계천 산책로",
    lotNumberAddress: "서울 중구 청계천로 1",
    cityName: "서울",
    trackTime: "1시간45분",
    length: "6.3km",
    difficultyLevel: "쉬움",
    toiletDescription: "청계천 곳곳의 공중화장실, 주변 상가 화장실 이용 가능",
    optionDescription: "도심 속 하천에서 감상하는 특별한 석양 풍경",
    amenityDescription: "주변에 맛집과 카페가 많아 플로깅 후 식사하기 좋습니다",
    descriptionDetail:
      "서울 도심을 가로지르는 청계천을 따라 걷는 도시형 산책로입니다. 역사와 현대가 공존하는 독특한 풍경을 감상하며 여유로운 플로깅을 즐길 수 있습니다.\n\n①광교구간(2.1km) : 청계천 복원의 시작점부터 시작하는 역사적 구간입니다.\n\n②문화구간(2.8km) : 다양한 조형물과 문화시설을 지나는 구간입니다.\n\n③자연구간(1.4km) : 상대적으로 녹지가 많은 상류 구간입니다.",
    trailTypeName: "도심형",
    spotLatitude: 37.5694,
    spotLongitude: 126.9785,
    reportCount: 1,
  },
}

/**
 * 산책로 상세 정보를 가져오는 함수
 * @param {string} trailId - 산책로 ID
 * @returns {Promise<Object>} 산책로 상세 정보
 */
export const getTrailDetail = async (trailId) => {
  try {
    console.log(`[API] 산책로 상세 정보 요청: ${trailId}`)

    // 실제 API 호출 (현재는 주석 처리)
    /*
    const response = await fetch(`${API_BASE_URL}/trails/${trailId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 필요한 경우 인증 헤더 추가
        // 'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
    */

    // 현재는 더미 데이터 반환
    await new Promise((resolve) => setTimeout(resolve, 500)) // API 호출 시뮬레이션

    const mockData = MOCK_TRAIL_DATA[trailId]
    if (!mockData) {
      throw new Error(`Trail with ID ${trailId} not found`)
    }

    console.log(`[API] 산책로 상세 정보 응답:`, mockData.trailName)
    return mockData
  } catch (error) {
    console.error(`[API] 산책로 상세 정보 요청 실패:`, error.message)
    throw error
  }
}

/**
 * 모든 산책로 목록을 가져오는 함수 (추가 기능)
 * @returns {Promise<Array>} 산책로 목록
 */
export const getTrailList = async () => {
  try {
    console.log("[API] 산책로 목록 요청")

    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300))

    const trailList = Object.values(MOCK_TRAIL_DATA).map((trail) => ({
      id: trail.trailId,
      name: trail.trailName,
      address: trail.lotNumberAddress,
      region: trail.cityName,
      duration: trail.trackTime,
      length: trail.length,
      level: trail.difficultyLevel,
      reportCount: trail.reportCount,
    }))

    console.log(`[API] 산책로 목록 응답: ${trailList.length}개`)
    return trailList
  } catch (error) {
    console.error("[API] 산책로 목록 요청 실패:", error.message)
    throw error
  }
}

/**
 * 산책로 검색 함수 (추가 기능)
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<Array>} 검색 결과
 */
export const searchTrails = async (keyword) => {
  try {
    console.log(`[API] 산책로 검색 요청: ${keyword}`)

    await new Promise((resolve) => setTimeout(resolve, 400))

    const allTrails = Object.values(MOCK_TRAIL_DATA)
    const searchResults = allTrails.filter(
      (trail) =>
        trail.trailName.includes(keyword) ||
        trail.lotNumberAddress.includes(keyword) ||
        trail.cityName.includes(keyword),
    )

    console.log(`[API] 산책로 검색 결과: ${searchResults.length}개`)
    return searchResults
  } catch (error) {
    console.error("[API] 산책로 검색 실패:", error.message)
    throw error
  }
}

// 기본 export
export default {
  getTrailDetail,
  getTrailList,
  searchTrails,
}
