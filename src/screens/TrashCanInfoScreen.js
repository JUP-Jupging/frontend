import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, Image, Dimensions, SafeAreaView, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 37.5665,
  longitude: 126.9780,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const dummyTrashCans = [
  {
    id: 1,
    latitude: 37.567,
    longitude: 126.9784,
    type: '재활용 쓰레기통',
    location: '서울 중구 무교로 21',
    placeName: '서울시청 앞',
    details: '시청 광장 앞 인도변',
    phone: '02-123-4567',
    logo: require('../assets/image232.png'),
  },
  {
    id: 2,
    latitude: 37.5655,
    longitude: 126.9775,
    type: '일반 쓰레기통',
    location: '서울 중구 을지로 1가',
    placeName: '을지로입구역 1번 출구',
    details: '출구 계단 옆',
    phone: '02-234-5678',
    logo: require('../assets/image232.png'),
  },
];

export default function TrashCanMapScreen({ navigation }) {
  const { currentLocation, mapRef } = useLocation();
  const [selectedTrashCan, setSelectedTrashCan] = useState(null);

  const handleCloseSheet = () => setSelectedTrashCan(null);
  const goBack = () => navigation.goBack();
  const goToProfile = () => navigation.navigate("내 플로깅 기록");

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        zoom: 17,
      }, { duration: 1000 });
    }
  }, [currentLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 주변 쓰레기통</Text>
        <TouchableOpacity onPress={goToProfile}>
          <Icon name="account-circle" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        initialRegion={INITIAL_REGION}
      >
        {dummyTrashCans.map(can => (
          <Marker
            key={can.id}
            coordinate={{ latitude: can.latitude, longitude: can.longitude }}
            onPress={() => setSelectedTrashCan(can)}
          />
        ))}
      </MapView>

      <Modal
        visible={!!selectedTrashCan}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseSheet}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCloseSheet}>
          <View style={styles.infoBox}>
            <View style={styles.headerRow}>
              <Text style={styles.trashType}>{selectedTrashCan?.type}</Text>
              {selectedTrashCan?.logo && (
                <Image source={selectedTrashCan.logo} style={styles.trashLogo} />
              )}
            </View>
            <View style={styles.infoRow}><Text style={styles.label}>위치</Text><Text style={styles.value}>{selectedTrashCan?.location}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>설치장소명</Text><Text style={styles.value}>{selectedTrashCan?.placeName}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>세부위치</Text><Text style={styles.value}>{selectedTrashCan?.details}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>관리기관 전화번호</Text><View style={{ flex: 1, alignItems: 'flex-end' }}><Text style={styles.phone}>{selectedTrashCan?.phone}</Text></View></View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.navigateBtn}
              onPress={() => {
                if (currentLocation && selectedTrashCan) {
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${selectedTrashCan.latitude},${selectedTrashCan.longitude}&travelmode=walking`;
                  Linking.openURL(url);
                }
              }}
            >
              <Text style={styles.navigateText}>길찾기 안내</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 5,
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
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(170,178,200,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#418663',
    borderRadius: 30,
    height: 48,
    width: '80%',
    alignSelf: 'center',
    gap: 8,
  },
  navigateText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
