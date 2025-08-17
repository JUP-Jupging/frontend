// src/hooks/useOAuthCallback.js
import { useEffect, useRef } from "react";
import { Linking, Alert } from "react-native";
import { parseTokensFromUrl } from "../utils/parseTokens";
import { useAuth } from "../stores/useAuth";

/**
 * OAuth 딥링크 콜백을 감지하고, 토큰 저장 후 onSuccess 호출.
 * - 화면에서 로직 흩어지지 않게 한 곳에 모음
 * - 중복 이벤트 방지
 *
 * @param {{ onSuccess?: Function, onError?: Function }} opts
 */
export default function useOAuthCallback({ onSuccess, onError } = {}) {
  const setTokens = useAuth((s) => s.setTokens);
  const isHandlingRef = useRef(false);

  useEffect(() => {
    const onUrl = async (event) => {
      if (isHandlingRef.current) return;
      isHandlingRef.current = true;

      try {
        const { accessToken, refreshToken, error } = parseTokensFromUrl(event?.url || "");
        if (error) {
          onError?.(error);
          return;
        }
        if (!accessToken) return; // 다른 딥링크일 수 있음

        // 토큰 저장 (Zustand + persist)
        setTokens({ accessToken, refreshToken });
        onSuccess?.({ accessToken, refreshToken });
      } catch (e) {
        onError?.(e?.message || "oauth_callback_failed");
      } finally {
        setTimeout(() => (isHandlingRef.current = false), 300);
      }
    };

    const sub = Linking.addEventListener("url", onUrl);

    // 콜드 스타트 대응
    (async () => {
      const init = await Linking.getInitialURL();
      if (init) onUrl({ url: init });
    })();

    return () => sub.remove();
  }, [onSuccess, onError, setTokens]);
}
