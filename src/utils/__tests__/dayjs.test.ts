import { describe, expect, it } from 'vitest';
import dayjs from '@/utils/dayjs';

describe('dayjs', () => {
  it('应该正确导出 dayjs 实例', () => {
    expect(dayjs).toBeDefined();
    expect(typeof dayjs).toBe('function');
  });

  it('应该支持基本日期解析', () => {
    const date = dayjs('2024-01-15');
    expect(date.isValid()).toBe(true);
    expect(date.year()).toBe(2024);
    expect(date.month()).toBe(0);
    expect(date.date()).toBe(15);
  });

  it('应该支持 UTC 插件', () => {
    const utcDate = dayjs.utc('2024-01-15T12:00:00Z');
    expect(utcDate.isValid()).toBe(true);
    expect(utcDate.format()).toContain('2024-01-15');
  });

  it('应该支持时区插件', () => {
    const date = dayjs('2024-01-15T12:00:00');
    expect(date.tz).toBeDefined();
    expect(typeof date.tz).toBe('function');

    const shanghaiDate = date.tz('Asia/Shanghai');
    expect(shanghaiDate.isValid()).toBe(true);
  });

  it('应该支持相对时间插件', () => {
    const now = dayjs();
    expect(now.fromNow).toBeDefined();
    expect(typeof now.fromNow).toBe('function');

    const yesterday = dayjs().subtract(1, 'day');
    const fromNow = yesterday.fromNow();
    expect(typeof fromNow).toBe('string');
    expect(fromNow.length).toBeGreaterThan(0);
  });

  it('应该使用中文 locale', () => {
    // 显式设置中文 locale
    dayjs.locale('zh-cn');
    const yesterday = dayjs().subtract(1, 'day');
    const fromNow = yesterday.fromNow();

    // 中文相对时间应包含 "天前"
    expect(fromNow).toContain('天前');
  });

  it('应该支持日期格式化', () => {
    const date = dayjs('2024-01-15T10:30:00');
    expect(date.format('YYYY-MM-DD')).toBe('2024-01-15');
    expect(date.format('YYYY年MM月DD日')).toBe('2024年01月15日');
  });

  it('应该支持日期计算', () => {
    const date = dayjs('2024-01-15');
    const nextDay = date.add(1, 'day');
    expect(nextDay.date()).toBe(16);

    const prevMonth = date.subtract(1, 'month');
    expect(prevMonth.month()).toBe(11);
    expect(prevMonth.year()).toBe(2023);
  });

  it('应该支持日期比较', () => {
    const date1 = dayjs('2024-01-15');
    const date2 = dayjs('2024-01-20');

    expect(date1.isBefore(date2)).toBe(true);
    expect(date2.isAfter(date1)).toBe(true);
    expect(date1.isSame(date2)).toBe(false);
  });

  it('应该支持 Unix 时间戳转换', () => {
    const timestamp = 1705315200; // 2024-01-15 12:00:00 UTC
    const date = dayjs.unix(timestamp);

    expect(date.isValid()).toBe(true);
    expect(date.year()).toBe(2024);
  });

  it('应该支持毫秒时间戳', () => {
    const timestamp = 1705315200000;
    const date = dayjs(timestamp);

    expect(date.isValid()).toBe(true);
    expect(date.year()).toBe(2024);
  });
});
