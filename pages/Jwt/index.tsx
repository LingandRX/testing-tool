import { useCallback, useMemo, useState } from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { useSnackbar } from '@/components/GlobalSnackbar';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PageHeader from '@/components/PageHeader';
import { stringifyJson, parseJwt } from '@/utils/jwt';
import CopyButton from '@/components/CopyButton';
import TextInputArea from '@/components/TextInputArea';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useContextMenuData } from '@/utils/useContextMenuData';

interface SectionProps {
  title: string;
  content: unknown;
  color: string;
}

const Section = ({ title, content, color }: SectionProps) => {
  const { t } = useLazyTranslation('jwt');
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: `${color}40`,
        bgcolor: `${color}05`,
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: color, letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <CopyButton text={JSON.stringify(content)} size="small" />
        </Box>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          bgcolor: 'rgba(255,255,255,0.6)',
          borderRadius: 2,
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {content ? stringifyJson(content) : t('jwt:invalidFormat')}
      </Box>
    </Paper>
  );
};

export default function Index() {
  const { showMessage } = useSnackbar();
  const { t } = useLazyTranslation('jwt');
  const [jwtInput, setJwtInput] = useState('');

  const handleContextMenuData = useCallback((payload: string) => {
    const cleaned = payload.replace(/^Bearer\s*/i, '').trim();
    setJwtInput(cleaned);
  }, []);

  useContextMenuData({ featureKey: 'jwt', onData: handleContextMenuData });

  const result = useMemo(() => {
    if (!jwtInput.trim()) {
      return null;
    }
    return parseJwt(jwtInput);
  }, [jwtInput]);

  return (
    <Box>
      <Container sx={{ p: 2 }}>
        <PageHeader
          title={t('jwt:pageTitle')}
          subtitle={t('jwt:pageSubtitle')}
          icon={<VpnKeyIcon />}
        />

        <Stack spacing={2.5}>
          {/* Input Area */}
          <TextInputArea
            minRows={4}
            placeholder={t('jwt:placeholder')}
            value={jwtInput}
            onChange={(val) => {
              const cleaned = val.replace(/^Bearer\s*/i, '').trim();
              setJwtInput(cleaned);
            }}
            allowCopy={true}
            showClear={true}
            showMessage={showMessage}
            externalError={result?.error}
          />

          {result && !result.error && (
            <Stack spacing={2}>
              <Section
                title={t('jwt:headerTitle')}
                content={result.header}
                color="#fb015b" // JWT.io Header Color
              />
              <Section
                title={t('jwt:payloadTitle')}
                content={result.payload}
                color="#d63aff" // JWT.io Payload Color
              />
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  borderColor: 'primary.light',
                  bgcolor: 'primary.lighter',
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
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: 'info.main', letterSpacing: 0.5 }}
                  >
                    {t('jwt:signatureTitle')}
                  </Typography>
                  <CopyButton text={JSON.stringify(result.raw.signature)} size="small" />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    wordBreak: 'break-all',
                    color: 'text.secondary',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  {result.signature || t('jwt:noSignature')}
                </Typography>
              </Paper>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
