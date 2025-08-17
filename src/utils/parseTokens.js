// src/utils/parseTokens.js

/**
 * 딥링크 URL에서 access/refresh 토큰을 파싱한다.
 * - query (?accessToken=...) / hash (#access_token=...) 모두 지원
 * - 실패 시 { error }를 채워줌
 */
export function parseTokensFromUrl(url) {
  try {
    const u = new URL(url);

    // query
    let accessToken = u.searchParams.get("accessToken") || u.searchParams.get("access_token");
    let refreshToken = u.searchParams.get("refreshToken") || u.searchParams.get("refresh_token");
    let error = u.searchParams.get("error");

    // hash
    if (!accessToken && u.hash) {
      const hash = new URLSearchParams(u.hash.replace(/^#/, ""));
      accessToken = hash.get("accessToken") || hash.get("access_token");
      refreshToken = hash.get("refreshToken") || hash.get("refresh_token");
      error = error || hash.get("error");
    }

    return { accessToken, refreshToken, error: error || null };
  } catch {
    return { accessToken: null, refreshToken: null, error: "invalid_redirect_uri" };
  }
}
