// src/store/userSlice.js
const createUserSlice = (set) => ({
  id: null,
  email: null,
  nickname: null,
  appNickname: null,
  profileImageUrl: null,
  activityRegion: null,

  // 로그인 응답(명세서의 유저 객체)으로 상태 세팅
  setUserFromLoginResponse: (user) => {
    set({
      id: user?.id ?? null,
      email: user?.email ?? null,
      nickname: user?.nickname ?? null,
      appNickname: user?.appNickname ?? null,
      profileImageUrl: user?.profileImageUrl ?? null,
      activityRegion: user?.activityRegion ?? null,
    });
  },

  // /members/me 응답으로도 세팅 가능 (선택)
  setUserFromMe: (me) => {
    set({
      id: me?.id ?? null,
      email: me?.email ?? null,
      nickname: me?.nickname ?? me?.appNickname ?? null,
      appNickname: me?.appNickname ?? null,
      profileImageUrl: me?.profileImageUrl ?? null,
      activityRegion: me?.activityRegion ?? null,
    });
  },

  clearUser: () => set({
    id: null,
    email: null,
    nickname: null,
    appNickname: null,
    profileImageUrl: null,
    activityRegion: null,
  }),
});

export default createUserSlice;
