// TrailInfoModal.js - 산책로 정보 모달 컴포넌트 분리

import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * 산책로 정보 모달 컴포넌트
 */
const TrailInfoModal = ({ 
  visible, 
  trail, 
  onClose, 
  onConfirm 
}) => {
  if (!trail) return null;

  const formatTrailInfo = (trail) => {
    return {
      name: trail.trailName || '이름 없는 산책로',
      location: trail.lotNumberAddress || '주소 정보 없음',
      length: trail.length || '정보 없음',
      duration: trail.trackTime || '정보 없음',
      difficulty: trail.difficultyLevel || '보통',
      reportCount: trail.reportCount || 0,
      distance: trail.distanceToUser ? `${trail.distanceToUser.toFixed(0)}m` : '거리 계산 중'
    };
  };

  const trailInfo = formatTrailInfo(trail);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{trailInfo.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* 내용 */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <InfoRow
              icon="📍"
              label="위치"
              value={trailInfo.location}
            />
            
            <InfoRow
              icon="📏"
              label="총 길이"
              value={trailInfo.length}
            />
            
            <InfoRow
              icon="⏱️"
              label="소요시간"
              value={trailInfo.duration}
            />
            
            <InfoRow
              icon="🏔️"
              label="난이도"
              value={trailInfo.difficulty}
            />
            
            <InfoRow
              icon="🗑️"
              label="쓰레기 신고"
              value={`${trailInfo.reportCount}개`}
            />
            
            <InfoRow
              icon="📏"
              label="현재 위치에서"
              value={trailInfo.distance}
              isLast={true}
            />
          </ScrollView>
          
          {/* 버튼 영역 */}
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => onConfirm(trail)}
            >
              <Text style={styles.confirmButtonText}>이 코스로 플로깅 시작</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * 정보 행 컴포넌트
 */
const InfoRow = ({ icon, label, value, isLast = false }) => (
  <View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
    <Text style={styles.infoLabel}>{icon} {label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxHeight: screenHeight * 0.8,
    width: screenWidth * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    // 높은 z-index 설정
    zIndex: 2000,
  },
  
  // 헤더
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },
  
  // 내용
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    maxHeight: screenHeight * 0.5,
  },
  infoRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    lineHeight: 22,
  },
  
  // 버튼 영역
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#418663',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TrailInfoModal;