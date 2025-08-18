// src/config/regionLogos.js
// 지역별 로고 이미지 매핑 설정

export const REGION_LOGOS = {
  '서울': require('../assets/logos/seoul_logo.png'),
  '인천': require('../assets/logos/incheon_logo.png'),
  '부산': require('../assets/logos/busan_logo.png'),
  '대구': require('../assets/logos/daegu_logo.png'),
  '광주': require('../assets/logos/gwangju_logo.png'),
  '대전': require('../assets/logos/daejeon_logo.jpg'),
  '울산': require('../assets/logos/ulsan_logo.png'),
  '세종': require('../assets/logos/sejong_logo.png'),
  '경기': require('../assets/logos/gyeonggi_logo.png'),
  '강원': require('../assets/logos/gangwon_logo.jpg'),
  '충북': require('../assets/logos/chungbuk_logo.jpg'),
  '충남': require('../assets/logos/chungnam_logo.png'),
  '전북': require('../assets/logos/jeonbuk_logo.jpg'),
  '전남': require('../assets/logos/jeonnam_logo.png'),
  '경북': require('../assets/logos/gyeongbuk_logo.png'),
  '경남': require('../assets/logos/gyeongnam_logo.png'),
  '제주': require('../assets/logos/jeju_logo.png'),
  'default': require('../assets/logos/default_logo.png'),
};

/**
 * 주소에서 지역명을 추출하는 함수
 * @param {string} address - 주소 문자열
 * @returns {string} - 추출된 지역명 ('서울', '인천', etc.) 또는 'default'
 */
export const extractRegionFromAddress = (address) => {
  if (!address) return 'default';
  
  // 주소에서 첫 번째 단어 추출
  const firstWord = address.split(' ')[0];
  
  // 특별시/광역시 처리
  const cityMappings = {
    '서울': ['서울'],
    '인천': ['인천'],
    '부산': ['부산'],
    '대구': ['대구'],
    '광주': ['광주'],
    '대전': ['대전'],
    '울산': ['울산'],
    '세종': ['세종'],
  };
  
  // 도 단위 처리
  const provinceMappings = {
    '경기': ['경기'],
    '강원': ['강원'],
    '충북': ['충북', '충청북'],
    '충남': ['충남', '충청남'],
    '전북': ['전북', '전라북'],
    '전남': ['전남', '전라남'],
    '경북': ['경북', '경상북'],
    '경남': ['경남', '경상남'],
    '제주': ['제주'],
  };
  
  // 모든 매핑을 합쳐서 검사
  const allMappings = { ...cityMappings, ...provinceMappings };
  
  for (const [region, keywords] of Object.entries(allMappings)) {
    if (keywords.some(keyword => firstWord.includes(keyword))) {
      return region;
    }
  }
  
  return 'default';
};

/**
 * 지역명에 해당하는 로고 이미지를 반환하는 함수
 * @param {string} region - 지역명
 * @returns {any} - require로 가져온 이미지 객체
 */
export const getRegionLogo = (region) => {
  return REGION_LOGOS[region] || REGION_LOGOS.default;
};