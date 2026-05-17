import { ToggleButton, ToggleButtonGroup, type SxProps, type Theme } from '@mui/material';

export interface SwitchOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
}

export interface SwitchButtonGroupProps<T extends string | number = string> {
  value: T;
  options: SwitchOption<T>[];
  onChange: (value: T) => void;
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium' | 'large';
  buttonSx?: SxProps<Theme>;
}

export default function SwitchButtonGroup<T extends string | number = string>({
  value,
  options,
  onChange,
  sx,
  size,
  buttonSx,
}: SwitchButtonGroupProps<T>) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size={size}
      onChange={(_, v) => v && onChange(v)}
      sx={{
        width: '100%',
        mb: 2,
        borderRadius: 4,
        bgcolor: (theme: Theme) => (theme.palette.mode === 'light' ? 'grey.100' : 'grey.900'),
        border: '1px solid',
        borderColor: 'divider',
        p: 0.6,
        '& .MuiToggleButtonGroup-grouped': {
          flex: 1,
          border: 'none',
          borderRadius: 3.5,
          mx: 0.3,
          fontWeight: 800,
          color: 'text.secondary',
          transition: 'color 0.3s',
          '&:not(:first-of-type)': {
            borderLeft: 'none',
            marginLeft: 0.6,
          },
          '&.Mui-selected': {
            bgcolor: 'background.paper',
            color: 'primary.main',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        },
        ...sx,
      }}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          sx={buttonSx ?? { px: 1.5, fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
