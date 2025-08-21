import React, { useState, useEffect } from "react"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useLocation } from "../hooks/useLocation"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function RecommendCourseScreen({ navigation }) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [showStoryInput, setShowStoryInput] = useState(false)
  const [story, setStory] = useState("")
  const [inputSubmitted, setInputSubmitted] = useState(false)

  // 추천 결과 모달 관련 state
  const [modalVisible, setModalVisible] = useState(false)
  const [recommendResults, setRecommendResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loadingRecommend, setLoadingRecommend] = useState(false)

  // 위치 hook
  const { currentLocation } = useLocation()

  const goBack = () => navigation.goBack()
  const goToProfile = () => navigation.navigate("내 플로깅 기록")

  const handleAnalysisButton = () => {
    setShowStoryInput(true)
    setInputSubmitted(false)
  }

  const handleStorySubmit = () => {
    setInputSubmitted(true)
    Keyboard.dismiss()
  }

  const handleRecommendButton = async () => {
    setLoadingRecommend(true)
    try {
      const res = await axios.post("https://ai.jupging.store/recommend", {
        story: story,
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      })
      setRecommendResults(res.data.trails)
      setSelectedIndex(0)
      setModalVisible(true)
    } catch (err) {
      alert("추천 요청에 실패했습니다.")
    }
    setLoadingRecommend(false)
  }

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true))
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false))
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])
  useFocusEffect(
  React.useCallback(() => {
    setShowStoryInput(false)
    setStory("")
    setInputSubmitted(false)
    setRecommendResults([])
    setModalVisible(false)
    setSelectedIndex(0)
    setLoadingRecommend(false)
    // cleanup 필요 없으면 return 없음
  }, [])
)
  // 추천 결과 카드 렌더
