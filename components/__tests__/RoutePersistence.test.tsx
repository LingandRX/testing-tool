import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RoutePersistence from '../RoutePersistence';
import { storageUtil } from '@/utils/chromeStorage';
import { vi } from 'vitest';

vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

const renderComponentOnly = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <RoutePersistence />
    </MemoryRouter>,
  );
};

describe('RoutePersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('组件应该正常渲染且返回 null', () => {
    const { container } = renderComponentOnly();
    expect(container.firstChild).toBeNull();
  });

  it('当在根路由时应该从存储中恢复路由', async () => {
    const mockGet = storageUtil.get as vi.Mock;
    mockGet.mockResolvedValue('/timestamp');

    await renderComponentOnly('/');

    expect(mockGet).toHaveBeenCalledWith('app/lastRoute');
  });
});
