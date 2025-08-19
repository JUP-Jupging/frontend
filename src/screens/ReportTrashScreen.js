"use client"

import { useState, useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Modal,
  ToastAndroid,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import { launchImageLibrary, launchCamera } from "react-native-image-picker"
import { useLocation } from "../hooks/useLocation"
import { getNearestTrail } from "../api/trails"
import { analyzeTrashImage, createReport } from "../api/report"
import { useAuth } from "../stores/useAuth"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// trailTypeName + trailName을 한 줄로, 중복 제거
function mergeTrailTitle(a, b) {
  const A = (a || "").trim()
  const B = (b || "").trim()
  if (!A && !B) return ""
  if (!A) return B
  if (!B) return A
  if (A === B) return A
  if (B.includes(A)) return B
  if (A.includes(B)) return A
  if (B.startsWith(A)) return B
  if (A.startsWith(B)) return A
  return `${A} ${B}`
}

// base64 -> data URI
function toDataUri(b64) {
  if (!b64 || typeof b64 !== "string") return null
  // 양쪽 따옴표 제거 + 공백/개행 제거
  let clean = b64.trim()
  if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1)
  clean = clean.replace(/\r?\n|\r/g, "").replace(/\s/g, "")
  // 앞부분(매직넘버)로 MIME 추정
  const head = clean.slice(0, 20)
  let mime = "image/jpeg"
  if (head.startsWith("iVBORw0KGgo")) mime = "image/png"  // PNG
  else if (head.startsWith("R0lGOD")) mime = "image/gif"   // GIF
  else if (head.startsWith("/9j/")) mime = "image/jpeg"    // JPEG
  return clean.startsWith("data:") ? clean : `data:${mime};base64,${clean}`
}

// 보기 순서(한글 라벨)
const CATEGORY_ORDER = ["종이", "캔", "플라스틱", "비닐", "유리", "스티로폼", "건전지"]

