// EnhancedTrashInfoModal.js - 탭바 통합 방식에 맞게 간소화된 버전

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getReportById, markReportPicked } from '../../api/report';
import { useAuth } from '../../stores/useAuth';
import { usePloggingContext } from '../../contexts/PloggingContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get("window");

/**
 * 개선된 쓰레기 정보 모달 컴포넌트 - 탭바 통합 버전 (간소화)
 */
const EnhancedTrashInfoModal = ({
  visible,
  trashId,
  onClose,
  onPickSuccess,
  onModalStateChange,
}) => {
  // ✅ [수정] 모든 훅 호출을 컴포넌트 최상단으로 이동시킵니다.
  const { accessToken } = useAuth();
  const { getTrashDetails } = usePloggingContext();
  const insets = useSafeAreaInsets();

  // 로컬 상태 훅
  const [trashDetails, setTrashDetails] = useState(null);
  const [isPickingTrash, setIsPickingTrash] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // useEffect 훅
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(visible);
    }
  }, [visible, onModalStateChange]);

  useEffect(() => {
    if (visible && trashId) {
      loadTrashDetails();
    } else {
      resetModalState();
    }
  }, [visible, trashId]);


  // --- 이하 함수 정의 (순서 변경 없음) ---

  /**
   * 쓰레기 상세 정보 로드 (컨텍스트 우선, API fallback)
   */
  const loadTrashDetails = async () => {
    try {
      setIsLoadingDetails(true);
      console.log(`🔍 [EnhancedTrashInfoModal] === 쓰레기 정보 로드 시작 ===`);

      // 1차: 컨텍스트에서 쓰레기 상세 정보 조회 시도
      let trashFromContext = null;
      if (getTrashDetails && typeof getTrashDetails === 'function') {
        trashFromContext = getTrashDetails(trashId);
      }

      let reportData = null;

      if (trashFromContext) {
        // 컨텍스트에서 데이터를 찾은 경우
        reportData = trashFromContext.originalData || trashFromContext;
      } else {
        // 2차: API를 통해 쓰레기 상세 정보 가져오기
        reportData = await getReportById(trashId, accessToken);
      }

      if (reportData) {
        // API 응답을 내부 형식으로 변환
        const formattedDetails = formatReportData(reportData);
        setTrashDetails(formattedDetails);
        setImageLoadError(false);
        console.log('✅ [EnhancedTrashInfoModal] 상세 정보 로드 완료!');
      } else {
        console.warn(`⚠️ [EnhancedTrashInfoModal] 응답이 null/undefined입니다`);
        setTrashDetails(null);
      }

    } catch (error) {
      console.error(`❌ [EnhancedTrashInfoModal] 쓰레기 ${trashId} 정보 로드 실패:`, error);
      setTrashDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  /**
   * API 응답 데이터를 내부 형식으로 변환
   */
  const formatReportData = (reportData) => {
    // 카테고리별 상세 정보 생성
    const categoryDetails = [];
    const categories = [
      { key: 'paper', name: '종이', color: '#8BC34A' },
      { key: 'can', name: '캔', color: '#FF9800' },
      { key: 'plastic', name: '플라스틱', color: '#2196F3' },
      { key: 'vinyl', name: '비닐', color: '#9C27B0' },
      { key: 'glass', name: '유리', color: '#4CAF50' },
      { key: 'styro', name: '스티로폼', color: '#FFC107' },
      { key: 'battery', name: '건전지', color: '#F44336' }
    ];

    let totalCount = 0;
    categories.forEach(category => {
      const count = reportData[category.key] || 0;
      if (count > 0) {
        categoryDetails.push({
          type: category.name,
          count: count,
          color: category.color
        });
        totalCount += count;
      }
    });

    // 쓰레기 양 계산
    const getAmount = (total) => {
      if (total >= 10) return '많음';
      if (total >= 5) return '보통';
      return '적음';
    };

    const getAmountColor = (amount) => {
      switch(amount) {
        case '많음': return '#FF5722';
        case '보통': return '#FF9800';
        case '적음': return '#4CAF50';
        default: return '#797982';
      }
    };

    const amount = getAmount(totalCount);

    return {
      id: reportData.reportId,
      title: reportData.title || '쓰레기 신고',
      location: `위도: ${reportData.lat?.toFixed(4)}, 경도: ${reportData.lng?.toFixed(4)}`,
      amount: amount,
      totalCount: totalCount,
      color: getAmountColor(amount),
      categoryDetails: categoryDetails,
      isPicked: reportData.isPicked === 'Y',
      imageUrl: reportData.imageUrl,
      reportDate: reportData.createdAt || new Date().toISOString(),
      originalData: reportData
    };
  };

  /**
   * 모달 상태 초기화
   */
  const resetModalState = () => {
    setTrashDetails(null);
    setImageLoadError(false);
    setIsPickingTrash(false);
    setIsLoadingDetails(false);
  };

  /**
   * API를 통한 쓰레기 줍기 처리
   */
  const handlePickTrash = async () => {
    if (!trashDetails || isPickingTrash) {
      return;
    }

    if (trashDetails.isPicked) {
      Alert.alert(
        '이미 주운 쓰레기',
        '이 쓰레기는 이미 다른 사용자가 주웠습니다.',
        [{ text: '확인' }]
      );
      return;
    }

    try {
      setIsPickingTrash(true);
      
      const result = await markReportPicked(trashId, accessToken);
      console.log(`✅ [handlePickTrash] 쓰레기 ${trashId} 줍기 성공`);
      
      setTrashDetails(prev => ({
        ...prev,
        isPicked: true
      }));
      
      if (onPickSuccess) {
        onPickSuccess(trashDetails);
      }
      
      Alert.alert(
        '수거 완료',
        '쓰레기를 성공적으로 수거했습니다!',
        [{ text: '확인', onPress: onClose }]
      );

    } catch (error) {
      console.error('❌ [handlePickTrash] 쓰레기 줍기 중 오류:', error);
      
      let errorMessage = '쓰레기 수거 중 오류가 발생했습니다.';
      
      if (error.status === 404) {
        errorMessage = '해당 쓰레기 신고를 찾을 수 없습니다.';
      } else if (error.status === 403) {
        errorMessage = '쓰레기 수거 권한이 없습니다.';
      } else if (error.status === 409) {
        errorMessage = '이미 수거된 쓰레기입니다.';
      } else if (error.message && error.message.includes('Network')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      
      Alert.alert('오류 발생', errorMessage, [{ text: '확인' }]);
    } finally {
      setIsPickingTrash(false);
    }
  };

  /**
   * 모달 닫기 처리
   */
  const handleClose = () => {
    if (isPickingTrash) {
      return;
    }
    onClose();
  };

  /**
   * 카테고리 아이템 렌더링
   */
  const renderCategoryItem = (category) => (
    <View key={category.type} style={styles.categoryItem}>
      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
      <Text style={styles.categoryText}>
        {category.type} ({category.count}개)
      </Text>
    </View>
  );

  /**
   * 이미지 렌더링 (있는 경우만)
   */
  const renderTrashImage = () => {
    if (!trashDetails?.imageUrl || imageLoadError) {
      return null;
    }

    return (
      <View style={styles.imageSection}>
        <Text style={styles.sectionLabel}>신고 이미지</Text>
        <Image
          source={{ uri: trashDetails.imageUrl }}
          style={styles.trashImage}
          onError={() => {
            console.warn('⚠️ [EnhancedTrashInfoModal] 이미지 로드 실패');
            setImageLoadError(true);
          }}
          resizeMode="cover"
        />
      </View>
    );
  };

  /**
   * 줍기 버튼 렌더링
   */
  const renderPickButton = () => {
    if (trashDetails?.isPicked) {
      return (
        <View style={[styles.pickButton, styles.pickedButton]}>
          <Icon name="check-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.pickedButtonText}>이미 수거됨</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.pickButton, isPickingTrash && styles.pickingButton]} 
        onPress={handlePickTrash}
        disabled={isPickingTrash}
      >
        {isPickingTrash ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.pickButtonText}>처리 중...</Text>
          </>
        ) : (
          <>
            <Icon name="cleaning-services" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.pickButtonText}>줍기</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  // ✅ [수정] 모든 훅 호출이 끝난 후에 조건부 return을 실행합니다.
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>쓰레기 정보</Text>
              {trashDetails?.isPicked && (
                <View style={styles.pickedBadge}>
                  <Icon name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.pickedBadgeText}>수거됨</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              onPress={handleClose}
              disabled={isPickingTrash || isLoadingDetails}
              style={[styles.closeButton, (isPickingTrash || isLoadingDetails) && styles.disabledButton]}
            >
              <Icon name="close" size={24} color={(isPickingTrash || isLoadingDetails) ? "#CCC" : "#666"} />
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* 로딩 상태 */}
            {isLoadingDetails && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#418663" />
                <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
              </View>
            )}

            {/* 데이터가 있을 때만 표시 */}
            {!isLoadingDetails && trashDetails && (
              <>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionLabel}>제목</Text>
                  <Text style={styles.infoValue}>{trashDetails.title}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionLabel}>위치</Text>
                  <Text style={styles.infoValue}>{trashDetails.location}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionLabel}>쓰레기 양</Text>
                  <View style={styles.amountContainer}>
                    <View style={[
                      styles.amountIndicator, 
                      { backgroundColor: trashDetails.color }
                    ]} />
                    <Text style={[styles.infoValue, { marginLeft: 8 }]}>
                      {trashDetails.amount} (총 {trashDetails.totalCount}개)
                    </Text>
                  </View>
                </View>

                {/* 카테고리별 상세 정보 */}
                {trashDetails.categoryDetails && trashDetails.categoryDetails.length > 0 && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>쓰레기 종류</Text>
                    <View style={styles.categoryContainer}>
                      {trashDetails.categoryDetails.map(renderCategoryItem)}
                    </View>
                  </View>
                )}

                {/* 신고 날짜 */}
                {trashDetails.reportDate && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>신고 날짜</Text>
                    <Text style={styles.infoValue}>
                      {new Date(trashDetails.reportDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                )}

                {/* 이미지 (있는 경우) */}
                {renderTrashImage()}
              </>
            )}

            {/* 데이터 로드 실패 */}
            {!isLoadingDetails && !trashDetails && (
              <View style={styles.errorContainer}>
                <Icon name="error" size={48} color="#FF5722" />
                <Text style={styles.errorText}>쓰레기 정보를 불러올 수 없습니다</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={loadTrashDetails}
                >
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* 하단 버튼 */}
          {!isLoadingDetails && trashDetails && (
            <View style={styles.modalFooter}>
              {renderPickButton()}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    zIndex: 1000,
    elevation: 1000,
    marginHorizontal: 10,
  },
  
  // 헤더 스타일
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    zIndex: 1001,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginRight: 12,
  },
  pickedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  disabledButton: {
    opacity: 0.5,
  },
  
  // 내용 스타일
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  
  // 로딩 컨테이너
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  
  // 에러 컨테이너
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#418663',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  infoSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    color: "#212529",
    lineHeight: 22,
  },
  
  // 쓰레기 양 표시
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  
  // 카테고리 스타일
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  
  // 이미지 스타일
  imageSection: {
    marginTop: 8,
  },
  trashImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  
  // 하단 버튼 스타일
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    zIndex: 1001,
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
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pickingButton: {
    backgroundColor: "#6C757D",
  },
  pickedButton: {
    backgroundColor: "#4CAF50",
  },
  pickButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  pickedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EnhancedTrashInfoModal;

