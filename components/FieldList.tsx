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
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InputIcon from '@mui/icons-material/Input';

// 字段数据接口
interface FieldData {
  id: string;
  fieldType: string;
  label: string | null;
  placeholder: string;
  name: string;
  value: string;
  isSelected: boolean;
  generatedValue: string;
}

// 字段类型显示名称映射
const FIELD_TYPE_NAMES: Record<string, string> = {
  text: '文本',
  email: '邮箱',
  phone: '手机号',
  number: '数字',
  date: '日期',
  textarea: '文本域',
  radio: '单选框',
  checkbox: '复选框',
  select: '下拉框',
  password: '密码',
  name: '姓名',
  id_card: '身份证号',
  unknown: '未知',
};

// 字段类型颜色映射
const FIELD_TYPE_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning'
> = {
  email: 'primary',
  phone: 'success',
  number: 'secondary',
  date: 'warning',
  password: 'error',
  name: 'primary',
  id_card: 'secondary',
  text: 'default',
  textarea: 'default',
  unknown: 'default',
};

interface FieldListProps {
  fields: FieldData[];
  showFields: boolean;
  onToggleShowFields: () => void;
}

const FieldList: React.FC<FieldListProps> = ({ fields, showFields, onToggleShowFields }) => {
  if (fields.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 2 }}>
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
        onClick={onToggleShowFields}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          已识别字段 ({fields.length})
        </Typography>
        {showFields ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
      <Collapse in={showFields}>
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {fields.map((field, index) => (
            <ListItem key={field.id} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <InputIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {field.label || field.name || field.placeholder || `字段 ${index + 1}`}
                    </Typography>
                    <Chip
                      label={FIELD_TYPE_NAMES[field.fieldType] || '未知'}
                      size="small"
                      color={FIELD_TYPE_COLORS[field.fieldType] || 'default'}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={field.placeholder || field.name}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default FieldList;
