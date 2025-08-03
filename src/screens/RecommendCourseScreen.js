// 📁 RecommendCourseScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const dummyCourses = [
  {
    id: '1',
    name: '국립 중앙 박물관',
    address: '서울 용산구 서빙고로 137 국립중앙박물관',
    difficulty: '# 쉬움',
  },
  {
    id: '2',
    name: '남산',
    address: '서울 중구 회현동1가',
    difficulty: '# 어려움',
  },
];

export default function RecommendCourseScreen({ navigation }) {
  const [tab, setTab] = useState('전체');
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionValue, setRegionValue] = useState(null);
  const [regionItems, setRegionItems] = useState([]); // ✅ 추후 API에서 set

  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [difficultyValue, setDifficultyValue] = useState(null);
  const [difficultyItems, setDifficultyItems] = useState([]); // ✅ 추후 API에서 set

  // ✅ 상단 탭 렌더링 함수
  const renderTabs = () => (
    <View style={styles.tabBox}>
      <TouchableOpacity
        style={[styles.tabBtn, tab === '전체' && styles.activeTab]}
        onPress={() => setTab('전체')}
      >
        <Text style={[styles.tabText, tab === '전체' && styles.activeText]}>전체</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabBtn, tab === 'AI' && styles.activeTab]}
        onPress={() => setTab('AI')}
      >
        <Text style={[styles.tabText, tab === 'AI' && styles.activeText]}>AI 기반 추천</Text>
      </TouchableOpacity>
    </View>
  );

const renderCourseItem = ({ item }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
  >
    <View style={styles.card}>
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardAddress}>{item.address}</Text>
        <Text style={styles.cardTag}>{item.difficulty}</Text>
      </View>
    </View>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      {renderTabs()}

      {tab === '전체' ? (
        <>
<View style={styles.filterRow}>
  <DropDownPicker
    placeholder="지역 선택"
    open={regionOpen}
    value={regionValue}
    items={regionItems}
    setOpen={setRegionOpen}
    setValue={setRegionValue}
    setItems={setRegionItems}
    style={styles.filterBtn} // 📌 버튼 스타일
    containerStyle={{ flex: 1, marginRight: 8 }} // 📌 레이아웃 조정
    dropDownDirection="AUTO"
    zIndex={3000}
    zIndexInverse={1000} // 다른 picker와 겹칠 때 대비
  />

  <DropDownPicker
    placeholder="난이도 선택"
    open={difficultyOpen}
    value={difficultyValue}
    items={difficultyItems}
    setOpen={setDifficultyOpen}
    setValue={setDifficultyValue}
    setItems={setDifficultyItems}
    style={styles.filterBtn}
    containerStyle={{ flex: 1 }}
    dropDownDirection="AUTO"
    zIndex={2000}
    zIndexInverse={1000}
  />

      </View>
          <Text style={styles.countText}>산책로 246</Text>
          <FlatList
            data={dummyCourses}
            keyExtractor={(item) => item.id}
            renderItem={renderCourseItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      ) : (
        <>
          <Text style={styles.aiTitle}>AI에게 산책로를 추천 받아보세요.</Text>
          <Text style={styles.aiQuestion}>나에게 맞는 산책로는?</Text>
          {/* <Image source={require('../assets/ai_robot.png')} style={styles.aiImage} /> */}
          <Text style={styles.aiSubtitle}>나의 플로깅 기록, 선호도를 바탕으로{"\n"}산책로를 추천 받아 보세요.</Text>

          <TouchableOpacity style={styles.aiBtn}>
            <Text style={styles.aiBtnText}>AI 분석하기</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  tabBox: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeText: {
    color: '#4CAF50',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  filterBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  countText: {
    marginBottom: 8,
    color: '#444',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: 80,
    height: 80,
  },
  cardContent: {
    flex: 1,
    padding: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    color: '#666',
  },
  cardTag: {
    marginTop: 4,
    fontSize: 12,
    color: '#4CAF50',
  },
  aiTitle: {
    marginTop: 20,
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  aiQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  aiImage: {
    width: width - 100,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },
  aiSubtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  aiBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  aiBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
