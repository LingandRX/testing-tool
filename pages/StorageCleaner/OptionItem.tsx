import { Box, Checkbox, Typography } from '@mui/material';
import { formatSize } from '@/utils/storageCleaner';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface OptionItemProps {
  label: string;
  checked: boolean;
  size?: number;
  isCount?: boolean;
  onChange: () => void;
}

export default function OptionItem({
  label,
  checked,
  size,
  isCount = false,
  onChange,
}: OptionItemProps) {
  const { t } = useTranslation(['storageCleaner']);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
        px: { xs: 1, sm: 1.5 },
        borderRadius: 3,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: checked ? 'rgba(255, 152, 0, 0.05)' : 'transparent',
        border: `1px solid ${checked ? 'rgba(255, 152, 0, 0.2)' : 'transparent'}`,
        '&:hover': {
          bgcolor: checked ? 'rgba(255, 152, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          color={checked ? storageCleanerPageStyles.warningColor : 'text.primary'}
          sx={{
            fontSize: '0.75rem',
            display: 'block',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.2s',
          }}
        >
          {label}
        </Typography>
        {size !== undefined && size > 0 ? (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.65rem',
              fontWeight: 600,
              display: 'block',
              mt: 0.3,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              opacity: 0.8,
            }}
          >
            {isCount ? `${size} ${t('storageCleaner:countUnit')}` : formatSize(size)}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: 'grey.400',
              fontSize: '0.65rem',
              fontWeight: 500,
              display: 'block',
              mt: 0.3,
              lineHeight: 1,
              fontStyle: 'italic',
            }}
          >
            {t('storageCleaner:noData')}
          </Typography>
        )}
      </Box>
      <Checkbox
        size="small"
        checked={checked}
        onChange={onChange}
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
  );
}
