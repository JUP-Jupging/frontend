// EnhancedTrashInfoModal.js - ì“°ë ˆê¸° ì •ë³´ ëª¨ë‹¬ (ìˆ˜ì •ëœ ë²„ì „)

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
import { getReportById, markReportPicked } from '../../api/report'; // ðŸ”¥ API ì§ì ‘ import
import { useAuth } from '../../stores/useAuth'; // ðŸ”¥ ì¸ì¦ ì •ë³´ ì¶”ê°€
import { usePloggingContext } from '../../contexts/PloggingContext'; // ðŸ”¥ ì»¨í…ìŠ¤íŠ¸ ì¶”ê°€

const { width: screenWidth } = Dimensions.get("window");

/**
 * ê°œì„ ëœ ì“°ë ˆê¸° ì •ë³´ ëª¨ë‹¬ ì»´í¬ë„ŒíŠ¸
 */
const EnhancedTrashInfoModal = ({ 
  visible, 
  trashId, 
  onClose, 
  onPickSuccess,
  onModalStateChange
}) => {
  // ðŸ”¥ ì¸ì¦ ì •ë³´ ê°€ì ¸ì˜¤ê¸°
  const { accessToken } = useAuth();
  
  // ðŸ”¥ í”Œë¡œê¹… ì»¨í…ìŠ¤íŠ¸ì—ì„œ ì“°ë ˆê¸° ìƒì„¸ ì •ë³´ ì¡°íšŒ í•¨ìˆ˜ ê°€ì ¸ì˜¤ê¸°
  const { getTrashDetails } = usePloggingContext();
  
  // ë¡œì»¬ ìƒíƒœ
  const [trashDetails, setTrashDetails] = useState(null);
  const [isPickingTrash, setIsPickingTrash] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  console.log('[EnhancedTrashInfoModal] === ì»´í¬ë„ŒíŠ¸ ë Œë”ë§ ===', { 
    visible, 
    trashId,
    trashIdType: typeof trashId,
    hasDetails: !!trashDetails,
    isLoadingDetails,
    hasAccessToken: !!accessToken
  });

  // ëª¨ë‹¬ ìƒíƒœ ë³€ê²½ ì‹œ ë¶€ëª¨ì—ê²Œ ì•Œë¦¼
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(visible);
    }
  }, [visible, onModalStateChange]);

  /**
   * ðŸ”¥ ì“°ë ˆê¸° ìƒì„¸ ì •ë³´ ë¡œë“œ
   */
  useEffect(() => {
    console.log(`ðŸŽ¯ [EnhancedTrashInfoModal] useEffect í˜¸ì¶œ:`, {
      visible,
      trashId,
      trashIdType: typeof trashId,
      trashIdValue: trashId
    });
    
    if (visible && trashId) {
      console.log(`ðŸŽ¯ [EnhancedTrashInfoModal] ì¡°ê±´ ë§Œì¡± - loadTrashDetails í˜¸ì¶œ`);
      loadTrashDetails();
    } else {
      console.log(`ðŸŽ¯ [EnhancedTrashInfoModal] ì¡°ê±´ ë¶ˆë§Œì¡± - ìƒíƒœ ì´ˆê¸°í™”`);
      console.log(`ðŸŽ¯ [EnhancedTrashInfoModal] visible: ${visible}, trashId: ${trashId}`);
      // ëª¨ë‹¬ì´ ë‹«ížˆë©´ ìƒíƒœ ì´ˆê¸°í™”
      resetModalState();
    }
  }, [visible, trashId]);

  /**
   * ðŸ”¥ ì“°ë ˆê¸° ìƒì„¸ ì •ë³´ ë¡œë“œ (ì»¨í…ìŠ¤íŠ¸ ìš°ì„ , API fallback)
   */
  const loadTrashDetails = async () => {
    try {
      setIsLoadingDetails(true);
      console.log(`ðŸ” [EnhancedTrashInfoModal] === ì“°ë ˆê¸° ì •ë³´ ë¡œë“œ ì‹œìž‘ ===`);
      console.log(`ðŸ” [EnhancedTrashInfoModal] trashId:`, trashId);
      console.log(`ðŸ” [EnhancedTrashInfoModal] accessToken:`, accessToken ? 'ì¡´ìž¬í•¨' : 'ì—†ìŒ');
      
      // ðŸ”¥ 1ì°¨: ì»¨í…ìŠ¤íŠ¸ì—ì„œ ì“°ë ˆê¸° ìƒì„¸ ì •ë³´ ì¡°íšŒ ì‹œë„
      let trashFromContext = null;
      if (getTrashDetails && typeof getTrashDetails === 'function') {
        console.log(`ðŸ” [EnhancedTrashInfoModal] ì»¨í…ìŠ¤íŠ¸ì—ì„œ ì“°ë ˆê¸° ì •ë³´ ì¡°íšŒ ì‹œë„...`);
        trashFromContext = getTrashDetails(trashId);
        console.log(`ðŸ” [EnhancedTrashInfoModal] ì»¨í…ìŠ¤íŠ¸ ì¡°íšŒ ê²°ê³¼:`, trashFromContext ? 'ìžˆìŒ' : 'ì—†ìŒ');
      }
      
      let reportData = null;
      
      if (trashFromContext) {
        // ì»¨í…ìŠ¤íŠ¸ì—ì„œ ë°ì´í„°ë¥¼ ì°¾ì€ ê²½ìš°
        console.log(`ðŸ” [EnhancedTrashInfoModal] ì»¨í…ìŠ¤íŠ¸ ë°ì´í„° ì‚¬ìš©`);
        reportData = trashFromContext.originalData || trashFromContext;
      } else {
        // ðŸ”¥ 2ì°¨: APIë¥¼ í†µí•´ ì“°ë ˆê¸° ìƒì„¸ ì •ë³´ ê°€ì ¸ì˜¤ê¸°
        console.log(`ðŸ” [EnhancedTrashInfoModal] getReportById API í˜¸ì¶œ ì‹œìž‘...`);
        reportData = await getReportById(trashId, accessToken);
        console.log(`ðŸ” [EnhancedTrashInfoModal] API ì‘ë‹µ ë°›ìŒ:`, reportData ? 'OK' : 'NULL');
      }
      
      if (reportData) {
        console.log(`ðŸ” [EnhancedTrashInfoModal] formatReportData í˜¸ì¶œ ì‹œìž‘...`);
        // API ì‘ë‹µì„ ë‚´ë¶€ í˜•ì‹ìœ¼ë¡œ ë³€í™˜
        const formattedDetails = formatReportData(reportData);
        console.log(`ðŸ” [EnhancedTrashInfoModal] í¬ë§·íŒ… ì™„ë£Œ:`, formattedDetails);
        
        setTrashDetails(formattedDetails);
        setImageLoadError(false);
        console.log('âœ… [EnhancedTrashInfoModal] ìƒì„¸ ì •ë³´ ë¡œë“œ ì™„ë£Œ!');
      } else {
        console.warn(`âš ï¸ [EnhancedTrashInfoModal] ì‘ë‹µì´ null/undefinedìž…ë‹ˆë‹¤`);
        setTrashDetails(null);
      }
      
    } catch (error) {
      console.error(`âŒ [EnhancedTrashInfoModal] ì“°ë ˆê¸° ${trashId} ì •ë³´ ë¡œë“œ ì‹¤íŒ¨:`, error);
      console.error(`âŒ [EnhancedTrashInfoModal] ì—ëŸ¬ ìƒì„¸:`, {
        message: error.message,
        stack: error.stack,
        status: error.status,
        payload: error.payload
      });
      setTrashDetails(null);
    } finally {
      setIsLoadingDetails(false);
      console.log(`ðŸ” [EnhancedTrashInfoModal] === ì“°ë ˆê¸° ì •ë³´ ë¡œë“œ ì¢…ë£Œ ===`);
    }
  };

  /**
   * ðŸ”¥ API ì‘ë‹µ ë°ì´í„°ë¥¼ ë‚´ë¶€ í˜•ì‹ìœ¼ë¡œ ë³€í™˜
   */
  const formatReportData = (reportData) => {
    // ì¹´í…Œê³ ë¦¬ë³„ ìƒì„¸ ì •ë³´ ìƒì„±
    const categoryDetails = [];
    const categories = [
      { key: 'paper', name: 'ì¢…ì´', color: '#8BC34A' },
      { key: 'can', name: 'ìº”', color: '#FF9800' },
      { key: 'plastic', name: 'í”Œë¼ìŠ¤í‹±', color: '#2196F3' },
      { key: 'vinyl', name: 'ë¹„ë‹', color: '#9C27B0' },
      { key: 'glass', name: 'ìœ ë¦¬', color: '#4CAF50' },
      { key: 'styro', name: 'ìŠ¤í‹°ë¡œí¼', color: '#FFC107' },
      { key: 'battery', name: 'ê±´ì „ì§€', color: '#F44336' }
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

    // ì“°ë ˆê¸° ì–‘ ê³„ì‚°
    const getAmount = (total) => {
      if (total >= 10) return 'ë§ŽìŒ';
      if (total >= 5) return 'ë³´í†µ';
      return 'ì ìŒ';
    };

    const getAmountColor = (amount) => {
      switch(amount) {
        case 'ë§ŽìŒ': return '#FF5722';
        case 'ë³´í†µ': return '#FF9800';
        case 'ì ìŒ': return '#4CAF50';
        default: return '#797982';
      }
    };

    const amount = getAmount(totalCount);

    return {
      id: reportData.reportId,
      title: reportData.title || 'ì“°ë ˆê¸° ì‹ ê³ ',
      location: `ìœ„ë„: ${reportData.lat?.toFixed(4)}, ê²½ë„: ${reportData.lng?.toFixed(4)}`,
      amount: amount,
      totalCount: totalCount,
      color: getAmountColor(amount),
      categoryDetails: categoryDetails,
      isPicked: reportData.isPicked === 'Y',
      imageUrl: reportData.imageUrl,
      reportDate: reportData.createdAt || new Date().toISOString(),
      // ì›ë³¸ ë°ì´í„°ë„ ë³´ê´€
      originalData: reportData
    };
  };

  /**
   * ëª¨ë‹¬ ìƒíƒœ ì´ˆê¸°í™”
   */
  const resetModalState = () => {
    setTrashDetails(null);
    setImageLoadError(false);
    setIsPickingTrash(false);
    setIsLoadingDetails(false);
  };

  /**
   * ðŸ”¥ APIë¥¼ í†µí•œ ì“°ë ˆê¸° ì¤ê¸° ì²˜ë¦¬
   */
const handlePickTrash = async () => {
  console.log(`ðŸŽ¯ [handlePickTrash] === ì“°ë ˆê¸° ì¤ê¸° ì‹œìž‘ ===`);
  console.log(`ðŸŽ¯ [handlePickTrash] trashDetails:`, !!trashDetails);
  console.log(`ðŸŽ¯ [handlePickTrash] isPickingTrash:`, isPickingTrash);
  
  if (!trashDetails || isPickingTrash) {
    console.log(`ðŸŽ¯ [handlePickTrash] ì¡°ê±´ ë¶ˆë§Œì¡±ìœ¼ë¡œ ë¦¬í„´`);
    return;
  }

  // ì´ë¯¸ ì£¼ìš´ ì“°ë ˆê¸°ì¸ì§€ í™•ì¸
  if (trashDetails.isPicked) {
    console.log(`ðŸŽ¯ [handlePickTrash] ì´ë¯¸ ì£¼ìš´ ì“°ë ˆê¸°`);
    Alert.alert(
      'ì´ë¯¸ ì£¼ìš´ ì“°ë ˆê¸°',
      'ì´ ì“°ë ˆê¸°ëŠ” ì´ë¯¸ ë‹¤ë¥¸ ì‚¬ìš©ìžê°€ ì£¼ì› ìŠµë‹ˆë‹¤.',
      [{ text: 'í™•ì¸' }]
    );
    return;
  }

  try {
    setIsPickingTrash(true);
    console.log(`ðŸŽ¯ [handlePickTrash] markReportPicked API í˜¸ì¶œ ì‹œìž‘...`);
    console.log(`ðŸŽ¯ [handlePickTrash] trashId: ${trashId}, accessToken: ${accessToken ? 'ìžˆìŒ' : 'ì—†ìŒ'}`);

    // ðŸ”¥ API í˜¸ì¶œ - HTTP 200ì´ë©´ ì„±ê³µ
    const result = await markReportPicked(trashId, accessToken);
    
    console.log(`ðŸŽ¯ [handlePickTrash] API ì‘ë‹µ:`, result);
    console.log(`ðŸŽ¯ [handlePickTrash] API ì‘ë‹µ íƒ€ìž…:`, typeof result);
    
    // ðŸ”¥ ì—¬ê¸°ì— ë„ë‹¬í–ˆë‹¤ë©´ ì„±ê³µ (HTTP 200) - ì‘ë‹µ ë‚´ìš©ê³¼ ìƒê´€ì—†ì´ ì„±ê³µ ì²˜ë¦¬
    console.log(`âœ… [handlePickTrash] ì“°ë ˆê¸° ${trashId} ì¤ê¸° ì„±ê³µ (HTTP 200)`);
    
    // ìƒíƒœ ì—…ë°ì´íŠ¸
    setTrashDetails(prev => ({
      ...prev,
      isPicked: true
    }));
    
    // ë¶€ëª¨ ì»´í¬ë„ŒíŠ¸ì— ì„±ê³µ ì•Œë¦¼
    if (onPickSuccess) {
      console.log(`ðŸŽ¯ [handlePickTrash] onPickSuccess ì½œë°± í˜¸ì¶œ`);
      onPickSuccess(trashDetails);
    }
    
    // ì„±ê³µ ì•Œë¦¼
    Alert.alert(
      'ìˆ˜ê±° ì™„ë£Œ',
      'ì“°ë ˆê¸°ë¥¼ ì„±ê³µì ìœ¼ë¡œ ìˆ˜ê±°í–ˆìŠµë‹ˆë‹¤!',
      [{ text: 'í™•ì¸', onPress: onClose }]
    );

  } catch (error) {
    // ðŸ”¥ ì‹¤ì œ ì—ëŸ¬(ë„¤íŠ¸ì›Œí¬, 4xx, 5xx)ë§Œ ì—¬ê¸°ì„œ ì²˜ë¦¬
    console.error('âŒ [handlePickTrash] ì“°ë ˆê¸° ì¤ê¸° ì¤‘ ì˜¤ë¥˜:', error);
    console.error('âŒ [handlePickTrash] ì—ëŸ¬ ìƒì„¸:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      response: error.response
    });
    
    // ðŸ”¥ êµ¬ì²´ì ì¸ ì—ëŸ¬ ë©”ì‹œì§€ ì œê³µ
    let errorMessage = 'ì“°ë ˆê¸° ìˆ˜ê±° ì¤‘ ì˜¤ë¥˜ê°€ ë°œìƒí–ˆìŠµë‹ˆë‹¤.';
    
    if (error.status === 404) {
      errorMessage = 'í•´ë‹¹ ì“°ë ˆê¸° ì‹ ê³ ë¥¼ ì°¾ì„ ìˆ˜ ì—†ìŠµë‹ˆë‹¤.';
    } else if (error.status === 403) {
      errorMessage = 'ì“°ë ˆê¸° ìˆ˜ê±° ê¶Œí•œì´ ì—†ìŠµë‹ˆë‹¤.';
    } else if (error.status === 409) {
      errorMessage = 'ì´ë¯¸ ìˆ˜ê±°ëœ ì“°ë ˆê¸°ìž…ë‹ˆë‹¤.';
    } else if (error.message && error.message.includes('Network')) {
      errorMessage = 'ë„¤íŠ¸ì›Œí¬ ì—°ê²°ì„ í™•ì¸í•´ì£¼ì„¸ìš”.';
    }
    
    Alert.alert(
      'ì˜¤ë¥˜ ë°œìƒ',
      errorMessage,
      [{ text: 'í™•ì¸' }]
    );
  } finally {
    setIsPickingTrash(false);
    console.log(`ðŸŽ¯ [handlePickTrash] === ì“°ë ˆê¸° ì¤ê¸° ì¢…ë£Œ ===`);
  }
};
  /**
   * ëª¨ë‹¬ ë‹«ê¸° ì²˜ë¦¬
   */
  const handleClose = () => {
    if (isPickingTrash) {
      return; // ì¤ê¸° ì²˜ë¦¬ ì¤‘ì—ëŠ” ë‹«ê¸° ë°©ì§€
    }
    
    console.log('[EnhancedTrashInfoModal] ëª¨ë‹¬ ë‹«ê¸°');
    onClose();
  };

  /**
   * ì¹´í…Œê³ ë¦¬ ì•„ì´í…œ ë Œë”ë§
   */
  const renderCategoryItem = (category) => (
    <View key={category.type} style={styles.categoryItem}>
      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
      <Text style={styles.categoryText}>
        {category.type} ({category.count}ê°œ)
      </Text>
    </View>
  );

  /**
   * ì´ë¯¸ì§€ ë Œë”ë§ (ìžˆëŠ” ê²½ìš°ë§Œ)
   */
  const renderTrashImage = () => {
    if (!trashDetails?.imageUrl || imageLoadError) {
      return null;
    }

    return (
      <View style={styles.imageSection}>
        <Text style={styles.sectionLabel}>ì‹ ê³  ì´ë¯¸ì§€</Text>
        <Image
          source={{ uri: trashDetails.imageUrl }}
          style={styles.trashImage}
          onError={() => {
            console.warn('âš ï¸ [EnhancedTrashInfoModal] ì´ë¯¸ì§€ ë¡œë“œ ì‹¤íŒ¨');
            setImageLoadError(true);
          }}
          resizeMode="cover"
        />
      </View>
    );
  };

  /**
   * ì¤ê¸° ë²„íŠ¼ ë Œë”ë§
   */
  const renderPickButton = () => {
    // ì´ë¯¸ ì£¼ìš´ ì“°ë ˆê¸°ì¸ ê²½ìš°
    if (trashDetails?.isPicked) {
      return (
        <View style={[styles.pickButton, styles.pickedButton]}>
          <Icon name="check-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.pickedButtonText}>ì´ë¯¸ ìˆ˜ê±°ë¨</Text>
        </View>
      );
    }

    // ì¤ê¸° ê°€ëŠ¥í•œ ê²½ìš°
    return (
      <TouchableOpacity 
        style={[styles.pickButton, isPickingTrash && styles.pickingButton]} 
        onPress={handlePickTrash}
        disabled={isPickingTrash}
      >
        {isPickingTrash ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.pickButtonText}>ì²˜ë¦¬ ì¤‘...</Text>
          </>
        ) : (
          <>
            <Icon name="cleaning-services" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.pickButtonText}>ì¤ê¸°</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  // ëª¨ë‹¬ì´ ë³´ì´ì§€ ì•Šìœ¼ë©´ null ë°˜í™˜
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
        <View style={styles.modalContent}>
          {/* í—¤ë” */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>ì“°ë ˆê¸° ì •ë³´</Text>
              {trashDetails?.isPicked && (
                <View style={styles.pickedBadge}>
                  <Icon name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.pickedBadgeText}>ìˆ˜ê±°ë¨</Text>
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

          {/* ë‚´ìš© */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* ðŸ”¥ ë¡œë”© ìƒíƒœ */}
            {isLoadingDetails && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#418663" />
                <Text style={styles.loadingText}>ì •ë³´ë¥¼ ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘...</Text>
              </View>
            )}

            {/* ðŸ”¥ ë°ì´í„°ê°€ ìžˆì„ ë•Œë§Œ í‘œì‹œ */}
            {!isLoadingDetails && trashDetails && (
              <>
                {/* ê¸°ë³¸ ì •ë³´ ì„¹ì…˜ */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionLabel}>ì œëª©</Text>
                  <Text style={styles.infoValue}>{trashDetails.title}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionLabel}>ìœ„ì¹˜</Text>
                  <Text style={styles.infoValue}>{trashDetails.location}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionLabel}>ì“°ë ˆê¸° ì–‘</Text>
                  <View style={styles.amountContainer}>
                    <View style={[
                      styles.amountIndicator, 
                      { backgroundColor: trashDetails.color }
                    ]} />
                    <Text style={[styles.infoValue, { marginLeft: 8 }]}>
                      {trashDetails.amount} (ì´ {trashDetails.totalCount}ê°œ)
                    </Text>
                  </View>
                </View>

                {/* ì¹´í…Œê³ ë¦¬ë³„ ìƒì„¸ ì •ë³´ */}
                {trashDetails.categoryDetails && trashDetails.categoryDetails.length > 0 && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>ì“°ë ˆê¸° ì¢…ë¥˜</Text>
                    <View style={styles.categoryContainer}>
                      {trashDetails.categoryDetails.map(renderCategoryItem)}
                    </View>
                  </View>
                )}

                {/* ì‹ ê³  ë‚ ì§œ */}
                {trashDetails.reportDate && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>ì‹ ê³  ë‚ ì§œ</Text>
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

                {/* ì´ë¯¸ì§€ (ìžˆëŠ” ê²½ìš°) */}
                {renderTrashImage()}
              </>
            )}

            {/* ðŸ”¥ ë°ì´í„° ë¡œë“œ ì‹¤íŒ¨ */}
            {!isLoadingDetails && !trashDetails && (
              <View style={styles.errorContainer}>
                <Icon name="error" size={48} color="#FF5722" />
                <Text style={styles.errorText}>ì“°ë ˆê¸° ì •ë³´ë¥¼ ë¶ˆëŸ¬ì˜¬ ìˆ˜ ì—†ìŠµë‹ˆë‹¤</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={loadTrashDetails}
                >
                  <Text style={styles.retryButtonText}>ë‹¤ì‹œ ì‹œë„</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* í•˜ë‹¨ ë²„íŠ¼ */}
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
    paddingBottom: 80, // ðŸ”¥ ë°”í…€ ë„¤ë¹„ê²Œì´í„° ë†’ì´ë§Œí¼ ì—¬ë°± ì¶”ê°€ (ì¼ë°˜ì ìœ¼ë¡œ 60-80px)
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%", // ðŸ”¥ ë†’ì´ ë” ì¤„ìž„ (75% â†’ 70%)
    paddingBottom: 20,
    zIndex: 1000,
    elevation: 1000,
    marginHorizontal: 10, // ðŸ”¥ ì¢Œìš° ì—¬ë°± ì¶”ê°€
  },
  
  // í—¤ë” ìŠ¤íƒ€ì¼
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
  
  // ë‚´ìš© ìŠ¤íƒ€ì¼
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  
  // ðŸ”¥ ë¡œë”© ì»¨í…Œì´ë„ˆ
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
  
  // ðŸ”¥ ì—ëŸ¬ ì»¨í…Œì´ë„ˆ
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
  
  // ì“°ë ˆê¸° ì–‘ í‘œì‹œ
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  
  // ì¹´í…Œê³ ë¦¬ ìŠ¤íƒ€ì¼
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
  
  // ì´ë¯¸ì§€ ìŠ¤íƒ€ì¼
  imageSection: {
    marginTop: 8,
  },
  trashImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  
  // í•˜ë‹¨ ë²„íŠ¼ ìŠ¤íƒ€ì¼
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