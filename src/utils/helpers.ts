/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:55:59
 * @LastEditTime : 2025-06-28 10:34:55
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/utils/helpers.ts
 * @Description  : 辅助函数
 */
import type { Details } from 'express-useragent';

export function formatLocation(city: string, region: string, country: string): string {
  // 省名与城市名相同处理
  if (city === region) {
    return `${city}, ${country}`;
  }

  return `${city}, ${region}, ${country}`;
}

export function getCurrentTime(timezone: string): string {
  const date = new Date();
  const options1: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const options2: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    weekday: 'long'
  };
  const dateStr = new Intl.DateTimeFormat('zh-CN', options1).format(date);
  const weekStr = new Intl.DateTimeFormat('zh-CN', options2).format(date);
  return `${dateStr} ${weekStr}`;
}

export function getWeatherIconUrl(iconCode: string): string {
  return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function parseUserAgent(useragent: Details | undefined, userAgent: string): { os: string; browser: string } {
  let os = '未知系统';
  let browser = '未知浏览器';
  const defaultInfo = { os: '未知系统', browser: '未知浏览器' };

  if (userAgent.includes('github-camo')) {
    return { os: 'Github', browser: userAgent.split(' ')[0] };
  }

  if (!useragent) {
    return defaultInfo;
  }

  os = useragent.os === 'unknown' ? '未知系统' : useragent.os;
  browser = `${useragent.browser === 'unknown' ? '未知浏览器' : useragent.browser} ${useragent.version === 'unknown' ? '' : useragent.version}`;

  return { os, browser };
}
