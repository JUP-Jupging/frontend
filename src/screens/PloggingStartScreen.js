// PloggingStartScreen.js - ì™„ì „ížˆ ë¦¬íŒ©í† ë§ëœ ê¹”ë”í•œ ë²„ì „

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, 
  BackHandler, Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ì»´í¬ë„ŒíŠ¸ imports
import CommonModal from "../components/CommonModal";
import PloggingMap from "../components/Plogging/PloggingMap";
import PloggingHeader from "../components/Plogging/PloggingHeader";
import PloggingEndModal from "../components/Plogging/PloggingEndModal";
import CollapsiblePloggingControls from "../components/Plogging/CollapsiblePloggingControls";
import EnhancedTrashInfoModal from "../components/Plogging/EnhancedTrashInfoModal";
import TrailInfoModal from "../components/Plogging/TrailInfoModal";
import { 
  DistanceInfo, 
  TrashLoadingInfo, 
  MainOverlayContainer,
  PloggingStatusRenderer 
} from "../components/Plogging/UIOverlayComponents";
import { savePloggingRecord } from '../api/plog';
// ì„œë¹„ìŠ¤ imports
import { trailSearchService } from "../services/TrailSearchService";
import { ploggingSessionManager } from "../services/PloggingSessionManager";
import { mapCaptureService } from "../services/MapCaptureService";

// í›…ê³¼ ì»¨í…ìŠ¤íŠ¸ imports
import { usePloggingContext } from "../contexts/PloggingContext";
import { useAuth } from "../stores/useAuth";
import ViewShot from 'react-native-view-shot'; // ðŸ”¥ ë‹¤ì‹œ ì¶”ê°€ (í´ë°±ìš©)

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const MAX_DISTANCE_TO_START = 50000;

