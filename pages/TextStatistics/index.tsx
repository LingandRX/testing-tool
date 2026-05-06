import { useMemo, useState } from 'react';
import { alpha, Box, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';
import DescriptionIcon from '@mui/icons-material/Description';
import { formatByteSize, getTextStats } from '@/utils/textStatistics';
import { textStatisticsPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

/**
 * 文本统计页面组件
 *
 * 提供实时的文本分析功能，包括字符数、单词数、行数和字节大小。
 */
export default function Index() {
  const { t } = useTranslation(['textStatistics']);
  const [text, setText] = useState('');

  // 实时计算统计信息，使用 useMemo 优化性能
  // 对于 10,000 字符以上的文本，Intl.Segmenter 也能保持良好的性能
  const stats = useMemo(() => getTextStats(text), [text]);

  const statItems = [
    { label: t('textStatistics:characters'), value: stats.characters },
    { label: t('textStatistics:words'), value: stats.words },
    { label: t('textStatistics:lines'), value: stats.lines },
    { label: t('textStatistics:bytes'), value: formatByteSize(stats.bytes) },
  ];

  return (
    <Box>
      <Container sx={{ p: 2 }}>
        {/* 头部区域 */}
        <PageHeader
          title={t('textStatistics:pageTitle')}
          subtitle={t('textStatistics:pageSubtitle')}
          icon={<DescriptionIcon />}
          iconColor={textStatisticsPageStyles.primaryColor}
        />

        {/* 文本输入区域 */}
        <TextField
          multiline
          fullWidth
          minRows={8}
          maxRows={15}
          placeholder={t('textStatistics:placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              bgcolor: 'grey.50',
              transition: 'all 0.2s',
              '& fieldset': {
                borderColor: 'grey.200',
              },
              '&:hover fieldset': {
                borderColor: 'grey.300',
              },
              '&.Mui-focused fieldset': {
                borderColor: textStatisticsPageStyles.primaryColor,
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '0.9rem',
              lineHeight: 1.6,
            },
          }}
        />

        {/* 统计结果展示区域 */}
        <Grid container spacing={2}>
          {statItems.map((item) => (
            <Grid size={{ xs: 12, md: 3 }} key={item.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: textStatisticsPageStyles.cardBg,
                  border: '1px solid',
                  borderColor: textStatisticsPageStyles.cardBorder,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // 平滑的切换动画
                  minHeight: { xs: '64px', md: '90px' },
                  display: 'flex',
                  flexDirection: { xs: 'row', md: 'column' }, // 小屏幕横向排列提高空间利用率
                  alignItems: 'center',
                  justifyContent: { xs: 'space-between', md: 'center' },
                  px: { xs: 3, md: 2 },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: () =>
                      `0 4px 12px ${alpha(textStatisticsPageStyles.primaryColor, 0.15)}`,
                    borderColor: textStatisticsPageStyles.primaryColor,
                  },
                  lineHeight: 1.6,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    mb: { xs: 0, md: 0.5 },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    color: textStatisticsPageStyles.primaryColor, // 高亮显示核心数值
                    wordBreak: 'break-all',
                  }}
                >
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
