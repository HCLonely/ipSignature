/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:57:01
 * @LastEditTime : 2025-06-27 22:20:00
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/imageService.ts
 * @Description  : 图片生成服务
 */
import { createCanvas, loadImage, registerFont } from 'canvas';
import { SignatureData } from '../types/types';
import { getWeatherIconUrl } from '../utils/helpers';
import path from 'path';
import { prepareBackground } from './backgroundService';

// 注册中文字体
const fontsDir = path.resolve(__dirname, '../../assets/fonts');
registerFont(path.join(fontsDir, 'SourceHanSansSC-Regular.otf'), {
  family: 'Source Han Sans SC',
  weight: 'normal'
});
registerFont(path.join(fontsDir, 'SourceHanSansSC-Bold.otf'), {
  family: 'Source Han Sans SC',
  weight: 'bold'
});
registerFont(path.join(fontsDir, 'oldenglishtextmt.ttf'), {
  family: 'Old English Text MT'
});

// 加载图标
const netIcon = loadImage(path.resolve(__dirname, '../../assets/images/net.png'));
const weatherIcon = loadImage(path.resolve(__dirname, '../../assets/images/weather.png'));

// 布局参数接口
interface LayoutParams {
  width: number;
  height: number;
  padding: number;
  sectionSpacing: number;
  lineHeight: number;
}

