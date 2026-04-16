import { Box, Typography, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Sparkles for AI
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import React from 'react';

interface ToolCardProps {
  title: string;
  description?: string;
  snapshot?: React.ReactNode;
  colorCode: string;
  icon: React.ReactNode;
  onClick: () => void;
  hasAI?: boolean;
}

export default function ToolCard({ title, description, snapshot, colorCode, icon, onClick, hasAI }: ToolCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 2.5,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'grey.100',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        '&:hover': { 
          borderColor: colorCode,
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px -10px ${colorCode}33`, // 20% opacity of colorCode
          '& .arrow-icon': {
            transform: 'translateX(4px)',
            color: colorCode
          }
        }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 3,
              bgcolor: `${colorCode}11`, // 7% opacity
              color: colorCode
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                lineHeight: 1.2,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {title}
              {hasAI && <AutoAwesomeIcon sx={{ fontSize: 14, color: '#f5b041' }} />}
            </Typography>
            {description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  display: 'block',
                  mt: 0.5
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
        <ArrowForwardIosIcon 
          className="arrow-icon"
          sx={{ 
            fontSize: 12, 
            color: 'grey.300', 
            mt: 0.5,
            transition: 'all 0.3s ease'
          }} 
        />
      </Stack>

      {snapshot && (
        <Box 
          sx={{ 
            mt: 'auto',
            pt: 1.5,
            borderTop: '1px dashed',
            borderColor: 'grey.100'
          }}
        >
          {snapshot}
        </Box>
      )}
    </Box>
  );
}
