import { Grid } from '@mui/material';
import TextInputArea from '@/components/TextInputArea';
import QrCodePreview from '@/components/QrCodePreview';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useQrCodeContext } from '../contexts/QrCodeContext';

export default function GeneratePanel() {
  const { t } = useLazyTranslation('qrCode');
  const { showMessage } = useSnackbar();
  const { generatorState, setTextToEncode, downloadQrCode, copyQrCode } = useQrCodeContext();

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextInputArea
          title={t('qrCode:urlInputLabel')}
          value={generatorState.textToEncode}
          onChange={setTextToEncode}
          placeholder={t('qrCode:urlInputPlaceholder')}
          showCount
          showClear
          allowCopy
          externalError={generatorState.inputError}
          showMessage={showMessage}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <QrCodePreview
          qrCodeDataUrl={generatorState.qrCodeDataUrl}
          onDownload={downloadQrCode}
          onCopy={copyQrCode}
        />
      </Grid>
    </Grid>
  );
}
