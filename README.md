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

本项目使用 `cloudflare-config` 目录存储 Cloudflare Pages 的配置文件，避免使用隐藏目录无法上传到 GitHub 的问题。

### 新增配置文件: .cfconfig

项目现在使用 `.cfconfig` 文件存储 Cloudflare Pages 部署的配置信息。这个文件会在部署脚本运行时自动创建，包含以下信息：

```json
{
  "name": "getchinesename",  // 项目名称
  "config_dir": "cloudflare-config",  // 配置目录
  "site": {
    "bucket": ".next",  // 部署目录
    "exclude": [...]  // 排除的文件
  },
  "env": {...},  // 环境变量
  "compatibility_date": "2023-09-01",
  "compatibility_flags": ["nodejs_compat"]
}
```

如果您需要更改项目名称或其他配置，可以直接编辑此文件，部署脚本将使用此文件中的配置。

### 新增部署方法（解决文件大小限制问题）

我们增加了专门的部署脚本来解决 Cloudflare Pages 的 25MB 文件大小限制问题：

1. **使用专用构建脚本**：
   ```bash
   node cloudflare-pages-build.js
   ```
   此脚本会清理缓存、优化构建、删除大文件，并生成适合 Cloudflare Pages 的输出。

2. **使用部署脚本**：
   ```bash
   # Linux/Mac
   chmod +x cloudflare-pages-deploy.sh
   ./cloudflare-pages-deploy.sh
   
   # Windows (PowerShell)
   powershell -File cloudflare-pages-deploy.ps1
   ```

3. **使用 package.json 命令**：
   ```bash
   # Windows
   npm run deploy:win
   
   # Linux/Mac
   npm run deploy:unix
   
   # 通用
   npm run deploy:cf
   ```

### 配置文件说明

- `.cfconfig`: Cloudflare Pages 主配置文件（会自动生成）
- `cloudflare-config/pages-config.json`: Cloudflare Pages 详细配置
- `cloudflare-config/kv-ignore.json`: 忽略的大型缓存文件配置
- `cloudflare-config/workers-site/index.js`: Cloudflare Workers 脚本
- `cloudflare-pages-build.js`: 专用构建脚本，解决大文件问题
- `cloudflare-deploy.js`: 部署准备脚本
- `cloudflare-build.js`: 构建优化脚本

### 文件大小限制问题解决方案

Cloudflare Pages 有 25MB 的文件大小限制，项目已经通过以下方式解决：

1. **优化构建配置**：
   - 禁用 webpack 缓存持久化（避免生成大型 .pack 文件）
   - 优化代码分块策略，将大型依赖分成更小的块
   - 移除源代码映射（source maps）以减小构建输出

2. **特殊部署步骤**：
   - 使用 `cloudflare-pages-build.js` 脚本处理部署前的准备工作
   - 自动删除超过大小限制的 webpack 缓存文件
   - 使用 `.cfignore` 和 `cfignore.txt` 确保大型文件不会被上传

3. **项目结构优化**：
   - 分离 React 相关库和大型依赖
   - 优化图像和资源加载
   - 提高代码压缩级别

### 部署命令

```bash
# 标准部署（构建并部署到 Cloudflare Pages）
npm run deploy

# 只执行部署准备步骤（不执行实际部署）
npm run cloudflare-deploy

# 使用 Cloudflare Pages 部署
npm run deploy:cf

# 仅执行构建步骤
node cloudflare-pages-build.js
```

### 部署故障排除

如果遇到 `File is too big, it should be under 25 MiB` 错误：

1. 确保运行了正确的部署命令：
   ```bash
   npm run cloudflare-deploy
   ```

2. 检查是否生成了大型 .pack 文件：
   ```bash
   find .next -name "*.pack" -size +20M
   ```
   
3. 如有必要，手动删除大型文件：
   ```bash
   rm -rf .next/cache/webpack
   ```

4. 确保 `.cfignore` 文件正确配置且没有编码问题

5. 如果上述方法都无效，可以尝试手动上传构建后的文件，排除大型文件

## 贡献

欢迎通过PR和Issue提供贡献。

## 许可

MIT

# 部署注意事项

## Cloudflare Pages 部署

在Cloudflare Pages部署过程中，需要注意以下几点：

1. 文件大小限制：Cloudflare Pages有25MB的文件大小限制，我们通过以下方式解决：
   - 使用 `cfignore.txt` 文件（而不是 `.cfignore`）定义部署时需要排除的文件
   - 修改了webpack缓存策略以避免生成大型pack文件
   - 优化了代码分块策略

2. 配置文件：
   - `cfignore.txt` - 定义部署排除规则，会在部署时自动转换为 `.cfignore`
   - `cloudflare-deploy.js` - 处理部署前的准备工作
   - `cloudflare-pages-build.js` - Cloudflare Pages专用构建脚本

3. 部署命令：
   - 使用 `npm run deploy:cf` 命令进行部署
   - 使用 `npm run build:cf` 命令进行构建

## 为什么使用 cfignore.txt 而不是 .cfignore

由于`.cfignore`是隐藏文件，在某些环境下（如GitHub）上传可能会有问题，所以我们用普通的`cfignore.txt`文件作为源，在部署时自动生成`.cfignore`文件。