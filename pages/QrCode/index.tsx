import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const qrCode = useQrCode();

  // 模式选项
  const modeOptions = [
    { value: 'generate' as QrCodeMode, label: t('qrCode:urlToQr') },
    { value: 'parse' as QrCodeMode, label: t('qrCode:qrToUrl') },
  ];

  return (
    <QrCodeContext.Provider value={qrCode}>
      <Box>
        <Container
          maxWidth={isDesktop ? 'lg' : false}
          sx={{ py: 2, maxWidth: isDesktop ? undefined : 400 }}
        >
          <PageHeader
            title={t('qrCode:pageTitle')}
            subtitle={t('qrCode:pageSubtitle')}
            icon={<QrCodeIcon />}
            iconColor={qrCodePageStyles.primaryColor}
            sx={{ mb: 2.5 }}
          />

          <SwitchButtonGroup
            value={qrCode.mode}
            options={modeOptions}
            onChange={qrCode.setMode}
            sx={{ mb: 3 }}
          />

          {qrCode.mode === 'generate' ? <GeneratePanel /> : <ParsePanel />}
        </Container>
      </Box>
    </QrCodeContext.Provider>
  );
}
