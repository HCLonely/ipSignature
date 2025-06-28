/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:57:01
 * @LastEditTime : 2025-06-28 17:51:40
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/imageService.ts
 * @Description  : 图片生成服务
 */
import { createCanvas, loadImage, registerFont } from 'canvas';
import { SignatureData } from '../types/types';
import { getWeatherIconUrl } from '../utils/helpers';
import path from 'path';
import { prepareBackground } from './backgroundService';

// 注册字体
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

// 默认图片尺寸
const DEFAULT_WIDTH = 752;
const DEFAULT_HEIGHT = 423;

// 计算缩放后的尺寸
function calculateScaledDimensions(width: number | undefined, height: number | undefined): { width: number; height: number } {
  // 如果没有指定任何尺寸，使用默认尺寸
  if (!width && !height) {
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }

  // 如果指定了高度，按高度等比例缩放
  if (height) {
    const scale = height / DEFAULT_HEIGHT;
    return {
      width: Math.round(DEFAULT_WIDTH * scale),
      height
    };
  }

  // 如果只指定了宽度，按宽度等比例缩放
  if (width) {
    const scale = width / DEFAULT_WIDTH;
    return {
      width,
      height: Math.round(DEFAULT_HEIGHT * scale)
    };
  }

  // 默认返回原始尺寸（不应该到达这里）
  return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
}