function PloggingStartScreen({ navigation, route }) {
  console.log("ðŸš€ [PloggingStart] ì»´í¬ë„ŒíŠ¸ ì‹œìž‘");
  
  // ðŸ” ì¸ì¦ ì •ë³´
  const { accessToken } = useAuth();
  console.log("accessToken:", accessToken ? "ì¡´ìž¬" : "ì—†ìŒ");
  console.log("í† í° ê°’:", accessToken || "null");
  // ðŸŽ¯ í”Œë¡œê¹… ì»¨í…ìŠ¤íŠ¸
  const {
    status, time, trashCount, formatTime, currentLocation, routeCoordinates,
    totalDistance, mapRef, trashLocations, isLoadingTrashData,
    startPlogging, pausePlogging, resumePlogging, endPlogging, addTrash,
    collectedTrash, addCollectedTrashItem, pickTrashItem, // ðŸ”¥ ì‹¤ì œ ì“°ë ˆê¸° ì¤ê¸° í•¨ìˆ˜ ì‚¬ìš©
    getTrashDetails // ðŸ”¥ ì“°ë ˆê¸° ìƒì„¸ ì •ë³´ ì¡°íšŒ í•¨ìˆ˜ ì¶”ê°€
  } = usePloggingContext();

  // ðŸ“± ë¡œì»¬ ìƒíƒœ ê´€ë¦¬ - pickedTrashIds ì œê±° (ì»¨í…ìŠ¤íŠ¸ì—ì„œ ê´€ë¦¬)
  const [state, setState] = useState({
    // ëª¨ë‹¬ ìƒíƒœ
    modalVisible: false,
    trashInfoModalVisible: false,
    trailInfoModalVisible: false,
    distanceModalVisible: false,
    
    // ë°ì´í„° ìƒíƒœ
    isLoading: false,
    mapReady: false,
    
    // ì„ íƒëœ í•­ëª©ë“¤
    selectedTrashId: null,
    selectedTrailForModal: null,
    
    // í”Œë¡œê¹… ì»¨íŠ¸ë¡¤ ìƒíƒœ
    isControlsCollapsed: false,
    forceCollapseControls: false,
    
    // ì‚°ì±…ë¡œ ê´€ë ¨ ìƒíƒœ
    nearestTrail: null,
    selectedRoute: null,
    courseInfo: null,
    trailStartCoords: null,
    initialTrailPath: null,
    distanceToTrail: null,
    canStartPlogging: false,
    
    // ì§„ìž… ëª¨ë“œ
    entryMode: 'main'
  });

  // ðŸ”§ ì°¸ì¡° ê´€ë¦¬
  const initializeOnce = useRef(false);
  const viewShotRef = useRef(null);

  // ðŸ“Š ìƒíƒœ ì—…ë°ì´íŠ¸ í—¬í¼
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ðŸŽ¬ ì´ˆê¸°í™” ë° ìƒëª…ì£¼ê¸° ê´€ë¦¬
  useEffect(() => {
    if (initializeOnce.current) return;
    initializeOnce.current = true;

    console.log("ðŸŽ¬ [PloggingStart] ì´ˆê¸°í™” ì‹œìž‘");
    initializeScreen();
    setupServices();

    // ë’¤ë¡œ ê°€ê¸° ì²˜ë¦¬
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate("Main");
      return true;
    });

    return () => {
      backHandler.remove();
      cleanupServices();
    };
  }, []);

  // ðŸŒ ìœ„ì¹˜ ë³€ê²½ ê°ì§€
  useEffect(() => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      handleLocationChange();
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, state.entryMode]);

  // ðŸ—ƒï¸ ì„œë¹„ìŠ¤ ì„¤ì •
  const setupServices = () => {
    console.log("ðŸ”§ [PloggingStart] ì„œë¹„ìŠ¤ ì„¤ì •");
    
    // ì‚°ì±…ë¡œ ê²€ìƒ‰ ì„œë¹„ìŠ¤ ë¦¬ìŠ¤ë„ˆ
    trailSearchService.addListener(handleTrailSearchEvent);
    
    // í”Œë¡œê¹… ì„¸ì…˜ ë§¤ë‹ˆì € ë¦¬ìŠ¤ë„ˆ
    ploggingSessionManager.addListener(handleSessionEvent);
  };

  // ðŸ§¹ ì„œë¹„ìŠ¤ ì •ë¦¬
  const cleanupServices = () => {
    console.log("ðŸ§¹ [PloggingStart] ì„œë¹„ìŠ¤ ì •ë¦¬");
    trailSearchService.removeListener(handleTrailSearchEvent);
    ploggingSessionManager.removeListener(handleSessionEvent);
  };

  // ðŸ” ì‚°ì±…ë¡œ ê²€ìƒ‰ ì´ë²¤íŠ¸ ì²˜ë¦¬
  const handleTrailSearchEvent = useCallback((type, data) => {
    console.log(`ðŸ”” [TrailSearch] ${type}:`, data);
    
    switch (type) {
      case 'search_started':
        updateState({ isLoading: true });
        break;
        
      case 'search_completed':
        const trail = data.trail;
        if (trail) {
          const distance = trail.distanceToUser;
          updateState({
            nearestTrail: trail,
            distanceToTrail: distance,
            canStartPlogging: distance <= MAX_DISTANCE_TO_START,
            isLoading: false
          });
        } else {
          updateState({ nearestTrail: null, isLoading: false });
        }
        break;
        
      case 'search_error':
        updateState({ isLoading: false });
        console.error("âŒ [TrailSearch] ê²€ìƒ‰ ì˜¤ë¥˜:", data.error);
        break;
    }
  }, [updateState]);

  // ðŸ“Š ì„¸ì…˜ ì´ë²¤íŠ¸ ì²˜ë¦¬
  const handleSessionEvent = useCallback((type, data) => {
    console.log(`ðŸ”” [Session] ${type}:`, data);
    
    switch (type) {
      case 'save_error':
        Alert.alert(
          "ì•Œë¦¼", 
          "ì„œë²„ ì €ìž¥ì— ì‹¤íŒ¨í–ˆì§€ë§Œ ë¡œì»¬ ê¸°ë¡ì€ ì €ìž¥ë©ë‹ˆë‹¤.",
          [{ text: "í™•ì¸" }]
        );
        break;
    }
  }, []);

  // ðŸŽ¬ í™”ë©´ ì´ˆê¸°í™”
  const initializeScreen = async () => {
    try {
      const routeParams = route?.params || {};
      
      if (routeParams.selectedRoute) {
        console.log("ðŸŽ¯ [PloggingStart] CourseDetailì—ì„œ ì§„ìž…");
        updateState({ entryMode: 'courseDetail' });
        handleCourseDetailEntry(routeParams);
      } else {
        console.log("ðŸ  [PloggingStart] ë©”ì¸ì—ì„œ ì§„ìž…");
        updateState({ entryMode: 'main' });
      }

      // ì§€ë„ ì¤€ë¹„
      setTimeout(() => {
        updateState({ mapReady: true });
      }, 100);
      
    } catch (error) {
      console.error("âŒ [PloggingStart] ì´ˆê¸°í™” ì˜¤ë¥˜:", error);
      updateState({ mapReady: true });
    }
  };

  // ðŸŽ¯ CourseDetail ì§„ìž… ì²˜ë¦¬
  const handleCourseDetailEntry = (routeParams) => {
    const { selectedRoute, trailStartCoords, trailFullPath } = routeParams;
    
    const updates = {};
    
    if (selectedRoute) {
      updates.selectedRoute = selectedRoute;
      updates.courseInfo = {
        name: selectedRoute.name,
        difficulty: selectedRoute.difficulty,
        distance: selectedRoute.distance,
        duration: selectedRoute.duration
      };
    }
    
    if (trailStartCoords) {
      updates.trailStartCoords = trailStartCoords;
    }
    
    if (trailFullPath) {
      updates.initialTrailPath = trailFullPath;
    }
    
    updateState(updates);
  };

  // ðŸŒ ìœ„ì¹˜ ë³€ê²½ ì²˜ë¦¬
  const handleLocationChange = async () => {
    if (state.entryMode === 'courseDetail' && state.trailStartCoords) {
      handleDistanceCheck();
    } else if (state.entryMode === 'main') {
      await handleNearestTrailSearch();
    }
  };

  // ðŸ“ ê±°ë¦¬ ì²´í¬ (CourseDetail ëª¨ë“œ)
  const handleDistanceCheck = () => {
    if (!currentLocation || !state.trailStartCoords) return;
    
    const result = trailSearchService.canStartPlogging(
      currentLocation, 
      state.trailStartCoords, 
      MAX_DISTANCE_TO_START
    );
    
    updateState({
      distanceToTrail: result.distance,
      canStartPlogging: result.canStart
    });
  };

  // ðŸ” ê°€ìž¥ ê°€ê¹Œìš´ ì‚°ì±…ë¡œ ê²€ìƒ‰
  const handleNearestTrailSearch = async () => {
    if (state.isLoading || state.nearestTrail) return;
    
    await trailSearchService.searchNearestTrail(currentLocation);
  };

  // ðŸ—ºï¸ ì‚°ì±…ë¡œ ë§ˆì»¤ í´ë¦­ ì²˜ë¦¬
  const handleTrailMarkerPress = useCallback(async () => {
    if (!state.nearestTrail) return;
    
    try {
      const trailDetail = await trailSearchService.getTrailDetails(state.nearestTrail.id);
      const detailWithDistance = {
        ...trailDetail,
        distanceToUser: state.nearestTrail.distanceToUser
      };
      
      updateState({
        selectedTrailForModal: detailWithDistance,
        trailInfoModalVisible: true
      });
      
    } catch (error) {
      console.error("âŒ [PloggingStart] ì‚°ì±…ë¡œ ì •ë³´ ê°€ì ¸ì˜¤ê¸° ì‹¤íŒ¨:", error);
      
      updateState({
        selectedTrailForModal: {
          ...state.nearestTrail.originalData,
          distanceToUser: state.nearestTrail.distanceToUser
        },
        trailInfoModalVisible: true
      });
    }
  }, [state.nearestTrail]);

  // âœ… ì‚°ì±…ë¡œ ì„ íƒ í™•ì¸
  const handleTrailSelection = useCallback((trail) => {
    console.log("âœ… [PloggingStart] ì‚°ì±…ë¡œ ì„ íƒ í™•ì¸:", trail.trailName);
    
    const updates = {
      selectedRoute: {
        id: trail.trailId,
        name: trail.trailName,
        location: trail.lotNumberAddress,
        difficulty: trail.difficultyLevel,
        distance: trail.length,
        duration: trail.trackTime
      },
      trailInfoModalVisible: false
    };
    
    if (state.nearestTrail) {
      updates.trailStartCoords = state.nearestTrail.coordinate;
      updates.courseInfo = {
        name: trail.trailName,
        difficulty: trail.difficultyLevel,
        distance: trail.length,
        duration: trail.trackTime,
        reportCount: trail.reportCount
      };
    }
    
    updateState(updates);
  }, [state.nearestTrail]);

  // ðŸš€ í”Œë¡œê¹… ì‹œìž‘ ì²˜ë¦¬
  const handleStart = useCallback(async () => {
    try {
      console.log("ðŸš€ [PloggingStart] í”Œë¡œê¹… ì‹œìž‘ ìš”ì²­");

      // ê±°ë¦¬ ì²´í¬
      if (state.entryMode === 'courseDetail' && !state.canStartPlogging && state.trailStartCoords) {
        updateState({ distanceModalVisible: true });
        return;
      }

      // ì‚°ì±…ë¡œ ì—†ì„ ë•Œ í™•ì¸
      if (state.entryMode === 'main' && !state.selectedRoute && !state.nearestTrail) {
        Alert.alert("ì•Œë¦¼", "ì‚°ì±…ë¡œ ì •ë³´ê°€ ì—†ì§€ë§Œ í”Œë¡œê¹…ì„ ì‹œìž‘í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.", [
          { text: "ì·¨ì†Œ", style: "cancel" },
          { text: "ì‹œìž‘", onPress: () => proceedWithStart() }
        ]);
        return;
      }

      await proceedWithStart();

    } catch (error) {
      console.error("âŒ [PloggingStart] í”Œë¡œê¹… ì‹œìž‘ ì‹¤íŒ¨:", error);
    }
  }, [state.entryMode, state.canStartPlogging, state.trailStartCoords, state.selectedRoute, state.nearestTrail]);

  // ðŸƒ ì‹¤ì œ í”Œë¡œê¹… ì‹œìž‘
  const proceedWithStart = async () => {
    // ì„¸ì…˜ ì‹œìž‘
    ploggingSessionManager.startSession({
      currentLocation,
      selectedTrailId: state.selectedRoute?.id || state.nearestTrail?.id || null,
      memberId: 1
    });

    // í”Œë¡œê¹… ì»¨í…ìŠ¤íŠ¸ì—ì„œ ì‹œìž‘
    const trailInfo = state.selectedRoute || (state.nearestTrail ? {
      id: state.nearestTrail.id,
      name: state.nearestTrail.name,
      location: state.nearestTrail.address
    } : null);

    await startPlogging(trailInfo);
    console.log("âœ… [PloggingStart] í”Œë¡œê¹… ì‹œìž‘ ì™„ë£Œ");
  };

  // â¸ï¸ í”Œë¡œê¹… ì»¨íŠ¸ë¡¤ í•¸ë“¤ëŸ¬ë“¤
  const handlePause = useCallback(() => pausePlogging(), [pausePlogging]);
  const handleResume = useCallback(() => resumePlogging(), [resumePlogging]);
  const handleEnd = useCallback(() => updateState({ modalVisible: true }), []);

  // ðŸ”™ í—¤ë” ë’¤ë¡œê°€ê¸° ì²˜ë¦¬ (ìŠ¤ë§ˆíŠ¸í•œ ì²˜ë¦¬)
  const handleHeaderBack = useCallback(() => {
    // PloggingHeaderì—ì„œ ì•Œì•„ì„œ í”Œë¡œê¹… ìƒíƒœë¥¼ ì²´í¬í•˜ê³  ì²˜ë¦¬
    navigation.navigate("Main");
  }, [navigation]);

  // â–¶ï¸ í”Œë¡œê¹… ê³„ì†í•˜ê¸° ì²˜ë¦¬ (ì—”ë“œ ëª¨ë‹¬ì—ì„œ)
  const handleContinuePlogging = useCallback(() => {
    console.log("â–¶ï¸ [PloggingStart] í”Œë¡œê¹… ê³„ì†í•˜ê¸°");
    updateState({ modalVisible: false });
  }, []);

  // ðŸ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬
 // PloggingStartScreen.jsì˜ confirmEnd í•¨ìˆ˜ - ê°œì„ ëœ ë²„ì „

