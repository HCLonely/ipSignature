/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 15:10:15
 * @LastEditTime : 2025-06-27 15:12:26
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/cacheService.ts
 * @Description  : 缓存服务
 */

import { GeoData, WeatherData } from '../types/types';
import fs from 'fs';
import path from 'path';

interface CacheData {
  data: GeoData | WeatherData | string;
  timestamp: number;
}

interface CacheStore {
  [key: string]: CacheData;
}

class CacheService {
  private static instance: CacheService;
  private geoCache: CacheStore = {};
  private weatherCache: CacheStore = {};
  private hitokotoCache: CacheStore = {};
  private readonly weatherCacheDuration = 30 * 60 * 1000;  // 30分钟
  private readonly hitokotoCacheDuration = 5 * 60 * 1000;  // 5分钟
  private readonly geoCacheFile = path.join(process.cwd(), 'cache/data', 'geo-cache.json');

  private constructor() {
    // 创建缓存目录
    const cacheDir = path.dirname(this.geoCacheFile);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    // 加载持久化的IP数据
    this.loadGeoCache();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // 加载持久化的IP数据
  private loadGeoCache(): void {
    try {
      if (fs.existsSync(this.geoCacheFile)) {
        const data = fs.readFileSync(this.geoCacheFile, 'utf-8');
        this.geoCache = JSON.parse(data);
        console.log('[缓存] 已加载持久化IP数据');
      }
    } catch (error) {
      console.error('[缓存] 加载持久化IP数据失败:', error);
      this.geoCache = {};
    }
  }

  // 保存IP数据到文件
  private saveGeoCache(): void {
    try {
      fs.writeFileSync(this.geoCacheFile, JSON.stringify(this.geoCache, null, 2));
      console.log('[缓存] IP数据已保存到文件');
    } catch (error) {
      console.error('[缓存] 保存IP数据失败:', error);
    }
  }

  // 获取地理位置缓存
  public getGeoCache(ip: string): GeoData | null {
    const cached = this.geoCache[ip];
    if (cached) {
      console.log(`[缓存] 使用IP缓存数据: ${ip}`);
      return cached.data as GeoData;
    }
    return null;
  }

  // 设置地理位置缓存
  public setGeoCache(ip: string, data: GeoData): void {
    console.log(`[缓存] 保存IP数据: ${ip}`);
    this.geoCache[ip] = {
      data,
      timestamp: Date.now()
    };
    this.saveGeoCache();
  }

  // 获取天气缓存
  public getWeatherCache(location: string): WeatherData | null {
    const cached = this.weatherCache[location];
    if (cached && Date.now() - cached.timestamp < this.weatherCacheDuration) {
      console.log(`[缓存] 使用天气缓存数据: ${location}`);
      return cached.data as WeatherData;
    }
    return null;
  }

  // 设置天气缓存
  public setWeatherCache(location: string, data: WeatherData): void {
    console.log(`[缓存] 保存天气数据: ${location}`);
    this.weatherCache[location] = {
      data,
      timestamp: Date.now()
    };
  }

  // 获取一言缓存
  public getHitokotoCache(): string | null {
    const key = 'current';
    const cached = this.hitokotoCache[key];
    if (cached && Date.now() - cached.timestamp < this.hitokotoCacheDuration) {
      console.log('[缓存] 使用一言缓存数据');
      return cached.data as string;
    }
    return null;
  }

  // 设置一言缓存
  public setHitokotoCache(data: string): void {
    console.log('[缓存] 保存一言数据');
    const key = 'current';
    this.hitokotoCache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  // 清理过期缓存
  public cleanExpiredCache(): void {
    const now = Date.now();

    // 清理天气缓存
    Object.keys(this.weatherCache).forEach(key => {
      if (now - this.weatherCache[key].timestamp >= this.weatherCacheDuration) {
        console.log(`[缓存] 清理过期天气数据: ${key}`);
        delete this.weatherCache[key];
      }
    });

    // 清理一言缓存
    Object.keys(this.hitokotoCache).forEach(key => {
      if (now - this.hitokotoCache[key].timestamp >= this.hitokotoCacheDuration) {
        console.log('[缓存] 清理过期一言数据');
        delete this.hitokotoCache[key];
      }
    });
  }
}

export const cacheService = CacheService.getInstance();
