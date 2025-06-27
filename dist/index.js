"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:57:15
 * @LastEditTime : 2025-06-27 09:58:53
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/index.ts
 * @Description  :
 */
const express_1 = __importDefault(require("express"));
const request_ip_1 = __importDefault(require("request-ip"));
const geoService_1 = require("./services/geoService");
const weatherService_1 = require("./services/weatherService");
const imageService_1 = require("./services/imageService");
const helpers_1 = require("./utils/helpers");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 中间件
app.use(request_ip_1.default.mw());
// 路由
app.get('/signature', async (req, res) => {
    try {
        // 获取客户端IP
        const clientIp = req.clientIp || req.ip;
        if (!clientIp) {
            res.status(400).send('Invalid IP address');
            return;
        }
        // 获取地理位置信息
        const geoData = await (0, geoService_1.getGeoData)(clientIp);
        const [lat, lon] = geoData.loc.split(',');
        // 获取天气信息
        const weatherData = await (0, weatherService_1.getWeatherData)(lat, lon);
        // 准备签名数据
        const signatureData = {
            ip: geoData.ip,
            location: (0, helpers_1.formatLocation)(geoData.city, geoData.region, geoData.country),
            time: (0, helpers_1.getCurrentTime)(geoData.timezone),
            weather: weatherData
        };
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
    }
    catch (error) {
        console.error('Error generating signature:', error);
        res.status(500).send('Error generating signature image');
    }
});
// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map