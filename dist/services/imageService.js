"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignatureImage = generateSignatureImage;
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:57:01
 * @LastEditTime : 2025-06-27 09:57:01
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/imageService.ts
 * @Description  :
 */
const canvas_1 = require("canvas");
const helpers_1 = require("../utils/helpers");
async function generateSignatureImage(data) {
    const width = 600;
    const height = 300;
    // 创建画布
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a2a6c');
    gradient.addColorStop(0.5, '#b21f1f');
    gradient.addColorStop(1, '#fdbb2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    // 添加半透明层
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(20, 20, width - 40, height - 40);
    // 设置文本样式
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    // 绘制标题
    ctx.fillText('IP Signature Card', 40, 60);
    // 绘制分隔线
    ctx.beginPath();
    ctx.moveTo(40, 80);
    ctx.lineTo(width - 40, 80);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 绘制信息
    ctx.font = '18px Arial';
    ctx.fillText(`IP Address: ${data.ip}`, 40, 120);
    ctx.fillText(`Location: ${data.location}`, 40, 150);
    ctx.fillText(`Local Time: ${data.time}`, 40, 180);
    // 绘制天气信息
    ctx.fillText('Weather:', 40, 220);
    ctx.fillText(`${data.weather.weather.description}`, 120, 220);
    ctx.fillText(`Temp: ${data.weather.temp.toFixed(1)}°C`, 40, 250);
    ctx.fillText(`Humidity: ${data.weather.humidity}%`, 200, 250);
    ctx.fillText(`Wind: ${data.weather.wind_speed.toFixed(1)} m/s`, 360, 250);
    // 加载并绘制天气图标
    try {
        const iconUrl = (0, helpers_1.getWeatherIconUrl)(data.weather.weather.icon);
        const icon = await (0, canvas_1.loadImage)(iconUrl);
        ctx.drawImage(icon, 480, 190, 80, 80);
    }
    catch (error) {
        console.error('Error loading weather icon:', error);
    }
    // 添加水印
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'italic 12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('IP Signature Server • Generated on ' + new Date().toLocaleString(), width - 20, height - 20);
    return canvas.toBuffer('image/png');
}
//# sourceMappingURL=imageService.js.map