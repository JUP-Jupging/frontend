// 📁 screens/MyPloggingScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MyPloggingScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('줍깅');

  return (
    <View style={styles.container}>
      {/* 🔼 프로필 상단 영역 */}
      <View style={styles.profileRow}>
        <Text style={styles.nickname}>쓰레기줍기장인</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyPageMain')}>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* 🔽 탭 영역 */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('줍깅')}>
          <Text style={activeTab === '줍깅' ? styles.activeTab : styles.inactiveTab}>줍깅 기록</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('신고')}>
          <Text style={activeTab === '신고' ? styles.activeTab : styles.inactiveTab}>제보 기록</Text>
        </TouchableOpacity>
      </View>

      {/* 🔽 탭에 따라 다른 내용 */}
      {activeTab === '줍깅' ? (
        <>
          <TouchableOpacity style={styles.actionBox}>
            <Text style={styles.plusText}>+ 플로깅 하러 가기</Text>
            <Text style={styles.subText}>플로깅을 통해 주위를 깨끗하게</Text>
          </TouchableOpacity>

          <View style={styles.recordBox}>
            <Text style={styles.recordTitle}>플로깅 기록</Text>
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text>쓰줍장의 쓰레기 기록</Text>
                <Text>2024.10.24 ~ 2024.10.26</Text>
                <Text>국립 중앙 박물관</Text>
              </View>
              {/* <Image source={require('../assets/map_dummy.png')} style={styles.mapImage} /> */}
            </View>
          </View>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.actionBox}>
            <Text style={styles.plusText}>🛎️ 쓰레기 제보 하러 가기</Text>
            <Text style={styles.subText}>쓰레기 제보를 통해 동네를 깨끗하게</Text>
          </TouchableOpacity>

          <View style={styles.recordBox}>
            <Text style={styles.recordTitle}>제보 기록</Text>
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text>쓰줍장의 쓰레기 제보</Text>
                <Text>2024.10.24 ~ 2024.10.26</Text>
                <Text>국립 중앙 박물관</Text>
              </View>
              {/* <Image source={require('../assets/map_dummy.png')} style={styles.mapImage} /> */}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 24,
    color: '#333',
    marginLeft: 8,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    color: '#000',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderColor: '#4CAF50',
  },
  inactiveTab: {
    color: '#777',
  },
  actionBox: {
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  plusText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  subText: {
    color: '#555',
    fontSize: 13,
  },
  recordBox: {
    marginTop: 20,
  },
  recordTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  mapImage: {
    width: 64,
    height: 64,
    marginLeft: 12,
  },
});
