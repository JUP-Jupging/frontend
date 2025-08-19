import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PloggingEndModal = ({ visible, trashCount, onContinue, onEnd }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>플로깅을 그만하겠습니까?</Text>
          
          <View style={styles.trashInfo}>
            <Text style={styles.trashLabel}>주운 쓰레기</Text>
            <Text style={styles.trashCount}>{trashCount}개</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
              <Text style={styles.continueButtonText}>계속하기</Text>
              <Image 
                source={require('../../assets/play.png')} 
                style={styles.playIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.endButton} onPress={onEnd}>
              <Text style={styles.endButtonText}>종료</Text>
              <Image 
                source={require('../../assets/tablet.png')} 
                style={styles.tabletIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.8, // 반응형: 화면 너비의 80%
    minWidth: 280,
    maxWidth: 320,
    height: screenHeight * 0.2, // 반응형: 화면 높이의 20%
    minHeight: 201,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    fontSize: screenWidth * 0.05, // 반응형: 화면 너비의 5%
    minFontSize: 18,
    maxFontSize: 22,
    lineHeight: screenWidth * 0.06, // 반응형
    color: '#333333',
    marginTop: 30,
  },
  trashInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  trashLabel: {
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  trashCount: {
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    fontSize: 12,
    color: '#2E2E2E',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.25, // 반응형
    minWidth: 100,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#418663',
    borderRadius: 30,
  },
  continueButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    fontSize: 16,
    color: '#418663',
    textAlign: 'center',
    letterSpacing: -0.24,
    marginRight: 4, // 글자와 아이콘 사이 간격
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.25, // 반응형
    minWidth: 100,
    height: 40,
    backgroundColor: '#2E2E2E',
    borderRadius: 30,
  },
  endButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.24,
    marginRight: 4, // 글자와 아이콘 사이 간격
  },
  playIcon: {
    width: 20,
    height: 18,
    tintColor: '#418663', // play 아이콘을 초록색으로
  },
  tabletIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF', // tablet 아이콘을 흰색으로
  },
});

export default PloggingEndModal;
