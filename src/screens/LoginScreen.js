import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

// 👇 navigation prop 사용을 위해 파라미터로 받음
export default function HomeScreen({ navigation }) {
  const handleKakaoLogin = () => {
    Alert.alert('카카오 로그인 버튼 클릭');
  };

  const handleGoogleLogin = () => {
    Alert.alert('구글 로그인 버튼 클릭');
  };

  // 👇 메인화면으로 이동하는 함수
  const handleGoToMain = () => {
    navigation.navigate('Main'); // Stack.Screen의 name이 "Main"이어야 함
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>jupging</Text>

      <Text style={styles.mainText}>봉사하는 플로깅앱, 줍깅</Text>
      <Text style={styles.description}>
        <Text style={styles.highlight}>줍깅은</Text> 조깅을 하면서 길가의 쓰레기를 수거하는 플로깅의 한국말입니다.
      </Text>

      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Text style={styles.kakaoText}>카카오로 계속하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>Google로 계속하기</Text>
      </TouchableOpacity>

      {/* 👇 메인으로 이동하는 네비게이션 버튼 추가 */}
      <TouchableOpacity style={styles.mainButton} onPress={handleGoToMain}>
        <Text style={styles.mainTextButton}>메인 화면으로 이동</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginBottom: 40,
    textAlign: 'center',
  },
  highlight: {
    color: 'green',
    fontWeight: 'bold',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kakaoText: {
    color: '#000',
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  googleText: {
    color: '#000',
    fontWeight: 'bold',
  },
  mainButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  mainTextButton: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
