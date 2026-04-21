import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Chip,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface OperationHistoryItem {
  time: string;
  type: string;
  content: string;
  result: string;
}

interface OperationHistoryProps {
  history: OperationHistoryItem[];
  showHistory: boolean;
  onToggleShowHistory: () => void;
}

const OperationHistory: React.FC<OperationHistoryProps> = ({
  history,
  showHistory,
  onToggleShowHistory,
}) => {
  if (history.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={onToggleShowHistory}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          操作历史 ({history.length})
        </Typography>
        {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
      <Collapse in={showHistory}>
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {history.map((item, index) => (
            <Box key={index}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={item.type} size="small" color="primary" variant="outlined" />
                      <Typography variant="body2">{item.content}</Typography>
                    </Box>
                  }
                  secondary={`${item.time} · ${item.result}`}
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default OperationHistory;