/**
 * ðŸ”¥ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬ (ê°œì„ ëœ ë²„ì „)
 */
/**
 * ðŸ”¥ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬ (ê°œì„ ëœ ë²„ì „ - ì¤Œ ë ˆë²¨ ìµœì í™”)
 */
/**
 * ðŸ”¥ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬ (ë„¤ì´í‹°ë¸Œ takeSnapshot ì „ìš© ë²„ì „)
 */
/**
 * ðŸ”¥ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬ (ì•ˆì „í•œ ìº¡ì²˜ ë° ì—ëŸ¬ ì²˜ë¦¬ ê°•í™”)
 */
/**
 * ðŸ”¥ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬ (ì™„ì „í•œ ì„œë²„ ì „ì†¡ ë¡œì§ í¬í•¨)
 */
// ðŸ”¥ ê¸°ì¡´ API í•¨ìˆ˜ import ì¶”ê°€


/**
 * ðŸ”¥ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬ (ê¸°ì¡´ API ì‚¬ìš©í•˜ì—¬ multipart/form-dataë¡œ ì „ì†¡)
 */
/**
 * ðŸ”¥ í”Œë¡œê¹… ì¢…ë£Œ ì²˜ë¦¬ (ë°±ì—”ë“œ API ìŠ¤íŽ™ì— ì •í™•ížˆ ë§žì¶˜ ë²„ì „)
 */
