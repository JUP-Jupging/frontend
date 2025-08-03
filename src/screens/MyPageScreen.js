// 📁 screens/MyPageScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CommonModal from '../components/CommonModal'; // ✅ 모달 컴포넌트 임포트


export default function MyPageScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ 추후 DB에서 받아올 유저 데이터
  const user = {
    nickname: '쓰레기 줍기 장인',
    email: 'trasxh@kakao.com',
    region: '서울 특별시',
  };

  // ✅ 확인 버튼 누르면 삭제 실행
  const handleDeleteAccount = () => {
    // 여기에서 실제 삭제 API 호출
    console.log('계정 삭제 처리됨');

    setModalVisible(false); // 모달 닫기
navigation.reset({
  index: 0,
  routes: [{ name: 'Login' }],
});
  };

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 */}
      <Text style={styles.title}>프로필</Text>

      {/* ✅ 프로필 이미지 */}
<View style={styles.profileImageContainer}>
  <TouchableOpacity>
    <Text style={styles.changePhotoText}>프로필 사진 바꾸기</Text>
  </TouchableOpacity>
</View>
      {/* 사용자 정보 표시 */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>닉네임</Text>
        <Text>{user.nickname}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>이메일</Text>
        <Text>{user.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>활동 지역</Text>
        <Text>{user.region}</Text>
      </View>

      {/* 설정 변경 */}
    <TouchableOpacity
      style={styles.settingRow}
      onPress={() => navigation.navigate('ChangeNickname')}
    >
      <Text style={styles.infoLabel}>닉네임 변경</Text>
      <Text>{'>'}</Text>
    </TouchableOpacity>
<TouchableOpacity
  style={styles.settingRow}
  onPress={() => navigation.navigate('ChangePassword')}
>
  <Text style={styles.infoLabel}>비밀번호 변경</Text>
  <Text>{'>'}</Text>
</TouchableOpacity>
    <View style={styles.container}>
      {/* ✅ 계정 삭제 버튼 */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.deleteText}>계정 삭제</Text>
      </TouchableOpacity>

      {/* ✅ 모달 컴포넌트 */}
      <CommonModal
        visible={modalVisible}
        message="정말 계정을 삭제하시겠습니까?"
        onCancel={() => setModalVisible(false)} // 취소
        onConfirm={handleDeleteAccount}         // 확인
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoText: {
    color: '#4CAF50',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 60,
    alignItems: 'center',
  },
  deleteText: {
    color: '#999',
    fontSize: 16,
  },
});
