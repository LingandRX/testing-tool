import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  InputBase,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from '@/providers/RouterProvider';
import { FEATURES, FeatureConfig } from '@/config/features';
import { storageUtil } from '@/utils/chromeStorage';

export default function TopBar({ onOpenOptions }: { onOpenOptions: () => void }) {
  const { currentPage, goBack, navigateTo } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载搜索历史
  useEffect(() => {
    storageUtil.get('app/searchHistory', []).then((history) => {
      setSearchHistory(history || []);
    });
  }, []);

  // 模糊搜索逻辑
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return FEATURES.filter(
      (f) =>
        f.key !== 'dashboard' &&
        (f.label.toLowerCase().includes(query) || f.description.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  const displayedHistory = useMemo(() => {
    if (searchQuery.trim()) return [];
    return searchHistory.slice(0, 5);
  }, [searchHistory, searchQuery]);

  const handleOpenInTab = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?mode=tab') }).catch(console.error);
    window.close();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
    setSelectedIndex(-1);
  };

  const saveToHistory = async (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    await storageUtil.set('app/searchHistory', newHistory);
  };

  const handleSelectFeature = (feature: FeatureConfig) => {
    navigateTo(feature.key);
    saveToHistory(feature.label);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchQuery.trim() ? searchResults.length : displayedHistory.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        if (searchQuery.trim()) {
          handleSelectFeature(searchResults[selectedIndex]);
        } else {
          setSearchQuery(displayedHistory[selectedIndex]);
          setSelectedIndex(-1);
        }
      } else if (searchQuery.trim() && searchResults.length > 0) {
        handleSelectFeature(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const isDashboard = currentPage === 'dashboard';

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        px: { xs: 1, sm: 2 },
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        bgcolor: 'background.paper',
        zIndex: 1100,
        position: 'relative',
      }}
    >
      <Box sx={{ width: { xs: 32, sm: 40 } }}>
        {!isDashboard && (
          <IconButton
            size="small"
            onClick={goBack}
            aria-label="返回"
            sx={{
              bgcolor: 'grey.50',
              '&:hover': { bgcolor: 'grey.200' },
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, mx: { xs: 1, sm: 2 }, position: 'relative', maxWidth: 400 }}>
        <ClickAwayListener onClickAway={() => setShowResults(false)}>
          <Box>
            <InputBase
              ref={inputRef}
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleKeyDown}
              inputProps={{ 'aria-label': '搜索工具' }}
              startAdornment={<SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />}
              endAdornment={
                searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIndex(-1);
                    }}
                    aria-label="清除搜索"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )
              }
              sx={{
                width: '100%',
                bgcolor: 'grey.50',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.875rem',
                border: '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'grey.100' },
                '&.Mui-focused': {
                  bgcolor: 'background.paper',
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                },
              }}
            />

            {showResults && (searchQuery.trim() || displayedHistory.length > 0) && (
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  maxHeight: 300,
                  overflow: 'auto',
                  borderRadius: 2,
                  zIndex: 1200,
                }}
              >
                <List disablePadding role="listbox">
                  {searchQuery.trim() ? (
                    searchResults.length > 0 ? (
                      searchResults.map((feature, index) => (
                        <ListItemButton
                          key={feature.key}
                          selected={selectedIndex === index}
                          onClick={() => handleSelectFeature(feature)}
                          role="option"
                          aria-selected={selectedIndex === index}
                          sx={{ py: 1 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>{feature.icon}</ListItemIcon>
                          <ListItemText
                            primary={feature.label}
                            secondary={feature.description}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                          />
                        </ListItemButton>
                      ))
                    ) : (
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          未找到相关工具
                        </Typography>
                      </Box>
                    )
                  ) : (
                    <>
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="text.disabled">
                          最近搜索
                        </Typography>
                      </Box>
                      {displayedHistory.map((item, index) => (
                        <ListItemButton
                          key={item}
                          selected={selectedIndex === index}
                          onClick={() => {
                            setSearchQuery(item);
                            setSelectedIndex(-1);
                          }}
                          role="option"
                          aria-selected={selectedIndex === index}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <HistoryIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItemButton>
                      ))}
                    </>
                  )}
                </List>
              </Paper>
            )}
          </Box>
        </ClickAwayListener>
      </Box>

      <Stack
        direction="row"
        spacing={0.5}
        sx={{ width: { xs: 72, sm: 120 }, justifyContent: 'flex-end' }}
      >
        <Tooltip title="在标签页打开">
          <IconButton size="small" onClick={handleOpenInTab} aria-label="在标签页打开">
            <OpenInNewIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="设置">
          <IconButton size="small" onClick={onOpenOptions} aria-label="设置">
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
