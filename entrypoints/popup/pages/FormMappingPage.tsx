import {
  Box,
  Typography,
  Container,
  IconButton,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AbcIcon from '@mui/icons-material/Abc';
import ListIcon from '@mui/icons-material/List';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CasinoIcon from '@mui/icons-material/Casino';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import PushPinIcon from '@mui/icons-material/PushPin';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import React, { useEffect, useState } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import { FormMapEntry } from '@/types/storage';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import { useSnackbar as useGlobalSnackbar } from '@/components/GlobalSnackbar';
import { MessageAction, sendMessageToContent } from '@/utils/messages';
import CopyButton from '@/components/CopyButton';

export default function FormMappingPage() {
  const [entries, setEntries] = useState<FormMapEntry[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [expandedId, setExpandedId] = useState<string | false>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { showMessage } = useGlobalSnackbar({ autoHideDuration: 3000 });

  const DEFAULT_HIGHLIGHT_DURATION = 1500;

  useEffect(() => {
    const loadData = async () => {
      const data = (await storageUtil.get('active_form_map')) as FormMapEntry[];
      setEntries(data || []);
      const picking = (await storageUtil.get('app/formMapping/isPicking')) as boolean;
      setIsPicking(picking || false);
    };

    loadData().catch((r) => console.error(r));

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
    // 从 storage 读取最新数据，避免使用可能过时的 entries 状态
    const currentData = (await storageUtil.get('active_form_map')) as FormMapEntry[];
    const newEntries = (currentData || []).filter((e) => e.id !== id);
    await storageUtil.set('active_form_map', newEntries);
  };

  const updateEntry = async (id: string, updates: Partial<FormMapEntry>) => {
    // 从 storage 读取最新数据，避免使用可能过时的 entries 状态
    const currentData = (await storageUtil.get('active_form_map')) as FormMapEntry[];
    const newEntries = (currentData || []).map((e) => {
      if (e.id === id) {
        const updated = { ...e, ...updates };
        // 处理嵌套对象
        if (updates.action_logic) {
          updated.action_logic = { ...e.action_logic, ...updates.action_logic };
        }
        return updated;
      }
      return e;
    });
    await storageUtil.set('active_form_map', newEntries);
  };

  const highlightEntry = async (entry: FormMapEntry) => {
    try {
      const resp = await sendMessageToContent(MessageAction.FLASH_SELECTOR, {
        entry: entry,
        duration: DEFAULT_HIGHLIGHT_DURATION,
      });
      if (!resp.success) {
        showMessage(resp.message || '未能在页面上定位到元素', { severity: 'warning' });
      }
    } catch (error) {
      console.error(error);
      showMessage('通信失败，请确认页面已刷新', { severity: 'error' });
    }
  };

  const clearAll = async () => {
    await storageUtil.set('active_form_map', []);
    await storageUtil.set('app/formMapping/isPicking', false);
  };

  const flashMultiple = async () => {
    // 检查是否正在拾取中
    if (isPicking) {
      showMessage('正在拾取中，请先停止拾取', { severity: 'warning' });
      return;
    }

    // 从 storage 读取最新数据，确保高亮的是最新拾取的字段
    const targets = (await storageUtil.get('active_form_map')) as FormMapEntry[];
    if (!targets || targets.length === 0) {
      showMessage('暂无已拾取字段', {
        severity: 'warning',
      });
      return;
    }

    try {
      const resp = await sendMessageToContent(MessageAction.FLASH_MULTIPLE_SELECTORS, {
        entries: targets,
        duration: DEFAULT_HIGHLIGHT_DURATION,
      });
      if (resp.success) {
        showMessage(resp.message || '已在页面上定位');
      } else {
        showMessage(resp.message || '定位失败', { severity: 'error' });
      }
    } catch (r) {
      console.error(r);
      showMessage('通信失败，请确认页面已刷新', { severity: 'error' });
    }
  };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽预览透明度
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newEntries = [...entries];
    const draggedItem = newEntries[draggedIndex];
    newEntries.splice(draggedIndex, 1);
    newEntries.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setEntries(newEntries);
  };

  const handleDragEnd = async (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    await storageUtil.set('active_form_map', entries);
  };

  const exportConfig = () => {
    try {
      if (entries.length === 0) {
        showMessage('没有可导出的配置数据', { severity: 'warning' });
        return;
      }

      const jsonStr = JSON.stringify(entries, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const filename = `form-mapping-config-${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('配置导出成功！', { severity: 'success' });
    } catch (error) {
      console.error('导出配置失败:', error);
      showMessage(error instanceof Error ? error.message : '导出失败，请重试', {
        severity: 'error',
      });
    }
  };

  const handleExpand = (id: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedId(isExpanded ? id : false);
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <AbcIcon fontSize="inherit" />;
      case 'select':
        return <ListIcon fontSize="inherit" />;
      case 'checkbox':
        return <CheckBoxIcon fontSize="inherit" />;
      default:
        return <AbcIcon fontSize="inherit" />;
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box>
        <Container sx={{ py: 2, width: '400px', maxWidth: '400px', px: 2 }}>
          <PageHeader
            title="通用表单映射助手"
            subtitle="智能识别表单指纹，自定义填充逻辑"
            icon={<AutoFixHighIcon />}
          />
          <Box sx={{ py: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                bgcolor: isPicking ? 'primary.50' : 'grey.50',
                borderRadius: 4,
                border: '1px solid',
                borderColor: isPicking ? 'primary.200' : 'grey.200',
                boxShadow: isPicking
                  ? (theme) => `0 0 12px ${theme.palette.primary.main}40`
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                  状态控制
                </Typography>
                <Button
                  variant={isPicking ? 'contained' : 'outlined'}
                  color={isPicking ? 'success' : 'primary'}
                  onClick={togglePicking}
                  size="small"
                  startIcon={isPicking ? <CheckCircleIcon /> : <AddCircleOutlineIcon />}
                  sx={{
                    px: 2,
                    borderRadius: 3,
                    fontWeight: 700,
                    animation: isPicking ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.4)' },
                      '70%': { boxShadow: '0 0 0 10px rgba(46, 125, 50, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)' },
                    },
                  }}
                >
                  {isPicking ? '完成拾取' : '开始拾取'}
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.9 }}>
                {isPicking
                  ? '请在网页上点击想要映射的表单元素。支持连续点击拾取多个。'
                  : '点击“开始拾取”后，直接在网页上点击想要映射的表单元素。'}
              </Typography>
            </Paper>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                px: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                已拾取字段 ({entries.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip
                  title={isPicking ? '拾取模式下无法高亮所有字段' : '闪烁高亮所有已拾取的字段'}
                >
                  <span>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => flashMultiple()}
                      disabled={entries.length === 0 || isPicking}
                      sx={{ fontWeight: 700, minWidth: 0, px: 1 }}
                    >
                      高亮显示
                    </Button>
                  </span>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  onClick={clearAll}
                  disabled={entries.length === 0}
                  sx={{ fontWeight: 700, minWidth: 0, px: 1 }}
                >
                  清空全部
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
              {entries.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    borderStyle: 'dashed',
                    borderColor: 'grey.300',
                  }}
                >
                  <Typography variant="body2" color="text.disabled" fontWeight={500}>
                    暂无数据，点击上方按钮开始探测网页表单
                  </Typography>
                </Paper>
              ) : (
                entries.map((entry, index) => (
                  <Accordion
                    key={entry.id}
                    expanded={expandedId === entry.id}
                    onChange={handleExpand(entry.id)}
                    draggable
                    onDragStart={handleDragStart(index)}
                    onDragOver={handleDragOver(index)}
                    onDragEnd={handleDragEnd}
                    elevation={0}
                    sx={{
                      mb: 1,
                      borderRadius: '16px !important',
                      '&:before': { display: 'none' },
                      border: '1px solid',
                      borderColor: expandedId === entry.id ? 'primary.200' : 'grey.200',
                      bgcolor: expandedId === entry.id ? 'background.paper' : 'background.paper',
                      boxShadow: expandedId === entry.id ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      cursor: 'default',
                      width: '100%',
                      boxSizing: 'border-box',
                      '&:hover': {
                        borderColor: 'primary.100',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon fontSize="small" />}
                      sx={{
                        px: 2,
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          my: '12px !important',
                          minWidth: 0, // 确保内容区可以收缩
                          overflow: 'hidden',
                        },
                      }}
                    >
                      <Tooltip title="拖动调整顺序">
                        <Box
                          sx={{
                            cursor: 'grab',
                            mr: 1,
                            color: 'text.disabled',
                            display: 'flex',
                            '&:active': { cursor: 'grabbing' },
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DragIndicatorIcon fontSize="small" />
                        </Box>
                      </Tooltip>
                      <Box sx={{ flex: 1, minWidth: 0, ml: 0.5 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{ minWidth: 0 }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              color: 'primary.main',
                              fontSize: '1rem',
                              flexShrink: 0,
                            }}
                          >
                            {getFieldTypeIcon(entry.action_logic.type)}
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            noWrap
                            sx={{
                              color: entry.label_display ? 'text.primary' : 'text.disabled',
                              letterSpacing: '-0.01em',
                              flexGrow: 1,
                              minWidth: 0,
                            }}
                          >
                            {entry.label_display || '未识别标签'}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{
                            display: 'block',
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            opacity: 0.6,
                            mt: 0.2,
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {entry.fingerprint.selector}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.2} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="高亮定位">
                          <IconButton
                            size="small"
                            onClick={() => highlightEntry(entry)}
                            sx={{ color: 'primary.main', opacity: 0.8, '&:hover': { opacity: 1 } }}
                          >
                            <GpsFixedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除字段">
                          <IconButton
                            size="small"
                            onClick={() => deleteEntry(entry.id)}
                            sx={{ color: 'error.light', opacity: 0.8, '&:hover': { opacity: 1 } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, px: 2, pb: 2.5 }}>
                      <Divider sx={{ mb: 2, opacity: 0.6 }} />
                      <Stack spacing={2.5}>
                        <TextField
                          label="显示名称"
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={entry.label_display}
                          onChange={(e) => updateEntry(entry.id, { label_display: e.target.value })}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                        <Stack direction="row" spacing={1.5}>
                          <FormControl fullWidth size="small">
                            <InputLabel shrink>字段类型</InputLabel>
                            <Select
                              value={entry.action_logic.type}
                              label="字段类型"
                              notched
                              onChange={(e) =>
                                updateEntry(entry.id, {
                                  action_logic: {
                                    ...entry.action_logic,
                                    type: e.target.value as never,
                                  },
                                })
                              }
                            >
                              <MenuItem value="text">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <AbcIcon fontSize="small" />
                                  <Typography variant="body2">文本输入</Typography>
                                </Stack>
                              </MenuItem>
                              <MenuItem value="select">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <ListIcon fontSize="small" />
                                  <Typography variant="body2">下拉选择</Typography>
                                </Stack>
                              </MenuItem>
                              <MenuItem value="checkbox">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <CheckBoxIcon fontSize="small" />
                                  <Typography variant="body2">复选框</Typography>
                                </Stack>
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl fullWidth size="small">
                            <InputLabel shrink>填充策略</InputLabel>
                            <Select
                              value={entry.action_logic.strategy}
                              label="填充策略"
                              notched
                              onChange={(e) =>
                                updateEntry(entry.id, {
                                  action_logic: {
                                    ...entry.action_logic,
                                    strategy: e.target.value as never,
                                  },
                                })
                              }
                            >
                              <MenuItem value="fixed">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <PushPinIcon fontSize="small" />
                                  <Typography variant="body2">固定值</Typography>
                                </Stack>
                              </MenuItem>
                              <MenuItem value="random">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <CasinoIcon fontSize="small" />
                                  <Typography variant="body2">随机值</Typography>
                                </Stack>
                              </MenuItem>
                              <MenuItem value="sequence">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <FormatListNumberedIcon fontSize="small" />
                                  <Typography variant="body2">序列值</Typography>
                                </Stack>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Stack>
                        <TextField
                          label="填充值 / 配置"
                          size="small"
                          fullWidth
                          placeholder={
                            entry.action_logic.strategy === 'random'
                              ? '随机模式下可不填'
                              : '请输入填充值'
                          }
                          value={entry.action_logic.value}
                          onChange={(e) =>
                            updateEntry(entry.id, {
                              action_logic: { ...entry.action_logic, value: e.target.value },
                            })
                          }
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />

                        <Box>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5, px: 0.5 }}
                          >
                            CSS 选择器 (指纹)
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'monospace',
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flexGrow: 1,
                                mr: 1,
                              }}
                            >
                              {entry.fingerprint.selector}
                            </Typography>
                            <CopyButton text={entry.fingerprint.selector} size="small" />
                          </Paper>
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>

            {entries.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    px: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    配置预览 (JSON)
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={exportConfig}
                    startIcon={<FileDownloadIcon />}
                    sx={{ fontWeight: 700 }}
                  >
                    导出 JSON
                  </Button>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#1e1e1e',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'grey.800',
                    fontFamily: '"Fira Code", "Roboto Mono", monospace',
                    fontSize: '0.75rem',
                    maxHeight: '200px',
                    overflow: 'auto',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'grey.700',
                      borderRadius: '3px',
                    },
                    '& pre': {
                      margin: 0,
                      color: '#ce9178', // JSON String color
                    },
                  }}
                >
                  <pre>{JSON.stringify(entries, null, 2)}</pre>
                </Paper>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
