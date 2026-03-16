import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storageUtil } from '@/utils/chromeStorage';

const RoutePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isRestored = useRef(false);

  useEffect(() => {
    const restoreRoute = async () => {
      if (isRestored.current) return;

      try {
        const lastRoute = await storageUtil.get('app/lastRoute');

        if (lastRoute && lastRoute !== '/' && location.pathname === '/') {
          navigate(lastRoute, { replace: true });
        }
      } catch (err) {
        console.error('恢复路由失败', err);
      } finally {
        isRestored.current = true;
      }
    };

    restoreRoute();
  }, [navigate, location.pathname]);

  useEffect(() => {
    const saveRoute = async () => {
      if (!isRestored.current) return;
      await storageUtil.set('app/lastRoute', location.pathname);
    };

    saveRoute();
  }, [location]);

  return null;
};

export default RoutePersistence;
