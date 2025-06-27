/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:57:15
 * @LastEditTime : 2025-06-27 16:20:12
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/index.ts
 * @Description  :
 */
// 在文件最顶部加载环境变量
import './utils/envLoader';

import express from 'express';
import requestIp from 'request-ip';
import { getGeoDataByIpInfo, getGeoDataByNsmao } from './services/geoService';
import { getWeatherData } from './services/weatherService';
import { generateSignatureImage, createErrorImage } from './services/imageService';
import { formatLocation, getCurrentTime, parseUserAgent } from './utils/helpers';
import { GeoData, SignatureData, WeatherData } from './types/types';
import axios from 'axios';
import { initBackgroundService } from './services/backgroundService';
import { cacheService } from './services/cacheService';
import { getHitokoto } from './services/hitokotoService';

const app = express();
const PORT = process.env.PORT || 3000;

// 允许跨域访问
app.use((__, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 中间件
app.use(requestIp.mw());

// 获取客户端IP的函数
function getClientIp(req: express.Request): string {
  // 尝试从 x-forwarded-for 获取
  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps && typeof forwardedIps === 'string') {
    const ips = forwardedIps.split(',');
    return ips[0].trim();
  }

  // 尝试从 requestIp 中间件获取
  const ipFromMiddleware = requestIp.getClientIp(req);
  if (ipFromMiddleware) {
    return ipFromMiddleware;
  }

  // 最后尝试从 req.ip 获取
  return req.ip || '';
}

// 获取公网IP的函数
async function getPublicIP(): Promise<string> {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('[错误] 获取公网IP失败:', error);
    throw error;
  }
}

// 检查是否为本地IP
function isLocalIP(ip: string): boolean {
  return ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1';
}

// 获取地理位置数据
async function getGeoData(ip: string): Promise<GeoData> {
  // 检查缓存
  const cachedGeoData = cacheService.getGeoCache(ip);
  if (cachedGeoData) {
    return cachedGeoData;
  }

  // 检查环境变量中的令牌
  const ipinfoToken = process.env.IPINFO_TOKEN;
  const nsmaoToken = process.env.NSMAO_TOKEN;

  let geoData: GeoData;

  // 优先使用 ipinfo 服务
  if (ipinfoToken) {
    try {
      console.log('[地理位置] 使用 ipinfo 服务');
      geoData = await getGeoDataByIpInfo(ip);
      cacheService.setGeoCache(ip, geoData);
      return geoData;
    } catch (error) {
      console.error('[地理位置] ipinfo 服务失败:', error);
      // 如果有 nsmao 令牌，尝试使用 nsmao 服务作为备选
      if (nsmaoToken) {
        console.log('[地理位置] 尝试使用 nsmao 服务作为备选');
        geoData = await getGeoDataByNsmao(ip);
        cacheService.setGeoCache(ip, geoData);
        return geoData;
      }
      throw error;
    }
  }

  // 如果没有 ipinfo 令牌但有 nsmao 令牌
  if (nsmaoToken) {
    console.log('[地理位置] 使用 nsmao 服务');
    geoData = await getGeoDataByNsmao(ip);
    cacheService.setGeoCache(ip, geoData);
    return geoData;
  }

  // 如果两个令牌都没有
  throw new Error('未配置地理位置服务令牌 (IPINFO_TOKEN 或 NSMAO_TOKEN)');
}

// 获取天气数据（添加缓存）
async function getWeatherDataWithCache(lat: string, lon: string): Promise<WeatherData> {
  const location = `${lat},${lon}`;

  // 检查缓存
  const cachedWeatherData = cacheService.getWeatherCache(location);
  if (cachedWeatherData) {
    return cachedWeatherData;
  }

  // 获取新数据
  const weatherData = await getWeatherData(lat, lon);
  cacheService.setWeatherCache(location, weatherData);
  return weatherData;
}

// 路由
app.get('/signature', async (req, res) => {
  try {
    let clientIp = getClientIp(req);
    console.log(`[请求] 原始 IP: ${clientIp}`);

    if (!clientIp) {
      res.send(createErrorImage('无效的IP地址'));
      return;
    }

    // 在开发环境下处理本地IP
    if (process.env.NODE_ENV === 'development' && isLocalIP(clientIp)) {
      console.log('[开发环境] 检测到本地IP，尝试获取公网IP');
      clientIp = await getPublicIP();
      console.log(`[开发环境] 使用公网IP: ${clientIp}`);
    }

    if (!clientIp) {
      res.send(createErrorImage('无效的IP地址'));
      return;
    }

    // 获取地理位置信息
    const geoData: GeoData = await getGeoData(clientIp);
    console.log(`[地理位置] 获取到数据: ${JSON.stringify(geoData)}`);

    const [lat, lon] = geoData.loc.split(',');

    // 获取天气信息
    const weatherData = await getWeatherDataWithCache(lat, lon);
    console.log(`[天气] 获取到数据: ${JSON.stringify(weatherData)}`);

    // 获取用户代理信息
    const userAgent = req.headers['user-agent'] || '';
    const systemInfo = parseUserAgent(userAgent);
    console.log(`[系统信息] 操作系统: ${systemInfo.os}, 浏览器: ${systemInfo.browser}`);

    // 获取一言
    let hitokoto = cacheService.getHitokotoCache();
    if (!hitokoto) {
      hitokoto = await getHitokoto();
      cacheService.setHitokotoCache(hitokoto);
    }

    // 准备签名数据
    const signatureData: SignatureData = {
      ip: geoData.ip,
      location: formatLocation(geoData.city, geoData.region, geoData.country),
      time: getCurrentTime(geoData.timezone),
      weather: weatherData,
      systemInfo,
      hitokoto
    };

    console.log(`[签名数据] 准备生成图片: ${JSON.stringify(signatureData)}`);

    // 生成图片
    const imageBuffer = await generateSignatureImage(signatureData);

    // 设置响应头
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=600',
      'Expires': new Date(Date.now() + 600000).toUTCString()
    });

    // 发送图片
    res.send(imageBuffer);
    console.log(`[响应] 成功发送签名图片 (大小: ${imageBuffer.length} 字节)`);
  } catch (error) {
    console.error('[错误] 生成签名时出错:', error);

    // 在调试模式下发送详细错误
    if (process.env.DEBUG === 'true') {
      res.status(500).send(`<pre>Error: ${error instanceof Error ? error.stack : error}</pre>`);
    } else {
      // 返回错误图片
      res.set('Content-Type', 'image/png');
      const errorImage = createErrorImage('生成签名图片时出错');
      res.send(errorImage);
    }
  }
});

// 定期清理过期缓存
setInterval(() => {
  cacheService.cleanExpiredCache();
}, 60 * 60 * 1000); // 每小时清理一次

// 启动服务器
async function startServer() {
  try {
    // 初始化背景服务
    await initBackgroundService();

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`[服务器] 正在运行: http://localhost:${PORT}`);
      console.log(`[服务器] 签名端点: http://localhost:${PORT}/signature`);
      console.log('[缓存] IP数据缓存时间: 长期');
      console.log('[缓存] 天气数据缓存时间: 30分钟');
      console.log('[缓存] 一言数据缓存时间: 5分钟');
    });
  } catch (error) {
    console.error('[错误] 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();
