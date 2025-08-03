// 📁 TrashCanInfoScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';

export default function TrashCanInfoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* ✅ 지도 영역 더미 - 나중에 Google Map 또는 KakaoMap 연동 */}
      <View style={styles.mapBox}>
        <Text style={styles.mapText}>[지도 영역 - 쓰레기통 위치]</Text>
      </View>

      {/* ✅ 쓰레기통 상세 정보 영역 */}
      <View style={styles.infoBox}>

        {/* ✅ 상세 정보 상단: 타입 텍스트 + 기관 로고 */}
        <View style={styles.headerRow}>
          {/* 📌 쓰레기통 종류 - 나중에 DB에서 받아올 값 */}
          <Text style={styles.trashType}>일반 쓰레기통</Text>

          {/* 📌 로고 이미지 - 기관별 이미지도 추후 서버에서 받아올 수 있도록 설정
          <Image source={require('../assets/trash_logo.png')} style={styles.trashLogo} /> */}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>위치</Text>
          {/* 📌 백엔드에서 가져온 쓰레기통 주소를 여기에 표시 */}
          <Text style={styles.value}>서울특별시 구로구 구로중앙로 135-6</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>설치장소명</Text>
          <Text style={styles.value}>도로변</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>세부위치</Text>
          <Text style={styles.value}>녹색병원 정문 앞</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>관리기관 전화번호</Text>
          <Text style={styles.phone}>061-860-6054</Text>
        </View>

        {/* ✅ 길찾기 버튼 - 나중에 네비게이션 연동 */}
        <TouchableOpacity style={styles.navigateBtn}>
          <Text style={styles.navigateText}>길찾기 안내</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapBox: {
    height: 300,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#555',
  },
  infoBox: {
    padding: 20,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    color: '#222',
    flex: 1,
    textAlign: 'right',
  },
  phone: {
    color: '#777',
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    textAlign: 'right',
  },
  navigateBtn: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  navigateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});