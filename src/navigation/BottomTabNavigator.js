import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './HomeStackNavigator';
import WalkSearchScreen from '../screens/WalkSearchScreen';
import ReportTrashScreen from '../screens/ReportTrashScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, Image } from 'react-native';
import MyPageStackNavigator from './MyPageStackNavigator';
import RecommendCourseStackNavigator from './RecommendCourseStackNavigator' // 추천 코스 스택 네비게이터
const Tab = createBottomTabNavigator();


export default function BottomTabNavigator() {
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
