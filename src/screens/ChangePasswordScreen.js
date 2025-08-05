"use client"

import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function ChangePasswordScreen() {
  const navigation = useNavigation()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.")
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("비밀번호 불일치", "새 비밀번호가 일치하지 않습니다.")
      return
    }
    if (newPassword.length < 6) {
      Alert.alert("비밀번호 오류", "비밀번호는 6자 이상이어야 합니다.")
      return
    }
    setModalVisible(true)
  }

  const confirmChange = async () => {
    try {
      setModalVisible(false)

      // TODO: 실제 API 호출
      /*
      await fetch('https://your-backend.com/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      });
      */

      console.log("비밀번호 변경 완료")
      Alert.alert("완료", "비밀번호가 성공적으로 변경되었습니다.")
      navigation.goBack()
    } catch (error) {
      console.error("비밀번호 변경 오류:", error)
      Alert.alert("오류", "비밀번호 변경에 실패했습니다.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 변경</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>완료</Text>
        </TouchableOpacity>
      </View>

      {/* 입력 폼 */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>현재 비밀번호</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="현재 비밀번호를 입력하세요"
            placeholderTextColor="rgba(51, 51, 51, 0.5)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>새 비밀번호</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="새 비밀번호를 입력하세요"
            placeholderTextColor="rgba(51, 51, 51, 0.5)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>새 비밀번호 확인</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="새 비밀번호를 다시 입력하세요"
            placeholderTextColor="rgba(51, 51, 51, 0.5)"
          />
        </View>
      </View>

      {/* 확인 모달 */}
      <CommonModal
        visible={modalVisible}
        message="비밀번호를 변경하시겠습니까?"
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
})
