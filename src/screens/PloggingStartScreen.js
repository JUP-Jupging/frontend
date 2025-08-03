// 📁 PloggingRunningScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';

export default function PloggingStartScreen({ navigation }) {
  const [status, setStatus] = useState('idle'); // idle, running, paused, ended

  const handleStart = () => setStatus('running');
  const handlePause = () => setStatus('paused');
  const handleResume = () => setStatus('running');
  const handleEnd = () => setStatus('ended');

  const goBack = () => navigation.navigate('Main');
  const goToMyPage = () => navigation.navigate('MyPage');

  return (
    <View style={styles.container}>
      {/* 📍 지도 더미 박스 */}
      <View style={styles.mapDummy}>
        <Text style={styles.mapText}>[지도 영역 - Google Map]</Text>
      </View>



      {/* 🟢 하단 버튼 상태별 조건부 렌더링 */}
      <View style={styles.bottomBox}>
        {status === 'idle' && (
          <>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>시작</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>🗑 제보목록 보기</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'running' && (
          <>
            <Text style={styles.timer}>00:00:00</Text>
            <TouchableOpacity style={styles.stopButton} onPress={handlePause}>
              <Text style={styles.stopButtonText}>정지 ⏸</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'paused' && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>플로깅을 그만하겠습니까?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.resumeBtn} onPress={handleResume}>
                <Text style={styles.resumeText}>계속하기 ▶</Text>
              </TouchableOpacity>
              <TouchableOpacity
  style={styles.endBtn}
  onPress={() => {
    setStatus('ended'); // 상태 업데이트는 유지
    navigation.navigate('PloggingRecord'); // 👉 PloggingRecordScreen으로 이동
  }}
>
  <Text style={styles.endText}>종료 ⏹</Text>
</TouchableOpacity>
            </View>
          </View>
        )}


      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapDummy: {
    flex: 1,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#666',
    fontSize: 14,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
    color: '#333',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userIcon: {
    fontSize: 18,
  },
  bottomBox: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    width: width * 0.6,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  reportButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
    width: width * 0.5,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stopButton: {
    backgroundColor: '#222',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  confirmBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  resumeBtn: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  resumeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  endBtn: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
  },
  endText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  trashCount: {
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
});
