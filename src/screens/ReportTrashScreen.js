// 📁 screens/ReportTrashScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CommonModal from '../components/CommonModal'; // ✅ 모달 임포트

export default function ReportTrashScreen({ navigation }) {
  // 📌 더미 데이터
  const [title, setTitle] = useState('마로니에 공원 쓰레기');
  const [trail, setTrail] = useState('산책로 체크하기');
  const [location, setLocation] = useState('위치 불러오기');
  const [amount, setAmount] = useState('많음');
  // const [imageUri, setImageUri] = useState(require('../assets/dummy_trash.jpg'));
 const [modalVisible, setModalVisible] = useState(false); // ✅ 모달 상태



  // TODO: 서버에서 산책로 목록 및 위치 데이터 받아오기
  // useEffect(() => {
  //   fetchTrailList();
  //   fetchCurrentLocation();
  // }, []);

  const handleSubmit = () => {
    // TODO: 백엔드로 POST 요청 보내기
        setModalVisible(true); // ✅ 모달 오픈

    console.log('제보 데이터 전송');
  };

  return (
    <>
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ AI 분석 버튼 */}
      <TouchableOpacity style={styles.aiButton}>
        <Text style={styles.aiText}>AI 분석으로 쓰레기 정보 입력하기</Text>
        <Icon name="check" size={20} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>

      {/* ✅ 사진 업로드 영역 */}
      {/* <View style={styles.imageBox}>
        <Image source={imageUri} style={styles.image} />
        <TouchableOpacity style={styles.imageDelete}>
          <Icon name="close" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.imageCount}>1/1</Text>
      </View> */}

      {/* ✅ 입력 폼 영역 */}
      <Text style={styles.label}>제목</Text>
      <TextInput value={title} editable={false} style={styles.inputDisabled} />

      <Text style={styles.label}>산책로</Text>
      <TouchableOpacity style={styles.selectBox}>
        <Text>{trail}</Text>
        <Icon name="place" size={20} color="#555" />
      </TouchableOpacity>

      <Text style={styles.label}>쓰레기 위치</Text>
      <TouchableOpacity style={styles.selectBox}>
        <Text>{location}</Text>
        <Icon name="place" size={20} color="#555" />
      </TouchableOpacity>

      <Text style={styles.label}>쓰레기 양</Text>
      <TextInput value={amount} editable={false} style={styles.inputDisabled} />
      {/* ✅ 하단 버튼 */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>제보하기</Text>
      </TouchableOpacity>
      {/* ✅ 모달 삽입 */}
    </ScrollView>
    {/* ✅ 반드시 ScrollView 밖에 위치해야 함 */}
    <CommonModal
      visible={modalVisible}
      message="근처로 이동해서 주워주세요."
      onCancel={() => setModalVisible(false)}
      onConfirm={() => {
        setModalVisible(false);
        console.log("다시 줍기 클릭됨");
              navigation.goBack();

      }}
    />
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  aiButton: {
    backgroundColor: '#418f69',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  imageBox: {
    marginBottom: 24,
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: 180,
    height: 120,
    borderRadius: 8,
  },
  imageDelete: {
    position: 'absolute',
    top: 0,
    right: 100,
    backgroundColor: '#999',
    borderRadius: 10,
    padding: 2
  },
  imageCount: {
    marginTop: 6,
    color: '#555'
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600'
  },
  inputDisabled: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 18
  },
  selectBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  submitBtn: {
    marginTop: 30,
    backgroundColor: '#418f69',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