export async function generateSignatureImage(data: SignatureData): Promise<Buffer> {
  // 布局参数
  const layout: LayoutParams = {
    width: 700,
    height: 420,
    padding: 25,
    sectionSpacing: 45,
    lineHeight: 35
  };

  // 创建画布
  const canvas = createCanvas(layout.width, layout.height);
  const ctx = canvas.getContext('2d');

  // 使用背景图片
  try {
    const backgroundCanvas = await prepareBackground(layout.width, layout.height);
    ctx.drawImage(backgroundCanvas, 0, 0);
  } catch (error) {
    console.error('[错误] 加载背景图片失败:', error);
    // 使用渐变色作为备用背景
    const gradient = ctx.createLinearGradient(0, 0, layout.width, layout.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(0.5, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, layout.width, layout.height);
  }

  // 添加纹理效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < layout.height; i += 3) {
    ctx.fillRect(0, i, layout.width, 1);
  }

  // 添加水印和版权信息
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const smallFont = '14px "Source Han Sans SC"';
  ctx.font = smallFont;

  // 添加版权信息（左对齐）
  ctx.textAlign = 'left';
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearStr = currentYear > startYear ? `${startYear}-${currentYear}` : startYear.toString();
  ctx.fillText(`© ${yearStr} Powered by HCLonely`, 10, layout.height - 8);

  // 添加日期水印（右对齐）
  ctx.textAlign = 'right';
  const dateOptions1: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const dateOptions2: Intl.DateTimeFormatOptions = {
    weekday: 'long'
  };
  const dateStr = new Intl.DateTimeFormat('zh-CN', dateOptions1).format(new Date());
  const weekStr = new Intl.DateTimeFormat('zh-CN', dateOptions2).format(new Date());
  ctx.fillText(
    'IP 签名服务器 • ' + dateStr + ' ' + weekStr,
    layout.width - 10,
    layout.height - 8
  );

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 添加主要内容区域
  const contentX = layout.padding;
  const contentY = layout.padding;
  const contentWidth = layout.width - layout.padding * 2;
  const contentHeight = layout.height - layout.padding * 2;

  // 绘制圆角矩形
  ctx.beginPath();
  ctx.moveTo(contentX + 10, contentY);
  ctx.lineTo(contentX + contentWidth - 10, contentY);
  ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + 10);
  ctx.lineTo(contentX + contentWidth, contentY + contentHeight - 10);
  ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - 10, contentY + contentHeight);
  ctx.lineTo(contentX + 10, contentY + contentHeight);
  ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - 10);
  ctx.lineTo(contentX, contentY + 10);
  ctx.quadraticCurveTo(contentX, contentY, contentX + 10, contentY);
  ctx.closePath();

  // 添加阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;

  // 填充半透明背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fill();

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 设置字体
  const titleFont = '36px "Old English Text MT"';
  const headerFont = 'bold 24px "Source Han Sans SC"';
  const textFont = '20px "Source Han Sans SC"';

  // 当前位置跟踪
  let currentY = layout.padding + 35;

  // 绘制标题
  ctx.fillStyle = '#ffffff';
  ctx.font = titleFont;
  ctx.textAlign = 'center';
  ctx.fillText('IP Signature'.toUpperCase(), layout.width / 2, currentY);
  ctx.textAlign = 'left';

  // 绘制发光分隔线
  ctx.beginPath();
  ctx.moveTo(layout.padding + 15, currentY + 15);
  ctx.lineTo(layout.width - layout.padding - 15, currentY + 15);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 添加发光效果
  ctx.beginPath();
  ctx.moveTo(layout.padding + 15, currentY + 15);
  ctx.lineTo(layout.width - layout.padding - 15, currentY + 15);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 移动到下一部分
  currentY += layout.sectionSpacing + 20;

  // 绘制IP信息
  ctx.font = headerFont;
  ctx.fillStyle = '#ffffff';

  // 添加定位图标
  const icon = await netIcon;
  ctx.drawImage(icon, layout.padding + 15, currentY - 22, 26, 26);

  // 绘制网络信息标题
  ctx.font = headerFont;
  ctx.fillText('网络信息', layout.padding + 45, currentY);

  // 移动到信息行
  currentY += layout.lineHeight;

  // 文字阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // 设置标签颜色（白色）
  ctx.fillStyle = '#ffffff';
  ctx.font = textFont;

  // IP地址
  const ipLabel = 'IP 地址: ';
  const ipLabelWidth = ctx.measureText(ipLabel).width;
  ctx.fillText(ipLabel, layout.padding + 25, currentY);

  // IP值使用浅蓝色
  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  const ipValue = data.ip;
  ctx.fillText(ipValue, layout.padding + 25 + ipLabelWidth, currentY);

  // 操作系统（在右侧）
  ctx.fillStyle = '#ffffff';
  const osLabel = '操作系统: ';
  const osLabelWidth = ctx.measureText(osLabel).width;
  const rightColumnX = layout.width / 2 + 50; // 右侧列的起始位置
  ctx.fillText(osLabel, rightColumnX, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.systemInfo.os, rightColumnX + osLabelWidth, currentY);
  currentY += layout.lineHeight;

  // 地理位置
  ctx.fillStyle = '#ffffff';
  const locationLabel = '地理位置: ';
  const locationLabelWidth = ctx.measureText(locationLabel).width;
  ctx.fillText(locationLabel, layout.padding + 25, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.location, layout.padding + 25 + locationLabelWidth, currentY);

  // 浏览器（在右侧）
  ctx.fillStyle = '#ffffff';
  const browserLabel = '浏览器: ';
  const browserLabelWidth = ctx.measureText(browserLabel).width;
  ctx.fillText(browserLabel, rightColumnX, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.systemInfo.browser, rightColumnX + browserLabelWidth, currentY);
  currentY += layout.lineHeight;

  // 当地时间
  ctx.fillStyle = '#ffffff';
  const timeLabel = '当地时间: ';
  const timeLabelWidth = ctx.measureText(timeLabel).width;
  ctx.fillText(timeLabel, layout.padding + 25, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.time, layout.padding + 25 + timeLabelWidth, currentY);
  currentY += layout.lineHeight;

  // 移动到天气部分
  currentY += layout.sectionSpacing - layout.lineHeight;

  // 绘制天气信息标题
  ctx.font = headerFont;

  // 添加温度计图标
  const tempIcon = await weatherIcon;
  ctx.drawImage(tempIcon, layout.padding + 15, currentY - 26, 26, 26);

  // 绘制天气信息标题
  ctx.font = headerFont;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('天气信息', layout.padding + 45, currentY);

  // 移动到天气行
  currentY += layout.lineHeight;

  // 天气图标位置
  const weatherIconX = layout.width - layout.padding - 100;
  const weatherIconY = currentY - 45;

  // 绘制天气描述
  ctx.font = textFont;
  ctx.fillStyle = '#ffffff';
  const weatherLabel = '天气状况: ';
  const weatherLabelWidth = ctx.measureText(weatherLabel).width;
  ctx.fillText(weatherLabel, layout.padding + 25, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.weather.weather.description, layout.padding + 25 + weatherLabelWidth, currentY);

  // 移动到温度行
  currentY += layout.lineHeight;

  // 绘制温度信息
  ctx.fillStyle = '#ffffff';
  const tempLabel = '温度: ';
  const tempLabelWidth = ctx.measureText(tempLabel).width;
  ctx.fillText(tempLabel, layout.padding + 25, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  const tempValue = `${data.weather.temp.toFixed(1)}°C`;
  const tempValueWidth = ctx.measureText(tempValue).width;
  ctx.fillText(tempValue, layout.padding + 25 + tempLabelWidth, currentY);

  // 体感温度
  ctx.fillStyle = '#ffffff';
  const feelsLikeLabel = '体感温度: ';
  const feelsLikeLabelWidth = ctx.measureText(feelsLikeLabel).width;
  ctx.fillText(feelsLikeLabel, layout.padding + 25 + tempLabelWidth + tempValueWidth + 25, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  const feelsLikeValue = `${data.weather.feels_like.toFixed(1)}°C`;
  const feelsLikeValueWidth = ctx.measureText(feelsLikeValue).width;
  ctx.fillText(feelsLikeValue, layout.padding + 25 + tempLabelWidth + tempValueWidth + 25 + feelsLikeLabelWidth, currentY);

  // 湿度
  ctx.fillStyle = '#ffffff';
  const humidityLabel = '湿度: ';
  const humidityLabelWidth = ctx.measureText(humidityLabel).width;
  ctx.fillText(humidityLabel, layout.padding + 25 + tempLabelWidth + tempValueWidth + feelsLikeLabelWidth + feelsLikeValueWidth + 50, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(`${data.weather.humidity}%`, layout.padding + 25 + tempLabelWidth + tempValueWidth + feelsLikeLabelWidth + feelsLikeValueWidth + 50 + humidityLabelWidth, currentY);

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 绘制天气图标
  try {
    const iconUrl = getWeatherIconUrl(data.weather.weather.icon);
    const icon = await loadImage(iconUrl);

    // 添加发光背景
    const gradient = ctx.createRadialGradient(
      weatherIconX + 35, weatherIconY + 35, 0,
      weatherIconX + 35, weatherIconY + 35, 40
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(weatherIconX + 35, weatherIconY + 35, 40, 0, Math.PI * 2);
    ctx.fill();

    // 绘制图标
    ctx.drawImage(icon, weatherIconX, weatherIconY, 70, 70);

    // 添加天气状态文字
    ctx.font = 'bold 18px "Source Han Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.fillText(data.weather.weather.main, weatherIconX + 35, weatherIconY + 85);
  } catch (error) {
    console.error('加载天气图标出错:', error);
    ctx.font = textFont;
    ctx.textAlign = 'left';
    ctx.fillText('[无法加载天气图标]', weatherIconX, weatherIconY);
  }

  // 添加一言
  ctx.font = '16px "Source Han Sans SC"';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillText(`『 ${data.hitokoto} 』`, layout.width / 2, layout.height - 35);

  return canvas.toBuffer('image/png');
}

// 错误图片生成函数（中文）
export function createErrorImage(message: string): Buffer {
  const width = 600;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#ffcccc';
  ctx.fillRect(0, 0, width, height);

  // 边框
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // 错误文本
  ctx.fillStyle = '#990000';

  // 注册中文字体（错误处理时也需要）
  try {
    const fontsDir = path.resolve(__dirname, '../../assets/fonts');
    registerFont(path.join(fontsDir, 'SourceHanSansSC-Bold.otf'), {
      family: 'Source Han Sans SC',
      weight: 'bold'
    });
    ctx.font = 'bold 24px "Source Han Sans SC"';
  } catch (e) {
    ctx.font = 'bold 24px sans-serif';
  }

  ctx.textAlign = 'center';
  ctx.fillText('签名生成错误', width / 2, 60);

  ctx.fillStyle = '#660000';

  try {
    ctx.font = '18px "Source Han Sans SC"';
  } catch (e) {
    ctx.font = '18px sans-serif';
  }

  ctx.fillText(message, width / 2, 110);

  try {
    ctx.font = '14px "Source Han Sans SC"';
  } catch (e) {
    ctx.font = '14px sans-serif';
  }

  ctx.fillText('请检查服务器日志获取详细信息', width / 2, 150);

  return canvas.toBuffer('image/png');
}
