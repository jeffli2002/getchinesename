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