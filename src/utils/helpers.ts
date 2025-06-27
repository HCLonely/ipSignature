/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:55:59
 * @LastEditTime : 2025-06-27 22:40:42
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/utils/helpers.ts
 * @Description  : 辅助函数
 */

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

export function parseUserAgent(userAgent: string): { os: string; browser: string } {
  let os = '未知系统';
  let browser = '未知浏览器';

  // 识别操作系统
  if (userAgent.includes('Windows')) {
    const winVersion: Record<string, string> = {
      '10.0': '10',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
      '6.0': 'Vista',
      '5.2': 'Server 2003/XP x64',
      '5.1': 'XP',
      '5.0': '2000'
    };
    const ntVersion = userAgent.match(/Windows NT ([\d.]+)/)?.[1];
    os = ntVersion ? `Windows ${winVersion[ntVersion] || ntVersion}` : 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    const macVersion = userAgent.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.');
    if (macVersion) {
      const majorVersion = parseInt(macVersion);
      if (majorVersion >= 13) {
        os = `macOS ${majorVersion - 3}`; // macOS 13 = macOS 10
      } else if (majorVersion >= 10) {
        os = `macOS ${macVersion}`;
      } else {
        os = 'macOS';
      }
    } else {
      os = 'macOS';
    }
  } else if (userAgent.includes('Linux')) {
    if (userAgent.includes('Android')) {
      os = userAgent.match(/Android [\d.]+/)?.[0] || 'Android';
    } else if (userAgent.includes('Ubuntu')) {
      os = userAgent.match(/Ubuntu[/\s]([\d.]+)/)?.[0] || 'Ubuntu';
    } else if (userAgent.includes('Fedora')) {
      os = userAgent.match(/Fedora[/\s]([\d.]+)/)?.[0] || 'Fedora';
    } else if (userAgent.includes('SUSE')) {
      os = 'SUSE Linux';
    } else if (userAgent.includes('Debian')) {
      os = 'Debian';
    } else if (userAgent.includes('Mint')) {
      os = 'Linux Mint';
    } else {
      os = 'Linux';
    }
  } else if (userAgent.includes('iPhone')) {
    const version = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.');
    os = version ? `iOS ${version}` : 'iOS';
  } else if (userAgent.includes('iPad')) {
    const version = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.');
    os = version ? `iPadOS ${version}` : 'iPadOS';
  } else if (userAgent.includes('CrOS')) {
    os = 'Chrome OS';
  } else if (userAgent.includes('FreeBSD')) {
    os = 'FreeBSD';
  } else if (userAgent.includes('github')) {
    os = 'GitHub';
  }

  // 识别浏览器
  if (userAgent.includes('Edg/')) {
    browser = userAgent.match(/Edg\/([\d.]+)/)?.[0].replace('Edg/', 'Edge ') || 'Edge';
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
    browser = userAgent.match(/(?:OPR|Opera)[/]([\d.]+)/)?.[0].replace(/(?:OPR|Opera)\//, 'Opera ') || 'Opera';
  } else if (userAgent.includes('Chrome')) {
    if (userAgent.includes('Chromium')) {
      browser = userAgent.match(/Chromium\/([\d.]+)/)?.[0].replace('Chromium/', 'Chromium ') || 'Chromium';
    } else if (userAgent.includes('Brave')) {
      browser = 'Brave';
    } else if (userAgent.includes('Vivaldi')) {
      browser = userAgent.match(/Vivaldi\/([\d.]+)/)?.[0].replace('Vivaldi/', 'Vivaldi ') || 'Vivaldi';
    } else if (userAgent.includes('QQBrowser')) {
      browser = userAgent.match(/QQBrowser\/([\d.]+)/)?.[0].replace('QQBrowser/', 'QQ浏览器 ') || 'QQ浏览器';
    } else if (userAgent.includes('UBrowser')) {
      browser = userAgent.match(/UBrowser\/([\d.]+)/)?.[0].replace('UBrowser/', 'UC浏览器 ') || 'UC浏览器';
    } else if (userAgent.includes('360EE')) {
      browser = '360极速浏览器';
    } else if (userAgent.includes('360SE')) {
      browser = '360安全浏览器';
    } else {
      browser = userAgent.match(/Chrome\/([\d.]+)/)?.[0].replace('Chrome/', 'Chrome ') || 'Chrome';
    }
  } else if (userAgent.includes('Firefox')) {
    if (userAgent.includes('SeaMonkey')) {
      browser = userAgent.match(/SeaMonkey\/([\d.]+)/)?.[0].replace('SeaMonkey/', 'SeaMonkey ') || 'SeaMonkey';
    } else if (userAgent.includes('Waterfox')) {
      browser = userAgent.match(/Waterfox\/([\d.]+)/)?.[0].replace('Waterfox/', 'Waterfox ') || 'Waterfox';
    } else {
      browser = userAgent.match(/Firefox\/([\d.]+)/)?.[0].replace('Firefox/', 'Firefox ') || 'Firefox';
    }
  } else if (userAgent.includes('Safari')) {
    browser = userAgent.match(/Safari\/([\d.]+)/)?.[0].replace('Safari/', 'Safari ') || 'Safari';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    if (userAgent.includes('MSIE')) {
      browser = userAgent.match(/MSIE ([\d.]+)/)?.[0].replace('MSIE ', 'IE ') || 'IE';
    } else {
      // For IE 11
      browser = 'IE 11';
    }
  } else if (userAgent.includes('github-camo')) {
    browser = userAgent.split(' ')[0];
  }

  return { os, browser };
}
