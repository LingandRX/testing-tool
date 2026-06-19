import { randomInt, randomPick } from '@/lib/generators/random';

describe('generators/random', () => {
  it('randomInt 应返回闭区间内的整数', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(randomInt(1, 10)).toBe(6);
    expect(randomInt(5, 5)).toBe(5);
  });

  it('randomPick 应对单元素数组返回该元素', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(randomPick(['only'])).toBe('only');
  });

  it('randomPick 应返回数组中的元素', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    expect(randomPick(['a', 'b', 'c'])).toBe('c');
  });
});
