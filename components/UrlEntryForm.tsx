import { useState } from 'react';
import { Box, TextField, Alert, Stack, alpha } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Button from '@/components/Button';
import type { OpenUrlEntry } from '@/types/storage';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';
import { openUrlPageStyles } from '@/config/pageTheme';

interface UrlEntryFormProps {
  onAddEntry: (entry: OpenUrlEntry) => void;
  showMessage: (message: string, options?: SnackbarOptions) => void;
}

const UrlEntryForm = ({ onAddEntry, showMessage }: UrlEntryFormProps) => {
  const [newName, setNewName] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');

  const showMixedContentWarning =
    newUrl.startsWith('http://') && !newUrl.includes('localhost') && !newUrl.includes('127.0.0.1');

  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddEntry = () => {
    if (!newName.trim()) {
      showMessage('请输入名称', { severity: 'error' });
      return;
    }
    if (!isValidUrl(newUrl)) {
      showMessage('请输入有效的 URL', { severity: 'error' });
      return;
    }

    onAddEntry({ name: newName.trim(), url: newUrl.trim() });
    setNewName('');
    setNewUrl('');
    showMessage('添加成功', { severity: 'success' });
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'grey.100',
        mb: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      }}
    >
      <Stack spacing={2}>
        <TextField
          label="环境名称"
          placeholder="例如: 本地文档"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          fullWidth
          variant="outlined"
          sx={openUrlPageStyles.INPUT_STYLE}
        />
        <TextField
          label="目标 URL"
          placeholder="例如: http://localhost:8000/docs"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          fullWidth
          variant="outlined"
          sx={openUrlPageStyles.INPUT_STYLE}
        />

        {showMixedContentWarning && (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 3,
              '& .MuiAlert-message': { fontSize: '0.7rem', fontWeight: 600, lineHeight: 1.4 },
            }}
          >
            混合内容警告：当前 HTTPS 页面无法加载 HTTP 资源。
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleAddEntry}
          disabled={!newName.trim() || !isValidUrl(newUrl)}
          fullWidth
          startIcon={<AddIcon />}
          sx={{
            py: 1.2,
            borderRadius: 4,
            bgcolor: openUrlPageStyles.themeColor,
            fontWeight: 800,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: openUrlPageStyles.primaryDark,
              boxShadow: `0 8px 24px ${alpha(openUrlPageStyles.primaryColor, 0.2)}`,
            },
          }}
        >
          添加快捷方式
        </Button>
      </Stack>
    </Box>
  );
};

export default UrlEntryForm;
