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
          <Image source={require('../assets/seoul.png')} style={styles.trashLogo} />

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
        {/* divider */}
        <View style={styles.divider} />

        {/* ✅ 길찾기 버튼 - 나중에 네비게이션 연동 */}
        <TouchableOpacity style={styles.navigateBtn}>
          <Image
            source={require('../assets/navigation-pointer.png')}
            style={styles.navigateIcon}
          />
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
    width: '100%',
    aspectRatio: 360 / 350, // 피그마 비율 참고
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  infoBox: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  trashType: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  trashLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  label: {
    fontWeight: '600',
    color: '#AAB2C8',
    fontSize: 16,
    width: 110,
  },
  value: {
    color: '#333',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  phone: {
    color: '#797982',
    backgroundColor: 'rgba(153,153,153,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '500',
    minWidth: 120,
    flex: 1,

  },
    divider: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(170,178,200,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 38,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#418663',
    borderRadius: 30,
    height: 44,
    width: '70%',
    alignSelf: 'center',
    gap: 8,
  },
  navigateIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
    resizeMode: 'contain',
  },
  navigateText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.24,
  },
});