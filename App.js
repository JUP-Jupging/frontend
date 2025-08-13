// App.js — 지도 + 버튼(좌표갱신 / 내 위치로 이동)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const SEOUL = {
  latitude: 37.5665,
  longitude: 126.9780,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function App() {
  const mapRef = useRef(null);

  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy, timestamp }
  const [region, setRegion] = useState(SEOUL);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // 권한 요청
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

  // 현재 좌표 1회 가져오기
  const getCurrentLocation = async (options = { recenter: false }) => {
    setErr('');
    const ok = await requestLocationPermission();
    if (!ok) {
      setLoading(false);
      setErr('위치 권한 거부됨');
      return;
    }

    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const nextCoords = {
          latitude,
          longitude,
          accuracy,
          timestamp: pos.timestamp,
        };
        setCoords(nextCoords);

        const nextRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(nextRegion);

        // 옵션에 따라 지도 중심 이동
        if (options.recenter && mapRef.current) {
          mapRef.current.animateToRegion(nextRegion, 600);
        }

        setLoading(false);
      },
      (e) => {
        setErr(e?.message ?? '위치 조회 실패');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // 첫 진입 시 1회 조회 (지연 호출로 안정성 확보)
  useEffect(() => {
    const t = setTimeout(() => getCurrentLocation({ recenter: true }), 300);
    return () => clearTimeout(t);
  }, []);

  // 버튼: 좌표 갱신
  const handleRefresh = () => getCurrentLocation({ recenter: false });

  // 버튼: 내 위치로 이동(좌표가 있으면 지도만 이동, 없으면 조회 후 이동)
  const handleRecenter = () => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      );
    } else {
      getCurrentLocation({ recenter: true });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false} // 안드로이드 기본 버튼 숨기고 커스텀 버튼 사용
      >
        {/* 좌표가 있으면 마커 표시 */}
        {coords && (
          <Marker
            coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
            title="현재 위치"
            description={`정확도 약 ${coords.accuracy ? Math.round(coords.accuracy) : '?'} m`}
          />
        )}
      </MapView>

      {/* 상단 정보 패널 */}
      <View style={styles.info}>
        {loading ? (
          <ActivityIndicator />
        ) : err ? (
          <Text style={styles.err}>{err}</Text>
        ) : coords ? (
          <>
            <Text style={styles.title}>현재 좌표</Text>
            <Text style={styles.line}>lat: {coords.latitude}</Text>
            <Text style={styles.line}>lng: {coords.longitude}</Text>
            {coords.accuracy != null && (
              <Text style={styles.line}>accuracy: {Math.round(coords.accuracy)} m</Text>
            )}
          </>
        ) : (
          <Text>좌표 없음</Text>
        )}
      </View>

      {/* 하단 플로팅 버튼들 */}
      <View style={styles.fabWrap}>
        <TouchableOpacity style={styles.fab} onPress={handleRefresh}>
          <Text style={styles.fabText}>좌표 갱신</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabPrimary]} onPress={handleRecenter}>
          <Text style={styles.fabText}>내 위치로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },

  info: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  line: { fontSize: 13, marginTop: 2 },
  err: { color: '#c00', fontSize: 13 },

  fabWrap: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4b5563', // gray-700
  },
  fabPrimary: {
    backgroundColor: '#2563eb', // blue-600
  },
  fabText: { color: '#fff', fontWeight: 'bold' },
});
