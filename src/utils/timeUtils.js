// utils/timeUtils.js

/**
 * 🔥 [신규 추가] ISO 날짜 문자열을 'YYYY년 MM월 DD일' 형태로 변환하는 함수
 * @param {string} isoString - ISO 형식의 날짜 문자열
 * @returns {string} 'YYYY년 MM월 DD일' 형식의 날짜
 */
export const formatToAbsoluteDate = (isoString) => {
  if (!isoString) return "날짜 정보 없음";
  try {
    const date = new Date(isoString);
    // toLocaleDateString을 사용하여 한국식 날짜 포맷으로 변경
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('절대 날짜 변환 오류:', error);
    return "날짜 형식 오류";
  }
};


/**
 * ISO 날짜 문자열을 사용자 친화적인 형태로 변환 (기존 함수 - 그대로 둠)
 * @param {string} isoString - ISO 형식의 날짜 문자열 (예: "2025-08-19T11:57:59.519Z")
 * @returns {string} 사용자 친화적인 날짜 문자열
 */
export const formatUserFriendlyDate = (isoString) => {
  if (!isoString) return "날짜 정보 없음"
  
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    // 오늘인 경우
    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMinutes === 0) {
          return "방금 전"
        } else if (diffMinutes < 60) {
          return `${diffMinutes}분 전`
        }
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`
      }
      return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    // 어제인 경우
    if (diffDays === 1) {
      return `어제 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    // 일주일 이내인 경우
    if (diffDays < 7) {
      const weekdays = ['일', '월', '화', '수', '목', '금', '토']
      const dayName = weekdays[date.getDay()]
      return `${diffDays}일 전 (${dayName}요일)`
    }
    
    // 올해인 경우
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    }
    
    // 다른 년도인 경우
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric'})
    
  } catch (error) {
    console.error('날짜 파싱 오류:', error)
    return "날짜 형식 오류"
  }
}

/**
 * ploggingTime 문자열을 사용자 친화적인 시간으로 변환 (기존 함수 - 그대로 둠)
 * @param {string|number} timeString - 시간 문자열 (예: "01:30:45" 또는 초 단위 숫자)
 * @returns {string} 사용자 친화적인 시간 문자열
 */
export const formatPloggingTime = (timeString) => {
  if (!timeString || timeString === "0" || timeString === 0) return "0분"
  
  try {
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':')
      const hours = parseInt(parts[0]) || 0
      const minutes = parseInt(parts[1]) || 0
      const seconds = parseInt(parts[2]) || 0
      
      if (hours > 0) return `${hours}시간 ${minutes}분`
      else if (minutes > 0) return `${minutes}분`
      else return `${seconds}초`
    }
    
    if (timeString === "string") return "시간 정보 없음"
    
    const totalSeconds = parseInt(timeString) || 0
    if (totalSeconds > 86400) {
      console.warn('비정상적으로 큰 시간 값:', totalSeconds)
      return "시간 정보 오류"
    }
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const remainingSeconds = totalSeconds % 60
    
    if (hours > 0) return `${hours}시간 ${minutes}분`
    else if (minutes > 0) return `${minutes}분`
    else return `${remainingSeconds}초`
    
  } catch (error) {
    console.error('시간 파싱 오류:', error, 'input:', timeString)
    return "시간 정보 없음"
  }
}

/**
 * 거리를 사용자 친화적으로 표시 (기존 함수 - 그대로 둠)
 * @param {number} meters - 미터 단위 거리
 * @returns {string} 사용자 친화적인 거리 문자열
 */
export const formatDistance = (meters) => {
  if (!meters || meters === 0) return "0m"
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1)
    return `${km}km`
  } else {
    return `${Math.round(meters)}m`
  }
}

/**
 * 플로깅 기록 카드에 표시할 요약 정보 생성
 * @param {Object} record - 플로깅 기록 객체
 * @returns {Object} 표시용 정보 객체
 */
export const formatPloggingCardInfo = (record) => {
  let safePloggingTime = record.ploggingTime;
  if (safePloggingTime === "string" || !safePloggingTime) {
    safePloggingTime = "0";
  }
  
  return {
    // 🔥 [수정] formatUserFriendlyDate -> formatToAbsoluteDate 함수를 사용하도록 변경
    date: formatToAbsoluteDate(record.ploggingDate2 || record.ploggingDate || record.createdAt),
    time: formatPloggingTime(safePloggingTime),
    distance: formatDistance(record.distance),
    location: record.trailTypeName || "플로깅 경로",
    title: record.trailTypeName || "플로깅 기록"
  }
}