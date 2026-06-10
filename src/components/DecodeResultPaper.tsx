/**
 * DecodeResultPaper
 *
 * FileMode 与 ImageMode 通用的 decode 结果展示组件。
 * 提取了二者 decode 输出区完全一致的结构：
 *   标题 → 可选预览（children）→ 文件信息 → 文件名输入 → 下载按钮
 *
 * FileMode 直接使用，ImageMode 通过 children 传入图片预览。
 */
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatBytes } from '@/utils/format';
import { useI18n } from '@/utils/chromeI18n';

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
  const { t } = useI18n('base64Converter');

  return (
    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
      {/* 标题 */}
      <span className="block mb-2 text-xs font-bold text-muted-foreground">{title}</span>

      {/* 可选预览内容（ImageMode 的图片） */}
      {children}

      {/* 文件信息 */}
      <div className="flex gap-4 mb-3">
        <span className="text-xs text-muted-foreground">
          {t('inferredMimeType')}: {mimeType}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('decodedSize')}: {formatBytes(blobSize)}
        </span>
      </div>

      {/* 文件名输入 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {t('decodedFileName')}
        </label>
        <Input value={fileName} onChange={(e) => onFileNameChange(e.target.value)} />
      </div>

      {/* 下载按钮 */}
      <Button
        variant="default"
        onClick={onDownload}
        disabled={!fileName.trim()}
        className="w-full rounded-lg font-bold"
      >
        <Download className="mr-2 h-4 w-4" />
        {t('download')}
      </Button>
    </div>
  );
}
