// MapCaptureService.js - 지도 캡처 관련 로직 분리

/**
 * 지도 캡처 서비스
 */
export class MapCaptureService {
  constructor() {
    this.isCapturing = false;
  }

  /**
   * 지도에 경로가 모두 보이도록 자동 줌 조절
   */
  fitRouteToMap(routeCoordinates, mapRef, options = {}) {
    if (!routeCoordinates || routeCoordinates.length === 0 || !mapRef?.current) {
      console.warn('⚠️ [MapCaptureService] 경로 데이터 또는 지도 ref가 없습니다');
      return;
    }

    try {
      console.log("🎯 [MapCaptureService] 경로에 맞게 지도 줌 조절 시작");

      // 경계 계산
      let minLat = routeCoordinates[0].latitude;
      let maxLat = routeCoordinates[0].latitude;
      let minLng = routeCoordinates[0].longitude;
      let maxLng = routeCoordinates[0].longitude;

      routeCoordinates.forEach(coord => {
        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
      });

      // 여백 추가
      const paddingPercent = options.padding || 0.1;
      const latPadding = (maxLat - minLat) * paddingPercent || 0.01;
      const lngPadding = (maxLng - minLng) * paddingPercent || 0.01;

      const region = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: (maxLat - minLat + latPadding * 2),
        longitudeDelta: (maxLng - minLng + lngPadding * 2),
      };

      console.log("🎯 [MapCaptureService] 지도 줌 조절:", {
        경로점수: routeCoordinates.length,
        중심: `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`,
        범위: `${region.latitudeDelta.toFixed(4)} x ${region.longitudeDelta.toFixed(4)}`
      });

      // 지도 영역 조절
      const animationDuration = options.animationDuration || 1000;
      mapRef.current.animateToRegion(region, animationDuration);

      return region;

    } catch (error) {
      console.error("❌ [MapCaptureService] 지도 줌 조절 실패:", error);
      return null;
    }
  }

  /**
   * 좌표 배열을 포함하는 최적 지도 영역 조절
   */
  fitCoordinatesToMap(coordinates, mapRef, options = {}) {
    if (!coordinates || coordinates.length === 0 || !mapRef?.current) {
      console.warn('⚠️ [MapCaptureService] 좌표 데이터 또는 지도 ref가 없습니다');
      return;
    }

    try {
      console.log("🎯 [MapCaptureService] 좌표 기반 지도 줌 조절");

      // 기본 padding 설정
      const defaultPadding = {
        top: options.paddingTop || 100,
        right: options.paddingRight || 100,
        bottom: options.paddingBottom || 100,
        left: options.paddingLeft || 100
      };

      // fitToCoordinates 사용
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: defaultPadding,
        animated: options.animated !== false,
      });

      console.log("✅ [MapCaptureService] 좌표 기반 줌 조절 완료");

    } catch (error) {
      console.error("❌ [MapCaptureService] 좌표 기반 줌 조절 실패:", error);
    }
  }

  /**
   * ViewShot을 사용한 지도 캡처
   */
  async captureMapWithViewShot(viewShotRef, options = {}) {
    if (this.isCapturing) {
      console.warn('⚠️ [MapCaptureService] 이미 캡처 진행 중입니다');
      return null;
    }

    if (!viewShotRef?.current) {
      console.warn("⚠️ [MapCaptureService] ViewShot ref가 없습니다");
      return null;
    }

    try {
      this.isCapturing = true;
      console.log("📸 [MapCaptureService] 지도 캡처 시작");

      // 캡처 전 대기 시간
      const waitTime = options.waitTime || 1000;
      if (waitTime > 0) {
        console.log(`⏳ [MapCaptureService] ${waitTime}ms 대기 중...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // ViewShot 캡처 옵션
      const captureOptions = {
        format: options.format || 'png',
        quality: options.quality || 0.9,
        result: options.result || 'tmpfile',
        ...options.captureOptions
      };

      // 캡처 실행
      const imageUri = await viewShotRef.current.capture(captureOptions);
      
      console.log("✅ [MapCaptureService] 지도 캡처 성공:", imageUri);
      return imageUri;

    } catch (error) {
      console.error("❌ [MapCaptureService] 지도 캡처 실패:", error);
      return null;
    } finally {
      this.isCapturing = false;
    }
  }

  /**
   * 경로와 마커를 모두 포함한 최적 캡처
   */
  async captureOptimalView(params) {
    const {
      viewShotRef,
      mapRef,
      routeCoordinates,
      trashLocations,
      options = {}
    } = params;

    try {
      console.log("🎯 [MapCaptureService] 최적 뷰 캡처 시작");

      // 모든 좌표 수집
      const allCoordinates = [];
      
      // 경로 좌표 추가
      if (routeCoordinates && routeCoordinates.length > 0) {
        allCoordinates.push(...routeCoordinates);
      }
      
      // 쓰레기 위치 좌표 추가
      if (trashLocations && trashLocations.length > 0) {
        trashLocations.forEach(trash => {
          if (trash.coordinate) {
            allCoordinates.push(trash.coordinate);
          }
        });
      }

      // 좌표가 있으면 최적 뷰로 조정
      if (allCoordinates.length > 0) {
        this.fitCoordinatesToMap(allCoordinates, mapRef, {
          paddingTop: 150,
          paddingRight: 150,
          paddingBottom: 150,
          paddingLeft: 150,
          animated: true,
          ...options.fitOptions
        });

        // 지도 조정 완료 대기
        await new Promise(resolve => setTimeout(resolve, options.adjustWaitTime || 2000));
      }

      // 캡처 실행
      const imageUri = await this.captureMapWithViewShot(viewShotRef, {
        waitTime: options.captureWaitTime || 500,
        ...options.captureOptions
      });

      return imageUri;

    } catch (error) {
      console.error("❌ [MapCaptureService] 최적 뷰 캡처 실패:", error);
      return null;
    }
  }

  /**
   * 캡처 상태 확인
   */
  isCaptureInProgress() {
    return this.isCapturing;
  }

  /**
   * 캡처 취소 (진행 중인 경우)
   */
  cancelCapture() {
    if (this.isCapturing) {
      console.log("🚫 [MapCaptureService] 캡처 취소");
      this.isCapturing = false;
    }
  }
}

// 싱글톤 인스턴스
export const mapCaptureService = new MapCaptureService();