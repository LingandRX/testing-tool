import { Box, CircularProgress, Container, Stack } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import UrlToQrCodeSection from '@/pages/QrCode/UrlToQrCodeSection';
import QrCodeToUrlSection from '@/pages/QrCode/QrCodeToUrlSection';
import { useStorageState } from '@/utils/useStorageState';
import { qrCodePageStyles } from '@/config/pageTheme';
import PageHeader from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { t } = useTranslation(['qrCode']);

  // 使用自定义钩子管理展开状态
  const [urlExpanded, setUrlExpanded, urlInitialized] = useStorageState('qrCode/urlExpanded', true);
  const [qrExpanded, setQrExpanded, qrInitialized] = useStorageState('qrCode/qrExpanded', false);

  // 初始化未完成时显示加载状态
  if (!urlInitialized || !qrInitialized) {
    return (
      <Container sx={qrCodePageStyles.LOADING_CONTAINER}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box>
      <Container sx={{ py: 2, maxWidth: 400 }}>
        <PageHeader
          title={t('qrCode:pageTitle')}
          subtitle={t('qrCode:pageSubtitle')}
          icon={<QrCodeIcon />}
          iconColor={qrCodePageStyles.primaryColor}
          sx={{ mb: 2.5 }}
        />

        <Stack spacing={3}>
          <UrlToQrCodeSection expanded={urlExpanded} onExpandedChange={setUrlExpanded} />

          <QrCodeToUrlSection expanded={qrExpanded} onExpandedChange={setQrExpanded} />
        </Stack>
      </Container>
    </Box>
  );
}
