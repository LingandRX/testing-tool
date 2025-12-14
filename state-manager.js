/**
 * 状态管理器
 */
class StateManager {
  constructor() {
    this.state = {
      currentPage: 'home',
      settings: {
        darkMode: false,
        autoSave: true,
        showNotifications: true,
        dataSync: false,
        fontSize: 'medium',
        language: 'zh-CN',
      },
      history: [],
      stats: {
        usageCount: 0,
        pageSwitches: 0,
        historyCount: 0,
        settingsCount: 6,
      },
    };

    this.listeners = [];
    this.init();
  }

  async init() {
    try {
      const result = await chrome.storage.local.get(['appState']);
      if (result.appState) {
        this.state = {...this.state, ...result.appState};
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }

    this.notifyListeners();

    if (this.state.history.length === 0) {
      this.addHistory('应用初始化');
    }
  }

  setState(newState) {
    this.state = {...this.state, ...newState};
    this.saveState();
    this.notifyListeners();
  }

  async saveState() {
    try {
      await chrome.storage.local.set({appState: this.state});
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.state);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  navigateTo(page) {
    const newStats = {
      ...this.state.stats,
      pageSwitches: this.state.stats.pageSwitches + 1,
    };

    this.setState({
      currentPage: page,
      stats: newStats,
    });

    this.addHistory(`切换到${this.getPageName(page)}页面`);
  }

  updateSettings(settings) {
    const newSettings = {...this.state.settings, ...settings};
    this.setState({settings: newSettings});

    const changedSettings = Object.keys(settings);
    if (changedSettings.length > 0) {
      this.addHistory(`更新设置: ${changedSettings.join(', ')}`);
    }
  }

  addHistory(action) {
    const historyItem = {
      id: Date.now(),
      action: action,
      timestamp: new Date().toISOString(),
      page: this.state.currentPage,
    };

    const newHistory = [historyItem, ...this.state.history.slice(0, 19)];

    const newStats = {
      ...this.state.stats,
      historyCount: newHistory.length,
    };

    this.setState({
      history: newHistory,
      stats: newStats,
    });
  }

  clearHistory() {
    this.setState({
      history: [],
      stats: {
        ...this.state.stats,
        historyCount: 0,
      },
    });

    this.addHistory('清空了历史记录');
  }

  incrementUsage() {
    const newStats = {
      ...this.state.stats,
      usageCount: this.state.stats.usageCount + 1,
    };

    this.setState({stats: newStats});
  }

  getPageName(pageId) {
    const pageNames = {
      home: '首页',
      settings: '设置',
      history: '历史记录',
      about: '关于',
      'timestamptool': '时间戳转换工具',
    };

    return pageNames[pageId] || pageId;
  }

  getState() {
    return this.state;
  }
}

export default StateManager;
