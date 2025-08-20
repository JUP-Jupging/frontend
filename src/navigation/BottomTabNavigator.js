// BottomTabNavigator.js - Safe Area 적용 버전

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 🔥 Safe Area 추가
import HomeStackNavigator from './HomeStackNavigator';
import WalkSearchScreen from '../screens/WalkSearchScreen';
import ReportTrashScreen from '../screens/ReportTrashScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyPageStackNavigator from './MyPageStackNavigator';
import RecommendCourseStackNavigator from './RecommendCourseStackNavigator';
import SearchStackNavigator from './SearchStackNavigator';

// 🔥 원래 FloatingPloggingIndicator 복구
import FloatingPloggingIndicator from '../components/FloatingPloggingIndicator';

const Tab = createBottomTabNavigator();
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

/**
 * 🔥 Safe Area 적용된 커스텀 탭바
 */
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets(); // 🔥 Safe Area 값 가져오기
  
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      paddingBottom: Math.max(insets.bottom, 10), // 🔥 Safe Area bottom 적용 (최소 10)
      paddingTop: 10,
      paddingLeft: Math.max(insets.left, 0), // 🔥 좌측 Safe Area
      paddingRight: Math.max(insets.right, 0), // 🔥 우측 Safe Area
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined 
          ? options.tabBarLabel 
          : options.title !== undefined 
          ? options.title 
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // 🔥 탭 아이콘 결정
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
          default:
            iconName = 'home';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 5,
              minHeight: 50, // 🔥 최소 높이 보장
            }}
          >
            <Icon 
              name={iconName} 
              size={24} 
              color={isFocused ? '#4CAF50' : '#999'} 
            />
            <Text style={{
              fontSize: 12,
              color: isFocused ? '#4CAF50' : '#999',
              marginTop: 2,
              fontWeight: isFocused ? '600' : '400',
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * 🔥 탭 네비게이터
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ 
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="홈" component={HomeStackNavigator} />
      <Tab.Screen name="추천 코스" component={RecommendCourseStackNavigator} />
      <Tab.Screen name="코스 검색" component={SearchStackNavigator} />
      <Tab.Screen name="쓰레기 제보" component={ReportTrashScreen} />
      <Tab.Screen name="내 플로깅 기록" component={MyPageStackNavigator} />
    </Tab.Navigator>
  );
}

/**
 * 🔥 메인 export 컴포넌트 (Safe Area 적용)
 */
export default function BottomTabNavigator() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // 🔥 Safe Area 값 가져오기

  // 현재 활성화된 화면 이름을 더 정확하게 가져오기
  const currentRouteName = useNavigationState(state => {
    if (!state || !state.routes || state.index === undefined) return null;

    const currentRoute = state.routes[state.index];
    if (currentRoute.state) {
      // 스택 네비게이터 내부의 현재 화면 확인
      const nestedRoute = currentRoute.state.routes[currentRoute.state.index];
      return nestedRoute.name;
    }
    return currentRoute.name;
  });

  // 현재 화면이 플로깅 관련 화면인지 확인 (인디케이터 표시 여부 결정)
  const isPloggingScreen = currentRouteName === "PloggingStart" || currentRouteName === "PloggingRecord";

  return (
    <View style={{ 
      flex: 1,
      // 🔥 Safe Area 적용으로 전체 화면이 안전 영역 내에 위치
    }}>
      {/* 📱 하단 탭 네비게이터 */}
      <TabNavigator />

      {/* 🔥 원래 FloatingPloggingIndicator 복구 (종료 기능 포함) */}
      <FloatingPloggingIndicator
        hideOnPlogging={isPloggingScreen}
      />
    </View>
  );
}