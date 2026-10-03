import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AppRoot from '@/providers/AppRoot';
import App from '../App';

describe('Popup App Component', () => {
  it('应该在挂载后根据默认页面设置 html 和 body 高度', async () => {
    render(
      <AppRoot>
        <App />
      </AppRoot>,
    );

    // 默认页面为 timestamp，高度为 480px
    expect(document.documentElement.style.height).toBe('480px');
    expect(document.body.style.height).toBe('480px');
  });

  it('切换页面时应该动态更新 html 和 body 的高度', async () => {
    const user = userEvent.setup();
    render(
      <AppRoot>
        <App />
      </AppRoot>,
    );

    // 查找右键恢复按钮（高度为 420px）
    const rightClickBtn = screen.getByRole('button', { name: '右键恢复' });
    await act(async () => {
      await user.click(rightClickBtn);
    });

    expect(document.documentElement.style.height).toBe('420px');
    expect(document.body.style.height).toBe('420px');

    // 查找 JSON 工具按钮（高度为 600px）
    const jsonToolsBtn = screen.getByRole('button', { name: 'JSON 工具' });
    await act(async () => {
      await user.click(jsonToolsBtn);
    });

    expect(document.documentElement.style.height).toBe('600px');
    expect(document.body.style.height).toBe('600px');
  });
});
