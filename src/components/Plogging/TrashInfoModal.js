import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get("window");

const TrashInfoModal = ({ 
  visible, 
  trash, 
  onClose, 
  onPickTrash 
}) => {
  console.log('[TrashInfoModal] 렌더링:', { visible, trash: !!trash });

  if (!trash) {
    console.log('[TrashInfoModal] 쓰레기 정보 없음');
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        console.log('[TrashInfoModal] 모달 닫기 요청');
        onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>쓰레기 정보</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('[TrashInfoModal] X 버튼 클릭');
                onClose();
              }}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView style={styles.modalBody}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>위치</Text>
              <Text style={styles.infoValue}>{trash.location}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>쓰레기 양</Text>
              <Text style={styles.infoValue}>{trash.amount}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>종류</Text>
              <View style={styles.photoContainer}>
                {trash.photos && trash.photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <View style={[styles.photoColor, { backgroundColor: photo.color }]} />
                    <Text style={styles.photoText}>
                      {photo.type} ({photo.count}개)
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.pickButton} 
              onPress={() => {
                console.log('[TrashInfoModal] 줍기 버튼 클릭, trash ID:', trash.id);
                onPickTrash(trash);
              }}
            >
              <Icon name="cleaning-services" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.pickButtonText}>줍기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  modalBody: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    color: "#212529",
  },
  photoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  photoColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  photoText: {
    fontSize: 14,
    color: "#495057",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#418663",
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TrashInfoModal;