const confirmEnd = useCallback(async () => {
  try {
    updateState({ modalVisible: false });
    console.log("ðŸ [PloggingStart] === í”Œë¡œê¹… ì¢…ë£Œ ì‹œìž‘ ===");

    // 1ï¸âƒ£ ì§€ë„ ìº¡ì²˜
    console.log("ðŸ“¸ [PloggingStart] === ì§€ë„ ìº¡ì²˜ ì‹œìž‘ ===");
    let capturedImageUri = null;
    
    try {
      capturedImageUri = await mapCaptureService.captureMap({
        mapRef,
        viewShotRef,
        routeCoordinates
      });

      if (capturedImageUri) {
        console.log("âœ… [PloggingStart] ì§€ë„ ìº¡ì²˜ ì„±ê³µ!");
        console.log("âœ… [PloggingStart] URI:", capturedImageUri);
      } else {
        console.warn("âš ï¸ [PloggingStart] ì§€ë„ ìº¡ì²˜ ì‹¤íŒ¨ - null ë°˜í™˜");
      }
    } catch (captureError) {
      console.error("âŒ [PloggingStart] ìº¡ì²˜ ì—ëŸ¬:", captureError);
      capturedImageUri = null;
    }

    // 2ï¸âƒ£ í”Œë¡œê¹… ê²°ê³¼ ì •ë¦¬
    console.log("ðŸ“Š [PloggingStart] í”Œë¡œê¹… ê²°ê³¼ ì •ë¦¬");
    const ploggingResult = endPlogging();
    
    console.log("ðŸ“Š [PloggingStart] ê²°ê³¼ ìš”ì•½:");
    console.log("  - ì‹œê°„:", time);
    console.log("  - ê±°ë¦¬:", totalDistance);
    console.log("  - ì“°ë ˆê¸°:", trashCount);
    console.log("  - ê²½ë¡œ í¬ì¸íŠ¸:", routeCoordinates?.length || 0);
    console.log("  - ìº¡ì²˜ ì„±ê³µ:", !!capturedImageUri);

    // 3ï¸âƒ£ ì‚°ì±…ë¡œ ì •ë³´ ë¡œë“œ
    let trailDetails = null;
    if (state.selectedRoute?.id || state.nearestTrail?.id) {
      try {
        const trailId = state.selectedRoute?.id || state.nearestTrail?.id;
        console.log("ðŸƒ [PloggingStart] ì‚°ì±…ë¡œ ì •ë³´ ë¡œë“œ:", trailId);
        trailDetails = await trailSearchService.getTrailDetails(trailId);
        if (trailDetails) {
          console.log("âœ… [PloggingStart] ì‚°ì±…ë¡œ ì •ë³´:", trailDetails.trailName);
        }
      } catch (trailError) {
        console.warn("âš ï¸ [PloggingStart] ì‚°ì±…ë¡œ ì •ë³´ ë¡œë“œ ì‹¤íŒ¨:", trailError);
      }
    }

    // 4ï¸âƒ£ ì„œë²„ ì „ì†¡ ì‹œìž‘ (ë°±ì—”ë“œ API ìŠ¤íŽ™ì— ì •í™•ížˆ ë§žì¶¤)
    console.log("ðŸ“¤ [PloggingStart] === ì„œë²„ ì „ì†¡ ì‹œìž‘ ===");
    
    let serverSaveSuccess = false;
    let serverRecordId = null;

    try {
      // ðŸ”‘ ì¸ì¦ í† í° í™•ì¸
      console.log("ðŸ”‘ [PloggingStart] ì¸ì¦ í† í° í™•ì¸");
      if (!accessToken) {
        throw new Error('ì¸ì¦ í† í°ì´ ì—†ìŠµë‹ˆë‹¤. ë¡œê·¸ì¸ì´ í•„ìš”í•©ë‹ˆë‹¤.');
      }
      console.log("âœ… [PloggingStart] ì¸ì¦ í† í° í™•ì¸ë¨");

      // ðŸ“ FormData êµ¬ì„± (ë°±ì—”ë“œ ìŠ¤íŽ™ì— ì •í™•ížˆ ë§žì¶¤)
      console.log("ðŸ“ [PloggingStart] === FormData êµ¬ì„± ì‹œìž‘ ===");
      
      const formData = new FormData();
      
      // ðŸŽ¯ ë°±ì—”ë“œ API ìŠ¤íŽ™ì— ë§žì¶˜ í•„ë“œë“¤
      formData.append('trailId', (state.selectedRoute?.id || state.nearestTrail?.id || 0).toString());
      formData.append('ploggingTime', formatTimeForServer(time)); // "HH:mm:ss" í˜•ì‹
      formData.append('distance', Math.round(totalDistance || 0).toString()); // ë¯¸í„° ë‹¨ìœ„ ì •ìˆ˜
      formData.append('memberId', '0'); // í† í°ìœ¼ë¡œ ì‹ë³„í•˜ë¯€ë¡œ 0
      
      // ðŸ–¼ï¸ ì´ë¯¸ì§€ íŒŒì¼ ì¶”ê°€ (plog.jsì—ì„œ 'image' í‚¤ ì‚¬ìš©)
      if (capturedImageUri) {
        try {
          const imageFile = {
            uri: capturedImageUri,
            type: 'image/png',
            name: `plogging_map_${Date.now()}.png`
          };
          formData.append('image', imageFile); // ðŸ”¥ plog.jsì—ì„œ 'image' í‚¤ ì‚¬ìš©
          console.log("âœ… [PloggingStart] ì´ë¯¸ì§€ íŒŒì¼ FormData ì¶”ê°€ ì™„ë£Œ");
        } catch (imageError) {
          console.warn("âš ï¸ [PloggingStart] ì´ë¯¸ì§€ FormData ì¶”ê°€ ì‹¤íŒ¨:", imageError);
        }
      } else {
        console.log("âš ï¸ [PloggingStart] ìº¡ì²˜ëœ ì´ë¯¸ì§€ê°€ ì—†ìŒ - ì´ë¯¸ì§€ ì—†ì´ ì „ì†¡");
      }

      // FormData ë‚´ìš© ë¡œê¹… (ë””ë²„ê¹…ìš©)
      console.log("ðŸ“‹ [PloggingStart] FormData êµ¬ì„± ì™„ë£Œ:");
      console.log("  - trailId:", state.selectedRoute?.id || state.nearestTrail?.id || 0);
      console.log("  - ploggingTime:", formatTimeForServer(time));
      console.log("  - distance:", Math.round(totalDistance || 0));
      console.log("  - memberId: 0");
      console.log("  - image:", !!capturedImageUri ? "í¬í•¨ë¨" : "ì—†ìŒ");

      // ðŸ“¡ plog.jsì˜ savePloggingRecord í•¨ìˆ˜ ì‚¬ìš©
      console.log("ðŸ“¡ [PloggingStart] savePloggingRecord API í˜¸ì¶œ...");
      
      // ðŸ”¥ plog.js ìŠ¤íŽ™ì— ë§žì¶˜ ë°ì´í„° êµ¬ì¡°ë¡œ ë³€ê²½
      const ploggingData = {
        trailId: (state.selectedRoute?.id || state.nearestTrail?.id || 0),
        ploggingTime: formatTimeForServer(time),
        distance: Math.round(totalDistance || 0),
        memberId: 0,
        imageFile: capturedImageUri ? {
          uri: capturedImageUri,
          type: 'image/png',
          name: `plogging_map_${Date.now()}.png`
        } : null
      };
      
      const response = await savePloggingRecord(ploggingData, accessToken);
      
      console.log("âœ… [PloggingStart] í”Œë¡œê¹… ê¸°ë¡ ì €ìž¥ ì„±ê³µ:", response);
      
      serverSaveSuccess = true;
      serverRecordId = response?.recordId || response?.id || response?.ploggingId || 'unknown';
      
      console.log("ðŸŽ‰ [PloggingStart] í”Œë¡œê¹… ê¸°ë¡ì´ ì„œë²„ì— ì €ìž¥ë˜ì—ˆìŠµë‹ˆë‹¤!");

    } catch (serverError) {
      console.error("âŒ [PloggingStart] ì„œë²„ ì „ì†¡ ì‹¤íŒ¨:", serverError);
      
      // ì—ëŸ¬ íƒ€ìž…ë³„ ì²˜ë¦¬
      if (serverError.message.includes('ì¸ì¦ í† í°') || serverError.message.includes('401')) {
        console.error("âŒ [PloggingStart] ì¸ì¦ ì‹¤íŒ¨ - ë¡œê·¸ì¸ í•„ìš”");
        Alert.alert(
          "ì¸ì¦ ì˜¤ë¥˜", 
          "ë¡œê·¸ì¸ì´ í•„ìš”í•©ë‹ˆë‹¤. ë‹¤ì‹œ ë¡œê·¸ì¸ í•´ì£¼ì„¸ìš”.",
          [{ text: "í™•ì¸" }]
        );
      } else if (serverError.message.includes('fetch') || serverError.message.includes('Network')) {
        console.error("âŒ [PloggingStart] ë„¤íŠ¸ì›Œí¬ ì—°ê²° ì‹¤íŒ¨");
        Alert.alert(
          "ë„¤íŠ¸ì›Œí¬ ì˜¤ë¥˜", 
          "ì¸í„°ë„· ì—°ê²°ì„ í™•ì¸í•´ì£¼ì„¸ìš”. ê¸°ë¡ì€ ë¡œì»¬ì— ì €ìž¥ë©ë‹ˆë‹¤.",
          [{ text: "í™•ì¸" }]
        );
      } else if (serverError.message.includes('timeout') || serverError.message.includes('ì‹œê°„')) {
        console.error("âŒ [PloggingStart] ì„œë²„ ì‘ë‹µ ì‹œê°„ ì´ˆê³¼");
        Alert.alert(
          "ì‹œê°„ ì´ˆê³¼", 
          "ì„œë²„ ì‘ë‹µì´ ì§€ì—°ë˜ê³  ìžˆìŠµë‹ˆë‹¤. ê¸°ë¡ì€ ë¡œì»¬ì— ì €ìž¥ë©ë‹ˆë‹¤.",
          [{ text: "í™•ì¸" }]
        );
      } else {
        console.error("âŒ [PloggingStart] ì„œë²„ ì²˜ë¦¬ ì˜¤ë¥˜");
        Alert.alert(
          "ì €ìž¥ ì˜¤ë¥˜", 
          "ì„œë²„ ì €ìž¥ì— ì‹¤íŒ¨í–ˆì§€ë§Œ ë¡œì»¬ ê¸°ë¡ì€ ì €ìž¥ë©ë‹ˆë‹¤.",
          [{ text: "í™•ì¸" }]
        );
      }
    }

    // 5ï¸âƒ£ ê²°ê³¼ ë°ì´í„° êµ¬ì„± (ë¡œì»¬ìš©)
    const resultData = ploggingSessionManager.prepareResultData({
      time,
      totalDistance,
      trashCount,
      collectedTrash,
      routeCoordinates,
      trashLocations,
      selectedRoute: state.selectedRoute,
      courseInfo: state.courseInfo,
      capturedImageUri,
      trailDetails
    });

    if (!resultData) {
      throw new Error('ê²°ê³¼ ë°ì´í„° ì¤€ë¹„ ì‹¤íŒ¨');
    }

    console.log("ðŸ“‹ [PloggingStart] ìµœì¢… ê²°ê³¼:");
    console.log("  - ì´ë¦„:", resultData.routeName);
    console.log("  - ì´ë¯¸ì§€:", !!resultData.mapImage);
    console.log("  - ì‚°ì±…ë¡œID:", resultData.trailId);

    // 6ï¸âƒ£ ì„¸ì…˜ ì¢…ë£Œ
    ploggingSessionManager.endSession();

    // 7ï¸âƒ£ ê²°ê³¼ì— ì„œë²„ ì •ë³´ ì¶”ê°€
    const finalResultData = {
      ...resultData,
      serverSaved: serverSaveSuccess,
      serverRecordId,
      syncStatus: serverSaveSuccess ? 'synced' : 'pending'
    };

    // 8ï¸âƒ£ ê²°ê³¼ í™”ë©´ìœ¼ë¡œ ì´ë™
    console.log("ðŸŽ¯ [PloggingStart] ê²°ê³¼ í™”ë©´ìœ¼ë¡œ ì´ë™");
    navigation.navigate("PloggingRecord", { 
      result: finalResultData,
      serverStatus: {
        saved: serverSaveSuccess,
        recordId: serverRecordId,
        needsSync: !serverSaveSuccess
      }
    });

    console.log("ðŸ [PloggingStart] === í”Œë¡œê¹… ì¢…ë£Œ ì™„ë£Œ ===");

  } catch (error) {
    console.error("âŒ [PloggingStart] ì „ì²´ ì˜¤ë¥˜:", error);
    
    // ê¸°ë³¸ ê²°ê³¼ë¡œ ì´ë™ (ì‹¤íŒ¨ ì‹œ ë°±ì—…)
    const basicResult = {
      routeName: "í”Œë¡œê¹… ê¸°ë¡",
      totalTime: time || 0,
      totalDistance: totalDistance || 0,
      trashCount: trashCount || 0,
      mapImage: capturedImageUri,
      hasMapImage: !!capturedImageUri,
      serverSaved: false,
      syncStatus: 'failed',
      errorMessage: error.message
    };
    
    navigation.navigate("PloggingRecord", { 
      result: basicResult,
      serverStatus: {
        saved: false,
        error: error.message,
        needsSync: true
      }
    });
  }
}, [
  mapRef, 
  viewShotRef, 
  routeCoordinates, 
  endPlogging, 
  time, 
  totalDistance, 
  trashCount, 
  collectedTrash,
  trashLocations,
  state.selectedRoute,
  state.courseInfo,
  state.nearestTrail,
  accessToken,
  navigation
]);

