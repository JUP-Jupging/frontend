import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

/**
 * 🎮 PloggingControls: 플로깅 제어 및 통계 표시 컴포넌트 (이미지 스타일 버전)
 */
export default function PloggingControls({
  status,
  time,
  trashCount,
  totalDistance,
  formatTime,
  formatDistance,
  onStart,      // 시작 버튼 핸들러 추가
  onPause,
  onResume,
  onEnd,
  onGoToMain,
  onShowTrashList, // 쓰레기 목록 표시 핸들러 추가
}) {
  
  console.log('[PloggingControls] 렌더링:', { status, time, trashCount });

  // 플로깅 시작 전 (idle 상태)
  if (status === 'idle') {
    return (
      <View style={styles.container}>
        {/* 플로깅 시간 표시 */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>플로깅 시간</Text>
          <Text style={styles.timeValue}>00:00:00</Text>
        </View>

        {/* 시작 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={onStart}
          >
            <Icon name="stop" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>정지</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 플로깅 진행 중 또는 일시정지 (running/paused 상태)
  return (
    <View style={styles.container}>
      {/* 상단 시간 표시 */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>플로깅 시간</Text>
        <Text style={styles.timeValue}>
          {formatTime ? formatTime(time) : '00:00:00'}
        </Text>
      </View>

      {/* 쓰레기 정보 영역 */}
      <View style={styles.trashInfoContainer}>
        <TouchableOpacity 
          style={styles.trashListButton}
          onPress={onShowTrashList}
        >
          <View style={styles.hamburgerMenu}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.trashText}>
          현재 주운 쓰레기 <Text style={styles.trashCount}>{trashCount || 0}개</Text>
        </Text>
      </View>

      {/* 제어 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={onEnd}
        >
          <Icon name="stop" size={20} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>종료</Text>
        </TouchableOpacity>

        {status === 'running' ? (
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onPause}
          >
              <Image source={require("../../assets/tablet.png")} style={styles.tabletIcon} />
            <Text style={styles.primaryButtonText}>일시정지</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onResume}
          >
            <Text style={styles.primaryButtonText}>재시작</Text>
              <Image source={require("../../assets/play.png")} style={styles.playIcon} />
          </TouchableOpacity>
          
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    minHeight: 200,
  },

  // 시간 표시 영역
  timeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 48,
    color: '#333333',
    fontWeight: '300',
    letterSpacing: 2,
  },

  // 쓰레기 정보 영역
  trashInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
  },
  trashListButton: {
    marginRight: 15,
    padding: 10,
  },
  hamburgerMenu: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  trashText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  trashCount: {
    fontWeight: '700',
    color: '#4CAF50',
  },

  // 버튼 컨테이너
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },

  // 시작 버튼 (idle 상태)
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // 주요 버튼 (재시작/일시정지)
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    gap: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
    playIcon: {
    width: 30,
    height: 30,
    
    border: "1px solid #FFFFFF",
    tintColor: "#FFFFFF",
  },
  tabletIcon: {
    width: 30,
    height: 30,
    border: "1px solid #FFFFFF",
    tintColor: "#FFFFFF",
  },
  // 종료 버튼
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666666',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});