import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './HomeStackNavigator';
import RecommendCourseScreen from '../screens/RecommendCourseScreen';
import WalkSearchScreen from '../screens/WalkSearchScreen';
import ReportTrashScreen from '../screens/ReportTrashScreen';
import PloggingStartScreen from '../screens/PloggingStartScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, Image } from 'react-native';
import MyPageStackNavigator from './MyPageStackNavigator';

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
      <Tab.Screen name="추천 코스" component={RecommendCourseScreen} options={({ navigation }) => ({
        title: '추천 코스',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('홈')} // 또는 navigation.goBack()
            style={{ marginLeft: 16 }}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('내 플로깅 기록')}
            style={{ marginRight: 16 }}
          >
            <Image
              source={require('../assets/user.png')}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        ),
      })}
      />
      <Tab.Screen
        name="코스 검색"
        component={WalkSearchScreen}
        options={({ navigation }) => ({
          title: '코스 검색',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('홈')} // 또는 navigation.goBack()
              style={{ marginLeft: 16 }}
            >
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('내 플로깅 기록')}
              style={{ marginRight: 16 }}
            >
              <Image
                source={require('../assets/user.png')}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen name="쓰레기 제보" component={ReportTrashScreen} />
      <Tab.Screen name="내 플로깅 기록" component={MyPageStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
