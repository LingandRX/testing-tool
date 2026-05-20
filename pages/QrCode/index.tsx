import { useState, useCallback } from 'react';
import { Box, CircularProgress, Container, Stack, useMediaQuery, useTheme } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import UrlToQrCodeSection from '@/pages/QrCode/UrlToQrCodeSection';
import QrCodeToUrlSection from '@/pages/QrCode/QrCodeToUrlSection';
import { useStorageState } from '@/utils/useStorageState';
import { qrCodePageStyles } from '@/config/pageTheme';
import PageHeader from '@/components/PageHeader';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import type { QrCodeGeneratorState, QrCodeParserState } from './types';

export default function Index() {
  const { t } = useLazyTranslation('qrCode');
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // 使用自定义钩子管理展开状态（移动端使用）
  const [urlExpanded, setUrlExpanded, urlInitialized] = useStorageState('qrCode/urlExpanded', true);
  const [qrExpanded, setQrExpanded, qrInitialized] = useStorageState('qrCode/qrExpanded', false);

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

  // 生成器状态更新函数
  const setTextToEncode = useCallback((text: string) => {
    setGeneratorState((prev) => ({ ...prev, textToEncode: text }));
  }, []);

  const setQrCodeDataUrl = useCallback((dataUrl: string) => {
    setGeneratorState((prev) => ({ ...prev, qrCodeDataUrl: dataUrl }));
  }, []);

  const setGenerating = useCallback((generating: boolean) => {
    setGeneratorState((prev) => ({ ...prev, generating }));
  }, []);

  const setInputError = useCallback((error: string) => {
    setGeneratorState((prev) => ({ ...prev, inputError: error }));
  }, []);

  // 解析器状态更新函数
  const setDecodedResult = useCallback((result: string) => {
    setParserState((prev) => ({ ...prev, decodedResult: result }));
  }, []);

  const setParsing = useCallback((parsing: boolean) => {
    setParserState((prev) => ({ ...prev, parsing }));
  }, []);

  const setParseError = useCallback((error: string) => {
    setParserState((prev) => ({ ...prev, parseError: error }));
  }, []);

  const setSelectedFile = useCallback((file: File | null) => {
    setParserState((prev) => ({ ...prev, selectedFile: file }));
  }, []);

  const setPreviewUrl = useCallback((url: string) => {
    setParserState((prev) => ({ ...prev, previewUrl: url }));
  }, []);

  const setDragging = useCallback((dragging: boolean) => {
    setParserState((prev) => ({ ...prev, dragging }));
  }, []);

  const handleClearFile = useCallback(() => {
    setParserState((prev) => ({
      ...prev,
      selectedFile: null,
      previewUrl: '',
      decodedResult: '',
      parseError: '',
    }));
  }, []);

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
          textToEncode={generatorState.textToEncode}
          onTextChange={setTextToEncode}
          qrCodeDataUrl={generatorState.qrCodeDataUrl}
          onQrCodeDataUrlChange={setQrCodeDataUrl}
          generating={generatorState.generating}
          onGeneratingChange={setGenerating}
          inputError={generatorState.inputError}
          onInputErrorChange={setInputError}
          expanded={urlExpanded}
          onExpandedChange={setUrlExpanded}
          forceExpanded={isDesktop}
        />
      </Box>
      <Box sx={qrCodePageStyles.GRID_CELL}>
        <QrCodeToUrlSection
          decodedResult={parserState.decodedResult}
          onDecodedResultChange={setDecodedResult}
          parsing={parserState.parsing}
          onParsingChange={setParsing}
          parseError={parserState.parseError}
          onParseErrorChange={setParseError}
          selectedFile={parserState.selectedFile}
          onFileChange={setSelectedFile}
          onClearFile={handleClearFile}
          previewUrl={parserState.previewUrl}
          onPreviewUrlChange={setPreviewUrl}
          dragging={parserState.dragging}
          onDraggingChange={setDragging}
          expanded={qrExpanded}
          onExpandedChange={setQrExpanded}
          forceExpanded={isDesktop}
        />
      </Box>
    </>
  ) : (
    <>
      <UrlToQrCodeSection
        textToEncode={generatorState.textToEncode}
        onTextChange={setTextToEncode}
        qrCodeDataUrl={generatorState.qrCodeDataUrl}
        onQrCodeDataUrlChange={setQrCodeDataUrl}
        generating={generatorState.generating}
        onGeneratingChange={setGenerating}
        inputError={generatorState.inputError}
        onInputErrorChange={setInputError}
        expanded={urlExpanded}
        onExpandedChange={setUrlExpanded}
      />
      <QrCodeToUrlSection
        decodedResult={parserState.decodedResult}
        onDecodedResultChange={setDecodedResult}
        parsing={parserState.parsing}
        onParsingChange={setParsing}
        parseError={parserState.parseError}
        onParseErrorChange={setParseError}
        selectedFile={parserState.selectedFile}
        onFileChange={setSelectedFile}
        onClearFile={handleClearFile}
        previewUrl={parserState.previewUrl}
        onPreviewUrlChange={setPreviewUrl}
        dragging={parserState.dragging}
        onDraggingChange={setDragging}
        expanded={qrExpanded}
        onExpandedChange={setQrExpanded}
      />
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
