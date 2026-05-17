/**
 * DecodeResultPaper
 *
 * FileMode 与 ImageMode 通用的 decode 结果展示组件。
 * 提取了二者 decode 输出区完全一致的 Paper 结构：
 *   标题 → 可选预览（children）→ 文件信息 → 文件名输入 → 下载按钮
 *
 * FileMode 直接使用，ImageMode 通过 children 传入图片预览。
 */
import { alpha, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { formatFileSize } from '@/utils/base64Converter';
import { useTranslation } from 'react-i18next';

interface DecodeResultPaperProps {
  /** 标题文案，由调用方传入 i18n key 对应的值（如 decodedFileOutput / decodedImageOutput） */
  title: string;
  /** 解码后推断的 MIME 类型 */
  mimeType: string;
  /** 解码后 Blob 的大小（字节） */
  blobSize: number;
  /** 当前文件名 */
  fileName: string;
  /** 文件名变更回调 */
  onFileNameChange: (name: string) => void;
  /** 下载按钮点击回调 */
  onDownload: () => void;
  /** 可选的预览内容，ImageMode 用于渲染图片预览 */
  children?: React.ReactNode;
}

export default function DecodeResultPaper({
  title,
  mimeType,
  blobSize,
  fileName,
  onFileNameChange,
  onDownload,
  children,
}: DecodeResultPaperProps) {
  const { t } = useTranslation('base64Converter');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.info.main, 0.15),
      }}
    >
      {/* 标题 */}
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ mb: 1, display: 'block' }}
      >
        {title}
      </Typography>

      {/* 可选预览内容（ImageMode 的图片） */}
      {children}

      {/* 文件信息 */}
      <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.disabled">
          {t('inferredMimeType')}: {mimeType}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {t('decodedSize')}: {formatFileSize(blobSize)}
        </Typography>
      </Stack>

      {/* 文件名输入 */}
      <TextField
        size="small"
        fullWidth
        label={t('decodedFileName')}
        value={fileName}
        onChange={(e) => onFileNameChange(e.target.value)}
        sx={{ mb: 1.5 }}
      />

      {/* 下载按钮 */}
      <Button
        variant="contained"
        onClick={onDownload}
        startIcon={<DownloadIcon />}
        disabled={!fileName.trim()}
        sx={{ borderRadius: 3, fontWeight: 700 }}
      >
        {t('download')}
      </Button>
    </Paper>
  );
}
