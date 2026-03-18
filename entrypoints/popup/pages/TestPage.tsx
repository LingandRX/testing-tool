import { Button } from '@mui/material';
import { useState, useEffect } from 'react';

const TestPage = () => {
  const [tabId, setTabId] = useState(-1);

  useEffect(() => {
    (async () => {
      const activeTabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log(`activeTabs:`, activeTabs[0].id);
      if (activeTabs[0].id && activeTabs[0].id > 0) setTabId(activeTabs[0].id);
      else throw new Error('no active tab');
    })();
  });

  const handleAttach = () => {
    try {
      chrome.debugger.attach({ tabId: tabId }, '1.2', () => {
        console.log('[debugger] attached');
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetach = async () => {
    try {
      chrome.debugger.detach({ tabId: tabId }, () => {
        console.log('[debugger] detached');
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetTarget = () => {
    chrome.debugger.getTargets((targets) => {
      console.log('[debugger] targets:', targets);
    });
  };

  const enableRuntime = () => {
    chrome.debugger.sendCommand({ tabId: tabId }, 'Runtime.enable', {}, (res) => {
      console.log('[debugger] Runtime.enable:', res);
    });
  };

  const disableRuntime = () => {
    chrome.debugger.sendCommand({ tabId: tabId }, 'Runtime.disable', {}, (res) => {
      console.log('[debugger] Runtime.disable:', res);
    });
  };
  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAttach}>
        attach
      </Button>
      <Button variant="contained" color="primary" onClick={handleDetach}>
        detach
      </Button>
      <Button variant="contained" color="primary" onClick={handleGetTarget}>
        getTargets
      </Button>
      <Button variant="contained" color="primary" onClick={enableRuntime}>
        enableRuntime
      </Button>
      <Button variant="contained" color="primary" onClick={disableRuntime}>
        disableRuntime
      </Button>
    </div>
  );
};

export default TestPage;
