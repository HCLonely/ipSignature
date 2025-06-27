/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:56:41
 * @LastEditTime : 2025-06-27 22:21:00
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/weatherService.ts
 * @Description  : 天气服务
 */
import axios from 'axios';
import { WeatherData } from '../types/types';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;

// 天气描述映射表
const weatherDescriptions: Record<string, string> = {
  'clear sky': '晴朗',
  'few clouds': '少云',
  'scattered clouds': '散云',
  'broken clouds': '多云',
  'overcast clouds': '阴天',
  'shower rain': '阵雨',
  'rain': '雨',
  'light rain': '小雨',
  'moderate rain': '中雨',
  'heavy rain': '大雨',
  'thunderstorm': '雷暴',
  'snow': '雪',
  'light snow': '小雪',
  'moderate snow': '中雪',
  'heavy snow': '大雪',
  'mist': '薄雾',
  'fog': '雾',
  'haze': '霾',
  'dust': '浮尘',
  'sand': '沙尘',
  'smoke': '烟雾'
};


// 添加默认天气数据函数
function getDefaultWeatherData(): WeatherData {
  return {
    temp: Math.random() * 25 + 5, // 5-30°C之间的随机温度
    feels_like: 0,
    humidity: Math.floor(Math.random() * 100),
    pressure: 1013,
    wind_speed: Math.random() * 10,
    weather: {
      main: 'Default',
      description: '默认天气数据',
      icon: '01d'
    }
  };
}

export async function getWeatherData(lat: string, lon: string): Promise<WeatherData> {
  // 如果是本地IP，返回默认天气
  if (lat === '0' && lon === '0') {
    return getDefaultWeatherData();
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    // 获取原始描述并转换为中文
    const originalDescription = response.data.weather[0].description.toLowerCase();
    const chineseDescription = weatherDescriptions[originalDescription] || originalDescription;

    return {
      temp: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      wind_speed: response.data.wind.speed,
      weather: {
        main: response.data.weather[0].main,
        description: chineseDescription,
        icon: response.data.weather[0].icon
      }
    };
  } catch (error) {
    console.error('获取天气数据出错:', error);
    return {
      temp: Math.random() * 25 + 5, // 5-30°C之间的随机温度
      feels_like: 0,
      humidity: Math.floor(Math.random() * 100),
      pressure: 1013,
      wind_speed: Math.random() * 10,
      weather: {
        main: 'Clear',
        description: '天气数据不可用',
        icon: '01d'
      }
    };
  }
}
