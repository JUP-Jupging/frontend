// 📁 screens/ChangeNicknameScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// ⛳ 정확한 위치 확인: components 폴더 내부에 있는 CommonModal.js
import CommonModal from '../components/CommonModal'; // ✅ 모달 임포트

export default function ChangeNicknameScreen() {
    const navigation = useNavigation();
    const [nickname, setNickname] = useState('쓰레기 주우13초'); // TODO: 사용자 정보에서 불러오기

    const handleSave = () => {
        // TODO: 닉네임 업데이트 API 호출
        console.log('닉네임 변경:', nickname);
        
        setModalVisible(true); // ✅ 모달 오픈
    };
 const [modalVisible, setModalVisible] = useState(false); // ✅ 모달 상태

    return (
        <>
 <View style={styles.container}>
  {/* ✅ 상단 헤더 */}
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Text style={styles.backText}>{'<'}</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.submitBtn} onPress={() => setModalVisible(true)}>
      <Text style={styles.submitText}>닉네임 변경</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={handleSave}>
      <Text style={styles.doneText}>완료</Text>
    </TouchableOpacity>
  </View>

  {/* ✅ 닉네임 입력 등 다른 내용 */}
  {/* ... */}

            {/* ✅ 입력창 */}
            <Text style={styles.label}>닉네임</Text>
            <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임 입력"
            />
        </View>
        {/* ✅ 반드시 최상단 View 외부에 위치해야 함 */}
<CommonModal
  visible={modalVisible}
  message="닉네임을 변경하시겠습니까?"
  onCancel={() => setModalVisible(false)}
  onConfirm={async () => {
    try {
      setModalVisible(false);

      // ✅ 1. 닉네임 백엔드로 전송 (예: fetch 또는 axios)
      // TODO: 실제 API 주소와 POST 방식으로 교체 필요
      /*
      await fetch('https://your-backend.com/api/update-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      */

      console.log('닉네임 변경됨:', nickname); // 확인용 로그

      // ✅ 2. 성공 시 이전 화면으로 이동
      navigation.goBack();
    } catch (error) {
      console.error('닉네임 변경 오류:', error);
      // TODO: 실패 시 사용자에게 알림 처리 필요
    }
  }}
/>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        position: 'absolute',
        top: 30,
        height: 60,
        width: '100%',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    submitText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 60,
        color: '#4CAF50',
    },
    backText: {
        fontSize: 18,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingRight: 160,
    },
    doneText: {
        fontSize: 16,
        color: '#4CAF50',
        marginLeft: 30,
    },
    label: {
        fontSize: 14,
        marginTop: 40,
        marginBottom: 8,
        color: '#555',
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
        fontSize: 16,
    },
});
