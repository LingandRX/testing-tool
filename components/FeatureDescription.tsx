import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FeatureDescription: React.FC = () => {
  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          功能说明
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>有效数据模式：</strong>生成符合格式要求的测试数据，适用于正常功能测试。
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>异常数据模式：</strong>生成边界值或格式错误的数据，适用于异常场景测试。
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>一键清空：</strong>快速清空当前页面所有表单字段的值。
        </Typography>
        <Typography variant="body2">
          <strong>支持的字段类型：</strong>
          文本、邮箱、手机号、数字、日期、文本域、密码、身份证号等。
        </Typography>
      </Box>
    </Paper>
  );
};

export default FeatureDescription;
