import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createCanvas, loadImage, Canvas } from 'canvas';

// 缓存目录
const CACHE_DIR = path.resolve(__dirname, '../../cache');

// 支持的图片格式
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif'];

// 缓存背景图片路径
let cachedImagePath: string | null = null;

// 获取图片格式
function getImageFormat(url: string): string {
  const format = url.split('.').pop()?.toLowerCase() || '';
  return format.split('?')[0]; // 移除URL参数
}

// 检查图片格式是否支持
function isSupportedFormat(format: string): boolean {
  return SUPPORTED_FORMATS.includes(format);
}

// 下载图片
async function downloadImage(url: string, filePath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer'
  });

  // 检查Content-Type
  const contentType = response.headers['content-type'];
  if (!contentType.startsWith('image/')) {
    throw new Error('下载的文件不是图片');
  }

  // 检查格式是否支持
  const format = contentType.split('/')[1];
  if (!isSupportedFormat(format)) {
    throw new Error(`不支持的图片格式: ${format}，请使用 ${SUPPORTED_FORMATS.join(', ')} 格式的图片`);
  }

  await fs.writeFile(filePath, response.data);
}

// 确保缓存目录存在
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// 初始化背景服务
export async function initBackgroundService(): Promise<void> {
  console.log('[背景] 正在初始化背景服务...');
  try {
    const imagePath = await getBackgroundImage();
    cachedImagePath = imagePath;
    // 预加载图片以验证其有效性
    await loadImage(imagePath);
    console.log('[背景] 背景服务初始化成功');
  } catch (error) {
    console.error('[背景] 初始化失败:', error instanceof Error ? error.message : error);
    // 不抛出错误，让服务继续启动，使用备用背景
  }
}

// 获取背景图片
export async function getBackgroundImage(): Promise<string> {
  // 如果已经缓存了图片路径且文件存在，直接返回
  if (cachedImagePath) {
    try {
      await fs.access(cachedImagePath);
      return cachedImagePath;
    } catch {
      // 文件不存在，清除缓存
      cachedImagePath = null;
    }
  }

  const bgUrl = process.env.BACKGROUND_IMAGE_URL;
  if (!bgUrl) {
    throw new Error('未设置背景图片URL (BACKGROUND_IMAGE_URL)');
  }

  // 检查URL中的图片格式
  const format = getImageFormat(bgUrl);
  if (!isSupportedFormat(format)) {
    throw new Error(`不支持的图片格式: ${format}，请使用 ${SUPPORTED_FORMATS.join(', ')} 格式的图片`);
  }

  await ensureCacheDir();

  // 生成文件名和路径
  const urlMd5 = crypto.createHash('md5').update(bgUrl).digest('hex');
  const imagePath = path.join(CACHE_DIR, `${urlMd5}.${format}`);

  try {
    // 检查文件是否存在
    await fs.access(imagePath);
    console.log('[背景] 使用缓存的背景图片');
    cachedImagePath = imagePath;
    return imagePath;
  } catch {
    // 文件不存在，下载图片
    console.log('[背景] 下载新的背景图片');
    try {
      await downloadImage(bgUrl, imagePath);
      cachedImagePath = imagePath;
      return imagePath;
    } catch (error) {
      throw new Error(`下载背景图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 调整图片大小并返回Canvas
export async function prepareBackground(width: number, height: number): Promise<Canvas> {
  const imagePath = await getBackgroundImage();
  const image = await loadImage(imagePath);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 计算缩放比例以覆盖整个画布
  const scale = Math.max(width / image.width, height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;

  // 居中绘制图片
  const x = (width - scaledWidth) / 2;
  const y = (height - scaledHeight) / 2;

  // 绘制图片
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  // 添加半透明遮罩使文字更清晰
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, width, height);

  return canvas;
}
