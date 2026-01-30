// import { useRef } from 'react';
console.log('[offscreen] loaded');

// const events = [];

// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type === 'SAVE_EVENT') {
//     console.log('[offscreen] rrweb event', msg.event);
//     events.push(msg.event);
//     // 这里你可以存 IndexedDB / memory / file
//   }

//   if (msg.type === 'SAVE_EVENTS') {
//     console.log('[offscreen] SAVE_EVENTS received');
//     console.log('[offscreen] total events:', events.length);
//     console.log('[offscreen] events:', JSON.stringify(events));
//     // const blob = new Blob([JSON.stringify(events)], {
//     //   type: 'application/json',
//     // });
//     // reader.onload = () => {
//     //   chrome.runtime.sendMessage({
//     //     type: 'DOWNLOAD',
//     //     dataUrl: reader.result,
//     //   });
//     // };
//     // reader.readAsDataURL(blob);
//   }
// });
