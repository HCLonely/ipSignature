"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLocation = formatLocation;
exports.getCurrentTime = getCurrentTime;
exports.getWeatherIconUrl = getWeatherIconUrl;
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:55:59
 * @LastEditTime : 2025-06-27 09:56:04
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/utils/helpers.ts
 * @Description  :
 */
function formatLocation(city, region, country) {
    return `${city}, ${region}, ${country}`;
}
function getCurrentTime(timezone) {
    const options = {
        timeZone: timezone,
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    return new Date().toLocaleString('en-US', options);
}
function getWeatherIconUrl(iconCode) {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
//# sourceMappingURL=helpers.js.map