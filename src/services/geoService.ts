/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:56:27
 * @LastEditTime : 2025-06-27 22:18:57
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/geoService.ts
 * @Description  : 地理位置服务
 */
import axios from 'axios';
import { GeoData } from '../types/types';

const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '';
const NSMAO_TOKEN = process.env.NSMAO_TOKEN || '';

export async function getGeoDataByIpInfo(ip: string): Promise<GeoData> {
  // 处理本地IP的特殊情况
  if (ip === '::1' || ip === '127.0.0.1') {
    return {
      ip: '127.0.0.1',
      city: 'Localhost',
      region: 'Development',
      country: 'Local',
      loc: '0,0',
      timezone: 'UTC'
    };
  }
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
    return {
      ip: response.data.ip,
      city: response.data.city || '未知',
      region: response.data.region || '未知',
      country: response.data.country || '未知',
      loc: response.data.loc || '0,0',
      timezone: response.data.timezone || 'UTC'
    };
  } catch (error) {
    console.error('Error fetching geo data:', error);
    return {
      ip,
      city: '未知',
      region: '未知',
      country: '未知',
      loc: '0,0',
      timezone: 'UTC'
    };
  }
}
export async function getGeoDataByNsmao(ip: string): Promise<GeoData> {
  // 处理本地IP的特殊情况
  if (ip === '::1' || ip === '127.0.0.1') {
    return {
      ip: '127.0.0.1',
      city: 'Localhost',
      region: 'Development',
      country: 'Local',
      loc: '0,0',
      timezone: 'UTC'
    };
  }
  try {
    const response = await axios.get(`https://api.nsmao.net/api/ipip/query?key=${NSMAO_TOKEN}&ip=${ip}`, {
      validateStatus: function (status) {
        return status >= 200 && status < 303; // 只接受200-303之间的状态码
      }
    });
    return {
      ip: response.data.data.ip,
      city: response.data.data.city || '未知',
      region: response.data.data.province || '未知',
      country: response.data.data.country || '未知',
      loc: `${response.data.data.lat},${response.data.data.lng}`,
      timezone: 'UTC'
    };
  } catch (error) {
    console.error('Error fetching geo data:', error);
    return {
      ip,
      city: '未知',
      region: '未知',
      country: '未知',
      loc: '0,0',
      timezone: 'UTC'
    };
  }
}
