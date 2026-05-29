import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { parseJwt } from '@/utils/jwt';
import type { JwtResult } from '@/utils/jwt';

export interface UseJwtReturn {
  jwtInput: string;
  result: JwtResult | null;
  handleChange: (val: string) => void;
  handleClear: () => void;
}

export function useJwt(): UseJwtReturn {
  const [jwtInput, setJwtInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  // 防抖管道
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedInput(jwtInput), 200);
    return () => clearTimeout(handle);
  }, [jwtInput]);

  // 右键菜单数据
  const handleContextMenuData = useCallback((payload: string) => {
    setJwtInput(payload.replace(/^Bearer\s*/i, '').trim());
  }, []);

  useContextMenuData({ featureKey: 'jwt', onData: handleContextMenuData });

  // 响应式解析
  const result = useMemo(() => {
    if (!debouncedInput.trim()) return null;
    return parseJwt(debouncedInput);
  }, [debouncedInput]);

  const handleChange = useCallback((val: string) => {
    setJwtInput(val.replace(/^Bearer\s*/i, '').trim());
  }, []);

  const handleClear = useCallback(() => setJwtInput(''), []);

  return { jwtInput, result, handleChange, handleClear };
}
