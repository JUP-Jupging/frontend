// 📁 App.js
import React from 'react';
import { StatusBar, useColorScheme, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalkSearchScreen from './src/screens/WalkSearchScreen';
import PloggingRecordScreen from './src/screens/PloggingRecordScreen'; // ✅ 플로깅 기록
import TrashCanInfoScreen from './src/screens/TrashCanInfoScreen';     // ✅ 쓰레기통 정보
import MyPageScreen from './src/screens/MyPageScreen';
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';  // ✅ 하단 탭 네비게이터
import CourseDetailScreen from './src/screens/CourseDetailScreen';     // ✅ 산책로 상세

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <Stack.Navigator initialRouteName="Login">
        {/* ✅ 로그인 화면 */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: '로그인 화면' }}
        />

        {/* ✅ 로그인 성공 후 진입하는 메인 탭 네비게이터 */}
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />

        {/* ✅ 플로깅 기록 상세 */}
        <Stack.Screen
          name="PloggingRecord"
          component={PloggingRecordScreen}
          options={({ navigation }) => ({
            title: '플로깅 기록',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('내 플로깅 기록')}
                style={{ marginRight: 16 }}
              >
                <Image
                  source={require('./src/assets/user.png')}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            ),
          })}
        />

        {/* ✅ 근처 쓰레기통 정보 */}
        <Stack.Screen
          name="TrashCanInfo"
          component={TrashCanInfoScreen}
          options={({ navigation }) => ({
            title: '쓰레기통 정보',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('내 플로깅 기록')}
                style={{ marginRight: 16 }}
              >
                <Image
                  source={require('./src/assets/user.png')}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            ),
          })}
        />

        {/* ✅ 산책로 상세 페이지 */}
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{ title: '산책로 정보' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
