import { Box, Container, CircularProgress, FormControlLabel, Switch } from '@mui/material';
import Button from '@/components/Button';
import InputIcon from '@mui/icons-material/Input';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GlobalSnackbar from '@/components/GlobalSnackbar';
import { formRecognizerPageStyles } from '@/config/pageTheme';
import FieldList from '@/components/FieldList';
import PageHeader from '@/components/PageHeader';
import { useFormRecognizer } from './hooks/useFormRecognizer';

const FormRecognizerPage = () => {
  const {
    snackbarProps,
    fillLoading,
    clearLoading,
    includeHidden,
    setIncludeHidden,
    fields,
    scanning,
    showFields,
    setShowFields,
    hoveredFieldId,
    sidePanelOpen,
    handleScanFields,
    handleFieldTypeChange,
    handleToggleFieldSelection,
    handleToggleAllFields,
    handleLocateField,
    handleHoverField,
    handleFillSelectedFields,
    handleClearAllFields,
    handleOpenSidePanel,
    selectedCount,
  } = useFormRecognizer();

  return (
    <Box>
      <Container maxWidth="sm" sx={{ py: 3, px: 2 }}>
        {/* Header */}
        <PageHeader
          title="表单测试数据填充器"
          subtitle="一键填充表单测试数据，提升开发和测试效率"
          icon={<InputIcon />}
          iconColor={formRecognizerPageStyles.primaryColor}
          sx={{ mb: 2.5 }}
        />

        <Button
          size="small"
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenSidePanel}
          sx={{
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: sidePanelOpen ? 0 : 1,
            transform: sidePanelOpen ? 'scale(0.8)' : 'scale(1)',
            pointerEvents: sidePanelOpen ? 'none' : 'auto',
            visibility: sidePanelOpen ? 'hidden' : 'visible',
            position: 'relative',
          }}
        >
          侧边栏
        </Button>

        {/* 扫描按钮 */}
        <Button
          variant="outlined"
          onClick={handleScanFields}
          disabled={scanning}
          fullWidth
          startIcon={scanning ? <CircularProgress size={16} color="inherit" /> : <InputIcon />}
        >
          {scanning ? '扫描中...' : '扫描表单字段'}
        </Button>

        <FieldList
          fields={fields}
          showFields={showFields}
          onToggleShowFields={() => setShowFields(!showFields)}
          onFieldTypeChange={handleFieldTypeChange}
          onLocateField={handleLocateField}
          onHoverField={handleHoverField}
          onToggleFieldSelection={handleToggleFieldSelection}
          onToggleAllFields={handleToggleAllFields}
          hoveredFieldId={hoveredFieldId}
        />

        {/* 操作按钮 */}
        {fields.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              disableElevation
              disableRipple
              variant="contained"
              onClick={handleFillSelectedFields}
              disabled={fillLoading || selectedCount === 0}
              fullWidth
            >
              填充选中字段
            </Button>

            <Button
              disableElevation
              disableRipple
              variant="outlined"
              onClick={handleClearAllFields}
              disabled={clearLoading}
              fullWidth
            >
              清空所有字段
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={includeHidden}
                onChange={(e) => setIncludeHidden(e.target.checked)}
              />
            }
            label="包含隐藏字段"
          />
        </Box>

        <GlobalSnackbar {...snackbarProps} />
      </Container>
    </Box>
  );
};

export default FormRecognizerPage;
