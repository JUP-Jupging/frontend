// 📁 screens/ChangePasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CommonModal from '../components/CommonModal'; // ✅ 모달 컴포넌트 임포트

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // ✅ 모달 상태
const handleSave = () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
    return;
  }

  if (newPassword !== confirmPassword) {
    Alert.alert('비밀번호 불일치', '새 비밀번호가 일치하지 않습니다.');
    return;
  }

  setModalVisible(true); // ✅ 여기까지만 실행
};
  // ✅ 비밀번호 변경 최종 실행
const confirmChange = () => {
  setModalVisible(false);
  // TODO: API 호출
  console.log('비밀번호 변경 완료');
  Alert.alert('완료', '비밀번호가 성공적으로 변경되었습니다.');
  navigation.goBack(); // ✅ 이 타이밍에 이동
};

    const cancelChange = () => {
        setModalVisible(false);
    };
 return (
    <>
      <View style={styles.container}>
        {/* ✅ 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>비밀번호변경</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.doneText}>완료</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ 입력 필드 */}
        <Text style={styles.label}>현재 비밀번호</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Text style={styles.label}>새 비밀번호</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>새 비밀번호 확인</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* ✅ 확인 모달 */}
      <CommonModal
        visible={modalVisible}
        message="비밀번호를 변경하시겠습니까?"
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    fontSize: 16,
  },
});
