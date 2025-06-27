"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherData = getWeatherData;
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 09:56:41
 * @LastEditTime : 2025-06-27 09:56:47
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/weatherService.ts
 * @Description  :
 */
const axios_1 = __importDefault(require("axios"));
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
async function getWeatherData(lat, lon) {
    try {
        const response = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        return {
            temp: response.data.main.temp,
            feels_like: response.data.main.feels_like,
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            wind_speed: response.data.wind.speed,
            weather: {
                main: response.data.weather[0].main,
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon
            }
        };
    }
    catch (error) {
        console.error('Error fetching weather data:', error);
        return {
            temp: 0,
            feels_like: 0,
            humidity: 0,
            pressure: 0,
            wind_speed: 0,
            weather: {
                main: 'Unknown',
                description: 'Weather data unavailable',
                icon: '01d'
            }
        };
    }
}
//# sourceMappingURL=weatherService.js.map