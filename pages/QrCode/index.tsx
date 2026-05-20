import { useState, useCallback } from 'react';
import { Box, Container, Grid, useMediaQuery, useTheme } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QRious from 'qrious';
import PageHeader from '@/components/PageHeader';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import TextInputArea from '@/components/TextInputArea';
import QrCodePreview from '@/components/QrCodePreview';
import ImageUploader from '@/components/ImageUploader';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import type { QrCodeMode, QrCodeGeneratorState, QrCodeParserState } from './types';

export default function Index() {
  const { t } = useLazyTranslation('qrCode');
  const theme = useTheme();
  const { showMessage } = useSnackbar();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // 当前模式
  const [mode, setMode] = useState<QrCodeMode>('generate');

  // 二维码生成器状态
  const [generatorState, setGeneratorState] = useState<QrCodeGeneratorState>({
    textToEncode: '',
    qrCodeDataUrl: '',
    generating: false,
    inputError: '',
  });

  // 二维码解析器状态
  const [parserState, setParserState] = useState<QrCodeParserState>({
    decodedResult: '',
    parsing: false,
    parseError: '',
    selectedFile: null,
    previewUrl: '',
    dragging: false,
  });

  // 生成二维码
  const generateQrCode = useCallback(
    async (text: string) => {
      if (!text) return;

      try {
        setGeneratorState((prev) => ({ ...prev, generating: true, inputError: '' }));

        let url = text;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        const qr = new QRious({
          value: url,
          size: 250,
          level: 'H',
          foreground: '#000000',
          background: '#FFFFFF',
        });

        setGeneratorState((prev) => ({ ...prev, qrCodeDataUrl: qr.toDataURL() }));
        showMessage(t('qrCode:qrCodeSuccess'), { severity: 'success', autoHideDuration: 1000 });
      } catch (error) {
        console.error('生成二维码失败:', error);
        showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
      } finally {
        setGeneratorState((prev) => ({ ...prev, generating: false }));
      }
    },
    [t, showMessage],
  );

  // 处理右键菜单数据
  const handleContextMenuData = useCallback(
    (payload: string) => {
      setMode('generate');
      setGeneratorState((prev) => ({ ...prev, textToEncode: payload }));
      generateQrCode(payload);
    },
    [generateQrCode],
  );

  useContextMenuData({ featureKey: 'qrCode', onData: handleContextMenuData });

  // 解析二维码
  const parseQrCode = useCallback(
    async (file: File) => {
      try {
        setParserState((prev) => ({ ...prev, parsing: true, parseError: '', decodedResult: '' }));

        const result = await parseQrCodeFromFile(file);

        if (result.success && result.data) {
          setParserState((prev) => ({ ...prev, decodedResult: result.data! }));
          showMessage(t('qrCode:parseSuccess'), { severity: 'success', autoHideDuration: 1000 });
        } else {
          const errorMsg = result.error || t('qrCode:noQrDetected');
          setParserState((prev) => ({ ...prev, parseError: errorMsg }));
          showMessage(errorMsg, { severity: 'error', autoHideDuration: 1000 });
        }
      } catch (error) {
        console.error('解析二维码失败:', error);
        setParserState((prev) => ({ ...prev, parseError: t('qrCode:parseError') }));
        showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
      } finally {
        setParserState((prev) => ({ ...prev, parsing: false }));
      }
    },
    [t, showMessage],
  );

  // 下载二维码
  const downloadQrCode = useCallback(() => {
    if (!generatorState.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = generatorState.qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    showMessage(t('qrCode:qrCodeDownloadSuccess'), { severity: 'success', autoHideDuration: 300 });
  }, [generatorState.qrCodeDataUrl, showMessage, t]);

  // 复制二维码
  const copyQrCode = useCallback(async () => {
    if (!generatorState.qrCodeDataUrl) return;

    try {
      const response = await fetch(generatorState.qrCodeDataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      showMessage(t('qrCode:qrCodeCopySuccess'), { severity: 'success', autoHideDuration: 1000 });
    } catch (error) {
      console.error('复制二维码失败:', error);
      showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
    }
  }, [generatorState.qrCodeDataUrl, showMessage, t]);

  // 清除文件
  const handleClearFile = useCallback(() => {
    if (parserState.previewUrl) {
      URL.revokeObjectURL(parserState.previewUrl);
    }
    setParserState((prev) => ({
      ...prev,
      selectedFile: null,
      previewUrl: '',
      decodedResult: '',
      parseError: '',
    }));
  }, [parserState.previewUrl]);

  // 模式选项
  const modeOptions = [
    { value: 'generate' as QrCodeMode, label: t('qrCode:urlToQr') },
    { value: 'parse' as QrCodeMode, label: t('qrCode:qrToUrl') },
  ];

  // 渲染左侧面板
  const renderLeftPanel = () => {
    if (mode === 'generate') {
      return (
        <TextInputArea
          title={t('qrCode:urlInputLabel')}
          value={generatorState.textToEncode}
          onChange={(text) => setGeneratorState((prev) => ({ ...prev, textToEncode: text }))}
          placeholder={t('qrCode:urlInputPlaceholder')}
          showCount
          showClear
          allowCopy
          externalError={generatorState.inputError}
          actions={[
            {
              key: 'generate',
              label: generatorState.generating
                ? t('qrCode:generating')
                : t('qrCode:generateButton'),
              type: 'primary',
              position: 'bottom',
              disabled: (value) => !value || generatorState.generating,
              onClick: (value) => generateQrCode(value),
            },
          ]}
          showMessage={showMessage}
        />
      );
    }

    return (
      <ImageUploader
        selectedFile={parserState.selectedFile}
        onFileChange={(file) => {
          setParserState((prev) => ({
            ...prev,
            selectedFile: file,
            previewUrl: URL.createObjectURL(file),
            decodedResult: '',
            parseError: '',
          }));
        }}
        onClearFile={handleClearFile}
        previewUrl={parserState.previewUrl}
        onPreviewUrlChange={(url) => setParserState((prev) => ({ ...prev, previewUrl: url }))}
        dragging={parserState.dragging}
        onDraggingChange={(dragging) => setParserState((prev) => ({ ...prev, dragging }))}
      />
    );
  };

  // 渲染右侧面板
  const renderRightPanel = () => {
    if (mode === 'generate') {
      return (
        <QrCodePreview
          qrCodeDataUrl={generatorState.qrCodeDataUrl}
          onDownload={downloadQrCode}
          onCopy={copyQrCode}
        />
      );
    }

    return (
      <TextInputArea
        title={t('qrCode:resultLabel')}
        value={parserState.decodedResult}
        readOnly
        showClear={false}
        allowCopy
        externalError={parserState.parseError}
        actions={[
          {
            key: 'parse',
            label: parserState.parsing ? t('qrCode:parsing') : t('qrCode:parseButton'),
            type: 'primary',
            position: 'bottom',
            disabled: !parserState.selectedFile || parserState.parsing,
            onClick: () => {
              if (parserState.selectedFile) {
                parseQrCode(parserState.selectedFile);
              }
            },
          },
        ]}
        showMessage={showMessage}
      />
    );
  };

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

        <SwitchButtonGroup value={mode} options={modeOptions} onChange={setMode} sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>{renderLeftPanel()}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>{renderRightPanel()}</Grid>
        </Grid>
      </Container>
    </Box>
  );
}
