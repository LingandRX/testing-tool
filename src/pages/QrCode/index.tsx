import SwitchButtonGroup from '@/components/SwitchButtonGroup';

import { QrCodeContext } from './contexts/QrCodeContext';
import { useQrCode } from './hooks/useQrCode';
import GeneratePanel from './components/GeneratePanel';
import ParsePanel from './components/ParsePanel';
import type { QrCodeMode } from './types';

export default function Index() {
  const qrCode = useQrCode();

  // 模式选项驱动骨架
  const modeOptions = [
    { value: 'generate' as QrCodeMode, label: '文本转二维码' },
    { value: 'parse' as QrCodeMode, label: '二维码转文本' },
  ];

  return (
    <QrCodeContext.Provider value={qrCode}>
      <div className="p-4 w-full flex flex-col space-y-4 min-h-[500px] select-none">
        <div className="w-full sm:w-fit pt-0.5">
          <SwitchButtonGroup
            value={qrCode.mode}
            options={modeOptions}
            onChange={qrCode.setMode}
            size="small"
          />
        </div>

        <div className="w-full pt-1.5">
          {qrCode.mode === 'generate' ? (
            <div>
              <GeneratePanel />
            </div>
          ) : (
            <div>
              <ParsePanel />
            </div>
          )}
        </div>
      </div>
    </QrCodeContext.Provider>
  );
}