// ðŸ• ì‹œê°„ í¬ë§· ë³€í™˜ í•¨ìˆ˜ (ì´ˆ â†’ "HH:mm:ss")
const formatTimeForServer = (timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds === 0) return "00:00:00";
  
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// ðŸ”„ ì‹¤íŒ¨í•œ ê¸°ë¡ë“¤ì„ ë‚˜ì¤‘ì— ìž¬ì „ì†¡í•˜ëŠ” í•¨ìˆ˜ (ê¸°ì¡´ API ì‚¬ìš©)
const retryFailedUploads = async () => {
  try {
    const { accessToken } = useAuth.getState(); // Zustandì—ì„œ í˜„ìž¬ í† í° ê°€ì ¸ì˜¤ê¸°
    
    if (!accessToken) {
      console.log("ðŸ”„ ìž¬ì „ì†¡ ì¤‘ë‹¨: ì¸ì¦ í† í°ì´ ì—†ìŒ");
      return;
    }
    
    const records = await AsyncStorage.getItem('ploggingRecords');
    if (!records) return;
    
    const parsedRecords = JSON.parse(records);
    const failedRecords = parsedRecords.filter(record => !record.serverSaved);
    
    console.log(`ðŸ”„ ìž¬ì „ì†¡í•  ê¸°ë¡ ${failedRecords.length}ê°œ ë°œê²¬`);
    
    for (const record of failedRecords) {
      try {
        console.log(`ðŸ”„ ê¸°ë¡ ${record.localId} ìž¬ì „ì†¡ ì‹œë„`);
        
        // FormData ìž¬êµ¬ì„±
        const retryFormData = new FormData();
        const serverData = record.serverData;
        
        retryFormData.append('trailId', serverData.trailId.toString());
        retryFormData.append('ploggingTime', serverData.ploggingTime);
        retryFormData.append('distance', serverData.distance.toString());
        retryFormData.append('memberId', serverData.memberId.toString());
        retryFormData.append('imageUrl', serverData.imageUrl);
        
        // ì´ë¯¸ì§€ íŒŒì¼ ìž¬ì¶”ê°€ (ë¡œì»¬ì— ìžˆëŠ” ê²½ìš°)
        if (serverData.imageUri) {
          const imageFile = {
            uri: serverData.imageUri,
            type: 'image/png',
            name: `retry_plogging_${record.localId}.png`
          };
          retryFormData.append('imageFile', imageFile);
        }
        
        // ê¸°ì¡´ API í•¨ìˆ˜ ì‚¬ìš©
        const response = await savePloggingRecord(retryFormData, accessToken);
        
        if (response) {
          console.log(`âœ… ê¸°ë¡ ${record.localId} ìž¬ì „ì†¡ ì„±ê³µ`);
          // ë¡œì»¬ ê¸°ë¡ ì—…ë°ì´íŠ¸ (serverSaved: trueë¡œ ë³€ê²½)
          // ... ì—…ë°ì´íŠ¸ ë¡œì§ êµ¬í˜„
        }
      } catch (retryError) {
        console.error(`âŒ ê¸°ë¡ ${record.localId} ìž¬ì „ì†¡ ì‹¤íŒ¨:`, retryError);
      }
    }
  } catch (error) {
    console.error('âŒ ìž¬ì „ì†¡ ì²˜ë¦¬ ì˜¤ë¥˜:', error);
  }
};

