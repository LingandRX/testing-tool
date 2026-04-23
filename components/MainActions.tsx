import React from 'react';
import { Button, Stack, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { formRecognizerPageStyles } from '@/config/pageTheme';

interface MainActionsProps {
  loading: boolean;
  onFillValidData: () => void;
  onFillInvalidData: () => void;
  onClearAllFields: () => void;
}

const MainActions: React.FC<MainActionsProps> = ({
  loading,
  onFillValidData,
  onFillInvalidData,
  onClearAllFields,
}) => {
  return (
    <Stack spacing={2} sx={{ mb: 4 }}>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
        onClick={onFillValidData}
        disabled={loading}
        fullWidth
        sx={{
          ...formRecognizerPageStyles.buttonStyle,
          bgcolor: formRecognizerPageStyles.validColor,
          '&:hover': {
            bgcolor: formRecognizerPageStyles.validDark,
          },
        }}
      >
        {loading ? '填充中...' : '一键填充（有效数据）'}
      </Button>

      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ErrorOutlineIcon />}
        onClick={onFillInvalidData}
        disabled={loading}
        fullWidth
        sx={{
          ...formRecognizerPageStyles.buttonStyle,
          bgcolor: formRecognizerPageStyles.invalidColor,
          '&:hover': {
            bgcolor: formRecognizerPageStyles.invalidDark,
          },
        }}
      >
        {loading ? '填充中...' : '一键填充（异常数据）'}
      </Button>

      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ClearAllIcon />}
        onClick={onClearAllFields}
        disabled={loading}
        fullWidth
        sx={{
          ...formRecognizerPageStyles.buttonStyle,
          borderColor: formRecognizerPageStyles.clearColor,
          color: formRecognizerPageStyles.clearColor,
          '&:hover': {
            borderColor: formRecognizerPageStyles.clearDark,
            bgcolor: formRecognizerPageStyles.clearBg,
          },
        }}
      >
        {loading ? '清空中...' : '一键清空所有表单'}
      </Button>
    </Stack>
  );
};

export default MainActions;
