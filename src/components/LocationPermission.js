// locationPermission.js
import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * 포그라운드(ACCESS_FINE_LOCATION) + 백그라운드(ACCESS_BACKGROUND_LOCATION)
 * 위치 권한을 요청하고, 모두 GRANTED 이면 true 반환.
 * 거부되면 Alert 창을 띄우고 false 반환.
 */
export async function requestLocationPermission() {
  try {
    const perms = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
    if (Platform.Version >= 29) {
      perms.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
    }

    const statuses = await PermissionsAndroid.requestMultiple(perms);

    const fineGranted =
      statuses[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    const backgroundGranted =
      Platform.Version < 29 ||
      statuses[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

    if (fineGranted && backgroundGranted) {
      return true;
    }

    Alert.alert(
      '권한 필요',
      '앱을 정상적으로 사용하려면 위치 권한(포그라운드 & 백그라운드)을 모두 허용해 주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '다시 요청', onPress: requestLocationPermission },
      ]
    );
    return false;
  } catch (err) {
    console.warn('requestLocationPermission error:', err);
    Alert.alert('오류', '권한 요청 중 문제가 발생했습니다.');
    return false;
  }
}

/**
 * 현재 위치를 가져오는 함수.
 * 반드시 requestLocationPermission() 후에 호출해야 에러 없이 동작합니다.
 * @returns Promise<GeolocationPosition>
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}
