"use client"

import { useState, useCallback } from "react"
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, Dimensions, Modal } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CommonModal from "../components/CommonModal"
import { launchImageLibrary } from 'react-native-image-picker'
import { getMyPage, updateProfileImage, updateNickname, updateActivityRegion } from "../api/mypage";
import { useAuth } from "../stores/useAuth";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
const REGION_LIST = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도"
];

export default function MyPageScreen({ navigation }) {
  const accessToken = useAuth((s) => s.accessToken);
  const [modalVisible, setModalVisible] = useState(false)
  const [profileImage, setProfileImage] = useState(require("../assets/profile.png"))
  const [region, setRegion] = useState("지역을 선택하세요")
  const [regionModal, setRegionModal] = useState(false)
  const [confirmRegionModal, setConfirmRegionModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [user, setUser] = useState(null);
  const [confirmProfileModal, setConfirmProfileModal] = useState(false);
  const [pendingProfileImage, setPendingProfileImage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      async function fetchUser() {
        try {
          const data = await getMyPage(accessToken);
          setUser(data);
          setProfileImage(data.profileImageUrl ? { uri: data.profileImageUrl } : require("../assets/profile.png"));
          setRegion(data.activityRegion || "지역을 선택하세요");
        } catch (e) {
          console.error("유저 정보 불러오기 실패:", e);
        }
      }
      if (accessToken) fetchUser();
    }, [accessToken])
  );

  const handleDeleteAccount = () => {
    // 실제 삭제 API 호출 위치
    console.log("계정 삭제 처리됨")
    setModalVisible(false)
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  }

  // 프로필 사진 선택
  const handleChangeProfilePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 500,
      maxHeight: 500,
      selectionLimit: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('사용자가 사진 선택을 취소했습니다.');
      } else if (response.error) {
        console.error('사진 선택 중 오류 발생:', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setPendingProfileImage(selectedImage); // 임시 저장
        setConfirmProfileModal(true); // 변경 확인 모달 띄우기
      }
    });
  };

  // 프로필 사진 변경 확인
  const handleConfirmProfileChange = async () => {
    if (!pendingProfileImage) return;
    setConfirmProfileModal(false);
    setProfileImage({ uri: pendingProfileImage.uri }); // UI에 바로 반영
    try {
      await updateProfileImage(accessToken, {
        uri: pendingProfileImage.uri,
        name: pendingProfileImage.fileName || "profile.jpg",
        type: pendingProfileImage.type || "image/jpeg",
      });
      const data = await getMyPage(accessToken);
      setUser(data);
      if (data.profileImageUrl) setProfileImage({ uri: data.profileImageUrl });
    } catch (e) {
      console.error("프로필 이미지 업로드 실패:", e);
    }
    setPendingProfileImage(null);
  };

  const handleSelectRegion = (item) => {
    setSelectedRegion(item);
    setRegionModal(false);
    setConfirmRegionModal(true);
  };

  const handleConfirmRegionChange = async () => {
    try {
      await updateActivityRegion(accessToken, selectedRegion);
      setRegion(selectedRegion);
      setConfirmRegionModal(false);
      // 필요시 getMyPage로 최신 정보 반영
    } catch (e) {
      console.error("활동 지역 변경 실패:", e);
      setConfirmRegionModal(false);
    }
  };

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
            <Text style={styles.infoValue}>{user?.appNickname || "닉네임 없음"}</Text>
            <TouchableOpacity onPress={() => {
              navigation.navigate("ChangeNickname", { onChange: handleChangeNickname });
            }}>
              <Icon name="chevron-right" size={24} color="#131214" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{user?.email || ""}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>활동 지역</Text>
            <TouchableOpacity style={styles.regionRow} onPress={() => setRegionModal(true)}>
              <Text style={[styles.infoValue, { color: region === "지역을 선택하세요" ? "#aaa" : "#333" }]}>
                {region}
              </Text>
              <Icon name="chevron-right" size={24} color="#131214" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 계정 삭제 버튼 */}
        <View style={styles.deleteSection}>
          <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.deleteText}>계정 삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* 프로필 사진 변경 확인 모달 */}
      <CommonModal
        visible={confirmProfileModal}
        message="이 사진으로 프로필을 변경하시겠습니까?"
        onCancel={() => {
          setConfirmProfileModal(false);
          setPendingProfileImage(null);
        }}
        onConfirm={handleConfirmProfileChange}
      />      
      {/* 지역 선택 모달 */}
      <Modal visible={regionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.regionModal}>
            <Text style={styles.regionModalTitle}>지역을 선택하세요</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {REGION_LIST.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.regionItem}
                  onPress={() => handleSelectRegion(item)}
                >
                  <Text style={styles.regionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.regionCancel} onPress={() => setRegionModal(false)}>
              <Text style={{ color: "#418663", fontWeight: "bold" }}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* 지역 변경 확인 모달 */}
      <CommonModal
        visible={confirmRegionModal}
        message={`${selectedRegion}로 활동 지역을 바꾸시겠습니까?`}
        onCancel={() => setConfirmRegionModal(false)}
        onConfirm={handleConfirmRegionChange}
      />
      {/* 계정 삭제 확인 모달 */}
      <CommonModal
        visible={modalVisible}
        message="정말 계정을 삭제하시겠습니까?"
        onCancel={() => setModalVisible(false)}
        onConfirm={handleDeleteAccount}
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
    width: 34,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  regionModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: screenWidth * 0.6,
    alignItems: "center",
  },
  regionModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  regionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
    alignItems: "center",
  },
  regionText: {
    fontSize: 16,
    color: "#333",
  },
  regionCancel: {
    marginTop: 10,
    padding: 10,
  },
  regionRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
})