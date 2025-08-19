// src/api/report.js
import axios from "axios";
import BASE_URL from "./apiconfig";

/**
 * ✅ 공통 안내
 * - 파일 업로드(FormData) 요청에서는 Content-Type을 직접 지정하지 않습니다.
 *   (브라우저/RN이 boundary를 자동으로 붙입니다)
 * - Authorization이 필요한 API는 Bearer 토큰을 헤더에 넣습니다.
 */

/* ---------------------------------------------
 * 0) AI 분석 (참고: 별도 도메인)
 *    POST https://ai.jupging.store/detect
 *    - FormData: file
 * --------------------------------------------- */
export const analyzeTrashImage = async (imageFile) => {
  // 👉 파일 메타 확인용 로그
  console.log("[AI] analyzeTrashImage file:", imageFile);

  const form = new FormData();
  form.append("file", {
    uri: imageFile.uri,
    name: imageFile.name || "photo.jpg",
    type: imageFile.type || "image/jpeg",
  });

  // ❗ Content-Type 수동 지정 금지
  const res = await fetch("https://ai.jupging.store/detect", {
    method: "POST",
    body: form,
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    // 서버가 텍스트로 에러를 줄 수도 있으니 그대로 찍어봄
    const body = await res.text();
    console.log("[AI] /detect error:", res.status, body);
    throw new Error(`AI detect HTTP ${res.status} ${contentType}`);
  }

  // 정상 응답(JSON)
  const data = await res.json();
  console.log("[AI] /detect ok keys:", Object.keys(data || {}));
  return data;
};

/* ---------------------------------------------
 * 1) 신고 생성
 *    POST /reports (multipart/form-data)
 *    - parts:
 *        image      : 파일 (binary)
 *        title      : string
 *        lat,lng    : number → 문자열로 전송
 *        trailId    : number → 문자열로 전송
 *        imageUrl   : string (비워도 필드 전송 권장)
 *        isPicked   : "Y" | "N"
 *        paper,can,plastic,vinyl,glass,styro,battery : number → 문자열
 *        (option) memberId : number → 문자열
 * --------------------------------------------- */

// 한글 → 스펙(영문) 키 매핑 (필요 시 확장)
const KO_TO_EN = {
  "종이": "paper",
  "캔": "can",
  "플라스틱": "plastic",
  "비닐": "vinyl",
  "유리": "glass",
  "스티로폼": "styro",
  "건전지": "battery",
};

export const createReport = async (accessToken, reportData) => {
  if (!accessToken) throw new Error("인증 토큰이 없습니다.");
  if (!reportData?.image?.uri) throw new Error("이미지 파일이 없습니다.");

  // 👉 카테고리 카운트 평탄화 (미지정은 0)
  const counts = { paper: 0, can: 0, plastic: 0, vinyl: 0, glass: 0, styro: 0, battery: 0 };
  Object.entries(reportData.categoryCounts || {}).forEach(([k, v]) => {
    const key = KO_TO_EN[k] || k; // 이미 영문이면 그대로
    if (counts[key] !== undefined) counts[key] = Number(v) || 0;
  });

  // 👉 FormData 구성
  const form = new FormData();
  form.append("image", {
    uri: reportData.image.uri, // file:// 또는 content://
    name: reportData.image.name || "photo.jpg",
    type: reportData.image.type || "image/jpeg",
  });
  form.append("title", String(reportData.title || ""));
  form.append("lat", String(reportData.lat));
  form.append("lng", String(reportData.lng));
  form.append("trailId", String(reportData.trailId));
  form.append("imageUrl", String(reportData.imageUrl || "")); // 스펙상 존재하므로 빈 문자열이라도 전송
  form.append("isPicked", reportData.isPicked === "Y" ? "Y" : "N");

  // 7개 분류 카운트(문자열로)
  form.append("paper", String(counts.paper));
  form.append("can", String(counts.can));
  form.append("plastic", String(counts.plastic));
  form.append("vinyl", String(counts.vinyl));
  form.append("glass", String(counts.glass));
  form.append("styro", String(counts.styro));
  form.append("battery", String(counts.battery));

  // 필요 시 멤버 ID가 요구되면 활용
  if (reportData.memberId != null) {
    form.append("memberId", String(reportData.memberId));
  }

  // ❗ Content-Type 수동 지정 금지
  const resp = await fetch(`${BASE_URL}/reports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  const ct = resp.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await resp.json() : await resp.text();

  if (!resp.ok) {
    // 상태별 메시지 보강
    const msg =
      resp.status === 413
        ? "이미지 용량이 너무 큽니다."
        : resp.status === 415
        ? "형식이 올바르지 않습니다(필드명/타입 확인)."
        : `요청 실패 (${resp.status})`;
    const err = new Error(msg);
    err.status = resp.status;
    err.payload = payload;
    throw err;
  }
  return payload;
};

/* ---------------------------------------------
 * 2) 신고 상세(공개)
 *    GET /reports/{reportId}
 *    - 공개 API이지만, 토큰을 넘겨도 무방 (서버가 무시)
 * --------------------------------------------- */
export const getReportById = async (reportId, accessToken) => {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  const { data } = await axios.get(`${BASE_URL}/reports/${reportId}`, {
    headers,
    timeout: 10000,
  });
  return data;
};

/* ---------------------------------------------
 * 3) (주웠음 처리)
 *    PUT /reports/{reportId}
 *    - 응답이 JSON이 아니라 "picked" (text)로 돌아오는 케이스가 있음
 * --------------------------------------------- */
export const markReportPicked = async (reportId, accessToken) => {
  if (!accessToken) throw new Error("인증 토큰이 없습니다.");

  const resp = await fetch(`${BASE_URL}/reports/${reportId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });

  // 서버가 텍스트만 주는 경우 대비
  const contentType = resp.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await resp.json() : await resp.text();

  if (!resp.ok) {
    throw new Error(`주웠음 처리 실패 (${resp.status}) : ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }

  // "picked" 같은 텍스트를 boolean으로 매핑해주면 사용성이 좋아짐
  if (typeof body === "string") {
    return body.trim().toLowerCase() === "picked"; // picked → true
  }
  // 혹시 JSON을 줄 경우 그대로 반환
  return body;
};

/* ---------------------------------------------
 * 4) 산책로 기준 신고 목록
 *    GET /reports/trails/{trailId}
 * --------------------------------------------- */
export const getReportsByTrailId = async (trailId) => {
  const { data } = await axios.get(`${BASE_URL}/reports/trails/${trailId}`, {
    timeout: 10000,
  });
  return data; // 배열
};

/* ---------------------------------------------
 * 5) 내 신고 목록
 *    GET /reports/me  (Authorization 필요)
 * --------------------------------------------- */
export const getMyReports = async (accessToken) => {
  if (!accessToken) throw new Error("인증 토큰이 없습니다.");
  const { data } = await axios.get(`${BASE_URL}/reports/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  });
  return data;
};

/* ---------------------------------------------
 * 6) 내 특정 신고 상세
 *    GET /reports/me/{reportId} (Authorization 필요)
 * --------------------------------------------- */
export const getMyReportById = async (reportId, accessToken) => {
  if (!accessToken) throw new Error("인증 토큰이 없습니다.");
  const { data } = await axios.get(`${BASE_URL}/reports/me/${reportId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  });
  return data;
};
