"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:57:15
 * @LastEditTime : 2025-06-27 15:49:32
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/index.ts
 * @Description  :
 */
// 在文件最顶部加载环境变量
require("./utils/envLoader");
const express_1 = __importDefault(require("express"));
const request_ip_1 = __importDefault(require("request-ip"));
const geoService_1 = require("./services/geoService");
const weatherService_1 = require("./services/weatherService");
const imageService_1 = require("./services/imageService");
const helpers_1 = require("./utils/helpers");
const axios_1 = __importDefault(require("axios"));
const backgroundService_1 = require("./services/backgroundService");
const cacheService_1 = require("./services/cacheService");
const hitokotoService_1 = require("./services/hitokotoService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 允许跨域访问
app.use((__, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// 中间件
app.use(request_ip_1.default.mw());
// Windows 兼容性 - 处理代理后的 IP
app.use((req, __, next) => {
    // 处理代理后的 IP
    const forwardedIps = req.headers['x-forwarded-for'];
    if (forwardedIps && typeof forwardedIps === 'string') {
        const ips = forwardedIps.split(',');
        req.clientIp = ips[0].trim();
    }
    next();
});
// 获取公网IP的函数
async function getPublicIP() {
    try {
        const response = await axios_1.default.get('https://api.ipify.org?format=json');
        return response.data.ip;
    }
    catch (error) {
        console.error('[错误] 获取公网IP失败:', error);
        throw error;
    }
}
// 检查是否为本地IP
function isLocalIP(ip) {
    return ip === '127.0.0.1' ||
        ip === 'localhost' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.16.') ||
        ip === '::1' ||
        ip === '::ffff:127.0.0.1';
}
// 获取地理位置数据
async function getGeoData(ip) {
    // 检查缓存
    const cachedGeoData = cacheService_1.cacheService.getGeoCache(ip);
    if (cachedGeoData) {
        return cachedGeoData;
    }
    // 检查环境变量中的令牌
    const ipinfoToken = process.env.IPINFO_TOKEN;
    const nsmaoToken = process.env.NSMAO_TOKEN;
    let geoData;
    // 优先使用 ipinfo 服务
    if (ipinfoToken) {
        try {
            console.log('[地理位置] 使用 ipinfo 服务');
            geoData = await (0, geoService_1.getGeoDataByIpInfo)(ip);
            cacheService_1.cacheService.setGeoCache(ip, geoData);
            return geoData;
        }
        catch (error) {
            console.error('[地理位置] ipinfo 服务失败:', error);
            // 如果有 nsmao 令牌，尝试使用 nsmao 服务作为备选
            if (nsmaoToken) {
                console.log('[地理位置] 尝试使用 nsmao 服务作为备选');
                geoData = await (0, geoService_1.getGeoDataByNsmao)(ip);
                cacheService_1.cacheService.setGeoCache(ip, geoData);
                return geoData;
            }
            throw error;
        }
    }
    // 如果没有 ipinfo 令牌但有 nsmao 令牌
    if (nsmaoToken) {
        console.log('[地理位置] 使用 nsmao 服务');
        geoData = await (0, geoService_1.getGeoDataByNsmao)(ip);
        cacheService_1.cacheService.setGeoCache(ip, geoData);
        return geoData;
    }
    // 如果两个令牌都没有
    throw new Error('未配置地理位置服务令牌 (IPINFO_TOKEN 或 NSMAO_TOKEN)');
}
// 获取天气数据（添加缓存）
async function getWeatherDataWithCache(lat, lon) {
    const location = `${lat},${lon}`;
    // 检查缓存
    const cachedWeatherData = cacheService_1.cacheService.getWeatherCache(location);
    if (cachedWeatherData) {
        return cachedWeatherData;
    }
    // 获取新数据
    const weatherData = await (0, weatherService_1.getWeatherData)(lat, lon);
    cacheService_1.cacheService.setWeatherCache(location, weatherData);
    return weatherData;
}
// 路由
app.get('/signature', async (req, res) => {
    try {
        let clientIp = req.clientIp || req.ip;
        console.log(`[请求] 原始 IP: ${clientIp}`);
        if (!clientIp) {
            res.send((0, imageService_1.createErrorImage)('无效的IP地址'));
            return;
        }
        // 在开发环境下处理本地IP
        if (process.env.NODE_ENV === 'development' && isLocalIP(clientIp)) {
            console.log('[开发环境] 检测到本地IP，尝试获取公网IP');
            clientIp = await getPublicIP();
            console.log(`[开发环境] 使用公网IP: ${clientIp}`);
        }
        if (!clientIp) {
            res.send((0, imageService_1.createErrorImage)('无效的IP地址'));
            return;
        }
        // 获取地理位置信息
        const geoData = await getGeoData(clientIp);
        console.log(`[地理位置] 获取到数据: ${JSON.stringify(geoData)}`);
        const [lat, lon] = geoData.loc.split(',');
        // 获取天气信息
        const weatherData = await getWeatherDataWithCache(lat, lon);
        console.log(`[天气] 获取到数据: ${JSON.stringify(weatherData)}`);
        // 获取用户代理信息
        const userAgent = req.headers['user-agent'] || '';
        const systemInfo = (0, helpers_1.parseUserAgent)(userAgent);
        console.log(`[系统信息] 操作系统: ${systemInfo.os}, 浏览器: ${systemInfo.browser}`);
        // 获取一言
        let hitokoto = cacheService_1.cacheService.getHitokotoCache();
        if (!hitokoto) {
            hitokoto = await (0, hitokotoService_1.getHitokoto)();
            cacheService_1.cacheService.setHitokotoCache(hitokoto);
        }
        // 准备签名数据
        const signatureData = {
            ip: geoData.ip,
            location: (0, helpers_1.formatLocation)(geoData.city, geoData.region, geoData.country),
            time: (0, helpers_1.getCurrentTime)(geoData.timezone),
            weather: weatherData,
            systemInfo,
            hitokoto
        };
        console.log(`[签名数据] 准备生成图片: ${JSON.stringify(signatureData)}`);
        // 生成图片
        const imageBuffer = await (0, imageService_1.generateSignatureImage)(signatureData);
        // 设置响应头
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        // 发送图片
        res.send(imageBuffer);
        console.log(`[响应] 成功发送签名图片 (大小: ${imageBuffer.length} 字节)`);
    }
    catch (error) {
        console.error('[错误] 生成签名时出错:', error);
        // 在调试模式下发送详细错误
        if (process.env.DEBUG === 'true') {
            res.status(500).send(`<pre>Error: ${error instanceof Error ? error.stack : error}</pre>`);
        }
        else {
            // 返回错误图片
            res.set('Content-Type', 'image/png');
            const errorImage = (0, imageService_1.createErrorImage)('生成签名图片时出错');
            res.send(errorImage);
        }
    }
});
// 定期清理过期缓存
setInterval(() => {
    cacheService_1.cacheService.cleanExpiredCache();
}, 60 * 60 * 1000); // 每小时清理一次
// 启动服务器
async function startServer() {
    try {
        // 初始化背景服务
        await (0, backgroundService_1.initBackgroundService)();
        // 启动HTTP服务器
        app.listen(PORT, () => {
            console.log(`[服务器] 正在运行: http://localhost:${PORT}`);
            console.log(`[服务器] 签名端点: http://localhost:${PORT}/signature`);
            console.log('[缓存] IP数据缓存时间: 长期');
            console.log('[缓存] 天气数据缓存时间: 30分钟');
            console.log('[缓存] 一言数据缓存时间: 5分钟');
        });
    }
    catch (error) {
        console.error('[错误] 服务器启动失败:', error);
        process.exit(1);
    }
}
// 启动服务器
startServer();
