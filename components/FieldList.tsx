import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { FieldType } from '@/utils/dummyDataGenerator';

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
  useInvalidData?: boolean;
}

// 字段类型显示名称映射
const FIELD_TYPE_NAMES: Record<string, string> = {
  [FieldType.TEXT]: '文本',
  [FieldType.EMAIL]: '邮箱',
  [FieldType.PHONE]: '手机号',
  [FieldType.NUMBER]: '数字',
  [FieldType.DATE]: '日期',
  [FieldType.TEXTarea]: '文本域',
  [FieldType.RADIO]: '单选框',
  [FieldType.CHECKBOX]: '复选框',
  [FieldType.SELECT]: '下拉框',
  [FieldType.PASSWORD]: '密码',
  [FieldType.NAME]: '姓名',
  [FieldType.ID_CARD]: '身份证号',
  [FieldType.UNKNOWN]: '未知',
};

interface FieldListProps {
  fields: FieldData[];
  showFields: boolean;
  onToggleShowFields: () => void;
  onFieldTypeChange: (fieldId: string, newType: string) => void;
  onLocateField: (fieldId: string) => void;
  onHoverField: (fieldId: string | null) => void;
  onToggleFieldSelection: (fieldId: string) => void;
  onToggleAllFields: () => void;
  hoveredFieldId: string | null;
}

const FieldList: React.FC<FieldListProps> = ({
  fields,
  showFields,
  onToggleShowFields,
  onFieldTypeChange,
  onHoverField,
  onToggleFieldSelection,
  onToggleAllFields,
  hoveredFieldId,
}) => {
  if (fields.length === 0) return null;

  const handleTypeChange = (fieldId: string, event: SelectChangeEvent<string>) => {
    onFieldTypeChange(fieldId, event.target.value);
  };

  const allSelected = fields.every((f) => f.isSelected);
  const selectedCount = fields.filter((f) => f.isSelected).length;

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            已识别字段 ({fields.length})
          </Typography>
          <Typography
            variant="caption"
            sx={{
              bgcolor: selectedCount > 0 ? 'primary.main' : 'grey.300',
              color: selectedCount > 0 ? 'white' : 'text.secondary',
              px: 1,
              py: 0.25,
              borderRadius: 1,
            }}
          >
            {selectedCount} 已选择
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAllFields();
            }}
          >
            {allSelected ? '取消全选' : '全选'}
          </Button>
          {showFields ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>
      <Collapse in={showFields}>
        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
          {fields.map((field, index) => (
            <ListItem
              key={field.id}
              sx={{
                py: 1,
                px: 2,
                bgcolor: hoveredFieldId === field.id ? '#e3f2fd' : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={() => onHoverField(field.id)}
              onMouseLeave={() => onHoverField(null)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Checkbox
                  size="small"
                  checked={field.isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleFieldSelection(field.id);
                  }}
                />
              </ListItemIcon>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      opacity: field.isSelected ? 1 : 0.5,
                    }}
                  >
                    {field.label || field.name || field.placeholder || `字段 ${index + 1}`}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
                    <InputLabel>类型</InputLabel>
                    <Select
                      value={field.fieldType}
                      label="类型"
                      onChange={(e) => handleTypeChange(field.id, e)}
                    >
                      {Object.values(FieldType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {FIELD_TYPE_NAMES[type] || type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {field.placeholder && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    占位符: {field.placeholder}
                  </Typography>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default FieldList;
