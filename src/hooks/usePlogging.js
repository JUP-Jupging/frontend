import { useState, useEffect } from 'react';

export const usePlogging = () => {
  const [status, setStatus] = useState("idle"); // idle, running, paused
  const [time, setTime] = useState(0); // 초 단위
  const [trashCount, setTrashCount] = useState(0);

  console.log('[usePlogging] 현재 상태:', { status, time, trashCount });

  // 시간 포맷팅 (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 타이머 관리
  useEffect(() => {
    console.log('[usePlogging] 타이머 효과 실행, status:', status);
    
    let interval = null;
    if (status === "running") {
      console.log('[usePlogging] 타이머 시작');
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          console.log('[usePlogging] 시간 업데이트:', newTime);
          return newTime;
        });
      }, 1000);
    } else if (status === "paused") {
      console.log('[usePlogging] 타이머 일시정지');
      clearInterval(interval);
    }
    
    return () => {
      console.log('[usePlogging] 타이머 정리');
      clearInterval(interval);
    };
  }, [status]);

  const startPlogging = () => {
    console.log('[usePlogging] 플로깅 시작');
    setStatus("running");
    setTime(0);
    setTrashCount(0);
  };

  const pausePlogging = () => {
    console.log('[usePlogging] 플로깅 일시정지');
    setStatus("paused");
  };

  const resumePlogging = () => {
    console.log('[usePlogging] 플로깅 재시작');
    setStatus("running");
  };

  const endPlogging = () => {
    console.log('[usePlogging] 플로깅 종료');
    setStatus("idle");
    setTime(0);
    setTrashCount(0);
  };

  const addTrash = () => {
    console.log('[usePlogging] 쓰레기 개수 증가');
    setTrashCount(prev => {
      const newCount = prev + 1;
      console.log('[usePlogging] 새 쓰레기 개수:', newCount);
      return newCount;
    });
  };

  const pickTrash = () => {
    setTrashCount(prev => prev + 1);
  };

  return {
    status,
    time,
    trashCount,
    formatTime,
    startPlogging,
    pausePlogging,
    resumePlogging,
    endPlogging,
    pickTrash,
    setStatus,
    setTime,
    setTrashCount,
  };
};
