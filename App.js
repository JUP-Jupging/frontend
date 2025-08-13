// App.js (지도 없음, 좌표만 표기)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator, AppState } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export default function App() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: '위치 권한 요청',
        message: '현재 위치를 확인하려면 위치 권한이 필요합니다.',
        buttonPositive: '확인',
        buttonNegative: '취소',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getCurrentLocation = async () => {
    const ok = await requestLocationPermission();
    if (!ok) {
      setErr('위치 권한 거부됨');
      setLoading(false);
      return;
    }
    Geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setLoading(false);
      },
      (e) => {
        setErr(e?.message ?? '위치 조회 실패');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    // 앱이 활성화된 뒤에 한 번만 실행
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && loading) getCurrentLocation();
    });
    // 첫 렌더 후 짧은 지연 뒤 시도 (일부 기기 안정화)
    const t = setTimeout(() => loading && getCurrentLocation(), 300);
    return () => {
      sub.remove();
      clearTimeout(t);
    };
  }, [loading]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : err ? (
        <Text style={styles.err}>{err}</Text>
      ) : coords ? (
        <>
          <Text style={styles.title}>현재 좌표</Text>
          <Text>lat: {coords.latitude}</Text>
          <Text>lng: {coords.longitude}</Text>
          {coords.accuracy != null && <Text>accuracy: {Math.round(coords.accuracy)} m</Text>}
        </>
      ) : (
        <Text>좌표 없음</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  err: { color: '#c00' },
});
