/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:55:34
 * @LastEditTime : 2025-06-27 09:55:41
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/types/types.ts
 * @Description  :
 */
export interface GeoData {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // 经纬度，格式："lat,lon"
  timezone: string;
}

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
}

export interface UserSystemInfo {
  os: string;
  browser: string;
}

export interface SignatureData {
  ip: string;
  location: string;
  time: string;
  weather: WeatherData;
  systemInfo: UserSystemInfo;
  hitokoto: string;
}
