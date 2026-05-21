import { Database } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { formatSize } from '@/utils/storageCleaner';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface DomainHeaderProps {
  domain: string;
  totalSize: number;
}

export default function DomainHeader({ domain, totalSize }: DomainHeaderProps) {
  const { t } = useLazyTranslation('storageCleaner');
  return (
    <PageHeader
      icon={<Database size={22} />}
      iconColor={storageCleanerPageStyles.warningColor}
      title={t('storageCleaner:pageTitle')}
      subtitle={domain || t('storageCleaner:loading')}
      badge={
        totalSize > 0 ? (
          <span className="inline-block px-2 py-0.5 rounded-md font-extrabold text-[0.7rem] bg-amber-50 text-amber-600 shadow-sm transition-all hover:bg-amber-100">
            {t('storageCleaner:occupied', { size: formatSize(totalSize) })}
          </span>
        ) : null
      }
      iconSx={{
        padding: '0.3rem',
        borderRadius: '0.75rem',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
        transition: 'all 0.2s',
      }}
      titleSx={{
        fontSize: '1rem',
      }}
      subtitleSx={{
        display: 'block',
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginTop: '0.3rem',
        fontSize: '0.75rem',
      }}
      sx={{ marginBottom: '0.75rem' }}
    />
  );
}
