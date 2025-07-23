import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen'; // 직접 만든 초기 화면 연결

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
