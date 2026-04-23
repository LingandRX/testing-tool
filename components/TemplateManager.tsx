import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FolderIcon from '@mui/icons-material/Folder';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { DataTemplate } from '@/utils/dataTemplate';

interface TemplateManagerProps {
  templates: DataTemplate[];
  showTemplates: boolean;
  templateLoading: boolean;
  onToggleShowTemplates: () => void;
  onLoadTemplates: () => void;
  onExportTemplates: () => void;
  onImportTemplates: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  showTemplates,
  templateLoading,
  onToggleShowTemplates,
  onLoadTemplates,
  onExportTemplates,
  onImportTemplates,
}) => {
  const handleToggle = () => {
    onToggleShowTemplates();
    if (!showTemplates) onLoadTemplates();
  };

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
        onClick={handleToggle}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          模板管理 ({templates.length})
        </Typography>
        {showTemplates ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
      <Collapse in={showTemplates}>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={onExportTemplates}
              variant="outlined"
            >
              导出
            </Button>
            <Button
              size="small"
              startIcon={<UploadIcon />}
              onClick={onImportTemplates}
              variant="outlined"
            >
              导入
            </Button>
          </Stack>
          {templateLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : templates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              暂无模板，请先在其他页面创建模板
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {templates.map((template) => (
                <ListItem key={template.id} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FolderIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={template.name}
                    secondary={`${template.fields.length} 个字段 · ${new Date(
                      template.updatedAt,
                    ).toLocaleDateString('zh-CN')}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TemplateManager;