const renderResultItem = ({ item }) => (
  <View style={styles.resultCard}>
    <Image
      source={item.img1 ? { uri: item.img1 } : require("../assets/ai-assistant2.png")}
      style={styles.resultImage}
      resizeMode="cover"
    />
    <Text style={styles.resultTitle}>{item.trail_name || item.title}</Text>
    <Text style={styles.resultAddress}>{item.lot_number_address}</Text>
    {/* reason 줄바꿈 없이 원래대로 출력 */}
    <Text style={styles.resultReason}>
      {item.reason}
    </Text>
  </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={goBack}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>산책로 추천</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={goToProfile}>
            <Icon name="person" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 데이터 기반 맞춤 추천 영역 */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.aiContainer}>
            <Text style={styles.aiSubtitle}>사연을 적어 데이터 기반으로 맞춤 추천을 받아보세요.</Text>
            <Text style={styles.aiTitle}>나에게 맞는 산책로는?</Text>
            <View style={styles.aiCard}>
              <View style={styles.aiImageContainer}>
                <Image
                  source={require("../assets/ai-assistant2.png")}
                  style={styles.aiRobotImage}
                  resizeMode="contain"
                />
              </View>
              {!showStoryInput ? (
                <TouchableOpacity style={styles.aiAnalysisButton} onPress={handleAnalysisButton}>
                  <Text style={styles.aiAnalysisButtonText}>원하는 산책로 스타일 입력하기</Text>
                </TouchableOpacity>
              ) : (
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  keyboardVerticalOffset={80}
                  style={{ width: "100%" }}
                >
                  <View style={styles.storyInputContainer}>
                    {!inputSubmitted ? (
                      <>
                        <TextInput
                          style={styles.storyInput}
                          multiline
                          value={story}
                          onChangeText={setStory}
                          placeholder={
                            "주말에 가족이랑 2~3km 가볍게, 화장실/편의점 있으면 좋아요.\n서울 동부권이면 베스트! 플로깅장소 추천해주세요"
                          }
                          placeholderTextColor="#BEBEBE"
                          onFocus={() => setIsKeyboardVisible(true)}
                          onBlur={() => setIsKeyboardVisible(false)}
                        />
                        <TouchableOpacity style={styles.storySubmitButton} onPress={handleStorySubmit}>
                          <Text style={styles.storySubmitButtonText}>입력 완료</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.storyPreview}>
                        <Text style={styles.storyPreviewText}>{story}</Text>
                        <TouchableOpacity style={styles.storyEditButton} onPress={() => setInputSubmitted(false)}>
                          <Text style={styles.storyEditButtonText}>수정</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </KeyboardAvoidingView>
              )}
            </View>
            <Text style={styles.aiDescription}>가고싶은 산책로의 성향, 분위기, 정보 등{"\n"} 원하는 산책 상황을 입력하고 추천 받아 보세요.</Text>
            <TouchableOpacity
              style={[
                styles.aiButton,
                (!inputSubmitted || !story.trim() || loadingRecommend) && { backgroundColor: "#BEBEBE" },
              ]}
              disabled={!inputSubmitted || !story.trim() || loadingRecommend}
              onPress={handleRecommendButton}
            >
              <Text style={styles.aiButtonText}>
                {loadingRecommend ? "추천 중..." : "데이터 기반 맞춤 추천 받기"}
              </Text>
            </TouchableOpacity>
            {loadingRecommend && (
              <View style={{ marginTop: 20 }}>
                <ActivityIndicator size="large" color="#418663" />
                <Text style={{ color: "#418663", marginTop: 8 }}>추천 결과를 불러오는 중...</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 추천 결과 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={recommendResults}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.trail_id?.toString() || item.id?.toString()}
              renderItem={renderResultItem}
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (screenWidth * 0.8 + 20))
                setSelectedIndex(idx)
              }}
              style={{ flexGrow: 0 }}
            />
            {/* 인디케이터 */}
            <View style={styles.indicatorContainer}>
              {recommendResults.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorDot,
                    selectedIndex === idx ? styles.indicatorActive : styles.indicatorInactive,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => {
                setModalVisible(false)
                navigation.navigate("CourseDetail", { trailId: recommendResults[selectedIndex].trail_id })
              }}
            >
              <Text style={styles.detailButtonText}>이 코스 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 하단탭 예시: 키보드가 올라오면 숨김 */}
      {!isKeyboardVisible && (
        <View style={styles.tabBar}>
          {/* 실제 하단탭 컴포넌트 또는 내용 삽입 */}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: screenHeight * 0.05,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: screenWidth * 0.078,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiContainer: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.067,
    paddingTop: 20,
    alignItems: "center",
  },
  aiSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
    marginBottom: 10,
    textAlign: "center",
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 30,
    textAlign: "center",
  },
  aiCard: {
    width: screenWidth * 0.867,
    minHeight: screenHeight * 0.25,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#BEBEBE",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 30,
  },
  aiImageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  aiRobotImage: {
    width: 200,
    height: 200,
  },
  aiAnalysisButton: {
    backgroundColor: "#C8DECB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  aiAnalysisButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#418663",
  },
  storyInputContainer: {
    width: "100%",
    alignItems: "center",
  },
  storyInput: {
    width: "100%",
    minHeight: 70,
    borderColor: "#C8DECB",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#F8F8F8",
    marginBottom: 10,
    textAlignVertical: "top",
  },
  storySubmitButton: {
    backgroundColor: "#418663",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  storySubmitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  storyPreview: {
    width: "100%",
    alignItems: "center",
  },
  storyPreviewText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  storyEditButton: {
    backgroundColor: "#C8DECB",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  storyEditButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#418663",
  },
  aiDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  aiButton: {
    backgroundColor: "#418663",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    width: screenWidth * 0.889,
  },
  aiButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: screenWidth * 0.9,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  resultCard: {
    width: screenWidth * 0.8,
    alignItems: "center",
    marginRight: 20,
  },
  resultImage: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    backgroundColor: "#EEE",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  resultAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  resultReason: {
    fontSize: 14,
    color: "#418663",
    marginBottom: 18,
    textAlign: "center",
  },
  detailButton: {
    backgroundColor: "#418663",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: "#999",
    fontSize: 14,
  },
  tabBar: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: "#418663",
  },
  indicatorInactive: {
    backgroundColor: "#C8DECB",
  },
})