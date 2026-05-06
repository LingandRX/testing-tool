import { Box, Switch, Typography } from '@mui/material';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface AutoRefreshToggleProps {
  autoRefresh: boolean;
  onChange: (checked: boolean) => void;
}

export default function AutoRefreshToggle({ autoRefresh, onChange }: AutoRefreshToggleProps) {
  const { t } = useTranslation(['storageCleaner']);
  return (
    <Box sx={storageCleanerPageStyles.AUTO_REFRESH_CONTAINER}>
      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', px: 1.2 }}>
        {t('storageCleaner:autoRefresh')}
      </Typography>
      <Switch
        size="small"
        checked={autoRefresh}
        onChange={(e) => onChange(e.target.checked)}
        color="warning"
        sx={storageCleanerPageStyles.AUTO_REFRESH_SWITCH}
      />
    </Box>
  );
}
