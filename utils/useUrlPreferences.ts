import { useState, useEffect, useCallback } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import type { OpenUrlPreferences, OpenUrlEntry } from '@/types/storage';

const DEFAULT_PREFERENCES: OpenUrlPreferences = {
  entries: [],
};

export const useUrlPreferences = () => {
  const [entries, setEntries] = useState<OpenUrlEntry[]>(DEFAULT_PREFERENCES.entries);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await storageUtil.get('openUrl/preferences', DEFAULT_PREFERENCES);
        if (saved && saved.entries) {
          setEntries(saved.entries);
        }
      } catch (error) {
        console.error('Failed to load Open Url preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreferences();
  }, []);

  const savePreferences = useCallback(() => {
    const preferences: OpenUrlPreferences = { entries };
    storageUtil.set('openUrl/preferences', preferences).catch((error) => {
      console.error('Failed to save Open Url preferences:', error);
    });
  }, [entries]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      savePreferences();
    }, 500);
    return () => clearTimeout(timer);
  }, [entries, isLoaded, savePreferences]);

  return { entries, setEntries, isLoaded };
};
