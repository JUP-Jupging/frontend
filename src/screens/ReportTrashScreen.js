"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import { launchImageLibrary } from "react-native-image-picker"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// 더미 데이터
const DUMMY_TRAILS = [
  { id: 1, name: "마로니에 공원 산책로" },
  { id: 2, name: "한강 공원 산책로" },
  { id: 3, name: "남산 둘레길" },
]

const DUMMY_LOCATIONS = [
  { id: 1, name: "공원 입구 근처", coordinates: { lat: 37.5665, lng: 126.978 } },
  { id: 2, name: "벤치 옆", coordinates: { lat: 37.5666, lng: 126.9781 } },
  { id: 3, name: "화장실 앞", coordinates: { lat: 37.5667, lng: 126.9782 } },
]

const DUMMY_AMOUNTS = ["적음", "보통", "많음", "매우 많음"]

export default function ReportTrashScreen({ navigation }) {
  // 상태 관리
  const [title, setTitle] = useState("")
  const [selectedTrail, setSelectedTrail] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [amount, setAmount] = useState("")
  const [imageUris, setImageUris] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [trailModalVisible, setTrailModalVisible] = useState(false)
  const [locationModalVisible, setLocationModalVisible] = useState(false)
  const [amountModalVisible, setAmountModalVisible] = useState(false)

  // 데이터 로딩 상태
  const [trails, setTrails] = useState([])
  const [locations, setLocations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // 실제 API 호출 시뮬레이션 (실패하면 더미 데이터 사용)
      const shouldUseDummyData = Math.random() > 0.3 // 70% 확률로 더미 데이터 사용

      if (shouldUseDummyData) {
        // 더미 데이터 사용
        console.log("Using dummy data")
        setTrails(DUMMY_TRAILS)
        setLocations(DUMMY_LOCATIONS)

        // 기본값 설정
        setTitle("마로니에 공원 쓰레기")
        setSelectedTrail(DUMMY_TRAILS[0])
        setSelectedLocation(DUMMY_LOCATIONS[0])
        setAmount("많음")
      } else {
        // 실제 API 호출 (여기서는 시뮬레이션)
        console.log("Loading from API...")
        // const trailsData = await fetchTrails();
        // const locationsData = await fetchLocations();

        // API 호출 실패 시 더미 데이터로 폴백
        setTrails(DUMMY_TRAILS)
        setLocations(DUMMY_LOCATIONS)
      }
    } catch (error) {
      console.error("Data loading failed, using dummy data:", error)
      setTrails(DUMMY_TRAILS)
      setLocations(DUMMY_LOCATIONS)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImagePicker = () => {
    if (imageUris.length >= 5) {
      Alert.alert("알림", "최대 5장까지만 업로드할 수 있습니다.")
      return
    }

    const options = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    }

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return
      }

      if (response.assets && response.assets[0]) {
        const newImageUri = response.assets[0].uri
        setImageUris((prev) => [...prev, newImageUri])
      }
    })
  }

  const handleDeleteImage = (indexToDelete) => {
    setImageUris((prev) => prev.filter((_, index) => index !== indexToDelete))
  }

  const handleAIAnalysis = () => {
    // AI 분석 기능 시뮬레이션
    Alert.alert("AI 분석", "AI가 이미지를 분석하여 쓰레기 정보를 자동으로 입력합니다.", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "분석하기",
        onPress: () => {
          // AI 분석 결과 시뮬레이션
          setTitle("AI 분석: 플라스틱 쓰레기")
          setAmount("보통")
          Alert.alert("완료", "AI 분석이 완료되었습니다.")
        },
      },
    ])
  }

  const handleSubmit = () => {
    if (!title.trim() || !selectedTrail || !selectedLocation || !amount.trim()) {
      Alert.alert("오류", "모든 필드를 입력해주세요.")
      return
    }

    // 서버로 데이터 전송 시뮬레이션
    const reportData = {
      title: title.trim(),
      trail: selectedTrail,
      location: selectedLocation,
      amount: amount.trim(),
      imageUris, // 배열로 변경
      timestamp: new Date().toISOString(),
    }

    console.log("제보 데이터:", reportData)

    // TODO: 실제 API 호출
    // try {
    //   await submitTrashReport(reportData);
    //   setModalVisible(true);
    // } catch (error) {
    //   Alert.alert('오류', '제보 전송에 실패했습니다.');
    // }

    setModalVisible(true)
  }

  const renderTrailSelector = () => (
    <TouchableOpacity style={styles.selectBox} onPress={() => setTrailModalVisible(true)}>
      <Text style={[styles.selectText, !selectedTrail && styles.placeholderText]}>
        {selectedTrail ? selectedTrail.name : "산책로 선택하기"}
      </Text>
      <Icon name="place" size={20} color="#555" />
    </TouchableOpacity>
  )

  const renderLocationSelector = () => (
    <TouchableOpacity style={styles.selectBox} onPress={() => setLocationModalVisible(true)}>
      <Text style={[styles.selectText, !selectedLocation && styles.placeholderText]}>
        {selectedLocation ? selectedLocation.name : "위치 선택하기"}
      </Text>
      <Icon name="place" size={20} color="#555" />
    </TouchableOpacity>
  )

  const renderAmountSelector = () => (
    <TouchableOpacity style={styles.selectBox} onPress={() => setAmountModalVisible(true)}>
      <Text style={[styles.selectText, !amount && styles.placeholderText]}>{amount || "쓰레기 양 선택하기"}</Text>
      <Icon name="keyboard-arrow-down" size={20} color="#555" />
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>쓰레기 제보</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>등록</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* AI 분석 버튼 */}
        <TouchableOpacity style={styles.aiButton} onPress={handleAIAnalysis}>
          <Image source={require("../assets/ai-svgrepo-com.png")} style={styles.aiIcon} resizeMode="contain" />
          <Text style={styles.aiText}>AI 분석으로 쓰레기 정보 입력하기</Text>
          <Image source={require("../assets/check-square.png")} style={styles.checkIcon} resizeMode="contain" />
        </TouchableOpacity>

        {/* 사진 업로드 영역 */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageUploadBox} onPress={handleImagePicker}>
            <Text style={styles.imageCount}>{imageUris.length}/5</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity style={styles.imageDeleteButton} onPress={() => handleDeleteImage(index)}>
                  <Icon name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
            <Icon name="camera-alt" size={24} color="#418663" />
          </TouchableOpacity>
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

          <Text style={styles.label}>산책로</Text>
          {renderTrailSelector()}

          <Text style={styles.label}>쓰레기 위치</Text>
          {renderLocationSelector()}

          <Text style={styles.label}>쓰레기 양</Text>
          {renderAmountSelector()}
        </View>

        {/* 제보하기 버튼 */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>제보하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 모달들 */}
      <CommonModal
        visible={modalVisible}
        message="근처로 이동해서 주워주세요."
        onCancel={() => setModalVisible(false)}
        onConfirm={() => {
          setModalVisible(false)
          navigation.goBack()
        }}
      />

      {/* 산책로 선택 모달 */}
      <CommonModal
        visible={trailModalVisible}
        message="산책로를 선택하세요"
        onCancel={() => setTrailModalVisible(false)}
        onConfirm={() => setTrailModalVisible(false)}
        customContent={
          <View style={styles.modalContent}>
            {trails.map((trail) => (
              <TouchableOpacity
                key={trail.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedTrail(trail)
                  setTrailModalVisible(false)
                }}
              >
                <Text style={styles.modalItemText}>{trail.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      {/* 위치 선택 모달 */}
      <CommonModal
        visible={locationModalVisible}
        message="위치를 선택하세요"
        onCancel={() => setLocationModalVisible(false)}
        onConfirm={() => setLocationModalVisible(false)}
        customContent={
          <View style={styles.modalContent}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedLocation(location)
                  setLocationModalVisible(false)
                }}
              >
                <Text style={styles.modalItemText}>{location.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      {/* 쓰레기 양 선택 모달 */}
      <CommonModal
        visible={amountModalVisible}
        message="쓰레기 양을 선택하세요"
        onCancel={() => setAmountModalVisible(false)}
        onConfirm={() => setAmountModalVisible(false)}
        customContent={
          <View style={styles.modalContent}>
            {DUMMY_AMOUNTS.map((amountOption) => (
              <TouchableOpacity
                key={amountOption}
                style={styles.modalItem}
                onPress={() => {
                  setAmount(amountOption)
                  setAmountModalVisible(false)
                }}
              >
                <Text style={styles.modalItemText}>{amountOption}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
  },
  menuButton: {
    padding: 5,
  },
  menuText: {
    fontSize: 16,
    color: "#333333",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#418663",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  aiText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
    marginHorizontal: 10,
    flex: 1,
    textAlign: "center",
  },
  imageSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  imageUploadBox: {
    width: 50,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#418663",
    borderRadius: 5,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 5,
  },
  imageCount: {
    fontSize: 10,
    fontWeight: "600",
    color: "#418663",
  },
  imageScrollView: {
    flexDirection: "row",
    marginHorizontal: 10,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  uploadedImage: {
    width: 65,
    height: 50,
    borderRadius: 5,
  },
  imageDeleteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: "#D9D9D9",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#418663",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
    marginTop: 20,
  },
  textInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#F1F1F1",
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 33,
  },
  selectText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  placeholderText: {
    color: "rgba(51, 51, 51, 0.5)",
  },
  submitButton: {
    backgroundColor: "#418663",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 0,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    maxHeight: 200,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333333",
  },
  aiIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  checkIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
  },
})
