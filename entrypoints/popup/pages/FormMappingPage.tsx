import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Switch,
  Divider,
  Paper,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useEffect, useState } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import { FormMapEntry } from '@/types/storage';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import { globalStyles, formMappingPageStyles } from '@/config/pageTheme.ts';

export default function FormMappingPage() {
  const [entries, setEntries] = useState<FormMapEntry[]>([]);
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = (await storageUtil.get('active_form_map')) as FormMapEntry[];
      setEntries(data || []);
      const picking = (await storageUtil.get('app/formMapping/isPicking')) as boolean;
      setIsPicking(picking || false);
    };

    loadData();

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'local') {
        if (changes['active_form_map']) {
          setEntries((changes['active_form_map'].newValue as FormMapEntry[]) || []);
        }
        if (changes['app/formMapping/isPicking']) {
          setIsPicking((changes['app/formMapping/isPicking'].newValue as boolean) || false);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const togglePicking = async () => {
    await storageUtil.set('app/formMapping/isPicking', !isPicking);
  };

  const deleteEntry = async (id: string) => {
    const newEntries = entries.filter((e) => e.id !== id);
    await storageUtil.set('active_form_map', newEntries);
  };

  const toggleSelection = async (id: string) => {
    const newEntries = entries.map((e) =>
      e.id === id ? { ...e, ui_state: { ...e.ui_state, is_selected: !e.ui_state.is_selected } } : e,
    );
    await storageUtil.set('active_form_map', newEntries);
  };

  const clearAll = async () => {
    await storageUtil.set('active_form_map', []);
    await storageUtil.set('app/formMapping/isPicking', false);
  };

  return (
    <Box sx={{ bgcolor: globalStyles.backgroundColor, minHeight: '100%', pb: 3 }}>
      <Container sx={{ py: 2, bgcolor: globalStyles.backgroundColor }}>
        <PageHeader
          title="通用表单映射助手"
          subtitle="智能识别表单指纹，自定义填充逻辑"
          icon={<AutoFixHighIcon />}
        />
        <Container maxWidth="sm" sx={{ py: 2, px: 0 }}>
          <Paper
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: 'background.paper',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'grey.100',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                状态控制
              </Typography>
              <Button
                variant={isPicking ? 'contained' : 'outlined'}
                onClick={togglePicking}
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  borderRadius: 3,
                  px: 2,
                  fontWeight: 800,
                  ...(isPicking
                    ? {
                        bgcolor: 'secondary.main',
                        boxShadow: `0 4px 12px ${alpha(formMappingPageStyles.secondaryColor || '#9c27b0', 0.2)}`,
                      }
                    : {}),
                }}
              >
                {isPicking ? '正在拾取...' : '开始拾取'}
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              点击“开始拾取”后，直接在网页上点击想要映射的表单元素。
            </Typography>
          </Paper>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              px: 0.5,
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
              已拾取字段 ({entries.length})
            </Typography>
            <Button
              size="small"
              color="error"
              onClick={clearAll}
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            >
              清空全部
            </Button>
          </Box>

          <List
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.100',
            }}
          >
            {entries.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="暂无数据"
                  secondary="点击上方按钮开始探测网页表单"
                  slotProps={{
                    primary: {
                      align: 'center',
                      color: 'text.secondary',
                    },
                    secondary: {
                      align: 'center',
                    },
                  }}
                />
              </ListItem>
            ) : (
              entries.map((entry, index) => (
                <Box key={entry.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => deleteEntry(entry.id)}
                        sx={{ color: 'error.light' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ py: 1.5 }}
                  >
                    <Switch
                      edge="start"
                      checked={entry.ui_state.is_selected}
                      onChange={() => toggleSelection(entry.id)}
                    />
                    <ListItemText
                      primary={entry.label_display}
                      secondary={entry.fingerprint.selector}
                      slotProps={{
                        primary: { fontWeight: 500 },
                        secondary: {
                          sx: {
                            fontFamily: 'monospace',
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px',
                          },
                        },
                      }}
                    />
                  </ListItem>
                </Box>
              ))
            )}
          </List>

          {entries.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5, px: 0.5 }}
              >
                映射配置导出 (JSON)
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  maxHeight: '180px',
                  overflow: 'auto',
                }}
              >
                <pre style={{ margin: 0 }}>{JSON.stringify(entries, null, 2)}</pre>
              </Paper>
            </Box>
          )}
        </Container>
      </Container>
    </Box>
  );
}
