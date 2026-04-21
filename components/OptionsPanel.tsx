import React from 'react';
import { Box, Typography, Paper, FormControlLabel, Switch } from '@mui/material';

interface OptionsPanelProps {
  includeHidden: boolean;
  onIncludeHiddenChange: (checked: boolean) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ includeHidden, onIncludeHiddenChange }) => {
  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          填充选项
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={includeHidden}
              onChange={(e) => onIncludeHiddenChange(e.target.checked)}
              color="primary"
            />
          }
          label="包含隐藏字段"
          sx={{ width: '100%' }}
        />
      </Box>
    </Paper>
  );
};

export default OptionsPanel;
