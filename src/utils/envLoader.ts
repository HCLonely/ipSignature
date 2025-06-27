/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 10:13:17
 * @LastEditTime : 2025-06-27 14:42:32
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/utils/envLoader.ts
 * @Description  :
 */
import dotenv from 'dotenv';
import path from 'path';

// 获取当前环境 - 兼容 Windows 和 Unix 系统
const env = process.env.NODE_ENV || 'development';

// 调试输出
console.log(`[环境加载器] 当前环境: ${env}`);
console.log(`[环境加载器] 工作目录: ${process.cwd()}`);

// 尝试加载特定环境的 .env 文件
const envPath = path.resolve(process.cwd(), `.env.${env}`);
console.log(`[环境加载器] 尝试加载: ${envPath}`);

// 加载环境变量
dotenv.config({ path: envPath });

// 如果没有找到特定环境的文件，加载默认 .env 文件
if (!process.env.IPINFO_TOKEN || !process.env.OPENWEATHER_API_KEY) {
  const defaultEnvPath = path.resolve(process.cwd(), '.env');
  console.log(`[环境加载器] 关键环境变量缺失，尝试加载: ${defaultEnvPath}`);
  dotenv.config({ path: defaultEnvPath });
}

// 检查必需的环境变量
const requiredEnvVars = ['OPENWEATHER_API_KEY'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`[环境加载器] 错误: 环境变量 ${varName} 未设置`);
    throw new Error(`环境变量 ${varName} 未设置`);
  } else {
    console.log(`[环境加载器] ${varName} 已设置`);
  }
});

// 检查地理位置服务令牌
const ipinfoToken = process.env.IPINFO_TOKEN;
const nsmaoToken = process.env.NSMAO_TOKEN;

if (!ipinfoToken && !nsmaoToken) {
  console.error('[环境加载器] 错误: IPINFO_TOKEN 和 NSMAO_TOKEN 至少需要设置一个');
  throw new Error('IPINFO_TOKEN 和 NSMAO_TOKEN 至少需要设置一个');
} else {
  if (ipinfoToken) {
    console.log('[环境加载器] IPINFO_TOKEN 已设置');
  }
  if (nsmaoToken) {
    console.log('[环境加载器] NSMAO_TOKEN 已设置');
  }
}

// 添加调试输出
if (process.env.DEBUG === 'true') {
  console.log('[环境加载器] 所有环境变量:');
  console.log(process.env);
}
