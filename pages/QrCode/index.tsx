import { QrCode } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { QrCodeContext } from './contexts/QrCodeContext';
import { useQrCode } from './hooks/useQrCode';
import GeneratePanel from './components/GeneratePanel';
import ParsePanel from './components/ParsePanel';
import type { QrCodeMode } from './types';

export default function Index() {
  const { t } = useLazyTranslation('qrCode');
  const qrCode = useQrCode();

  // 模式选项
  const modeOptions = [
    { value: 'generate' as QrCodeMode, label: t('qrCode:urlToQr') },
    { value: 'parse' as QrCodeMode, label: t('qrCode:qrToUrl') },
  ];

  return (
    <QrCodeContext.Provider value={qrCode}>
      <div>
        <div className="py-2 max-w-[400px] md:max-w-none">
          <PageHeader
            title={t('qrCode:pageTitle')}
            subtitle={t('qrCode:pageSubtitle')}
            icon={<QrCode />}
            iconColor={qrCodePageStyles.primaryColor}
            sx={{ marginBottom: '0.625rem' }}
          />

          <SwitchButtonGroup
            value={qrCode.mode}
            options={modeOptions}
            onChange={qrCode.setMode}
            sx={{ marginBottom: '0.75rem' }}
          />

          {qrCode.mode === 'generate' ? <GeneratePanel /> : <ParsePanel />}
        </div>
      </div>
    </QrCodeContext.Provider>
  );
}
