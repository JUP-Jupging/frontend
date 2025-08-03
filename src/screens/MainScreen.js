// 📁 MainScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function MainScreen({ navigation }) {
  const goToRealtimePlogging = () => navigation.navigate('RealtimePlogging');
const goToRecommend = () => navigation.navigate('추천 코스');
const goToReport = () => navigation.navigate('쓰레기 제보');
const goToPlogging = () => navigation.navigate('PloggingStart');
  const goToTrashBin = () => navigation.navigate('TrashCan');
  const goToMyPage = () => navigation.navigate('나의 활동');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}  // ✅ 탭바 공간 확보
    >
      {/* 상단 로고 및 마이페이지 아이콘 */}

      <View style={styles.headerRow}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>Jupging</Text>
        </View>

<TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('코스 검색')}>
  <Text style={styles.searchPlaceholder}>🔍 산책로 검색</Text>
</TouchableOpacity>


        <TouchableOpacity style={styles.userBox} onPress={goToMyPage}>
          <Image source={require('../assets/user.png')} style={styles.userIcon} />
        </TouchableOpacity>
      </View>


      {/* 오른쪽: 두 개 카드 세로 정렬 */}
<View style={styles.topRow}>
  {/* 좌측 배너 */}
  <View style={styles.leftBanner}>
    <Text style={styles.bannerText}>주변 산책로를{'\n'}정리하고 싶다면</Text>
  </View>

  {/* 우측 카드 두 개 */}
  <View style={styles.rightCards}>
    <TouchableOpacity style={styles.ploggingCard} onPress={goToRealtimePlogging}>
      <Text style={styles.cardTitle}>진행중인 플로깅</Text>
      <Text style={styles.cardLink}>실시간 플로깅 </Text>
    </TouchableOpacity>

    <View style={styles.ploggingCard}>
      <Text style={styles.cardTitle}>오늘의 플로깅</Text>
      <Text style={styles.cardDetail}>0 / 1시간</Text>
      <Text style={styles.cardDetail}>0.0 / 3km</Text>
      <Text style={styles.cardDetail}>주운 쓰레기 수: 0개</Text>
    </View>
  </View>
</View>

      {/* 기능 아이콘 4개 */}
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

      {/* 문장 배너 */}
      <View style={styles.missionBanner}>
        <Text style={styles.missionText}>산책로를 깨끗하게 만드는데 동참하세요.</Text>
      </View>

      {/* 추천 PICK 영역 */}
      <View>
        <Text style={styles.pickTitle}>줍깅 PICK 추천코스 🎉</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={styles.pickCard}>
            <Image source={require('../assets/course1.jpg')} style={styles.pickImage} />
            <Text style={styles.pickCourseName}>국립 중앙 박물관</Text>
            <Text style={styles.pickDistance}>7.1km  |  1시간30분</Text>
          </View>
          <View style={styles.pickCard}>
            <Image source={require('../assets/course2.jpg')} style={styles.pickImage} />
            <Text style={styles.pickCourseName}>국립 중앙 박물관</Text>
            <Text style={styles.pickDistance}>7.1km  |  1시간30분</Text>
          </View>
        </ScrollView>
      </View>
    </ScrollView >
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },

  // 🔼 헤더 (로고 + 유저 아이콘)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 12,
  },

  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 100,
  },


  searchBar: {
    flex: 4,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 8,
  },

  searchPlaceholder: {
    color: '#888',
    fontSize: 14,
  },

  userBox: {
    flex: 1,
    alignItems: 'flex-end',
  },

  userIcon: {
    width: 28,
    height: 28,
  },

  // 🆕 상단 좌-우 레이아웃 (배너 + 카드)
topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'stretch',       // 🔥 높이 맞추기
  gap: 8,
  marginBottom: 24,
},

leftBanner: {
  width: '45%',
  borderRadius: 12,
  overflow: 'hidden',
  position: 'relative',
},

bannerImage: {
  width: '100%',
  aspectRatio: 3 / 4,
  resizeMode: 'cover',
},

bannerText: {
  position: 'absolute',
  top: 16,
  left: 12,
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 22,
},

rightCards: {
  width: '50%',
  justifyContent: 'space-between',
},

ploggingCard: {
  flex: 1,
  backgroundColor: '#F5F5F5',
  borderRadius: 10,
  padding: 12,
  marginBottom: 8,
},

cardTitle: {
  fontSize: 14,
  fontWeight: 'bold',
  marginBottom: 4,
},

cardLink: {
  fontSize: 13,
  color: '#4CAF50',
},

cardDetail: {
  fontSize: 13,
  color: '#555',
},


  // 🔽 아이콘 영역
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  icon: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // ✅ 문장 배너
  missionBanner: {
    backgroundColor: '#C8E6C9',
    padding: 50,
    borderRadius: 10,
    marginBottom: 20,
  },
  missionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    color: '#2E7D32',
  },

  // ✅ PICK 추천코스
  pickTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 8,
    marginBottom: 10

  },
  pickCard: {
    marginLeft: 8,
    marginRight: 12,
  },
  pickImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
  },
  pickCourseName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  pickDistance: {
    fontSize: 12,
    color: '#666',
  },
});
