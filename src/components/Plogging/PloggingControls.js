import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

/**
 * 🎮 PloggingControls: 플로깅 제어 및 통계 표시 컴포넌트
 * 
 * 주요 기능:
 * 1. 실시간 플로깅 통계 표시 (시간, 거리, 쓰레기 개수)
 * 2. 플로깅 제어 버튼 (일시정지/재시작/종료)
 * 3. 메인 화면으로 이동 (백그라운드 실행)
 * 
 * Props:
 * - status: 플로깅 상태 ('idle' | 'running' | 'paused')
 * - time: 경과 시간 (초)
 * - trashCount: 수집한 쓰레기 개수
 * - totalDistance: 총 이동 거리 (미터)
 * - formatTime: 시간 포맷팅 함수
 * - formatDistance: 거리 포맷팅 함수
 * - onPause: 일시정지 핸들러
 * - onResume: 재시작 핸들러
 * - onEnd: 종료 핸들러
 * - onGoToMain: 메인 화면 이동 핸들러
 */
export default function PloggingControls({
  status,
  time,
  trashCount,
  totalDistance,
  formatTime,
  formatDistance,
  onPause,
  onResume,
  onEnd,
  onGoToMain,
}) {
  
  console.log('[PloggingControls] 렌더링:', {
    status,
    time,
    trashCount,
    totalDistance,
    formattedDistance: formatDistance ? formatDistance(totalDistance) : 'N/A',
    formattedTime: formatTime ? formatTime(time) : 'N/A'
  });

  return (
    <View style={styles.container}>
      {/* 📊 상단 통계 표시 영역 */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          {/* ⏱️ 경과 시간 */}
          <View style={styles.statItem}>
            <Icon name="access-time" size={20} color="#4CAF50" />
            <Text style={styles.statLabel}>시간</Text>
            <Text style={styles.statValue}>
              {formatTime ? formatTime(time) : '00:00:00'}
            </Text>
          </View>

          {/* 📏 이동 거리 */}
          <View style={styles.statItem}>
            <Icon name="timeline" size={20} color="#4CAF50" />
            <Text style={styles.statLabel}>거리</Text>
            <Text style={styles.statValue}>
              {formatDistance ? formatDistance(totalDistance) : '0km'}
            </Text>
          </View>

          {/* 🗑️ 쓰레기 개수 */}
          <View style={styles.statItem}>
            <Icon name="delete-outline" size={20} color="#4CAF50" />
            <Text style={styles.statLabel}>쓰레기</Text>
            <Text style={styles.statValue}>{trashCount || 0}개</Text>
          </View>
        </View>
      </View>

      {/* 🎮 하단 제어 버튼 영역 */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          {/* 메인 화면 이동 버튼 */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={onGoToMain}
          >
            <Icon name="home" size={20} color="#666666" />
            <Text style={styles.secondaryButtonText}>메인</Text>
          </TouchableOpacity>

          {/* 플로깅 제어 버튼 (일시정지/재시작) */}
          {status === 'running' ? (
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={onPause}
            >
              <Icon name="pause" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>일시정지</Text>
            </TouchableOpacity>
          ) : status === 'paused' ? (
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={onResume}
            >
              <Icon name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>재시작</Text>
            </TouchableOpacity>
          ) : null}

          {/* 종료 버튼 */}
          <TouchableOpacity 
            style={styles.endButton} 
            onPress={onEnd}
          >
            <Icon name="stop" size={20} color="#FFFFFF" />
            <Text style={styles.endButtonText}>종료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },

  // 📊 통계 표시 영역
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '700',
  },

  // 🎮 제어 버튼 영역
  controlsContainer: {
    marginTop: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  // 버튼 스타일들
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 2,
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },

  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});