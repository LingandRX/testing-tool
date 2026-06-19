import { getSyncSnapshot } from '@/utils/syncSnapshot';

describe('getSyncSnapshot', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('无快照时应返回默认值', () => {
    expect(getSyncSnapshot('app/test-key', 'default')).toBe('default');
  });

  it('应读取并解析合法 JSON 快照', () => {
    localStorage.setItem('snapshot/app/test-key', JSON.stringify('saved'));
    expect(getSyncSnapshot('app/test-key', 'default')).toBe('saved');
  });

  it('validator 失败时应回退到默认值', () => {
    localStorage.setItem('snapshot/app/test-key', JSON.stringify('invalid'));
    const isNumber = (val: unknown): val is number => typeof val === 'number';
    expect(getSyncSnapshot('app/test-key', 0, isNumber)).toBe(0);
  });

  it('非法 JSON 时应回退到默认值并记录错误', () => {
    localStorage.setItem('snapshot/app/test-key', '{invalid');
    expect(getSyncSnapshot('app/test-key', 'fallback')).toBe('fallback');
    expect(console.error).toHaveBeenCalled();
  });
});
