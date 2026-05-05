import { Box, CircularProgress, Container, Stack } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useSnackbar as useGlobalSnackbar } from '@/components/GlobalSnackbar';
import UrlToQrCodeSection from '@/components/UrlToQrCodeSection';
import QrCodeToUrlSection from '@/components/QrCodeToUrlSection';
import { useStorageState } from '@/utils/useStorageState';
import { qrCodePageStyles } from '@/config/pageTheme';
import PageHeader from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { showMessage } = useGlobalSnackbar();
  const { t } = useTranslation(['qrCode']);

  // 使用自定义钩子管理展开状态
  const [urlExpanded, setUrlExpanded, urlInitialized] = useStorageState('qrCode/urlExpanded', true);
  const [qrExpanded, setQrExpanded, qrInitialized] = useStorageState('qrCode/qrExpanded', false);

  // 初始化未完成时显示加载状态
  if (!urlInitialized || !qrInitialized) {
    return (
      <Container
        sx={{
          py: 4,
          maxWidth: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
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
          <UrlToQrCodeSection
            expanded={urlExpanded}
            onExpandedChange={setUrlExpanded}
            showMessage={showMessage}
          />

          <QrCodeToUrlSection
            expanded={qrExpanded}
            onExpandedChange={setQrExpanded}
            showMessage={showMessage}
          />
        </Stack>
      </Container>
    </Box>
  );
}
