import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { vi } from 'vitest';

const mockItems = [
  { path: '/', label: '首页', element: <div>首页</div> },
  { path: '/timestamp', label: '时间戳', element: <div>时间戳</div> },
];

const renderWithRouter = (initialPath = '/', items = mockItems) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar items={items} />
    </MemoryRouter>,
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    // 模拟 useMediaQuery 以确保大屏幕行为
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(min-width:768px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it('应该正确渲染所有导航项（大屏幕）', () => {
    renderWithRouter();
    mockItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('没有提供 items 时应该正常渲染', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(true).toBe(true);
  });
});
