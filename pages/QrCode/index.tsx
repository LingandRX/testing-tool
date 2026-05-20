import { Box, CircularProgress, Container, Stack, useMediaQuery, useTheme } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import UrlToQrCodeSection from '@/pages/QrCode/UrlToQrCodeSection';
import QrCodeToUrlSection from '@/pages/QrCode/QrCodeToUrlSection';
import { useStorageState } from '@/utils/useStorageState';
import { qrCodePageStyles } from '@/config/pageTheme';
import PageHeader from '@/components/PageHeader';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

export default function Index() {
  const { t } = useLazyTranslation('qrCode');
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // 使用自定义钩子管理展开状态（移动端使用）
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

  const sections = isDesktop ? (
    <>
      <Box sx={qrCodePageStyles.GRID_CELL}>
        <UrlToQrCodeSection
          expanded={urlExpanded}
          onExpandedChange={setUrlExpanded}
          forceExpanded={isDesktop}
        />
      </Box>
      <Box sx={qrCodePageStyles.GRID_CELL}>
        <QrCodeToUrlSection
          expanded={qrExpanded}
          onExpandedChange={setQrExpanded}
          forceExpanded={isDesktop}
        />
      </Box>
    </>
  ) : (
    <>
      <UrlToQrCodeSection expanded={urlExpanded} onExpandedChange={setUrlExpanded} />
      <QrCodeToUrlSection expanded={qrExpanded} onExpandedChange={setQrExpanded} />
    </>
  );

  return (
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

        {isDesktop ? (
          <Box sx={qrCodePageStyles.LAYOUT_GRID}>{sections}</Box>
        ) : (
          <Stack spacing={3}>{sections}</Stack>
        )}
      </Container>
    </Box>
  );
}
