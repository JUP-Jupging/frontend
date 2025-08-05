"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function ChangeNicknameScreen() {
  const navigation = useNavigation()
  const [nickname, setNickname] = useState("쓰레기줍기장인") // TODO: 사용자 정보에서 불러오기
  const [modalVisible, setModalVisible] = useState(false)

  const handleSave = () => {
    if (!nickname.trim()) {
      Alert.alert("입력 오류", "닉네임을 입력해주세요.")
      return
    }
    if (nickname.trim().length < 2) {
      Alert.alert("입력 오류", "닉네임은 2자 이상이어야 합니다.")
      return
    }
    setModalVisible(true)
  }

  const confirmChange = async () => {
    try {
      setModalVisible(false)

      // TODO: 실제 API 호출
      /*
      await fetch('https://your-backend.com/api/update-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      */

      console.log("닉네임 변경됨:", nickname.trim())
      Alert.alert("완료", "닉네임이 성공적으로 변경되었습니다.")
      navigation.goBack()
    } catch (error) {
      console.error("닉네임 변경 오류:", error)
      Alert.alert("오류", "닉네임 변경에 실패했습니다.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>닉네임 변경</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>완료</Text>
        </TouchableOpacity>
      </View>

      {/* 입력 폼 */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor="rgba(51, 51, 51, 0.5)"
            maxLength={20}
          />
          <Text style={styles.helperText}>2-20자 이내로 입력해주세요</Text>
        </View>
      </View>

      {/* 확인 모달 */}
      <CommonModal
        visible={modalVisible}
        message="닉네임을 변경하시겠습니까?"
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmChange}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: screenHeight * 0.06,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    letterSpacing: -0.1,
  },
  saveButton: {
    padding: 5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#418663",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#F1F1F1",
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
    letterSpacing: -0.1,
  },
  helperText: {
    fontSize: 12,
    color: "rgba(51, 51, 51, 0.6)",
    marginTop: 8,
    letterSpacing: -0.1,
  },
})
