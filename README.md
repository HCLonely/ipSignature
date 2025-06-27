# IP 签名图片生成服务

一个简单的服务，可以生成包含 IP 地址、地理位置、天气、系统信息等数据的签名图片。

## 功能特点

- 获取访问者的 IP 地址和地理位置信息
- 显示当前天气状况
- 显示访问者的操作系统和浏览器信息
- 显示一言语句
- 支持图片缓存
- 支持跨域访问

## 示例

![IP Signature Example](https://ip-sign-image.vercel.app/signature)

## 使用方法

### 基本用法

直接访问签名图片：
```
https://你的域名/signature
```

### 在网页中使用

```html
<img src="https://你的域名/signature" alt="IP签名档" />
```

### 缓存说明

- IP 地理位置数据：长期缓存
- 天气数据：缓存 30 分钟
- 一言数据：缓存 5 分钟
- 生成的图片：客户端缓存 10 分钟

## 部署方法

### 本地部署

1. 克隆仓库：
   ```bash
   git clone https://github.com/HCLonely/ipSignature.git
   cd ipSignature
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   ```bash
   # 复制环境变量示例文件
   cp .env.example .env

   # 然后编辑 .env 文件，修改相关配置
   # 至少需要配置以下变量之一：
   # - IPINFO_TOKEN（ipinfo.io的API令牌）
   # - NSMAO_TOKEN（nsmao的API令牌）
   #
   # 以及：
   # - OPENWEATHER_API_KEY（OpenWeatherMap的API密钥）
   ```

4. 编译代码：
   ```bash
   npm run build
   ```

5. 启动服务：
   ```bash
   npm start
   ```

### Vercel 部署

#### 一键部署

[![部署到 Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHCLonely%2FipSignature&env=IPINFO_TOKEN,NSMAO_TOKEN,OPENWEATHER_API_KEY,BACKGROUND_IMAGE_URL&envDescription=需要配置相关API密钥才能正常使用&envLink=https%3A%2F%2Fgithub.com%2FHCLonely%2FipSignature%23环境变量说明)

#### 手动部署步骤

1. Fork 本仓库到你的 GitHub 账号

2. 在 Vercel 中导入项目：
   - 访问 [Vercel](https://vercel.com)
   - 点击 "Import Project"
   - 选择你 fork 的仓库
   - 点击 "Import"

3. 配置环境变量：
   - 在项目设置中找到 "Environment Variables"
   - 添加以下环境变量：
     ```env
     # IP地理位置服务令牌 (至少需要配置其中一个)
     IPINFO_TOKEN=your_ipinfo_token_here
     NSMAO_TOKEN=your_nsmao_token_here

     # OpenWeatherMap API密钥
     OPENWEATHER_API_KEY=your_openweather_api_key_here

     # 背景图片URL (可选，仅支持 jpg, jpeg, png, gif 格式)
     BACKGROUND_IMAGE_URL=https://example.com/background.jpg

     # 生产环境标识
     NODE_ENV=production
     ```

4. 部署：
   - Vercel 会自动部署你的服务
   - 部署完成后，你会得到一个 `.vercel.app` 域名
   - 也可以绑定自己的自定义域名

## 环境变量说明

创建 `.env` 文件并配置以下环境变量：

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| IPINFO_TOKEN | 是* | - | IP地理位置服务令牌，用于获取访问者的地理位置信息 |
| NSMAO_TOKEN | 是* | - | IP地理位置服务令牌（备选），用于获取访问者的地理位置信息 |
| OPENWEATHER_API_KEY | 是 | - | OpenWeatherMap API密钥，用于获取天气信息 |
| BACKGROUND_IMAGE_URL | 否 | - | 背景图片URL，仅支持 jpg, jpeg, png, gif 格式 |
| PORT | 否 | 3000 | 服务器端口 |
| DEBUG | 否 | false | 调试模式，设置为 true 时显示详细错误信息 |
| NODE_ENV | 否 | development | 运行环境，生产环境请设置为 production |

\* IPINFO_TOKEN 和 NSMAO_TOKEN 至少需要配置其中一个

## 命令行参数

| 参数 | 简写 | 说明 |
|------|------|------|
| --public-ip | -p | 使用公网 IP（当检测到本地 IP 时） |

## 许可证

MIT License
