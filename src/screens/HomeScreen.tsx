import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';

export default function HomeScreen() {
  const handleKakaoLogin = () => {
    Alert.alert('카카오 로그인 버튼 클릭');
  };

  const handleGoogleLogin = () => {
    Alert.alert('구글 로그인 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      {/* 로고 텍스트 */}
      <Text style={styles.logo}>jupging</Text>

      {/* 삽화 이미지
      <Image
        source={require('../assets/illustration.png')} // 주의: 실제 파일 필요
        style={styles.image}
        resizeMode="contain"
      /> */}

      {/* 설명 텍스트 */}
      <Text style={styles.mainText}>봉사하는 플로깅앱, 줍깅</Text>
      <Text style={styles.description}>
        <Text style={styles.highlight}>줍깅은</Text> 조깅을 하면서 길가의 쓰레기를 수거하는 플로깅의 한국말입니다.
      </Text>

      {/* 카카오 로그인 버튼 */}
      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Text style={styles.kakaoText}>카카오로 계속하기</Text>
      </TouchableOpacity>

      {/* 구글 로그인 버튼 */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>Google로 계속하기</Text>
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
  image: {
    width: '80%',
    height: 180,
    marginBottom: 32,
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
});
