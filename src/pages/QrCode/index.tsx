import SwitchButtonGroup from '@/components/SwitchButtonGroup';

import { useI18n } from '@/utils/chromeI18n';
import { QrCodeContext } from './contexts/QrCodeContext';
import { useQrCode } from './hooks/useQrCode';
import GeneratePanel from './components/GeneratePanel';
import ParsePanel from './components/ParsePanel';
import type { QrCodeMode } from './types';

export default function Index() {
  const { t } = useI18n('qrCode');
  const qrCode = useQrCode();

  // 模式选项驱动骨架
  const modeOptions = [
    { value: 'generate' as QrCodeMode, label: t('qrCode:urlToQr') },
    { value: 'parse' as QrCodeMode, label: t('qrCode:qrToUrl') },
  ];

  return (
    <QrCodeContext.Provider value={qrCode}>
      {/* 💡 统一视觉规范大超进化：
         - 彻底剥离破坏流式宽度的 max-w-[400px] 枷锁，开启标准的 w-full 全自适应包裹。
         - 替换为标准的 p-4 呼吸内边距配合 flex flex-col space-y-4，接管系统级重排！
      */}
      <div className="p-4 w-full flex flex-col space-y-4 min-h-[500px] select-none">
        {/* 流式中央控制切流卡：注入 sm 断点防御，防范单栏状态下发生变形 */}
        <div className="w-full sm:w-fit pt-0.5">
          <SwitchButtonGroup
            value={qrCode.mode}
            options={modeOptions}
            onChange={qrCode.setMode}
            size="small"
          />
        </div>

        {/* 💡 面板渲染沙箱：
            - 在切流渲染时，利用独立的 mt-2 增加纵深边界线。
            - 配合内部自带的双翼 Flex 聚焦大边框，形成坚固如铁的架构闭环！
        */}
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
