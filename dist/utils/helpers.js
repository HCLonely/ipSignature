"use strict";
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:55:59
 * @LastEditTime : 2025-06-27 14:34:11
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/utils/helpers.ts
 * @Description  :
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLocation = formatLocation;
exports.getCurrentTime = getCurrentTime;
exports.getWeatherIconUrl = getWeatherIconUrl;
exports.parseUserAgent = parseUserAgent;
function formatLocation(city, region, country) {
    // 省名与城市名相同处理
    if (city === region) {
        return `${city}, ${country}`;
    }
    return `${city}, ${region}, ${country}`;
}
function getCurrentTime(timezone) {
    const date = new Date();
    const options1 = {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const options2 = {
        timeZone: timezone,
        weekday: 'long'
    };
    const dateStr = new Intl.DateTimeFormat('zh-CN', options1).format(date);
    const weekStr = new Intl.DateTimeFormat('zh-CN', options2).format(date);
    return `${dateStr} ${weekStr}`;
}
function getWeatherIconUrl(iconCode) {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
function parseUserAgent(userAgent) {
    let os = '未知系统';
    let browser = '未知浏览器';
    // 识别操作系统
    if (userAgent.includes('Windows')) {
        os = userAgent.match(/Windows NT [\d.]+/)?.[0].replace('Windows NT ', 'Windows ') || 'Windows';
    }
    else if (userAgent.includes('Mac OS X')) {
        os = 'macOS';
    }
    else if (userAgent.includes('Linux')) {
        if (userAgent.includes('Android')) {
            os = userAgent.match(/Android [\d.]+/)?.[0] || 'Android';
        }
        else {
            os = 'Linux';
        }
    }
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
    }
    // 识别浏览器
    if (userAgent.includes('Chrome')) {
        if (userAgent.includes('Edg/')) {
            browser = userAgent.match(/Edg\/[\d.]+/)?.[0].replace('Edg/', 'Edge ') || 'Edge';
        }
        else if (userAgent.includes('OPR/')) {
            browser = userAgent.match(/OPR\/[\d.]+/)?.[0].replace('OPR/', 'Opera ') || 'Opera';
        }
        else {
            browser = userAgent.match(/Chrome\/[\d.]+/)?.[0].replace('Chrome/', 'Chrome ') || 'Chrome';
        }
    }
    else if (userAgent.includes('Firefox')) {
        browser = userAgent.match(/Firefox\/[\d.]+/)?.[0].replace('Firefox/', 'Firefox ') || 'Firefox';
    }
    else if (userAgent.includes('Safari')) {
        browser = userAgent.match(/Safari\/[\d.]+/)?.[0].replace('Safari/', 'Safari ') || 'Safari';
    }
    return { os, browser };
}
