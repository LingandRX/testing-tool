import { renderHook, act, waitFor } from '@testing-library/react';
import { useRightClickRestorer } from '../useRightClickRestorer';
import { sendMessageToContent } from '@/utils/messages';

const mockTabsQuery = vi.fn();

vi.mock('@/utils/messages', () => ({
  MessageAction: {
    RESTORE_RIGHT_CLICK: 'restoreRightClick',
    QUERY_RIGHT_CLICK_STATUS: 'queryRightClickStatus',
  },
  sendMessageToContent: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockTabsQuery.mockResolvedValue([{ url: 'https://example.com/path' }]);
  chrome.tabs.query = mockTabsQuery;
  vi.mocked(sendMessageToContent).mockResolvedValue({ success: true, restored: false });
});

describe('useRightClickRestorer', () => {
  it('should load domain and query status', async () => {
    const { result } = renderHook(() => useRightClickRestorer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.domain).toBe('example.com');
    expect(result.current.status).toBe('locked');
    expect(sendMessageToContent).toHaveBeenCalledWith('queryRightClickStatus');
  });

  it('should mark internal pages as unsupported', async () => {
    mockTabsQuery.mockResolvedValue([{ url: 'chrome://newtab/' }]);
    chrome.tabs.query = mockTabsQuery;

    const { result } = renderHook(() => useRightClickRestorer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe('unsupported');
    expect(sendMessageToContent).not.toHaveBeenCalled();
  });

  it('should unlock right click', async () => {
    vi.mocked(sendMessageToContent).mockResolvedValueOnce({ success: true, restored: false });
    vi.mocked(sendMessageToContent).mockResolvedValueOnce({ success: true, restored: true });

    const { result } = renderHook(() => useRightClickRestorer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.unlock();
    });

    expect(result.current.status).toBe('unlocked');
    expect(sendMessageToContent).toHaveBeenLastCalledWith('restoreRightClick');
  });

  it('should not unlock unsupported pages', async () => {
    mockTabsQuery.mockResolvedValue([{ url: 'chrome://settings/' }]);
    chrome.tabs.query = mockTabsQuery;

    const { result } = renderHook(() => useRightClickRestorer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.unlock();
    });

    expect(result.current.status).toBe('unsupported');
    expect(sendMessageToContent).not.toHaveBeenCalled();
  });

  it('should handle sendMessage failure gracefully', async () => {
    vi.mocked(sendMessageToContent).mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useRightClickRestorer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.unlock();
    });

    expect(result.current.status).toBe('locked');
  });
});
