import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator'; // 하단 탭 네비게이터 (FloatingPloggingIndicator 포함)
import { PloggingProvider } from './src/contexts/PloggingContext'; // 🎯 플로깅 전역 상태 관리: 앱 전체에서 플로깅 세션을 공유

// 🛠️ React DevTools 연결 (개발 환경에서만)
if (__DEV__) {
  console.log('🔧 React DevTools 연결 중...');
  // React DevTools 자동 연결 설정
  require('react-devtools-core').connectToDevTools({
    host: 'localhost',
    port: 8097,
  });
}

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    // 🎯 PloggingProvider: 플로깅 상태를 앱 전체에서 공유할 수 있도록 Context 제공
    <PloggingProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        {/* 📱 앱 최상위 네비게이션 구조 */}
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          {/* 🏠 메인 화면: BottomTabNavigator로 하단 탭 구조 제공 
              - 플로깅 시작 화면, 플로깅 결과 화면, 쓰레기통 정보 화면이 모두 홈 탭 안의 Stack Navigator에 위치
              - FloatingPloggingIndicator가 여기서 렌더링됨 */}
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PloggingProvider>
  );
}

export default App;