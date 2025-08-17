import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'

export default function PloggingControls({
  status,
  time,
  trashCount,
  formatTime,
  onPause,
  onResume,
  onEnd,
  onShowTrashList,
}) {

  if (status === 'idle') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>플로깅 시간</Text>
        <Text style={styles.timeValue}>
          {formatTime ? formatTime(time) : '00:00:00'}
        </Text>
      </View>

      {/* [추가] 중간 가로줄 */}
      <View style={styles.divider} />

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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onEnd}
        >
          <Image source={require("../../assets/tablet.png")} style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>종료</Text>
        </TouchableOpacity>
        {status === 'running' ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onPause}
          >
            <Image source={require("../../assets/tablet.png")} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>일시정지</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onResume}
          >
            <Image source={require("../../assets/play.png")} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>재시작</Text>
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
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    minHeight: 200,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 15, // 여백 조정
  },
  timeLabel: {
    fontSize: 16,
    color: '#2E2E2E',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 48,
    color: '#2E2E2E',
    fontWeight: '300',
    letterSpacing: 2,
  },
  // [추가] 가로줄 스타일
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 15, // 위아래 여백
  },
  trashInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15, // 여백 조정
    width: '100%',
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
    backgroundColor: '#418663',
    borderRadius: 2,
  },
  trashText: {
    fontSize: 16,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  trashCount: {
    fontWeight: '700',
    color: '#418663',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#418663',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF'
  }
});