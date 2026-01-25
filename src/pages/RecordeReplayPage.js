import React from 'react';
// import {sendRecordCommand} from '../services/bridge'
// import {storage} from "../services/storage";
import {useRecorder} from "../hooks/useRecorder";
import {downloadHtml} from "../utils/recordUtils";

const RecordeReplayPage = () => {
  // const [isRecording, setIsRecording] = useState(false);
  
  const {startRecord, stopRecord, getEvents, isRecording} = useRecorder();
  
  const handleStart = async () => {
    try {
      // await sendRecordCommand("START_RECORD");
      if (!isRecording) {
        await startRecord();
      } else {
        stopRecord();
      }
      // await storage.set({isRecording: true, recordingStartTime: Date.now()});
      // console.log('events', events);
    } catch (e) {
      console.error("Error starting recording:", e);
    }
  }
  
  const handleStop = async () => {
    try {
      // await sendRecordCommand("STOP_RECORD");
      // const events =useRecorder().getEvents();
      // console.log('events', events);
      // setIsRecording(false);
      // await storage.remove('isRecording');
      stopRecord();
      downloadHtml(getEvents());
      // console.log('events', getEvents());
    } catch (e) {
      console.error("Error stopping recording:", e)
    }
  };
  
  return (
    <div style={{width: "300px", padding: "16px"}}>
      <h3>RRWeb Recorder</h3>
      
      {/* 3. 选择标签页逻辑：默认为当前页，如果需要跨页，需先列出 chrome.tabs.query */}
      
      <div style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
        {!isRecording ? (
          <button onClick={handleStart} className={"action-btn"}>
            开始录制
          </button>
        ) : (
          <button className={"action-btn stop-btn"}
                  onClick={handleStop}>停止录制</button>
        )}
      </div>
    </div>
  );
};

export default RecordeReplayPage;
