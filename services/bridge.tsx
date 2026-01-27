// src/services/bridge.ts
import {record} from 'rrweb';
import {isExtension} from '../utils/env';

let stopFn = null;
let events = [];

/**
 * 发送指令给录制器（Content Script 或 当前页面逻辑）
 * @param action 'START_RECORD' | 'STOP_RECORD'
 * @returns {Promise<unknown>}
 */
export const sendRecordCommand = async (action) => {
  if (isExtension()) {
    // === 插件环境 ===
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      if (tab?.id) {
        // 使用 Promise 包装 sendMessage 以便统一 async/await 风格
        return new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, {action}, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
      }
    } catch (e) {
      console.error("Extension communication error:", e);
    }
  } else {
    // === 网页环境 (Web Demo / Localhost 调试) ===
    console.log(`[Web Mode] Simulation: Sending ${action}`);
    
    if (action === 'START_RECORD') {
      stopFn = record({
        emit(event) {
          if (events.length > 1000) {
            console.log('events length > 1000');
            stopFn();
          }
          events.push(event);
        }
      });
    } else if (action === 'STOP_RECORD') {
      if (stopFn != null) {
        stopFn();
      }
      console.log('[Web Mode] Simulation: Stopping recorder');
      console.log('[Web Mode] Simulation: Events:', events);
      console.log('[Web Mode] Simulation: Events:', events.length);
    }
  }
};