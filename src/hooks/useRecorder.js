import {useRef, useState} from "react";
import {record} from "rrweb";

export const useRecorder = () => {
  // 存储录制事件
  const eventRef = useRef([]);
  // 存储停止录制函数
  const stopFnRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  
  const startRecord = async () => {
    if (isRecording) return;
    
    setIsRecording(true);
    
    // 启动录制
    stopFnRef.current = record({
      emit(event) {
        // 存储数据
        eventRef.current.push(event);
      }
    });
  };
  
  const stopRecord = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    
    // 停止录制
    if (stopFnRef.current) {
      stopFnRef.current();
    }
  };
  
  return {
    startRecord,
    stopRecord,
    isRecording,
    getEvents: () => eventRef.current
  }
};