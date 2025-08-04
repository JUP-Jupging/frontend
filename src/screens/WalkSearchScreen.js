// 📁 WalkSearchScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const dummyCourses = [
  {
    id: '1',
    name: '국립 중앙 박물관',
    address: '서울 용산구 서빙고로 137 국립중앙박물관',
  },
  {
    id: '2',
    name: '남산',
    address: '서울 중구 회현동1가',
  },
];

export default function WalkSearchScreen() {
  return (
    <View style={styles.container}>
      {/* 검색 바 (실제 검색기능은 아직 없음) */}
      <TouchableOpacity style={styles.searchBar}>
        <Text style={styles.searchPlaceholder}>🔍 산책로 검색</Text>
      </TouchableOpacity>

      {/* 검색 결과 리스트 */}
      <FlatList
        data={dummyCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemRow}>
            <View style={styles.imageBox}>
              {/* 이미지 대신 회색 박스 */}
            </View>
            <View style={styles.textBox}>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

  // ✅ 검색바 추가
  searchBar: {
    width: '100%',
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchPlaceholder: {
    color: '#888',
    fontSize: 14,
  },

  // ✅ 리스트 아이템 스타일
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  imageBox: {
    width: 50,
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 8,
    marginRight: 16,
  },
  textBox: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#777',
  },
});
