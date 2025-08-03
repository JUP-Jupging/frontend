// 📁 CourseDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function CourseDetailScreen({ navigation }) {
  // 📌 추후 백엔드에서 산책로 ID를 기준으로 상세정보 조회 API 호출 필요
  // 예: GET /courses/:courseId

  // 📌 아래는 더미 데이터
  const courseData = {
    name: '남산 녹색 둘레길',
    address: '충남 청양군 청양읍 적누리 산 18-52',
    region: '충남 청양군',
    duration: '4시간',
    length: '13.8km',
    level: '쉬움',
    // image: require('../assets/course2.jpg'),
    // map: require('../assets/course_map.jpg'),
    toilet: '생태공원, 적누리 마을회관, 벚꽃길 사거리',
    tip: '식수보급처가 없으니 매점에서 구입하거나 사전준비',
    description:
      '357m의 남산을 중심으로 지형, 직누자수지, 급경, 탄천길 범위를 따라 형성된 또는 녹색 둘레길로 지역주민과 조깅족을 위한 길이다. 구간별 테마로 구분돼 4개 구간으로 구분하고 있다.\n①성곽길(4.2km) : 지형의 사계절 풍광,나비,청매,교교,희망이 등 설치물을 볼 수 있다.\n②녹색길(4.0km) : 직누자수지 따라 사면을 올라갈 수 있는 산책로가 감성 추억을 살 수 있다.\n③꽃길(1.8km) : 지하철 사당출입구에서 풍광까지 벚꽃이 장관이다.\n④고향길(2.9km) : 시원한 고향길을 느낄 수 있으며, 배웅의 터널과 청양 향교를 감상할 수 있다.',
  };

  const trashReports = [
    // 📌 이 데이터는 향후 course_id 기준으로 백엔드에서 쓰레기 제보 목록 조회
    // 예: GET /trash-reports?course_id=123
    {
      id: 1,
      title: '풀숲 쓰레기',
      detail: '플라스틱병 외 7개',
    },
    {
      id: 2,
      title: '전봇대 옆 쓰레기',
      detail: '유리조각 외 3개',
    },
    {
      id: 3,
      title: '길가 쓰레기',
      detail: '캔, 스낵 포장지 외 5개',
    },
  ];

  const goToTrashInfo = () => navigation.navigate('TrashCanInfo');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={courseData.image} style={styles.courseImage} />

      <View style={styles.headerBox}>
        <Text style={styles.title}>{courseData.name}</Text>
        <Text style={styles.address}>{courseData.address}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>지역</Text>
          <Text style={styles.value}>{courseData.region}</Text>
          <Text style={styles.label}>산책 소요시간</Text>
          <Text style={styles.value}>{courseData.duration}</Text>
          <Text style={styles.label}>산책로 길이</Text>
          <Text style={styles.value}>{courseData.length}</Text>
          <Text style={styles.label}>난이도</Text>
          <Text style={styles.value}>{courseData.level}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>상세 정보</Text>
        <Image source={courseData.map} style={styles.mapImage} />
        <Text style={styles.tip}>📌 {courseData.tip}</Text>
        <Text style={styles.tip}>🚻 화장실 정보: {courseData.toilet}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설명</Text>
        <Text style={styles.description}>{courseData.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>제보된 쓰레기 {trashReports.length}개</Text>
        {trashReports.map((item) => (
          <View key={item.id} style={styles.trashCard}>
            <Text style={styles.trashTitle}>{item.title}</Text>
            <Text style={styles.trashDetail}>{item.detail}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.trashBtn} onPress={goToTrashInfo}>
        <Text style={styles.trashBtnText}>근처 쓰레기통 찾기 🗑</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  courseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerBox: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#777',
    marginVertical: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 4,
    color: '#555',
  },
  value: {
    marginRight: 10,
    color: '#222',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mapImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  tip: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  trashCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  trashTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  trashDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  trashBtn: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 30,
  },
  trashBtnText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
