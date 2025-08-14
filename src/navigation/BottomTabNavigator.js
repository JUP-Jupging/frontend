import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import HomeStackNavigator from './HomeStackNavigator'; // 홈 탭 (메인 화면 + 플로깅 시작 화면)
import WalkSearchScreen from '../screens/WalkSearchScreen';
import ReportTrashScreen from '../screens/ReportTrashScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, Image } from 'react-native';
import MyPageStackNavigator from './MyPageStackNavigator';
import RecommendCourseStackNavigator from './RecommendCourseStackNavigator';
import FloatingPloggingIndicator from '../components/FloatingPloggingIndicator'; // 🎯 플로깅 진행 상황을 보여주는 드래그 가능한 모달

const Tab = createBottomTabNavigator();

/**
 * 🗂️ 하단 탭 네비게이터 컴포넌트
 * - 5개의 주요 탭으로 구성 (홈, 추천코스, 코스검색, 쓰레기제보, 마이페이지)
 * - 홈 탭에는 플로깅 시작 화면이 포함됨
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          // 각 탭에 해당하는 아이콘 설정
          let iconName;
          switch (route.name) {
            case '홈':
              iconName = 'home';
              break;
            case '추천 코스':
              iconName = 'explore';
              break;
            case '코스 검색':
              iconName = 'search';
              break;
            case '쓰레기 제보':
              iconName = 'delete';
              break;
            case '내 플로깅 기록':
              iconName = 'person';
              break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
      })}
    >
      {/* 🏠 홈 탭: HomeStackNavigator로 메인 화면과 플로깅 시작 화면을 관리 */}
      <Tab.Screen name="홈" component={HomeStackNavigator} options={{ headerShown: false }} />
      
      {/* 🗺️ 추천 코스 탭 */}
      <Tab.Screen name="추천 코스" component={RecommendCourseStackNavigator} options={{ headerShown: false }} />
      
      {/* 🔍 코스 검색 탭 */}
      <Tab.Screen
        name="코스 검색"
        component={WalkSearchScreen}
        options={{ headerShown: false }} 
      />
      
      {/* 🗑️ 쓰레기 제보 탭 */}
      <Tab.Screen name="쓰레기 제보" component={ReportTrashScreen} options={{ headerShown: false }}/>
      
      {/* 👤 마이페이지 탭 */}
      <Tab.Screen name="내 플로깅 기록" component={MyPageStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

/**
 * 🎯 메인 내보내기 컴포넌트: BottomTabNavigator + FloatingPloggingIndicator
 * 
 * 기능:
 * 1. 하단 탭 네비게이션 제공
 * 2. 플로깅 진행 중일 때 FloatingPloggingIndicator를 화면 위에 오버레이로 표시
 * 3. 플로깅 시작 화면에서는 인디케이터를 숨김 (중복 방지)
 * 
 * FloatingPloggingIndicator 특징:
 * - 드래그 가능한 모달 형태
 * - 플로깅 진행 상황 실시간 표시 (시간, 거리, 쓰레기 개수)
 * - 접기/펼치기 기능
 * - 플로깅 화면으로 이동 버튼
 */
export default function BottomTabNavigator() {
  const navigation = useNavigation();
  
  // 현재 활성화된 탭 이름 가져오기 (네비게이션 상태 추적)
  const currentRouteName = useNavigationState(state => {
    if (!state || !state.routes || state.index === undefined) return null;
    return state.routes[state.index]?.name;
  });
  
  // 현재 화면이 플로깅 관련 화면인지 확인 (인디케이터 표시 여부 결정)
  const isPloggingScreen = currentRouteName === "플로깅 시작";
  
  return (
    <View style={{ flex: 1 }}>
      {/* 📱 하단 탭 네비게이터 */}
      <TabNavigator />
      
      {/* 🎯 플로깅 진행 상황 인디케이터 (오버레이)
          - 플로깅 중일 때만 표시
          - 플로깅 시작 화면에서는 숨김 (hideOnPlogging=true)
          - 드래그해서 위치 이동 가능 */}
      <FloatingPloggingIndicator 
        hideOnPlogging={isPloggingScreen}
      />
    </View>
  );
}
