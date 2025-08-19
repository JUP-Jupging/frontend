// auth.js 또는 별도의 유틸리티 파일에 추가

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../stores/useAuth"; // Zustand 스토어

/**
 * 서버 API 호출 없이 클라이언트의 인증 정보(AsyncStorage, Zustand)만 강제로 삭제하는 함수.
 * DB에서 유저가 삭제되는 등 서버와 통신이 불가능할 때 사용합니다.
 */
export const forceClearAuth = async () => {
  try {
    console.log('[AUTH] 로컬 인증 정보 강제 삭제 시작');
    
    // 1. AsyncStorage에 저장된 토큰 정보 삭제
    // 키는 실제로 토큰 저장 시 사용한 키를 입력해야 합니다.
    await AsyncStorage.removeItem('user-tokens');
    
    // 또는 AsyncStorage 전체를 비워도 됩니다.
    // await AsyncStorage.clear();

    // 2. Zustand 스토어의 상태 초기화
    // useAuth 스토어에 accessToken, user 정보 등을 null로 만드는 logout 액션이 필요합니다.
    useAuth.getState().logout();

    console.log('[AUTH] 로컬 인증 정보 삭제 완료');
  } catch (error) {
    console.error('[AUTH] 로컬 인증 정보 삭제 중 에러 발생:', error);
  }
};