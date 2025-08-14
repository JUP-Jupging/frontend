"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import { launchImageLibrary } from 'react-native-image-picker' // 이미지 경로를 올바르게 설정해야 합니다.  
const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function MyPageScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false)
  const [profileImage, setProfileImage] = useState(require("../assets/profile.png")) // 기본 프로필 이미지
  // 추후 DB에서 받아올 유저 데이터
  const user = {
    nickname: "쓰레기줍기장인",
    email: "trasxh@kakao.com",
    region: "서울특별시",
  }

  // 확인 버튼 누르면 삭제 실행
  const handleDeleteAccount = () => {
    // 여기에서 실제 삭제 API 호출
    console.log("계정 삭제 처리됨")
    setModalVisible(false) // 모달 닫기
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  }

  const handleChangeProfilePhoto = () => { 
    const options = {
      mediaType: 'photo',
      quality: 1,
        selectionLimit: 1,

    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('사용자가 사진 선택을 취소했습니다.');
      } else if (response.error) {
        console.error('사진 선택 중 오류 발생:', response.error);
      }
      else if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        setProfileImage({ uri: selectedImageUri});
        // 여기에서 선택된 이미지를 서버에 업로드하거나 상태에 저장하는 로직을 추가하세요.
        console.log('선택된 이미지:', selectedImageUri);
      }
    });
  } 
  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="rgba(19, 18, 20, 0.5)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 프로필 이미지 섹션 */}
        <View style={styles.profileSection}>
          <Image source={profileImage} style={styles.profileImage} />
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangeProfilePhoto}>
            <Text style={styles.changePhotoText}>프로필 사진 바꾸기</Text>
          </TouchableOpacity>
        </View>

        {/* 사용자 정보 섹션 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>닉네임</Text>
            <Text style={styles.infoValue}>{user.nickname}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ChangeNickname")}>
          <Icon name="chevron-right" size={24} color="#131214" />
        </TouchableOpacity>

          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>활동 지역</Text>
            <Text style={styles.infoValue}>{user.region}</Text>
          </View>
        </View>


        {/* 계정 삭제 버튼 */}
        <View style={styles.deleteSection}>
          <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.deleteText}>계정 삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 모달 컴포넌트 */}
      <CommonModal
        visible={modalVisible}
        message="정말 계정을 삭제하시겠습니까?"
        onCancel={() => setModalVisible(false)} // 취소
        onConfirm={handleDeleteAccount} // 확인
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
  headerSpacer: {
    width: 34, // backButton과 같은 크기로 중앙 정렬
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 20,
  },
  changePhotoButton: {
    paddingVertical: 5,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#418663",
    letterSpacing: -0.1,
  },
  infoSection: {
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  infoLabel: {
    fontSize: 16,
    marginRight: 180,
    fontWeight: "700",
    color: "#333333",
    letterSpacing: -0.1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "400",
    color: "#333333",
    letterSpacing: -0.1,
  },
  settingsSection: {
    marginBottom: 60,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    letterSpacing: -0.1,
  },
  deleteSection: {
    alignItems: "center",
    marginTop: 100,
  },
  deleteButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(51, 51, 51, 0.5)",
    letterSpacing: -0.1,
  },
})
