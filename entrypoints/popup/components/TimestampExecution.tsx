import { useEffect, useState, useCallback } from 'react';
import { Button, Paper, Typography, Stack, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useCopy } from './useCopy';

/**
 * 时间戳显示和执行组件
 *
 * @component
 * @example
 * ```jsx
 * <TimestampExecution />
 * ```
 *
 * @returns {JSX.Element} 时间戳组件
 */
export function TimestampExecution() {
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Math.floor(Date.now()));
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const [isRunningTimestamp, setIsRunningTimestamp] = useState(true);

  const displayTimestamp = showMilliseconds
    ? currentTimestamp
    : Math.floor(currentTimestamp / 1000);

  const unitText = showMilliseconds ? '毫秒' : '秒';

  useEffect(() => {
    let timer: number;
    if (isRunningTimestamp) {
      const interval = showMilliseconds ? 100 : 1000;
      timer = window.setInterval(() => {
        setCurrentTimestamp(Math.floor(Date.now()));
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isRunningTimestamp, showMilliseconds]);

  const toggleUnit = useCallback(() => {
    setShowMilliseconds((prev) => !prev);
  }, []);

  const toggleTimestamp = useCallback(() => {
    setIsRunningTimestamp((prev) => !prev);
  }, []);

  const unitButtonLabel = showMilliseconds ? '切换为秒显示' : '切换为毫秒显示';
  const toggleButtonLabel = isRunningTimestamp ? '停止时间戳自动更新' : '开始时间戳自动更新';
  const toggleButtonText = isRunningTimestamp ? '停止' : '开始';

  const { isCopied, copy } = useCopy();

  return (
    <Paper elevation={3} sx={{ p: 2, my: 2, borderRadius: 2, minWidth: 320, textAlign: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 1,
          mb: 2,
          overflowX: 'auto',
          pb: 1,
        }}
      >
        <Typography
          variant="h4"
          component="span"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'primary.main',
            whiteSpace: 'nowrap',
          }}
        >
          {displayTimestamp}
        </Typography>
        <Typography
          variant="h6"
          component="span"
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          {unitText}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
        <Button
          variant="contained"
          color="secondary"
          onClick={toggleUnit}
          aria-label={unitButtonLabel}
          title={unitButtonLabel}
        >
          切换单位
        </Button>

        {/* <CopyButton
          textToCopy={String(currentTimestamp)}
          buttonText="复制"
          aria-label="复制当前时间戳到剪贴板"
          color="primary"
        /> */}

        <Button
          variant="contained"
          onClick={() => copy(String(currentTimestamp))}
          startIcon={isCopied ? <CheckIcon /> : <ContentCopyIcon />}
          color={isCopied ? 'success' : 'primary'}
        >
          {isCopied ? '已复制' : '复制'}
        </Button>

        <Button
          variant="contained"
          color={isRunningTimestamp ? 'error' : 'primary'}
          onClick={toggleTimestamp}
          aria-label={toggleButtonLabel}
          title={toggleButtonLabel}
        >
          {toggleButtonText}
        </Button>
      </Stack>
    </Paper>
  );
}
