// stores/useAuth.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuth = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      // 토큰 설정 (로그인/갱신 시 호출)
      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken, // 없으면 기존 유지
        }),

      // 유저 정보 저장(선택)
      setUser: (user) => set({ user }),
      // 로그아웃(로컬 상태만)
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      // 로그인 여부 간단 체크
      isAuthed: () => Boolean(get().accessToken),
    }),
    {
      name: "auth", // AsyncStorage 키
      storage: createJSONStorage(() => AsyncStorage), // 디스크 저장소
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    }
  )
);
