"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeoData = getGeoData;
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:56:27
 * @LastEditTime : 2025-06-27 09:56:32
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/geoService.ts
 * @Description  :
 */
const axios_1 = __importDefault(require("axios"));
const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '';
async function getGeoData(ip) {
    try {
        const response = await axios_1.default.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
        return {
            ip: response.data.ip,
            city: response.data.city || 'Unknown',
            region: response.data.region || 'Unknown',
            country: response.data.country || 'Unknown',
            loc: response.data.loc || '0,0',
            timezone: response.data.timezone || 'UTC'
        };
    }
    catch (error) {
        console.error('Error fetching geo data:', error);
        return {
            ip,
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            loc: '0,0',
            timezone: 'UTC'
        };
    }
}
//# sourceMappingURL=geoService.js.map