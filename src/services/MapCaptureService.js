// MapCaptureService.js - takeSnapshot 옵션 수정

/**
 * 🔥 수정된 지도 캡처 서비스
 */
export class MapCaptureService {
  constructor() {
    this.isCapturing = false;
  }

  /**
   * 🔥 안전한 takeSnapshot (옵션 단순화)
   */
  async captureMapSimple(mapRef, options = {}) {
    if (this.isCapturing) {
      console.warn('⚠️ [MapCapture] 이미 캡처 중');
      return null;
    }

    console.log("📸 [MapCapture] === 단순 캡처 시작 ===");

    if (!mapRef?.current) {
      console.error("❌ [MapCapture] mapRef가 없음");
      return null;
    }

    if (typeof mapRef.current.takeSnapshot !== 'function') {
      console.error("❌ [MapCapture] takeSnapshot 메서드 없음");
      return null;
    }

    try {
      this.isCapturing = true;
      
      // 🔥 충분한 대기 시간
      console.log("⏳ [MapCapture] 대기 중...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 🔥 최소한의 안전한 옵션만 사용
      const snapshotOptions = {
        format: 'png',
        quality: 0.8,
        result: 'base64'  // 🔥 tmpfile 대신 base64 사용
      };

      console.log("📸 [MapCapture] takeSnapshot 호출:", snapshotOptions);
      const result = await mapRef.current.takeSnapshot(snapshotOptions);

      console.log("📸 [MapCapture] takeSnapshot 결과:");
      console.log("  - 타입:", typeof result);
      console.log("  - 길이:", result ? result.length : 0);

      if (result && typeof result === 'string' && result.length > 0) {
        // 🔥 base64를 data URI로 변환
        const dataUri = result.startsWith('data:') ? result : `data:image/png;base64,${result}`;
        console.log("✅ [MapCapture] 캡처 성공!");
        return dataUri;
      } else {
        console.error("❌ [MapCapture] 캡처 실패 - 빈 결과");
        return null;
      }

    } catch (error) {
      console.error("❌ [MapCapture] 캡처 에러:", error);
      console.error("❌ [MapCapture] 에러 메시지:", error.message);
      
      // 🔥 다른 옵션으로 재시도
      try {
        console.log("🔄 [MapCapture] 다른 옵션으로 재시도");
        const fallbackResult = await mapRef.current.takeSnapshot({
          format: 'png',
          quality: 0.5
          // result 옵션 제거
        });
        
        if (fallbackResult) {
          console.log("✅ [MapCapture] 재시도 성공!");
          return fallbackResult;
        }
      } catch (retryError) {
        console.error("❌ [MapCapture] 재시도도 실패:", retryError);
      }
      
      return null;
    } finally {
      this.isCapturing = false;
    }
  }

  /**
   * 🔥 ViewShot 폴백
   */
  async captureWithViewShot(viewShotRef) {
    if (!viewShotRef?.current) {
      console.error("❌ [MapCapture] viewShotRef 없음");
      return null;
    }

    try {
      console.log("📸 [MapCapture] ViewShot 폴백 시작");
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await viewShotRef.current.capture({
        format: 'png',
        quality: 0.8
      });

      if (result) {
        console.log("✅ [MapCapture] ViewShot 성공:", result.substring(0, 50));
        return result;
      } else {
        console.error("❌ [MapCapture] ViewShot 실패");
        return null;
      }

    } catch (error) {
      console.error("❌ [MapCapture] ViewShot 에러:", error);
      return null;
    }
  }

  /**
   * 🔥 메인 캡처 함수
   */
  async captureMap(params) {
    const { mapRef, viewShotRef, routeCoordinates } = params;

    console.log("🎯 [MapCapture] === 메인 캡처 시작 ===");

    // 1️⃣ 간단한 줌 조절 (경로가 있으면)
    if (routeCoordinates && routeCoordinates.length > 2 && mapRef?.current) {
      try {
        console.log("🎯 [MapCapture] 경로 기반 줌 조절");
        
        const lats = routeCoordinates.map(p => p.latitude);
        const lngs = routeCoordinates.map(p => p.longitude);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const deltaLat = Math.max((maxLat - minLat) * 1.3, 0.005); // 최소 500m
        const deltaLng = Math.max((maxLng - minLng) * 1.3, 0.005);

        const region = {
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: deltaLat,
          longitudeDelta: deltaLng
        };

        console.log("🎯 [MapCapture] 줌 조절:", region);
        mapRef.current.animateToRegion(region, 1000);
        
        // 줌 완료 대기
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (zoomError) {
        console.error("❌ [MapCapture] 줌 조절 실패:", zoomError);
      }
    }

    // 2️⃣ takeSnapshot 시도
    console.log("📸 [MapCapture] takeSnapshot 시도");
    let result = await this.captureMapSimple(mapRef);
    
    if (result) {
      console.log("✅ [MapCapture] takeSnapshot 성공");
      return result;
    }

    // 3️⃣ ViewShot 폴백
    if (viewShotRef) {
      console.log("📸 [MapCapture] ViewShot 폴백 시도");
      result = await this.captureWithViewShot(viewShotRef);
      
      if (result) {
        console.log("✅ [MapCapture] ViewShot 성공");
        return result;
      }
    }

    // 4️⃣ 모든 방법 실패
    console.error("❌ [MapCapture] 모든 캡처 방법 실패");
    return null;
  }
}

// 싱글톤 인스턴스
export const mapCaptureService = new MapCaptureService();