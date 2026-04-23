import { Box, Checkbox, Divider, Grid, Typography } from '@mui/material';
import type { StorageCleanerOptions } from '@/types/storage';
import OptionItem from './OptionItem';

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
  return (
    <Box
      sx={{
        mb: 3,
        border: '1px solid',
        borderColor: 'grey.100',
        borderRadius: 4,
        p: 1.2,
        bgcolor: 'background.paper',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Grid container spacing={1.5}>
        <Grid size={6}>
          <OptionItem
            label="LocalStorage"
            checked={options.localStorage}
            size={sizes.localStorage}
            onChange={() => onOptionChange('localStorage')}
          />
        </Grid>
        <Grid size={6}>
          <OptionItem
            label="Session Storage"
            checked={options.sessionStorage}
            size={sizes.sessionStorage}
            onChange={() => onOptionChange('sessionStorage')}
          />
        </Grid>
        <Grid size={6}>
          <OptionItem
            label="IndexedDB"
            checked={options.indexedDB}
            size={sizes.indexedDB}
            onChange={() => onOptionChange('indexedDB')}
          />
        </Grid>
        <Grid size={6}>
          <OptionItem
            label="Cookies"
            checked={options.cookies}
            size={sizes.cookies}
            onChange={() => onOptionChange('cookies')}
          />
        </Grid>
        <Grid size={6}>
          <OptionItem
            label="Cache Storage"
            checked={options.cacheStorage}
            size={sizes.cacheStorage}
            isCount
            onChange={() => onOptionChange('cacheStorage')}
          />
        </Grid>
        <Grid size={6}>
          <OptionItem
            label="Service Workers"
            checked={options.serviceWorkers}
            size={sizes.serviceWorkers}
            isCount
            onChange={() => onOptionChange('serviceWorkers')}
          />
        </Grid>
      </Grid>
      <Divider sx={{ my: 1.2, borderColor: 'grey.100' }} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1.5,
          py: 0.6,
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 2,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
        >
          全选所有项
        </Typography>
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          color="warning"
          sx={{
            p: 0.6,
            '& .MuiSvgIcon-root': {
              fontSize: 18,
              transition: 'transform 0.2s',
            },
            '&:hover .MuiSvgIcon-root': {
              transform: 'scale(1.1)',
            },
          }}
        />
      </Box>
    </Box>
  );
}
