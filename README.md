# Chinese Name Generator

一个现代、美观的中文名字生成器网站，帮助用户根据个人信息生成有文化内涵的中文名字。

## 功能特点

- 基于用户名字、出生日期、性别和职业生成个性化中文名字
- 提供三个不同的名字选项（包括单字名和双字名）
- 通过书法动画展示名字的楷书和行书写法
- 提供中文名字的发音功能和拼音指导
- 详细解释每个名字的文化含义和演变
- 支持英语和法语界面
- 响应式设计，完美适配移动设备和桌面浏览器

## 技术栈

- **框架**：Next.js (React)
- **样式**：Tailwind CSS
- **动画**：Framer Motion
- **状态管理**：Zustand
- **打包工具**：内置的Next.js工具链

## Cloudflare Pages部署说明

在Cloudflare Pages中，需要使用以下配置：

1. 构建命令: `npm run build`
2. 输出目录: `.next`
3. 环境变量:
   - `NODE_VERSION`: `18.17.0`

如果使用自动部署，请在Cloudflare Pages项目设置中修改这些配置。

## 本地开发

### 安装依赖

```bash
npm install
```

# 中文名字生成器

一个可以为外国人生成中文名字的应用。根据输入的英文名字，生成符合中国文化的中文名字，并提供发音和含义解释。

## 功能特点

- 根据英文名字生成中文名字
- 提供中文名字的拼音和发音
- 显示名字的文化含义
- 多语言支持 (英文和法文)
- 响应式设计，适配各种设备

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- Framer Motion (动画效果)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 构建和部署

### 标准构建

```bash
npm run build
```

### Cloudflare Pages 部署

本项目已针对Cloudflare Pages进行了特殊优化，解决了React导入、TypeScript相关问题以及文件大小限制问题。

#### 部署方法

1. **本地构建并手动上传**:
   ```bash
   npm run cloudflare-build
   ```
   然后将`.next`目录上传到Cloudflare Pages。

2. **Cloudflare Pages自动部署**:
   
   在Cloudflare Pages的构建设置中，配置以下内容：
   - 构建命令: `npm run cloudflare-build`
   - 输出目录: `.next`
   - 框架预设: `Next.js`
   - Node版本: `18` 或更高

   确保添加以下环境变量:
   - `NODE_VERSION`: `18`
   - `NEXT_TELEMETRY_DISABLED`: `1`

#### 解决文件大小限制问题

Cloudflare Pages对文件大小有25MB的限制，本项目通过以下方式解决此问题：

1. **优化webpack配置**：修改了Next.js的webpack配置，调整代码分块策略，确保生成的文件不超过限制。

2. **禁用缓存持久化**：禁用webpack的持久缓存，避免生成过大的缓存文件。

3. **构建后清理**：在构建完成后自动清理`.next/cache/webpack`目录，移除可能超出大小限制的文件。

4. **文件分块优化**：将大型依赖项如React库和其他node_modules分成更小的块。

如果仍然遇到文件大小问题，可以尝试：
```bash
# 清理构建和缓存
npm run prebuild

# 使用优化过的构建脚本
npm run cloudflare-build
```

#### 常见问题解决

如果在Cloudflare Pages构建中遇到其他问题：

1. **React相关错误**：如`Cannot find namespace 'React'`，确保使用`cloudflare-build.js`脚本构建。

2. **KV存储限制错误**：如果出现`File is too big, it should be under 25 MiB`，确保删除了webpack缓存文件：
   ```bash
   rm -rf .next/cache/webpack
   ```

3. **部署失败**：检查构建日志中的具体错误，并确保wrangler.toml中的配置正确。

## 贡献

欢迎通过PR和Issue提供贡献。

## 许可

MIT