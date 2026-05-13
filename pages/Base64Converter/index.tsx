import { Box, Container, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImageIcon from '@mui/icons-material/Image';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import { base64ConverterPageStyles } from '@/config/pageTheme';
import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConverterPageMode } from '@/types/storage';
import TextMode from './TextMode';
import FileMode from './FileMode';
import ImageMode from './ImageMode';

const VALID_PAGE_MODES: readonly Base64ConverterPageMode[] = ['text', 'file', 'image'];

const isValidPageMode = (val: unknown): val is Base64ConverterPageMode =>
  typeof val === 'string' && (VALID_PAGE_MODES as readonly string[]).includes(val);

type PageMode = Base64ConverterPageMode;

export default function Index() {
  const { t } = useTranslation(['base64Converter']);
  const [pageMode, setPageMode] = useStorageState(
    'base64Converter/pageMode',
    'text',
    isValidPageMode,
  );

  const modeIcon: Record<PageMode, React.ReactNode> = {
    text: <TextFieldsIcon />,
    file: <UploadFileIcon />,
    image: <ImageIcon />,
  };

  return (
    <Box>
      <Container sx={{ p: 2 }}>
        <PageHeader
          title={t('base64Converter:pageTitle')}
          subtitle={t('base64Converter:pageSubtitle')}
          icon={modeIcon[pageMode]}
          iconColor={base64ConverterPageStyles.primaryColor}
        />

        <Stack spacing={2.5}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={pageMode}
            onChange={(_, v: PageMode | null) => v && setPageMode(v)}
            sx={{ borderRadius: 3, flexWrap: 'wrap', gap: 0.5 }}
          >
            <ToggleButton value="text" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
              {t('base64Converter:textMode')}
            </ToggleButton>
            <ToggleButton value="file" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
              {t('base64Converter:fileMode')}
            </ToggleButton>
            <ToggleButton value="image" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
              {t('base64Converter:imageMode')}
            </ToggleButton>
          </ToggleButtonGroup>

          {pageMode === 'text' && <TextMode />}
          {pageMode === 'file' && <FileMode />}
          {pageMode === 'image' && <ImageMode />}
        </Stack>
      </Container>
    </Box>
  );
}
