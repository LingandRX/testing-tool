import { Box, Checkbox, Typography } from '@mui/material';
import { formatSize } from '@/utils/storageCleaner';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface OptionItemProps {
  labelKey: string;
  checked: boolean;
  size?: number;
  isCount?: boolean;
  onChange: () => void;
}

export default function OptionItem({
  labelKey,
  checked,
  size,
  isCount = false,
  onChange,
}: OptionItemProps) {
  const { t } = useTranslation(['storageCleaner']);
  return (
    <Box sx={storageCleanerPageStyles.OPTION_ITEM(checked)}>
      <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={storageCleanerPageStyles.OPTION_ITEM_LABEL(checked)}
        >
          {t(labelKey)}
        </Typography>
        {size !== undefined && size > 0 ? (
          <Typography variant="caption" sx={storageCleanerPageStyles.OPTION_ITEM_SIZE}>
            {isCount ? `${size} ${t('storageCleaner:countUnit')}` : formatSize(size)}
          </Typography>
        ) : (
          <Typography variant="caption" sx={storageCleanerPageStyles.OPTION_ITEM_NO_DATA}>
            {t('storageCleaner:noData')}
          </Typography>
        )}
      </Box>
      <Checkbox
        size="small"
        checked={checked}
        onChange={onChange}
        color="warning"
        sx={storageCleanerPageStyles.OPTION_ITEM_CHECKBOX}
      />
    </Box>
  );
}
