// 📁 TrashCanInfoScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TrashCanInfoScreen({ navigation, route }) {
  // 쓰레기통 위치 (더미 데이터)
  const trashCanLocation = {
    latitude: 37.548,
    longitude: 126.985,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>쓰레기통 정보</Text>
        <TouchableOpacity>
          <Icon name="person" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 지도 영역 */}
      <View style={styles.mapBox}>
        <MapView
          style={styles.map}
          region={trashCanLocation}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={{
              latitude: trashCanLocation.latitude,
              longitude: trashCanLocation.longitude
            }}
            title="일반 쓰레기통"
            description="서울특별시 구로구 구로중앙로 135-6"
          >
            <View style={styles.markerContainer}>
              <Image
                source={require('../assets/trash-02.png')}
                style={styles.markerIcon}
              />
            </View>
          </Marker>
        </MapView>
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
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  mapBox: {
    width: '100%',
    height: 350,
    backgroundColor: '#eee',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  infoBox: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  trashType: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  trashLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  label: {
    fontWeight: '400',
    color: '#666',
    fontSize: 14,
    width: 90,
    textAlign: 'left',
  },
  value: {
    color: '#333',
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
    fontWeight: '400',
    marginLeft: 20,
  },
  phone: {
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '400',
    marginLeft: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#418663',
    borderRadius: 25,
    height: 50,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
    marginTop: 10,
  },
  navigateIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  navigateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});