export default function ReportTrashScreen({ navigation }) {
  const { currentLocation, getCurrentLocation } = useLocation()
  const accessToken = useAuth((s) => s.accessToken)

  // AI 미리보기/수정 모달
  const [aiModalVisible, setAiModalVisible] = useState(false)
  const [aiPreviewUri, setAiPreviewUri] = useState(null)  // data:image/...;base64,xxxx
  const [aiEditableCounts, setAiEditableCounts] = useState({}) // { "종이": 2, "유리": 1, ... }

  // 상태
  const [title, setTitle] = useState("")
  const [selectedTrail, setSelectedTrail] = useState(null) // { trailId, trailTypeName, trailName, ... }
  const [imageUris, setImageUris] = useState([])           // 최대 1장
  const [categoryCounts, setCategoryCounts] = useState({}) // 서버 전송용(한글 키 그대로)
  const [isLoading, setIsLoading] = useState(true)
  const [trailLoading, setTrailLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // 현재 위치 → 가장 가까운 산책로 자동 세팅
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true)
        const loc = await getCurrentLocation()
        if (!loc) {
          Alert.alert("위치 오류", "현재 위치를 가져오지 못했습니다.")
          return
        }
        setTrailLoading(true)
        const nearest = await getNearestTrail(loc.latitude, loc.longitude)
        if (nearest) setSelectedTrail(nearest)
        setTitle("") // placeholder만 노출
      } catch (e) {
        console.log("초기 로딩 오류:", e?.message)
      } finally {
        setTrailLoading(false)
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const trailLabel = useMemo(() => {
    if (!selectedTrail) return "산책로를 불러오는 중..."
    return mergeTrailTitle(selectedTrail.trailTypeName, selectedTrail.trailName)
  }, [selectedTrail])

  // ───────── 카메라 권한 & 이미지 선택 ─────────
  async function ensureCameraPermissions() {
    if (Platform.OS !== "android") return true
    const perms = [PermissionsAndroid.PERMISSIONS.CAMERA]
    if (Platform.Version >= 33) perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES)
    else perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)
    const results = await PermissionsAndroid.requestMultiple(perms)
    return perms.every(p => results[p] === PermissionsAndroid.RESULTS.GRANTED)
  }

  const handleImagePicker = () => {
    if (imageUris.length >= 1) {
      Alert.alert("알림", "최대 1장까지만 업로드할 수 있습니다.")
      return
    }

    Alert.alert(
      "사진 선택",
      "사진을 어떻게 추가할까요?",
      [
        {
          text: "카메라로 찍기",
          onPress: async () => {
            const ok = await ensureCameraPermissions()
            if (!ok) {
              Alert.alert("권한 필요", "카메라/사진 권한을 허용해주세요.")
              return
            }
            launchCamera(
              {
                mediaType: "photo",
                selectionLimit: 1,
                maxWidth: 640,   // 1024~1280 권장
                maxHeight: 640,
                quality: 0.6,     // 0.6~0.8 권장
                includeExtra: true
              },
              (response) => {
                if (response?.errorMessage || response?.didCancel) return
                const uri = response?.assets?.[0]?.uri
                if (uri) setImageUris([uri])
              }
            )
          },
        },
        {
          text: "앨범에서 선택",
          onPress: async () => {
            const ok = Platform.OS === "android" ? await ensureCameraPermissions() : true
            if (!ok) {
              Alert.alert("권한 필요", "사진 접근 권한을 허용해주세요.")
              return
            }
            launchImageLibrary(
              {
  mediaType: "photo",
  selectionLimit: 1,
  maxWidth: 640,   // 1024~1280 권장
  maxHeight: 640,
  quality: 0.6,     // 0.6~0.8 권장
  includeExtra: true
},
              (response) => {
                if (response?.errorMessage || response?.didCancel) return
                const uri = response?.assets?.[0]?.uri
                if (uri) setImageUris([uri])
              }
            )
          },
        },
        { text: "취소", style: "cancel" },
      ]
    )
  }

  const handleDeleteImage = () => setImageUris([])

  // ───────── AI 분석 → 모달로 미리보기 + 개수 편집 ─────────
  const handleAIAnalysis = async () => {
    if (!imageUris[0]) {
      Alert.alert("이미지 필요", "먼저 사진을 추가해주세요.")
      return
    }
    try {
      setAnalyzing(true)
      const file = { uri: imageUris[0], name: "photo.jpg", type: "image/jpeg" }
      const result = await analyzeTrashImage(file)
      console.log("[AI] image_base64 length:", result?.image_base64?.length)
      console.log("[AI] image_base64 head:", result?.image_base64?.slice(0, 30))

      // 미리보기 이미지 (base64)
      setAiPreviewUri(toDataUri(result?.image_base64))

      // counts.grouped (한글 키 기준) → 편집 상태 세팅
      const grouped = result?.counts?.grouped || {}
      const editable = {}
      Object.entries(grouped).forEach(([label, val]) => {
        editable[label] = Number(val) || 0
      })
      setAiEditableCounts(editable)

      // 모달 오픈
      setAiModalVisible(true)
    } catch (e) {
      console.log("AI 분석 오류:", e?.message)
      Alert.alert("분석 실패", "이미지 분석에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setAnalyzing(false)
    }
  }

  // 적용된 결과 요약(한글 라벨, 0 제외, 정렬)
  const appliedKorSummary = useMemo(() => {
    return Object.entries(categoryCounts)
      .filter(([_, n]) => (Number(n) || 0) > 0)
      .map(([ko, n]) => ({ ko, n }))
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.ko) - CATEGORY_ORDER.indexOf(b.ko))
  }, [categoryCounts])
  const resetForm = () => {
    setTitle("");
    setImageUris([]);
    setCategoryCounts({});
    setAiEditableCounts({});
    setAiPreviewUri(null);
    setAiModalVisible(false);
  };
  // ───────── 제출 ─────────
  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert("오류", "제목을 입력해주세요.")
    if (!selectedTrail?.trailId) return Alert.alert("오류", "산책로 정보를 불러오지 못했습니다.")
    if (!currentLocation?.latitude || !currentLocation?.longitude) return Alert.alert("오류", "현재 좌표가 없습니다.")
    if (!imageUris[0]) return Alert.alert("오류", "사진 1장을 첨부해주세요.")

    const imageFile = {
      uri: imageUris[0],
      name: "photo.jpg",
      type: "image/jpeg",
    }

    const payload = {
      title: title.trim(),
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
      trailId: selectedTrail.trailId,
      isPicked: "N",
      // ✅ 한글 키 그대로, 0 제외된 객체
      categoryCounts,
      image: imageFile,
    }

    try {
      setSubmitting(true)
      await createReport(accessToken, payload)

      // 성공 처리: 토스트/알럿 → 폼 리셋 → 뒤로
      if (Platform.OS === "android") {
        ToastAndroid.show("제보가 되었습니다.", ToastAndroid.SHORT)
      } else {
        Alert.alert("제보가 되었습니다.")
      }
      resetForm()
      navigation.goBack()
    } catch (e) {
      console.log("제보 실패:", e?.message)
      Alert.alert("제보 실패", "네트워크 혹은 서버 오류입니다.")
    } finally {
      setSubmitting(false)
    }
  }


  // ───────── AI 모달 본문 ─────────
  const renderAiModalContent = () => {
    // 보기 순서대로 라벨 정렬
    const rows = Object.keys(aiEditableCounts).sort(
      (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
    )

    const setValue = (k, v) => {
      const n = Math.max(0, parseInt(v, 10) || 0)
      setAiEditableCounts(prev => ({ ...prev, [k]: n }))
    }

    return (
      <View style={styles.aiModalWrap}>
        {aiPreviewUri ? (
          <Image
            source={{ uri: aiPreviewUri }}
            style={styles.aiPreview}
            resizeMode="contain"
            onLoad={() => console.log("[AI] preview loaded")}
            onError={(e) => {
              console.log("[AI] preview error:", e?.nativeEvent)
              // MIME 불일치 시 한 번 교차 시도
              if (aiPreviewUri.startsWith("data:image/jpeg;base64,")) {
                setAiPreviewUri(aiPreviewUri.replace("image/jpeg", "image/png"))
              } else if (aiPreviewUri.startsWith("data:image/png;base64,")) {
                setAiPreviewUri(aiPreviewUri.replace("image/png", "image/jpeg"))
              }
            }}
          />
        ) : (
          <View style={[styles.aiPreview, { alignItems: "center", justifyContent: "center" }]}>
            <Text>미리볼 이미지가 없습니다.</Text>
          </View>
        )}

        <Text style={styles.aiModalTitle}>분석된 쓰레기 종류 (수정 가능)</Text>

        {rows.length === 0 ? (
          <Text style={styles.infoText}>감지된 항목이 없습니다.</Text>
        ) : (
          rows.map((ko) => (
            <View key={ko} style={styles.countRow}>
              <Text style={styles.countLabel}>{ko}</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setValue(ko, (aiEditableCounts[ko] || 0) - 1)}
                >
                  <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  value={String(aiEditableCounts[ko])}
                  onChangeText={(t) => setValue(ko, t.replace(/[^\d]/g, ""))}
                  keyboardType="number-pad"
                  style={styles.counterInput}
                />
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setValue(ko, (aiEditableCounts[ko] || 0) + 1)}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 8 }} />
      </View>
    )
  }

  // ───────── 로딩 화면 (훅 아래, 메인 반환 위) ─────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ───────── 메인 UI ─────────
  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>쓰레기 제보</Text>
        <TouchableOpacity style={styles.menuButton} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.menuText}>{submitting ? "등록중..." : "등록"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* AI 분석 버튼 */}
        <TouchableOpacity
          style={[styles.aiButton, analyzing && { opacity: 0.7 }]}
          onPress={handleAIAnalysis}
          disabled={analyzing}
        >
          <Image source={require("../assets/ai-svgrepo-com.png")} style={styles.aiIcon} resizeMode="contain" />
          <Text style={styles.aiText}>{analyzing ? "AI 분석 중..." : "AI 분석으로 쓰레기 정보 입력하기"}</Text>
          <Image source={require("../assets/check-square.png")} style={styles.checkIcon} resizeMode="contain" />
        </TouchableOpacity>

        {/* 사진 업로드 영역 */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageUploadBox} onPress={handleImagePicker}>
            <View style={styles.cameraBoxInner}>
              <Icon name="camera-alt" size={24} color="#418663" />
              <Text style={styles.imageCount}>{imageUris.length}/1</Text>
            </View>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity style={styles.imageDeleteButton} onPress={handleDeleteImage}>
                  <Icon name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 입력 폼 */}
        <View style={styles.formSection}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.textInput}
            placeholder="제목을 입력하세요"
            placeholderTextColor="rgba(51, 51, 51, 0.5)"
          />

          {/* 산책로 - 고정 표시 */}
          <Text style={styles.label}>산책로</Text>
          <View style={styles.infoBox}>
            {trailLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.infoText}>{trailLabel || "산책로 정보를 불러오지 못했습니다."}</Text>
            )}
          </View>

          {/* 위치 - 고정 표시 */}
          <Text style={styles.label}>쓰레기 위치</Text>
          <View style={styles.infoBox}>
            {currentLocation?.latitude ? (
              <>
                <Text style={styles.infoText}>현재 좌표를 저장했습니다.</Text>
                <Text style={styles.coordText}>
                  ({currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)})
                </Text>
              </>
            ) : (
              <Text style={styles.infoText}>현재 좌표가 없습니다.</Text>
            )}
          </View>

          {/* 적용된 AI 결과 요약 + 수정 */}
          <Text style={styles.label}>분석 결과</Text>
          <View style={styles.infoBox}>
            {appliedKorSummary.length === 0 ? (
              <Text style={styles.infoText}>아직 적용된 분석 결과가 없습니다.</Text>
            ) : (
              <>
                <View style={{ gap: 6 }}>
                  {appliedKorSummary.map(({ ko, n }) => (
                    <Text key={ko} style={styles.infoText}>• {ko}: {n}</Text>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    // 현재 적용된 값 기준으로 7종 모두 편집 가능하게 열기
                    const next = {}
                    CATEGORY_ORDER.forEach((ko) => {
                      next[ko] = Number(categoryCounts[ko]) || 0
                    })
                    setAiEditableCounts(next)
                    setAiModalVisible(true)
                  }}
                  style={{ marginTop: 10, alignSelf: "flex-start" }}
                >
                  <Text style={{ color: "#418663", fontWeight: "600" }}>수정</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 제보하기 버튼 */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? "제보중..." : "제보하기"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 완료 모달 */}
      <CommonModal
        visible={modalVisible}
        message="근처로 이동해서 주워주세요."
        onCancel={() => setModalVisible(false)}
        onConfirm={() => {
          setModalVisible(false)
          navigation.goBack()
        }}
      />

      {/* AI 미리보기/수정 모달 (RN Modal) */}
      <Modal
        visible={aiModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>AI 분석 결과</Text>

            {renderAiModalContent()}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setAiModalVisible(false)}>
                <Text style={styles.modalBtnSecondaryText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={() => {
                  // 0 제외, 한글 키 그대로 적용
                  const out = {}
                  Object.entries(aiEditableCounts).forEach(([ko, v]) => {
                    const n = Math.max(0, parseInt(v, 10) || 0)
                    if (n > 0) out[ko] = n
                  })
                  setCategoryCounts(out)
                  setAiModalVisible(false)
                }}
              >
                <Text style={styles.modalBtnPrimaryText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: screenHeight * 0.06,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
    backgroundColor: "#FFFFFF",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333333", textAlign: "center" },
  menuButton: { padding: 5 },
  menuText: { fontSize: 16, color: "#333333" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  aiButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#418663", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20,
    marginTop: 20, marginBottom: 20,
  },
  aiText: { color: "#FFFFFF", fontSize: 14, fontWeight: "400", marginHorizontal: 10, flex: 1, textAlign: "center" },

  imageSection: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  imageUploadBox: {
    width: 50, height: 50, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#418663",
    borderRadius: 5, justifyContent: "center", alignItems: "center", position: "relative",
  },
  cameraBoxInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageCount: { fontSize: 10, fontWeight: "600", color: "#418663", marginTop: 2, textAlign: "center" },
  imageScrollView: { flexDirection: "row", marginHorizontal: 10 },
  imageContainer: { position: "relative", marginRight: 10 },
  uploadedImage: { width: 65, height: 50, borderRadius: 5 },
  imageDeleteButton: {
    position: "absolute", top: -8, right: -8, width: 24, height: 24, backgroundColor: "#D9D9D9",
    borderRadius: 12, borderWidth: 1.5, borderColor: "#418663", justifyContent: "center", alignItems: "center",
  },

  formSection: { marginBottom: 30 },
  label: { fontSize: 16, fontWeight: "700", color: "#333333", marginBottom: 8, marginTop: 20 },
  textInput: { borderBottomWidth: 1.5, borderBottomColor: "#F1F1F1", paddingVertical: 12, fontSize: 16, color: "#333333" },

  infoBox: {
    borderWidth: 1, borderColor: "#D9D9D9", borderRadius: 5, paddingHorizontal: 12, paddingVertical: 10, minHeight: 40,
    backgroundColor: "#FAFAFA",
  },
  infoText: { fontSize: 16, color: "#333333" },
  coordText: { marginTop: 4, fontSize: 12, color: "#666" },

  submitButton: { backgroundColor: "#418663", borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  submitText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },

  aiIcon: { width: 24, height: 24, tintColor: "#FFFFFF" },
  checkIcon: { width: 20, height: 20, tintColor: "#FFFFFF" },

  // AI 모달 내부
  aiModalWrap: { width: "100%" },
  aiPreview: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  aiModalTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 8 },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  countLabel: { fontSize: 16, color: "#333", flex: 1 },
  counter: { flexDirection: "row", alignItems: "center" },
  counterBtn: {
    width: 34, height: 34, borderRadius: 6, borderWidth: 1, borderColor: "#D9D9D9",
    alignItems: "center", justifyContent: "center",
  },
  counterBtnText: { fontSize: 18, fontWeight: "700", color: "#333" },
  counterInput: {
    width: 56, height: 34, marginHorizontal: 8, borderWidth: 1, borderColor: "#D9D9D9",
    borderRadius: 6, textAlign: "center", fontSize: 16, color: "#333", paddingVertical: 4, paddingHorizontal: 8,
  },

  // RN Modal 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "90%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  modalBtnPrimary: {
    backgroundColor: "#418663",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnPrimaryText: { color: "#fff", fontWeight: "700" },
  modalBtnSecondary: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnSecondaryText: { color: "#333", fontWeight: "600" },
})
