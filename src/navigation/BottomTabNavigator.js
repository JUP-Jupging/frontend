import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import HomeStackNavigator from './HomeStackNavigator';
import WalkSearchScreen from '../screens/WalkSearchScreen';
import ReportTrashScreen from '../screens/ReportTrashScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, Image } from 'react-native';
import MyPageStackNavigator from './MyPageStackNavigator';
import RecommendCourseStackNavigator from './RecommendCourseStackNavigator'; // 추천 코스 스택 네비게이터
import FloatingPloggingIndicator from '../components/FloatingPloggingIndicator'; // 플로깅 인디케이터

const Tab = createBottomTabNavigator();


// 탭 네비게이터 컴포넌트
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
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
      {/* 홈은 Stack Navigator */}
      <Tab.Screen name="홈" component={HomeStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="추천 코스" component={RecommendCourseStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen
        name="코스 검색"
        component={WalkSearchScreen}
        options={{ headerShown: false }} 
      />
      <Tab.Screen name="쓰레기 제보" component={ReportTrashScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="내 플로깅 기록" component={MyPageStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// 메인 내보내기 컴포넌트 (플로팅 인디케이터 포함)
export default function BottomTabNavigator() {
  const navigation = useNavigation();
  
  // 현재 활성화된 탭 이름 가져오기
  const currentRouteName = useNavigationState(state => {
    if (!state || !state.routes || state.index === undefined) return null;
    return state.routes[state.index]?.name;
  });
  
  // 현재 화면이 플로깅 관련 화면인지 확인
  const isPloggingScreen = currentRouteName === "플로깅 시작";
  
  return (
    <View style={{ flex: 1 }}>
      <TabNavigator />
      <FloatingPloggingIndicator 
        hideOnPlogging={isPloggingScreen}
      />
    </View>
  );
}
