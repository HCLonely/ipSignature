"use strict";
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 15:10:15
 * @LastEditTime : 2025-06-27 16:11:37
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/cacheService.ts
 * @Description  : 缓存服务
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CacheService {
    constructor() {
        this.geoCache = {};
        this.weatherCache = {};
        this.hitokotoCache = {};
        this.weatherCacheDuration = 30 * 60 * 1000; // 30分钟
        this.hitokotoCacheDuration = 5 * 60 * 1000; // 5分钟
        this.geoCacheFile = path_1.default.join(process.cwd(), 'cache', 'geo-cache.json');
        // 创建缓存目录
        const cacheDir = path_1.default.dirname(this.geoCacheFile);
        if (!fs_1.default.existsSync(cacheDir)) {
            fs_1.default.mkdirSync(cacheDir, { recursive: true });
        }
        // 加载持久化的IP数据
        this.loadGeoCache();
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    // 加载持久化的IP数据
    loadGeoCache() {
        try {
            if (fs_1.default.existsSync(this.geoCacheFile)) {
                const data = fs_1.default.readFileSync(this.geoCacheFile, 'utf-8');
                this.geoCache = JSON.parse(data);
                console.log('[缓存] 已加载持久化IP数据');
            }
        }
        catch (error) {
            console.error('[缓存] 加载持久化IP数据失败:', error);
            this.geoCache = {};
        }
    }
    // 保存IP数据到文件
    saveGeoCache() {
        try {
            fs_1.default.writeFileSync(this.geoCacheFile, JSON.stringify(this.geoCache, null, 2));
            console.log('[缓存] IP数据已保存到文件');
        }
        catch (error) {
            console.error('[缓存] 保存IP数据失败:', error);
        }
    }
    // 获取地理位置缓存
    getGeoCache(ip) {
        const cached = this.geoCache[ip];
        if (cached) {
            console.log(`[缓存] 使用IP缓存数据: ${ip}`);
            return cached.data;
        }
        return null;
    }
    // 设置地理位置缓存
    setGeoCache(ip, data) {
        console.log(`[缓存] 保存IP数据: ${ip}`);
        this.geoCache[ip] = {
            data,
            timestamp: Date.now()
        };
        this.saveGeoCache();
    }
    // 获取天气缓存
    getWeatherCache(location) {
        const cached = this.weatherCache[location];
        if (cached && Date.now() - cached.timestamp < this.weatherCacheDuration) {
            console.log(`[缓存] 使用天气缓存数据: ${location}`);
            return cached.data;
        }
        return null;
    }
    // 设置天气缓存
    setWeatherCache(location, data) {
        console.log(`[缓存] 保存天气数据: ${location}`);
        this.weatherCache[location] = {
            data,
            timestamp: Date.now()
        };
    }
    // 获取一言缓存
    getHitokotoCache() {
        const key = 'current';
        const cached = this.hitokotoCache[key];
        if (cached && Date.now() - cached.timestamp < this.hitokotoCacheDuration) {
            console.log('[缓存] 使用一言缓存数据');
            return cached.data;
        }
        return null;
    }
    // 设置一言缓存
    setHitokotoCache(data) {
        console.log('[缓存] 保存一言数据');
        const key = 'current';
        this.hitokotoCache[key] = {
            data,
            timestamp: Date.now()
        };
    }
    // 清理过期缓存
    cleanExpiredCache() {
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
exports.cacheService = CacheService.getInstance();
