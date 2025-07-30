import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Image as SvgImage } from 'react-native-svg';

function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.menuIcon}>\u2630</Text>
      </View>

      <Image source={require('../assets/401cde5a-fe42-439b-be32-5a16d31fe7e3.png')} style={styles.banner} />

      <View style={styles.boxRow}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>진행중인 플로깅</Text>
          <TouchableOpacity>
            <Text style={styles.link}>실시간 플로깅 ></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>오늘의 플로깅</Text>
          <Text style={styles.subText}>0 / 1시간</Text>
          <Text style={styles.subText}>0.0 / 3km</Text>
          <Text style={styles.subText}>주운 쓰레기 수: 0개</Text>
        </View>
      </View>

      {/* 🔄 SVG 아이콘 버튼으로 교체된 네비게이션 버튼 */}
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => navigation.navigate('추천 코스')} style={styles.iconWrapper}>
          <Image source={require('../assets/course-recommend-icon.png')} style={styles.svgIcon} />
          <Text style={styles.iconLabel}>추천 코스</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('코스 검색')} style={styles.iconWrapper}>
          <Image source={require('../assets/course-search-icon.png')} style={styles.svgIcon} />
          <Text style={styles.iconLabel}>코스 검색</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('쓰레기 제보')} style={styles.iconWrapper}>
          <Image source={require('../assets/trash-report-icon.png')} style={styles.svgIcon} />
          <Text style={styles.iconLabel}>쓰레기 제보</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconWrapper}>
          <Image source={require('../assets/trash-bin-icon.png')} style={styles.svgIcon} />
          <Text style={styles.iconLabel}>쓰레기통</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promoBanner}>
        <Text style={styles.promoText}>산책로를 깨끗하게 만드는데 동참하세요.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>줍깅 PICK 추천코스 🎉</Text>
        <View style={styles.tags}>
          <Text style={styles.tag}># 가까운 곳</Text>
          <Text style={styles.tag}># 쓰레기 많은 곳</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Image source={require('../assets/course1.png')} style={styles.courseImage} />
          <Image source={require('../assets/course2.png')} style={styles.courseImage} />
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function CourseRecommendScreen() {
  return <View style={styles.screen}><Text>추천 코스</Text></View>;
}

function CourseSearchScreen() {
  return <View style={styles.screen}><Text>코스 검색</Text></View>;
}

function TrashReportScreen() {
  return <View style={styles.screen}><Text>쓰레기 제보</Text></View>;
}

function MyActivityScreen() {
  return <View style={styles.screen}><Text>나의 활동</Text></View>;
}

const Tab = createBottomTabNavigator();

export default function MainScreen() {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === '홈') iconName = 'home';
            else if (route.name === '추천 코스') iconName = 'flag-outline';
            else if (route.name === '코스 검색') iconName = 'map-outline';
            else if (route.name === '쓰레기 제보') iconName = 'trash-outline';
            else if (route.name === '나의 활동') iconName = 'person-outline';
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="홈" component={HomeScreen} />
        <Tab.Screen name="추천 코스" component={CourseRecommendScreen} />
        <Tab.Screen name="코스 검색" component={CourseSearchScreen} />
        <Tab.Screen name="쓰레기 제보" component={TrashReportScreen} />
        <Tab.Screen name="나의 활동" component={MyActivityScreen} />
      </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  menuIcon: {
    fontSize: 24,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  box: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  boxTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    color: '#555',
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  svgIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 12,
    color: '#333',
  },
  promoBanner: {
    backgroundColor: '#cceedd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  promoText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    marginRight: 8,
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  courseImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});