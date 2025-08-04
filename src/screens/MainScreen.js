// 파일: MainScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

export default function MainScreen({ navigation }) {
  const goToRealtimePlogging = () => navigation.navigate('RealtimePlogging');
  const goToRecommend = () => navigation.navigate('추천 코스');
  const goToReport = () => navigation.navigate('쓰레기 제보');
  const goToPlogging = () => navigation.navigate('PloggingStart');
  const goToTrashBin = () => navigation.navigate('TrashCan');
  const goToMyPage = () => navigation.navigate('나의 활동');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} />
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('코스 검색')}>
          <Text style={styles.searchPlaceholder}>🔍 산책로 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.userBox} onPress={goToMyPage}>
          <Image source={require('../assets/user.png')} style={styles.userIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.topRow}>
        <View style={styles.leftBannerWrapper}>
          <Image source={require('../assets/trash_background.png')} style={styles.leftBanner} />
          <Text style={styles.bannerText}>주변 산책로를 정리하고 싶다면</Text>
        </View>

        <View style={styles.rightCards}>
          <TouchableOpacity style={styles.ploggingCardExpanded} onPress={goToRealtimePlogging}>
            <Text style={styles.cardTitle}>진행중인 플로깅</Text>
            <Text style={styles.cardLink}>실시간 플로깅</Text>
          </TouchableOpacity>

          <View style={styles.ploggingCardExpanded}>
            <Text style={styles.cardTitle}>오늘의 플로깅</Text>
            <Text style={styles.cardDetail}>0 / 1시간</Text>
            <Text style={styles.cardDetail}>0.0 / 3km</Text>
            <Text style={styles.cardDetail}>주운 쓰레기 수: 0개</Text>
          </View>
        </View>
      </View>

      <View style={styles.iconRow}>
        <TouchableOpacity onPress={goToRecommend}>
          <Image source={require('../assets/recommend.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>추천 코스</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToPlogging}>
          <Image source={require('../assets/search.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>플로깅 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToReport}>
          <Image source={require('../assets/report.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>쓰레기 제보</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToTrashBin}>
          <Image source={require('../assets/trashcan.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>쓰레기통</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.missionBanner}>
        <Image source={require('../assets/road.png')} style={styles.missionImage} />
        <Text style={styles.missionText}>산책로를 깨끗하게 만드는데 동참하세요.</Text>
      </View>

      <View style={styles.pickWrapper}>
        <Text style={styles.pickTitle}>줍깅 PICK 추천코스 🎉</Text>
        <View style={styles.pickTags}>
          <Text style={styles.tagSelected}># 가까운 곳</Text>
          <Text style={styles.tag}># 쓰레기 많은 곳</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.pickCard}>
            <Image source={require('../assets/course1.jpg')} style={styles.pickImage} />
            <Text style={styles.pickCourseName}>국립 중앙 박물관</Text>
            <Text style={styles.pickDistance}>7.1km | 1시간30분</Text>
          </View>
          <View style={styles.pickCard}>
            <Image source={require('../assets/course2.jpg')} style={styles.pickImage} />
            <Text style={styles.pickCourseName}>남산 서울타워</Text>
            <Text style={styles.pickDistance}>7.1km | 1시간30분</Text>
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12, gap: 12
  },
  logoImage: {
    width: screenWidth * 0.28,
    aspectRatio: 3.2,
    resizeMode: 'contain',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#888',
  },
  userBox: {
    width: 30,
    height: 30,
  },
  userIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  topRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  leftBannerWrapper: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  leftBanner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerText: {
    position: 'absolute',
    top: '0%',
    left: '10%',
    right: '10%',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
    padding: 6,
    borderRadius: 8,
    textAlign: 'center',
  },
  rightCards: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  ploggingCardExpanded: {
    flex: 1,
    backgroundColor: 'rgba(121,121,130,0.08)',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AAB2C8',
  },
  cardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B6B6B',
  },
  cardDetail: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 28,
  },
  icon: {
    width: 70,
    height: 70,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#797982',
    textAlign: 'center',
  },
  missionBanner: {
    marginTop: 20,
    alignItems: 'center',
  },
  missionImage: {
    width: '100%',
    aspectRatio: 3,
    height: 150,
    resizeMode: 'cover',
  },
  missionText: {
    position: 'absolute',
    top: '35%',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Pridi',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
  },
  pickWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  pickTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },
  pickTags: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  tagSelected: {
    backgroundColor: '#000022',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 10,
    lineHeight: 20,
  },
  tag: {
    borderColor: '#000',
    borderWidth: 0.5,
    color: '#797982',
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 10,
    lineHeight: 20,
  },
  pickCard: {
    width: 200,
    marginRight: 14,
  },
  pickImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  pickCourseName: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  pickDistance: {
    fontSize: 9,
    color: '#797982',
  },
    iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  iconBox: {
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
