import { Box, Checkbox, Divider, Grid, Typography } from '@mui/material';
import type { StorageCleanerOptions } from '@/types/storage';
import OptionItem from './OptionItem';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface StorageOptionsGridProps {
  options: StorageCleanerOptions;
  sizes: Record<string, number>;
  allSelected: boolean;
  someSelected: boolean;
  onOptionChange: (key: keyof StorageCleanerOptions) => void;
  onSelectAll: (checked: boolean) => void;
}

export default function StorageOptionsGrid({
  options,
  sizes,
  allSelected,
  someSelected,
  onOptionChange,
  onSelectAll,
}: StorageOptionsGridProps) {
  const { t } = useTranslation(['storageCleaner']);

  const optionKeys: { key: keyof StorageCleanerOptions; isCount?: boolean }[] = [
    { key: 'localStorage' },
    { key: 'sessionStorage' },
    { key: 'indexedDB' },
    { key: 'cookies' },
    { key: 'cacheStorage', isCount: true },
    { key: 'serviceWorkers', isCount: true },
  ];

  return (
    <Box sx={storageCleanerPageStyles.OPTIONS_GRID_CONTAINER}>
      <Box sx={{ p: 1.2 }}>
        <Grid container spacing={1.5}>
          {optionKeys.map(({ key, isCount }) => (
            <Grid size={6} key={key}>
              <OptionItem
                labelKey={`storageCleaner:options.${key}`}
                checked={options[key]}
                size={sizes[key]}
                isCount={isCount}
                onChange={() => onOptionChange(key)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Divider sx={{ mx: 0, borderColor: 'grey.100' }} />
      <Box sx={storageCleanerPageStyles.OPTIONS_GRID_FOOTER}>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ color: 'text.secondary', fontSize: '0.7rem', px: 0 }}
        >
          {t('storageCleaner:selectAll')}
        </Typography>
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          color="warning"
          sx={storageCleanerPageStyles.OPTIONS_GRID_CHECKBOX}
        />
      </Box>
    </Box>
  );
}
