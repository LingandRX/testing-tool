import { Box, Typography, Container, Stack, alpha } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import UrlEntryForm from '@/components/UrlEntryForm';
import UrlEntryList from '@/components/UrlEntryList';
import { useUrlPreferences } from '@/utils/useUrlPreferences';
import type { OpenUrlEntry } from '@/types/storage';
import { openUrlPageStyles, dashboardPageStyles } from '@/config/pageTheme';

const THEME_COLOR = openUrlPageStyles.themeColor;

export default function OpenUrlPage() {
  const { entries, setEntries, isLoaded } = useUrlPreferences();
  const { snackbarProps, showMessage } = useSnackbar();

  const handleAddEntry = (entry: OpenUrlEntry) => {
    setEntries([...entries, entry]);
  };

  const handleDeleteEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
    showMessage('删除成功', { severity: 'success' });
  };

  if (!isLoaded) {
    return (
      <Box sx={{ bgcolor: dashboardPageStyles.backgroundColor, minHeight: '100%', pb: 3 }}>
        <Container sx={{ py: 2 }}>
          <Typography>加载中...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: dashboardPageStyles.backgroundColor, minHeight: '100%', pb: 3 }}>
      <Container sx={{ py: 2 }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2.5,
              bgcolor: alpha(THEME_COLOR, 0.1),
              color: THEME_COLOR,
              display: 'flex',
            }}
          >
            <LanguageIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight={900}
              sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}
            >
              URL 工具
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              快速打开 URL 或复制链接
            </Typography>
          </Box>
        </Stack>

        {/* Form Section */}
        <UrlEntryForm onAddEntry={handleAddEntry} showMessage={showMessage} />

        {/* List Section */}
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 800, px: 1, mb: 1, display: 'block' }}
          >
            已保存的快捷方式 ({entries.length})
          </Typography>

          <UrlEntryList
            entries={entries}
            onDeleteEntry={handleDeleteEntry}
            showMessage={showMessage}
          />
        </Box>
      </Container>
      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
