import { Box, FormHelperText, TextField, Typography } from '@mui/material';
import { jsonDiffPageStyles } from '@/config/pageTheme';

interface JsonDiffInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export default function JsonDiffInput({
  label,
  placeholder,
  value,
  onChange,
  error,
}: JsonDiffInputProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.6,
          fontWeight: 800,
          fontSize: '0.7rem',
          letterSpacing: 0.4,
          color: 'text.secondary',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <TextField
        multiline
        rows={8}
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={Boolean(error)}
        sx={jsonDiffPageStyles.INPUT_STYLE}
      />
      {error && (
        <FormHelperText error sx={{ mx: 1.5, mt: 0.5, fontWeight: 600 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}

export { JsonDiffInput };
export type { JsonDiffInputProps };
