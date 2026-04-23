import { Box, Typography, Stack, Container, CircularProgress } from '@mui/material';
import { alpha } from '@mui/system';
import QrCodeIcon from '@mui/icons-material/QrCode';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import UrlToQrCodeSection from '@/components/UrlToQrCodeSection';
import QrCodeToUrlSection from '@/components/QrCodeToUrlSection';
import { useStorageState } from '@/utils/useStorageState';
import { qrCodePageStyles, dashboardPageStyles } from '@/config/pageTheme';

const QrCodePage = () => {
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });

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
    <Box sx={{ minHeight: '100%', pb: 3, bgcolor: dashboardPageStyles.backgroundColor }}>
      <Container sx={{ py: 2, maxWidth: 400, bgcolor: dashboardPageStyles.backgroundColor }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2.5,
              bgcolor: alpha(qrCodePageStyles.successColor, 0.1),
              color: qrCodePageStyles.successColor,
              display: 'flex',
            }}
          >
            <QrCodeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight={900}
              sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}
            >
              二维码工具
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              生成和解析二维码
            </Typography>
          </Box>
        </Stack>

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
        <GlobalSnackbar {...snackbarProps} />
      </Container>
    </Box>
  );
};

export default QrCodePage;
