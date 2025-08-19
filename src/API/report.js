// src/api/report.js
import axios from "axios";
import BASE_URL from "./apiconfig";

/**
 * 신고 생성

 * parts:
 *  - image: 파일
 *  - req: JSON 문자열
 */
// 한글 키 → 스펙(영문) 키 매핑
const KO_TO_EN = {
  "종이": "paper",
  "캔": "can",
  "플라스틱": "plastic",
  "비닐": "vinyl",
  "유리": "glass",
  "스티로폼": "styro",
  "건전지": "battery",
}

export const createReport = async (accessToken, reportData) => {
  if (!accessToken) throw new Error("인증 토큰이 없습니다.")
  if (!reportData?.image?.uri) throw new Error("이미지 파일이 없습니다.")

  // 1) 카테고리 평탄화(영문 필드로, 없으면 0)
  const counts = { paper:0, can:0, plastic:0, vinyl:0, glass:0, styro:0, battery:0 }
  Object.entries(reportData.categoryCounts || {}).forEach(([k, v]) => {
    const key = KO_TO_EN[k] || k // 이미 영문이면 그대로
    if (counts[key] !== undefined) counts[key] = Number(v) || 0
  })

  // 2) FormData 구성 (모두 문자열로)
  const form = new FormData()
  form.append("image", {
    uri: reportData.image.uri,                 // file:// 또는 content:// 그대로
    name: reportData.image.name || "photo.jpg",
    type: reportData.image.type || "image/jpeg",
  })
  form.append("title", String(reportData.title || ""))
  form.append("lat", String(reportData.lat))
  form.append("lng", String(reportData.lng))
  form.append("trailId", String(reportData.trailId))
  form.append("imageUrl", "")                  // 스펙에 있으므로 빈 문자열 전송
  form.append("isPicked", reportData.isPicked || "N")

  // 스펙상의 7개 필드 모두 전송(문자열)
  form.append("paper",   String(counts.paper))
  form.append("can",     String(counts.can))
  form.append("plastic", String(counts.plastic))
  form.append("vinyl",   String(counts.vinyl))
  form.append("glass",   String(counts.glass))
  form.append("styro",   String(counts.styro))
  form.append("battery", String(counts.battery))

  // 필요 시 memberId가 요구되면 아래 주석 해제
  // form.append("memberId", String(reportData.memberId || ""))

  // 3) 전송 (Content-Type 수동 지정 금지: boundary 자동 설정)
  const resp = await fetch(`${BASE_URL}/reports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })

  const ct = resp.headers.get("content-type") || ""
  const payload = ct.includes("application/json") ? await resp.json() : await resp.text()

  if (!resp.ok) {
    // 413: 이미지 과대 / 415: 필드명·형식 불일치
    const msg =
      resp.status === 413 ? "이미지가 너무 큽니다." :
      resp.status === 415 ? "형식이 올바르지 않습니다(필드명·타입 확인)." :
      `요청 실패 (${resp.status})`
    const err = new Error(msg)
    err.status = resp.status
    err.payload = payload
    throw err
  }
  return payload
}



/**
 * 내 신고 목록 조회
 * GET /reports/me
 * 헤더: Authorization: Bearer <AccessToken>
 */
export const getMyReports = async (accessToken) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/reports/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error("getMyReports Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 신고 상세 조회
 * GET /reports/{reportId}
 * 헤더: Authorization: Bearer <AccessToken>
 */
export const getReportDetail = async (accessToken, reportId) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error("getReportDetail Error:", error.response?.data || error.message);
    throw error;
  }
};
// ...existing code...

/**
 * AI 기반 쓰레기 분석
 * POST https://ai.jupging.store/detect
 * Form-Data: file (사진 1장)
 * 반환 예:
 * {
 *   counts: { grouped: { "유리": 1, "종이": 1 }, fine: {...} },
 *   image_base64: "data:image/jpeg;base64,...." 또는 "....(base64)"
 *   ...
 * }
 */
// src/api/report.js
export const analyzeTrashImage = async (imageFile) => {
  // 디버깅 로그: 파일 메타
  console.log('[AI] analyzeTrashImage file:', imageFile);

  const form = new FormData();
  form.append('file', {
    uri: imageFile.uri,
    name: imageFile.name || 'photo.jpg',
    type: imageFile.type || 'image/jpeg',
  });

  try {
    // 절대 Content-Type 헤더를 직접 지정하지 말 것!
    const res = await fetch('https://ai.jupging.store/detect', {
      method: 'POST',
      body: form,
    });

    console.log('[AI] /detect status:', res.status);

    // 네트워크 핸드셰이크는 통과했는데 서버가 4xx/5xx라면 상세 본문을 찍어보자
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await res.text();
      console.log('[AI] /detect error body:', text);
      throw new Error(`AI detect HTTP ${res.status} ${contentType}`);
    }

    // JSON 파싱
    const data = await res.json();
    console.log('[AI] /detect ok payload keys:', Object.keys(data || {}));
    return data;
  } catch (e) {
    // fetch 자체 실패(핸드셰이크/네트워크)면 여기로 옴
    console.log('[AI] /detect fetch error:', e?.message || e);
    throw e;
  }
};