// ðŸ“‹ ì‹¤ì œ ì‚¬ìš©ë˜ëŠ” ë°±ì—”ë“œ API ìŠ¤íŽ™
/*
POST https://api.jupging.store/plogging
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

FormData:
- trailId: "0" (string)
- ploggingTime: "01:23:45" (HH:mm:ss string)  
- distance: "1500" (meter integer as string)
- memberId: "0" (í† í°ìœ¼ë¡œ ì‹ë³„í•˜ë¯€ë¡œ 0)
- imageUrl: "" (ë¹ˆ ë¬¸ìžì—´, ì‹¤ì œë¡œëŠ” imageFile ì‚¬ìš©)
- imageFile: File (ì‹¤ì œ ì´ë¯¸ì§€ íŒŒì¼)
*/
// ðŸ“± ì¶”ê°€ë¡œ í•„ìš”í•œ import ë¬¸ë“¤
// import AsyncStorage from '@react-native-async-storage/async-storage';

// ðŸ”§ ì„œë²„ ì—”ë“œí¬ì¸íŠ¸ ì„¤ì • ì˜ˆì‹œ
const SERVER_CONFIG = {
  baseUrl: 'https://your-api-server.com',
  endpoints: {
    savePloggingRecord: '/api/plogging/records',
    uploadImage: '/api/plogging/images'
  },
  timeout: 30000
};



