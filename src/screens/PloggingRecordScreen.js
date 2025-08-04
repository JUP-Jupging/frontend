// 📁 PloggingRecordScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

export default function PloggingRecordScreen({ navigation }) {


  const goToPloggingAgain = () => {
    console.log('플로깅 더하기 클릭');
  };
const goToNearbyTrash = () => {
  navigation.navigate('TrashCanInfo'); // ✅ 정확한 name으로
};
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ 상단 유저 & 이미지 (추후 실제 사진 연동 필요) */}
      <View style={styles.headerBox}>
        
        <Image source={require('../assets/course2.jpg')} style={styles.courseImage} />
      </View>

      {/* ✅ 장소 및 요약 정보 */}
      <View style={styles.summaryBox}>
        <Text style={styles.placeName}>남산</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>플로깅 일자  25.07.07</Text>
          <Text style={styles.infoText}>플로깅 시간  00:48:30</Text>
          <Text style={styles.infoText}>운동 거리  5.11km</Text>
          <Text style={styles.infoText}>난이도  쉬움</Text>
        </View>
      </View>

      {/* ✅ 주운 쓰레기 목록 */}
      <View style={styles.trashBox}>
        <Text style={styles.trashTitle}>주운 쓰레기</Text>
        <Text style={styles.trashSub}>플로깅중 주운 쓰레기 기록입니다</Text>

        {/* ✅ 쓰레기 카드들 (더미) */}
        <View style={styles.trashCard}>
          <Text style={styles.trashIndex}>1</Text>
          <View style={styles.trashContent}>
            <Text style={styles.trashName}>풀속 쓰레기</Text>
            <Text style={styles.trashDetail}>플라스틱 병 외 7개</Text>
            <Text style={styles.tag}># 많음</Text>
          </View>
          <Image source={require('../assets/course1.jpg')} style={styles.trashImage} />
        </View>

        <View style={styles.trashCard}>
          <Text style={styles.trashIndex}>2</Text>
          <View style={styles.trashContent}>
            <Text style={styles.trashName}>나무 옆 쓰레기</Text>
            <Text style={styles.trashDetail}>유리병 외 7개</Text>
            <Text style={styles.tag}># 적음</Text>
          </View>
          <Image source={require('../assets/course2.jpg')} style={styles.trashImage} />
        </View>
      </View>

      {/* ✅ 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.addBtn} onPress={goToPloggingAgain}>
          <Text style={styles.addBtnText}>플로깅 더하기 ＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.findBinBtn} onPress={goToNearbyTrash}>
          <Text style={styles.findBinText}>근처 쓰레기통 찾기 🗑</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerBox: {
    alignItems: 'flex-end',
  },
  userIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  userIconImage: {
    width: 24,
    height: 24,
  },
  courseImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  summaryBox: {
    marginBottom: 16,
  },
  placeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  trashBox: {
    marginBottom: 20,
  },
  trashTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trashSub: {
    fontSize: 13,
    color: '#777',
    marginBottom: 12,
  },
  trashCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  trashIndex: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  trashContent: {
    flex: 1,
  },
  trashName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  trashDetail: {
    fontSize: 13,
    color: '#777',
  },
  tag: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  trashImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 10,
  },
  bottomButtons: {
    gap: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  findBinBtn: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  findBinText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
