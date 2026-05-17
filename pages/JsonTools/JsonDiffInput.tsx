import { Box, Typography } from '@mui/material';
import TextInputArea from '@/components/TextInputArea';

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
      <TextInputArea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minRows={8}
        autoResize={false}
        externalError={error ?? undefined}
        showClear={true}
      />
    </Box>
  );
}

export { JsonDiffInput };
export type { JsonDiffInputProps };
