/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 15:10:15
 * @LastEditTime : 2025-06-27 22:34:39
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/backgroundService.ts
 * @Description  : 背景图片服务
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createCanvas, loadImage, Canvas, Image } from 'canvas';

// 缓存目录
const CACHE_DIR = path.resolve(__dirname, '../../cache');

// 支持的图片格式
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif'];

// 缓存背景图片路径或实例
let cachedImage: string | Image | null = null;

// 内存缓存
interface MemoryCache {
  buffer: Buffer;
  format: string;
  timestamp: number;
  image: Image | null;
}

let memoryCache: MemoryCache | null = null;
let isMemoryOnly = false;

// 获取图片格式
function getImageFormat(url: string): string {
  const format = url.split('.').pop()?.toLowerCase() || '';
  return format.split('?')[0]; // 移除URL参数
}

// 检查图片格式是否支持
function isSupportedFormat(format: string): boolean {
  return SUPPORTED_FORMATS.includes(format);
}

// 检查文件系统权限
async function checkFileSystemPermissions(): Promise<boolean> {
  try {
    const testFile = path.join(CACHE_DIR, '.write-test');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    return true;
  } catch (error) {
    console.warn('[背景] 文件系统不可写，将使用内存缓存');
    return false;
  }
}

// 从Buffer加载图片
async function loadImageFromBuffer(buffer: Buffer): Promise<Image> {
  return loadImage(buffer);
}

// 下载图片
async function downloadImage(url: string, filePath: string): Promise<Buffer> {
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

  const buffer = Buffer.from(response.data);

  if (!isMemoryOnly) {
    await fs.writeFile(filePath, buffer);
  }

  return buffer;
}

// 初始化背景服务
export async function initBackgroundService(): Promise<void> {
  console.log('[背景] 正在初始化背景服务...');
  try {
    // 检查文件系统权限
    const hasWritePermission = await checkFileSystemPermissions();
    isMemoryOnly = !hasWritePermission;

    if (isMemoryOnly) {
      console.log('[背景] 使用内存缓存模式');
    }

    const image = await getBackgroundImage();
    cachedImage = image;
    // 预加载图片以验证其有效性
    if (typeof image === 'string') {
      await loadImage(image);
    }
    console.log('[背景] 背景服务初始化成功');
  } catch (error) {
    console.error('[背景] 初始化失败:', error instanceof Error ? error.message : error);
    // 不抛出错误，让服务继续启动，使用备用背景
  }
}

// 获取背景图片
export async function getBackgroundImage(): Promise<string | Image> {
  const bgUrl = process.env.BACKGROUND_IMAGE_URL;

  // 如果未设置背景图片URL，使用默认背景
  if (!bgUrl) {
    console.log('[背景] 未设置背景图片URL (BACKGROUND_IMAGE_URL), 使用默认背景图片');
    return path.resolve(__dirname, '../../assets/images/default.png');
  }

  // 检查URL中的图片格式
  const format = getImageFormat(bgUrl);
  if (!isSupportedFormat(format)) {
    throw new Error(`不支持的图片格式: ${format}，请使用 ${SUPPORTED_FORMATS.join(', ')} 格式的图片`);
  }

  // 生成文件名和路径
  const urlMd5 = crypto.createHash('md5').update(bgUrl).digest('hex');
  const imagePath = path.join(CACHE_DIR, `${urlMd5}.${format}`);

  // 内存模式
  if (isMemoryOnly) {
    if (memoryCache && memoryCache.format === format) {
      // 使用缓存的图片实例
      if (memoryCache.image) {
        return memoryCache.image;
      }
      // 如果没有图片实例，从buffer加载
      try {
        const image = await loadImageFromBuffer(memoryCache.buffer);
        memoryCache.image = image;
        return image;
      } catch (error) {
        console.warn('[背景] 从缓存加载图片失败，重新下载');
        memoryCache = null;
      }
    }

    // 下载到内存
    console.log('[背景] 下载新的背景图片到内存');
    try {
      const buffer = await downloadImage(bgUrl, imagePath);
      const image = await loadImageFromBuffer(buffer);
      memoryCache = {
        buffer,
        format,
        timestamp: Date.now(),
        image
      };
      return image;
    } catch (error) {
      throw new Error(`下载背景图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 文件系统模式
  try {
    // 检查文件是否存在
    await fs.access(imagePath);
    console.log('[背景] 使用缓存的背景图片');
    cachedImage = imagePath;
    return imagePath;
  } catch {
    // 文件不存在，下载图片
    console.log('[背景] 下载新的背景图片');
    try {
      await downloadImage(bgUrl, imagePath);
      cachedImage = imagePath;
      return imagePath;
    } catch (error) {
      throw new Error(`下载背景图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 调整图片大小并返回Canvas
export async function prepareBackground(width: number, height: number): Promise<Canvas> {
  const imagePathOrImage = await getBackgroundImage();
  const image = typeof imagePathOrImage === 'string' ? await loadImage(imagePathOrImage) : imagePathOrImage;

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
