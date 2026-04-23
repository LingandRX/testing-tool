import { Box, List, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import UrlEntryItem from './UrlEntryItem';
import type { OpenUrlEntry } from '@/types/storage';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';

interface UrlEntryListProps {
  entries: OpenUrlEntry[];
  onDeleteEntry: (index: number) => void;
  showMessage: (message: string, options?: SnackbarOptions) => void;
}

const UrlEntryList = ({ entries, onDeleteEntry, showMessage }: UrlEntryListProps) => {
  if (entries.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          bgcolor: 'grey.50',
          borderRadius: 4,
          border: '1px dashed',
          borderColor: 'grey.200',
        }}
      >
        <LinkIcon sx={{ color: 'grey.300', fontSize: 40, mb: 1 }} />
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', fontWeight: 600 }}
        >
          暂无快捷方式，请在上方添加
        </Typography>
      </Box>
    );
  }

  return (
    <List
      disablePadding
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'grey.100',
        overflow: 'hidden',
      }}
    >
      {entries.map((entry, index) => (
        <UrlEntryItem
          key={index}
          entry={entry}
          index={index}
          isLast={index === entries.length - 1}
          onDelete={onDeleteEntry}
          showMessage={showMessage}
        />
      ))}
    </List>
  );
};

export default UrlEntryList;
