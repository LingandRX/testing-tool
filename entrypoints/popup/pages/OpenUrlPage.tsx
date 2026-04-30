import { Box, Typography, Container } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import UrlEntryForm from '@/components/UrlEntryForm';
import UrlEntryList from '@/components/UrlEntryList';
import { useUrlPreferences } from '@/utils/useUrlPreferences';
import type { OpenUrlEntry } from '@/types/storage';
import { dashboardPageStyles, openUrlPageStyles } from '@/config/pageTheme';
import PageHeader from '@/components/PageHeader';

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
        <PageHeader
          title="URL 工具"
          subtitle="快速打开 URL 或复制链接"
          icon={<LanguageIcon />}
          iconColor={openUrlPageStyles.primaryColor}
          sx={{ mb: 2.5 }}
        />

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
