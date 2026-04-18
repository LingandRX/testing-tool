import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Container } from '@mui/system';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import qrcode from 'qrcode';
import jsQR from 'jsqr';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { storageUtil } from '@/utils/chromeStorage';

const QrCodePage = () => {
  const { snackbarProps, showMessage } = useSnackbar();
  const [isInitialized, setIsInitialized] = useState(false);

  // URL 转二维码状态
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  // 二维码转 URL 状态
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [parsedUrl, setParsedUrl] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsing, setParsing] = useState(false);

  // 卡片展开状态
  const [urlExpanded, setUrlExpanded] = useState(true);
  const [qrExpanded, setQrExpanded] = useState(false);

  // 引用
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // 从存储加载状态
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedUrlExpanded = await storageUtil.get('qrCode/urlExpanded', true);
        const savedQrExpanded = await storageUtil.get('qrCode/expanded', false);
        setUrlExpanded(savedUrlExpanded ?? true);
        setQrExpanded(savedQrExpanded ?? false);
      } catch (error) {
        console.error('加载状态失败:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadState();
  }, []);

  // 保存状态到存储（仅在初始化完成后保存）
  useEffect(() => {
    if (!isInitialized) return;

    const saveState = async () => {
      try {
        await storageUtil.set('qrCode/urlExpanded', urlExpanded);
        await storageUtil.set('qrCode/expanded', qrExpanded);
      } catch (error) {
        console.error('保存状态失败:', error);
      }
    };

    saveState();
  }, [urlExpanded, qrExpanded, isInitialized]);

  // 初始化未完成时显示加载状态
  if (!isInitialized) {
    return (
      <Container sx={{ py: 4, maxWidth: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Container>
    );
  }

  // 处理 URL 输入变化
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    setUrlError('');
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只有当用户实际选择了文件时才更新状态
    // 如果用户取消选择，保持原有状态不变
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setQrCodeFile(file);
      setParseError('');
      setParsedUrl('');
    }
  };

  // 生成二维码
  const generateQrCode = async () => {
    if (!urlInput) {
      setUrlError('请输入 URL');
      return;
    }

    try {
      setGenerating(true);
      setUrlError('');

      // 验证 URL 格式
      let url = urlInput;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // 生成二维码
      const dataUrl = await qrcode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeDataUrl(dataUrl);
      showMessage('二维码生成成功', { severity: 'success', autoHideDuration: 1000 });
    } catch (error) {
      console.error('生成二维码失败:', error);
      showMessage('生成二维码失败，请重试', { severity: 'error', autoHideDuration: 300 });
    } finally {
      setGenerating(false);
    }
  };

  // 解析二维码
  const parseQrCode = async () => {
    if (!qrCodeFile) {
      showMessage('请选择二维码图片', { severity: 'error', autoHideDuration: 300 });
      return;
    }

    try {
      setParsing(true);
      setParseError('');
      setParsedUrl('');

      // 读取文件并解析
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('无法创建 canvas 上下文');
      }

      const image = new Image();
      image.src = URL.createObjectURL(qrCodeFile);

      await new Promise<void>((resolve, reject) => {
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          resolve();
        };
        image.onerror = () => reject(new Error('图片加载失败'));
      });

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setParsedUrl(code.data);
        showMessage('二维码解析成功', { severity: 'success', autoHideDuration: 1000 });
      } else {
        showMessage('未检测到二维码', { severity: 'error', autoHideDuration: 1000 });
      }
    } catch (error) {
      console.error('解析二维码失败:', error);
      showMessage('解析二维码失败，请重试', { severity: 'error', autoHideDuration: 300 });
    } finally {
      setParsing(false);
    }
  };

  // 下载二维码
  const downloadQrCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    showMessage('二维码下载成功', { severity: 'success', autoHideDuration: 300 });
  };

  // 复制到剪贴板
  const handleCopy = async (text: string) => {
    try {
      if (!text) {
        showMessage('未检测要复制的文本', { severity: 'error', autoHideDuration: 300 });
        return;
      }
      await navigator.clipboard.writeText(text);
      showMessage('复制成功', { severity: 'success', autoHideDuration: 300 });
    } catch (error) {
      console.error('复制失败:', error);
      showMessage('复制失败，请重试', { severity: 'error', autoHideDuration: 300 });
    }
  };

  return (
    <Container sx={{ py: 4, maxWidth: 400 }}>
      <Stack spacing={3}>
        {/* URL 转二维码 */}
        <Accordion
          expanded={urlExpanded}
          onChange={(_, isExpanded) => setUrlExpanded(isExpanded)}
          sx={{
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <QrCodeIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                URL 转二维码
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                label="输入 URL"
                placeholder="https://example.com"
                value={urlInput}
                onChange={handleUrlInputChange}
                fullWidth
                variant="outlined"
                error={!!urlError}
                helperText={urlError}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={
                  generating ? <CircularProgress size={16} color="inherit" /> : <QrCodeIcon />
                }
                onClick={generateQrCode}
                disabled={generating}
                sx={{
                  py: 1.2,
                  borderRadius: 3,
                  bgcolor: '#2196f3',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#1976d2',
                  },
                }}
              >
                {generating ? '生成中...' : '生成二维码'}
              </Button>

              {/* 二维码显示区域 */}
              <Box
                ref={qrCodeRef}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 200,
                  border: '2px dashed',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                }}
              >
                {qrCodeDataUrl ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={downloadQrCode}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        borderColor: '#2196f3',
                        color: '#2196f3',
                        '&:hover': {
                          borderColor: '#1976d2',
                          bgcolor: 'rgba(33, 150, 243, 0.05)',
                        },
                      }}
                    >
                      下载二维码
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    二维码将显示在这里
                  </Typography>
                )}
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* 二维码转 URL */}
        <Accordion
          expanded={qrExpanded}
          onChange={(_, isExpanded) => setQrExpanded(isExpanded)}
          sx={{
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinkIcon color="success" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                二维码转 URL
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  border: '2px dashed',
                  borderColor: qrCodeFile ? '#4caf50' : 'grey.200',
                  borderRadius: 3,
                  p: 4,
                  bgcolor: qrCodeFile ? 'rgba(76, 175, 80, 0.05)' : 'grey.50',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#4caf50',
                    bgcolor: 'rgba(76, 175, 80, 0.05)',
                  },
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    display: 'none',
                  }}
                  id="qr-code-upload"
                />
                <label
                  htmlFor="qr-code-upload"
                  style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}
                >
                  {qrCodeFile ? (
                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                      <img
                        src={URL.createObjectURL(qrCodeFile)}
                        alt="QR Code Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 160,
                          borderRadius: 8,
                          objectFit: 'contain',
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {qrCodeFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        点击更换图片
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <ImageIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        点击或拖拽上传二维码图片
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        支持 PNG、JPG、WEBP 格式
                      </Typography>
                    </>
                  )}
                </label>
              </Box>

              <Button
                variant="contained"
                startIcon={parsing ? <CircularProgress size={16} color="inherit" /> : <LinkIcon />}
                onClick={parseQrCode}
                disabled={parsing}
                sx={{
                  py: 1.2,
                  borderRadius: 3,
                  bgcolor: '#4caf50',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#388e3c',
                  },
                }}
              >
                {parsing ? '解析中...' : '解析二维码'}
              </Button>

              {/* 解析结果显示 */}
              <Box
                sx={{
                  position: 'relative',
                  mt: 2,
                }}
              >
                <TextField
                  label="解析结果"
                  value={parsedUrl}
                  fullWidth
                  variant="outlined"
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => handleCopy(parsedUrl)} size="small">
                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {parseError && (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {parseError}
                </Alert>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
      <GlobalSnackbar {...snackbarProps} />
    </Container>
  );
};

export default QrCodePage;
