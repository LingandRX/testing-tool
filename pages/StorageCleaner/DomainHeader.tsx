import { Box } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import PageHeader from '@/components/PageHeader';
import { formatSize } from '@/utils/storageCleaner';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

/**
 * DomainHeader 组件属性接口
 */
interface DomainHeaderProps {
  /** 当前域名 */
  domain: string;
  /** 已占用的存储大小（字节） */
  totalSize: number;
}

/**
 * DomainHeader - 存储清理页面标题栏组件
 *
 * 使用 PageHeader 组件构建，显示域名和已占用存储空间大小
 *
 * @example
 * ```tsx
 * <DomainHeader
 *   domain="example.com"
 *   totalSize={1048576}
 * />
 * ```
 */
export default function DomainHeader({ domain, totalSize }: DomainHeaderProps) {
  const { t } = useTranslation(['storageCleaner']);
  return (
    <PageHeader
      icon={<StorageIcon sx={{ fontSize: 22 }} />}
      iconColor={storageCleanerPageStyles.warningColor}
      title={t('storageCleaner:pageTitle')}
      subtitle={domain || t('storageCleaner:loading')}
      badge={
        totalSize > 0 ? (
          <Box sx={storageCleanerPageStyles.DOMAIN_HEADER_BADGE}>
            {t('storageCleaner:occupied', { size: formatSize(totalSize) })}
          </Box>
        ) : null
      }
      iconSx={storageCleanerPageStyles.DOMAIN_HEADER_ICON}
      titleSx={{
        fontSize: '1rem',
      }}
      subtitleSx={{
        display: 'block',
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        mt: 0.3,
        fontSize: '0.75rem',
      }}
      sx={{ mb: 3 }}
    />
  );
}
