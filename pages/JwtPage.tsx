import { useState, useMemo } from 'react';
import { TextField, Stack, Box, Container, Typography, Paper } from '@mui/material';
import { useSnackbar } from '@/components/GlobalSnackbar';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PageHeader from '@/components/PageHeader';
import { jwtPageStyles } from '@/config/pageTheme';
import { parseJwt, formatJson } from '@/utils/jwt';
import CopyButton from '@/components/CopyButton';

interface SectionProps {
  title: string;
  content: unknown;
  raw: string;
  color: string;
}

const Section = ({ title, content, color }: SectionProps) => (
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
      {content ? formatJson(content) : '无法解析'}
    </Box>
  </Paper>
);

export default function JwtPage() {
  useSnackbar();
  const [jwtInput, setJwtInput] = useState('');

  const result = useMemo(() => {
    if (!jwtInput.trim()) {
      return null;
    }
    return parseJwt(jwtInput);
  }, [jwtInput]);

  return (
    <Box>
      <Container sx={{ p: 2 }}>
        <PageHeader title="JWT 解析" subtitle="JSON Web Token 解码与查看" icon={<VpnKeyIcon />} />

        <Stack spacing={2.5}>
          {/* Input Area */}
          <TextField
            multiline
            rows={4}
            placeholder="在此粘贴 JWT 令牌 (Encoded JWT)..."
            value={jwtInput}
            onChange={(e) => {
              // 自动去除 Bearer 前缀及首尾空白字符/换行
              const val = e.target.value.replace(/^Bearer\s*/i, '').trim();
              setJwtInput(val);
            }}
            fullWidth
            sx={jwtPageStyles.INPUT_STYLE}
          />

          {result?.error && (
            <Paper
              sx={{
                p: 2,
                bgcolor: 'error.lighter',
                color: 'error.main',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                border: '1px solid',
                borderColor: 'error.light',
              }}
            >
              <ErrorOutlineIcon sx={{ mt: 0.2 }} fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {result.error}
              </Typography>
            </Paper>
          )}

          {result && !result.error && (
            <Stack spacing={2}>
              <Section
                title="HEADER: 算法 & 令牌类型"
                content={result.header}
                raw={result.raw.header}
                color="#fb015b" // JWT.io Header Color
              />
              <Section
                title="PAYLOAD: 数据"
                content={result.payload}
                raw={result.raw.payload}
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
                    sx={{ fontWeight: 800, color: '#00b9f1', letterSpacing: 0.5 }}
                  >
                    签名
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
                  {result.signature || 'No Signature'}
                </Typography>
              </Paper>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