// ðŸ—‘ï¸ ì“°ë ˆê¸° ê´€ë ¨ í•¸ë“¤ëŸ¬ë“¤ - ðŸ”¥ ë§ˆì»¤ ì œê±° ë¡œì§ ì¶”ê°€
const handleTrashMarkerPress = useCallback((trash) => {
  console.log("ðŸ—‘ï¸ [PloggingStartScreen] === ì“°ë ˆê¸° ë§ˆì»¤ í´ë¦­ ===");
  console.log("ðŸ—‘ï¸ [PloggingStartScreen] í´ë¦­ëœ ì“°ë ˆê¸° ë°ì´í„°:", trash);
  console.log("ðŸ—‘ï¸ [PloggingStartScreen] ì“°ë ˆê¸° ID:", trash?.id);
    console.log("ðŸ—‘ï¸ [PloggingStartScreen] ì“°ë ˆê¸° ê°ì²´ í‚¤ë“¤:", trash ? Object.keys(trash) : 'null');
    console.log("ðŸ—‘ï¸ [PloggingStartScreen] í˜„ìž¬ ëª¨ë‹¬ ìƒíƒœ:", {
      trashInfoModalVisible: state.trashInfoModalVisible,
      selectedTrashId: state.selectedTrashId
    });
    
    if (!trash) {
      console.warn("âš ï¸ [PloggingStartScreen] ì“°ë ˆê¸° ë°ì´í„°ê°€ ì—†ìŠµë‹ˆë‹¤");
      return;
    }
    
    if (!trash.id) {
      console.warn("âš ï¸ [PloggingStartScreen] ì“°ë ˆê¸° IDê°€ ì—†ìŠµë‹ˆë‹¤");
      console.log("ðŸ—‘ï¸ [PloggingStartScreen] ì „ì²´ ì“°ë ˆê¸° ë°ì´í„°:", JSON.stringify(trash, null, 2));
      
      // IDê°€ ì—†ì–´ë„ ë‹¤ë¥¸ ê³ ìœ  ì‹ë³„ìžê°€ ìžˆëŠ”ì§€ í™•ì¸
      const fallbackId = trash.reportId || trash.trashId || trash.key || `temp_${Date.now()}`;
      console.log("ðŸ—‘ï¸ [PloggingStartScreen] ëŒ€ì²´ ID ì‚¬ìš©:", fallbackId);
      
      updateState({
        selectedTrashId: fallbackId,
        trashInfoModalVisible: true
      });
      return;
    }
    
    console.log("âœ… [PloggingStartScreen] ëª¨ë‹¬ ìƒíƒœ ì—…ë°ì´íŠ¸ ì‹œìž‘");
    updateState({
      selectedTrashId: trash.id,
      trashInfoModalVisible: true
    });
    console.log("âœ… [PloggingStartScreen] ëª¨ë‹¬ ìƒíƒœ ì—…ë°ì´íŠ¸ ì™„ë£Œ");
  }, [state.trashInfoModalVisible, state.selectedTrashId, updateState]);

  const handlePickTrashSuccess = useCallback(async (trashData) => {
    console.log("âœ… [PloggingStartScreen] === ì“°ë ˆê¸° ì¤ê¸° ì„±ê³µ ===");
    console.log("âœ… [PloggingStartScreen] ìˆ˜ê±°ëœ ì“°ë ˆê¸°:", trashData);
    
    try {
      // ðŸ”¥ ì»¨í…ìŠ¤íŠ¸ì˜ pickTrashItem í•¨ìˆ˜ë¡œ ì‹¤ì œ ì„œë²„ ì²˜ë¦¬ + ë§ˆì»¤ ì œê±°
      const success = await pickTrashItem(trashData.id);
      
      if (success) {
        console.log("âœ… [PloggingStartScreen] ì»¨í…ìŠ¤íŠ¸ì—ì„œ ì“°ë ˆê¸° ì²˜ë¦¬ ì™„ë£Œ");
        
        // ë ˆê±°ì‹œ í˜¸í™˜ì„±ì„ ìœ„í•œ ì¶”ê°€ ì²˜ë¦¬
        addCollectedTrashItem(trashData);
        
        console.log("âœ… [PloggingStartScreen] ì“°ë ˆê¸° ìˆ˜ê±° ì²˜ë¦¬ ì™„ë£Œ");
      } else {
        console.warn("âš ï¸ [PloggingStartScreen] ì»¨í…ìŠ¤íŠ¸ì—ì„œ ì“°ë ˆê¸° ì²˜ë¦¬ ì‹¤íŒ¨");
      }
    } catch (error) {
      console.error("âŒ [PloggingStartScreen] ì“°ë ˆê¸° ì²˜ë¦¬ ì¤‘ ì˜¤ë¥˜:", error);
    }
  }, [pickTrashItem, addCollectedTrashItem]);

  const handleTrashModalStateChange = useCallback((isModalVisible) => {
    console.log(`ðŸ—‘ï¸ [PloggingStartScreen] ì“°ë ˆê¸° ëª¨ë‹¬ ìƒíƒœ ë³€ê²½: ${isModalVisible ? 'ì—´ë¦¼' : 'ë‹«íž˜'}`);
    // ðŸ”¥ ëª¨ë‹¬ì´ ì—´ë¦´ ë•Œë§Œ ì»¨íŠ¸ë¡¤ì„ ì ‘ê³ , ë‹«íž ë•ŒëŠ” ìžë™ìœ¼ë¡œ íŽ¼ì¹˜ì§€ ì•ŠìŒ
    if (isModalVisible) {
      updateState({ forceCollapseControls: true });
    } else {
      // ðŸ”¥ ëª¨ë‹¬ì´ ë‹«íž ë•ŒëŠ” ê°•ì œ ì ‘íž˜ í•´ì œë§Œ í•˜ê³ , ì‚¬ìš©ìžê°€ ì§ì ‘ íŽ¼ì¹˜ë„ë¡ í•¨
      updateState({ forceCollapseControls: false });
    }
  }, [updateState]);

  const handleControlsCollapseChange = useCallback((collapsed) => {
    console.log(`ðŸŽ® [PloggingStartScreen] ì»¨íŠ¸ë¡¤ ì ‘íž˜ ìƒíƒœ: ${collapsed ? 'ì ‘íž˜' : 'íŽ¼ì¹¨'}`);
    updateState({ isControlsCollapsed: collapsed });
  }, [updateState]);

  const handleShowTrashList = useCallback(() => {
    console.log("ðŸ“‹ [PloggingStartScreen] ìˆ˜ì§‘í•œ ì“°ë ˆê¸° ëª©ë¡ í‘œì‹œ");
    const collectedItems = collectedTrash.map(item =>
      `- ${item.title || 'ì“°ë ˆê¸°'}: ${item.amount || 'ë³´í†µ'}`
    ).join('\n');

    Alert.alert(
      "ìˆ˜ì§‘í•œ ì“°ë ˆê¸° ëª©ë¡",
      collectedTrash.length > 0 ? collectedItems : "ì•„ì§ ìˆ˜ì§‘í•œ ì“°ë ˆê¸°ê°€ ì—†ìŠµë‹ˆë‹¤."
    );
  }, [collectedTrash]);

  // ðŸ”„ ìž¬ê²€ìƒ‰ ì²˜ë¦¬
  const handleRetrySearch = useCallback(() => {
    console.log("ðŸ”„ [PloggingStartScreen] ìž¬ê²€ìƒ‰ ìš”ì²­");
    updateState({ nearestTrail: null });
    trailSearchService.reset();
    handleNearestTrailSearch();
  }, []);

  // ðŸ—ºï¸ ì§€ë„ì— í‘œì‹œí•  ì‚°ì±…ë¡œ ë°ì´í„°
  const mapTrails = state.nearestTrail ? [state.nearestTrail] : [];
  
  // ðŸ”¥ trashLocationsëŠ” ì´ë¯¸ ì»¨í…ìŠ¤íŠ¸ì—ì„œ activeTrashListë¡œ í•„í„°ë§ë¨
  console.log("ðŸ—ºï¸ [PloggingStartScreen] ì“°ë ˆê¸° ë§ˆì»¤ ê°œìˆ˜:", trashLocations?.length || 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* í—¤ë” */}
      <PloggingHeader 
        status={status}
        onBack={handleHeaderBack}
      />

      {/* ê±°ë¦¬ ì •ë³´ ë“± */}
      {state.trailStartCoords && state.distanceToTrail !== null && (
        <DistanceInfo
          distance={state.distanceToTrail}
          maxDistance={MAX_DISTANCE_TO_START}
          isWarning={!state.canStartPlogging}
        />
      )}

      {isLoadingTrashData && <TrashLoadingInfo />}

      {/* ðŸ”¥ ViewShot ë‹¤ì‹œ ì¶”ê°€ (í´ë°±ìš©) */}
      <ViewShot 
        ref={viewShotRef}
        style={styles.mapContainer}
        options={{ 
          format: 'png', 
          quality: 0.7,
          result: 'tmpfile'
        }}
      >        
        <PloggingMap
          mapRef={mapRef}
          currentLocation={currentLocation}
          routeCoordinates={routeCoordinates || []}
          trashLocations={trashLocations || []}
          isLoading={state.isLoading}
          mapReady={state.mapReady}
          onTrashMarkerPress={handleTrashMarkerPress}
          nearbyCourses={mapTrails}
          onCourseMarkerPress={handleTrailMarkerPress}
          selectedCourseId={state.nearestTrail?.id}
          initialTrailPath={state.initialTrailPath || []}
        />

        {/* ì˜¤ë²„ë ˆì´ë“¤ */}
        <MainOverlayContainer status={status}>
          <PloggingStatusRenderer
            entryMode={state.entryMode}
            isLoading={state.isLoading}
            nearestTrail={state.nearestTrail}
            selectedRoute={state.selectedRoute}
            courseInfo={state.courseInfo}
            canStartPlogging={state.canStartPlogging}
            trailStartCoords={state.trailStartCoords}
            onTrailPress={handleTrailMarkerPress}
            onRetrySearch={handleRetrySearch}
            onStart={handleStart}
            MAX_DISTANCE_TO_START={MAX_DISTANCE_TO_START}
          />
        </MainOverlayContainer>

        {status !== "idle" && (
          <View style={styles.runningControls}>
            <CollapsiblePloggingControls
              status={status}
              time={time}
              trashCount={trashCount}
              formatTime={formatTime}
              onPause={handlePause}
              onResume={handleResume}
              onEnd={handleEnd}
              onShowTrashList={handleShowTrashList}
              isCollapsed={state.isControlsCollapsed}
              onCollapseChange={handleControlsCollapseChange}
              forceCollapse={state.forceCollapseControls}
            />
          </View>
        )}
      </ViewShot>
      
      {/* ëª¨ë‹¬ë“¤ */}
      <PloggingEndModal
        visible={state.modalVisible}
        trashCount={trashCount}
        onContinue={handleContinuePlogging}
        onEnd={confirmEnd}
      />

      <CommonModal
        visible={state.distanceModalVisible}
        title="ì‚°ì±…ë¡œì™€ì˜ ê±°ë¦¬ê°€ ë„ˆë¬´ ë©‰ë‹ˆë‹¤"
        message={`í˜„ìž¬ ì‚°ì±…ë¡œì—ì„œ ${state.distanceToTrail?.toFixed(0)}m ë–¨ì–´ì ¸ ìžˆìŠµë‹ˆë‹¤.\n${MAX_DISTANCE_TO_START}m ì´ë‚´ë¡œ ê°€ê¹Œì´ ì´ë™í•´ì£¼ì„¸ìš”.`}
        onConfirm={() => updateState({ distanceModalVisible: false })}
        confirmText="í™•ì¸"
        showCancel={false}
      />

      <TrailInfoModal
        visible={state.trailInfoModalVisible}
        trail={state.selectedTrailForModal}
        onClose={() => updateState({ trailInfoModalVisible: false })}
        onConfirm={handleTrailSelection}
      />

      

      {/* ðŸ”¥ ì“°ë ˆê¸° ì •ë³´ ëª¨ë‹¬ - ë””ë²„ê¹… ë¡œê·¸ ì¶”ê°€ */}
      {console.log("ðŸ—‘ï¸ [PloggingStartScreen] ì“°ë ˆê¸° ëª¨ë‹¬ ë Œë”ë§:", {
        visible: state.trashInfoModalVisible,
        selectedTrashId: state.selectedTrashId,
        hasOnPickSuccess: !!handlePickTrashSuccess,
        hasOnModalStateChange: !!handleTrashModalStateChange
      })}
      
      <EnhancedTrashInfoModal
        visible={state.trashInfoModalVisible}
        trashId={state.selectedTrashId}
        onClose={() => {
          console.log("ðŸ—‘ï¸ [PloggingStartScreen] ì“°ë ˆê¸° ëª¨ë‹¬ ë‹«ê¸° ìš”ì²­");
          updateState({ trashInfoModalVisible: false, selectedTrashId: null });
        }}
        onPickSuccess={handlePickTrashSuccess}
        onModalStateChange={handleTrashModalStateChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  mapContainer: { 
    flex: 1, 
    position: 'relative' 
  },
  runningControls: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    zIndex: 50
  },
});

export default React.memo(PloggingStartScreen);