export async function generateSignatureImage(data: SignatureData, width?: number, height?: number): Promise<Buffer> {
  // 计算最终尺寸
  const dimensions = calculateScaledDimensions(width, height);
  console.log(`[图片] 生成尺寸: ${dimensions.width}x${dimensions.height}`);

  // 创建画布
  const canvas = await prepareBackground(dimensions.width, dimensions.height);
  const ctx = canvas.getContext('2d');

  // 保存当前状态
  ctx.save();

  // 设置字体
  const scale = dimensions.height / DEFAULT_HEIGHT;
  const fontSize = Math.round(20 * scale);
  const headerFontSize = Math.round(28 * scale);
  const titleFontSize = Math.round(36 * scale);

  // 设置布局参数
  const padding = Math.round(25 * scale);
  const lineHeight = Math.round(35 * scale);
  const sectionSpacing = Math.round(45 * scale);

  // 使用背景图片
  try {
    const backgroundCanvas = await prepareBackground(dimensions.width, dimensions.height);
    ctx.drawImage(backgroundCanvas, 0, 0);
  } catch (error) {
    console.error('[错误] 加载背景图片失败:', error);
    // 使用渐变色作为备用背景
    const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(0.5, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  // 添加纹理效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < dimensions.height; i += 3) {
    ctx.fillRect(0, i, dimensions.width, 1);
  }

  // 添加水印和版权信息
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const smallFont = `${Math.round(16 * scale)}px "Source Han Sans SC"`;
  ctx.font = smallFont;

  // 添加版权信息（左对齐）
  ctx.textAlign = 'left';
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearStr = currentYear > startYear ? `${startYear}-${currentYear}` : startYear.toString();
  ctx.fillText(`© ${yearStr} Powered by HCLonely`, 10, dimensions.height - 8);

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
    dimensions.width - 10,
    dimensions.height - 8
  );

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 添加主要内容区域
  const contentX = padding;
  const contentY = padding;
  const contentWidth = dimensions.width - padding * 2;
  const contentHeight = dimensions.height - padding * 2;

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
  const titleFont = `${titleFontSize}px "Old English Text MT"`;
  const headerFont = `bold ${headerFontSize}px "Source Han Sans SC"`;
  const textFont = `${fontSize}px "Source Han Sans SC"`;

  // 当前位置跟踪
  let currentY = padding + Math.round(35 * scale);

  // 绘制标题
  ctx.fillStyle = '#ffffff';
  ctx.font = titleFont;
  ctx.textAlign = 'center';

  // 添加标题阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = Math.round(4 * scale);
  ctx.shadowOffsetX = Math.round(2 * scale);
  ctx.shadowOffsetY = Math.round(2 * scale);

  ctx.fillText('welcome'.toUpperCase(), dimensions.width / 2, currentY);
  ctx.textAlign = 'left';

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 绘制发光分隔线
  const lineY = currentY + Math.round(15 * scale);
  const lineStartX = padding + Math.round(15 * scale);
  const lineEndX = dimensions.width - padding - Math.round(15 * scale);

  // 主分隔线
  ctx.beginPath();
  ctx.moveTo(lineStartX, lineY);
  ctx.lineTo(lineEndX, lineY);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = Math.round(2 * scale);
  ctx.stroke();

  // 发光效果
  ctx.beginPath();
  ctx.moveTo(lineStartX, lineY);
  ctx.lineTo(lineEndX, lineY);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = Math.round(4 * scale);
  ctx.stroke();

  // 移动到下一部分
  currentY += Math.round(sectionSpacing * 1.2);

  // 绘制IP信息
  ctx.font = headerFont;
  ctx.fillStyle = '#ffffff';

  // 添加定位图标
  const icon = await netIcon;
  const iconSize = Math.round(24 * scale);
  const iconOffset = Math.round(22 * scale);
  const iconPadding = Math.round(10 * scale);
  const titleOffset = Math.round(35 * scale);
  ctx.drawImage(icon, padding + iconPadding, currentY - iconOffset, iconSize, iconSize);

  // 绘制网络信息标题
  ctx.font = headerFont;
  ctx.fillText('网络信息', padding + iconPadding + iconSize + Math.round(10 * scale), currentY);

  // 移动到信息行
  currentY += lineHeight;

  // 文字阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = Math.round(3 * scale);
  ctx.shadowOffsetX = Math.round(1 * scale);
  ctx.shadowOffsetY = Math.round(1 * scale);

  // 设置标签颜色（白色）
  ctx.fillStyle = '#ffffff';
  ctx.font = textFont;

  // IP地址
  const ipLabel = 'IP 地址: ';
  const ipLabelWidth = ctx.measureText(ipLabel).width;
  const textPadding = Math.round(25 * scale);
  ctx.fillText(ipLabel, padding + textPadding, currentY);

  // IP值使用浅蓝色
  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  const ipValue = data.ip;
  ctx.fillText(ipValue, padding + textPadding + ipLabelWidth, currentY);

  // 操作系统（在右侧）
  ctx.fillStyle = '#ffffff';
  const osLabel = '操作系统: ';
  const osLabelWidth = ctx.measureText(osLabel).width;
  const rightColumnX = dimensions.width / 2 + 50; // 右侧列的起始位置
  ctx.fillText(osLabel, rightColumnX, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.systemInfo.os, rightColumnX + osLabelWidth, currentY);
  currentY += lineHeight;

  // 地理位置
  ctx.fillStyle = '#ffffff';
  const locationLabel = '地理位置: ';
  const locationLabelWidth = ctx.measureText(locationLabel).width;
  ctx.fillText(locationLabel, padding + textPadding, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.location, padding + textPadding + locationLabelWidth, currentY);

  // 浏览器（在右侧）
  ctx.fillStyle = '#ffffff';
  const browserLabel = '浏览器: ';
  const browserLabelWidth = ctx.measureText(browserLabel).width;
  ctx.fillText(browserLabel, rightColumnX, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.systemInfo.browser, rightColumnX + browserLabelWidth, currentY);
  currentY += lineHeight;

  // 当地时间
  ctx.fillStyle = '#ffffff';
  const timeLabel = '当地时间: ';
  const timeLabelWidth = ctx.measureText(timeLabel).width;
  ctx.fillText(timeLabel, padding + textPadding, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.time, padding + textPadding + timeLabelWidth, currentY);
  currentY += lineHeight;

  // 移动到天气部分
  currentY += sectionSpacing - lineHeight + 10;

  // 绘制天气信息标题
  ctx.font = headerFont;

  // 添加温度计图标
  const tempIcon = await weatherIcon;
  ctx.drawImage(tempIcon, padding + iconPadding, currentY - iconOffset, iconSize, iconSize);

  // 绘制天气信息标题
  ctx.font = headerFont;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('天气信息', padding + iconPadding + iconSize + Math.round(10 * scale), currentY);

  // 移动到天气行
  currentY += lineHeight;

  // 天气图标位置
  const weatherIconX = dimensions.width - padding - Math.round(550 * scale);
  const weatherIconY = currentY - Math.round(72 * scale);

  // 绘制天气描述
  ctx.font = textFont;
  ctx.fillStyle = '#ffffff';
  const weatherLabel = '天气状况: ';
  const weatherLabelWidth = ctx.measureText(weatherLabel).width;
  ctx.fillText(weatherLabel, padding + textPadding, currentY);

  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(data.weather.weather.description, padding + textPadding + weatherLabelWidth, currentY);

  // 移动到温度行
  currentY += lineHeight;

  // 计算温度信息的布局
  const columnGap = Math.round(25 * scale);
  let currentX = padding + textPadding;

  // 绘制温度信息
  ctx.fillStyle = '#ffffff';
  const tempLabel = '温度: ';
  const tempLabelWidth = ctx.measureText(tempLabel).width;
  ctx.fillText(tempLabel, currentX, currentY);

  currentX += tempLabelWidth;
  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  const tempValue = `${data.weather.temp.toFixed(1)}°C`;
  const tempValueWidth = ctx.measureText(tempValue).width;
  ctx.fillText(tempValue, currentX, currentY);

  // 体感温度
  currentX += tempValueWidth + columnGap;
  ctx.fillStyle = '#ffffff';
  const feelsLikeLabel = '体感温度: ';
  const feelsLikeLabelWidth = ctx.measureText(feelsLikeLabel).width;
  ctx.fillText(feelsLikeLabel, currentX, currentY);

  currentX += feelsLikeLabelWidth;
  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  const feelsLikeValue = `${data.weather.feels_like.toFixed(1)}°C`;
  const feelsLikeValueWidth = ctx.measureText(feelsLikeValue).width;
  ctx.fillText(feelsLikeValue, currentX, currentY);

  // 湿度
  currentX += feelsLikeValueWidth + columnGap;
  ctx.fillStyle = '#ffffff';
  const humidityLabel = '湿度: ';
  const humidityLabelWidth = ctx.measureText(humidityLabel).width;
  ctx.fillText(humidityLabel, currentX, currentY);

  currentX += humidityLabelWidth;
  ctx.fillStyle = 'rgba(135, 206, 250, 0.95)';
  ctx.fillText(`${data.weather.humidity}%`, currentX, currentY);

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 绘制天气图标
  try {
    const iconUrl = getWeatherIconUrl(data.weather.weather.icon);
    const icon = await loadImage(iconUrl);
    const weatherIconSize = Math.round(50 * scale);
    const glowRadius = Math.round(30 * scale);

    // 添加发光背景
    const gradient = ctx.createRadialGradient(
      weatherIconX + weatherIconSize/2, weatherIconY + weatherIconSize/2, 0,
      weatherIconX + weatherIconSize/2, weatherIconY + weatherIconSize/2, glowRadius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(weatherIconX + weatherIconSize/2, weatherIconY + weatherIconSize/2, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制图标
    ctx.drawImage(icon, weatherIconX, weatherIconY, weatherIconSize, weatherIconSize);
  } catch (error) {
    console.error('加载天气图标出错:', error);
    ctx.font = textFont;
    ctx.textAlign = 'left';
    ctx.fillText('[无法加载天气图标]', weatherIconX, weatherIconY);
  }

  // 添加一言
  const hitokotoFontSize = Math.round(16 * scale);
  const hitokotoY = dimensions.height - Math.round(30 * scale);
  ctx.font = `${hitokotoFontSize}px "Source Han Sans SC"`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = Math.round(2 * scale);
  ctx.shadowOffsetX = Math.round(1 * scale);
  ctx.shadowOffsetY = Math.round(1 * scale);
  ctx.fillText(`『 ${data.hitokoto} 』`, dimensions.width / 2, hitokotoY);

  // 恢复状态
  ctx.restore();

  // 返回图片buffer
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
