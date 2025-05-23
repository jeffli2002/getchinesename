# 中文名字生成器 (Chinese Name Generator)

一个为外国人生成中文名字的在线工具。

## 特点

- 基于姓氏发音匹配推荐中文姓氏
- 生成符合中文文化习惯的名字
- 提供名字的意义和发音指导
- 支持多语言界面
- 响应式设计，适配所有设备

## 技术栈

- Next.js 13
- React 18
- TailwindCSS
- Framer Motion
- TypeScript

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看结果。

## 构建

```bash
# 创建生产构建
npm run build
```

## Cloudflare Pages 部署

本项目专门针对Cloudflare Pages进行了优化，以避免部署过程中的常见问题，如文件大小限制。

### 部署前准备

为确保成功部署，我们使用了特殊的构建和部署脚本：

1. `cfignore.txt` - 包含需要从部署中排除的文件和目录的列表（不使用隐藏的.cfignore文件，以便于在仓库中看到和管理）
2. `deploy.js` - 部署前预处理脚本，修复React导入和创建必要的配置文件
3. `deploy-cloudflare.js` - 专门针对Cloudflare Pages优化的部署脚本

### 部署命令

使用以下命令部署到Cloudflare Pages：

```bash
# 在Unix/Linux/macOS系统上
npm run cf:full-deploy

# 在Windows系统上
# 方法1: 使用PowerShell脚本
.\deploy-cloudflare.ps1

# 方法2: 使用Node.js脚本
npm run cf:full-deploy
```

### 部署过程

部署脚本执行以下操作：

1. 清理构建环境和缓存文件
2. 确保.cfignore文件正确设置，以排除大文件和缓存
3. 禁用webpack缓存，避免生成超过25MB大小限制的文件
4. 构建优化的生产版本
5. 检查并删除任何超过大小限制的文件
6. 部署到Cloudflare Pages

### 故障排除

如果部署失败，请检查以下常见问题：

1. **文件大小超出限制** - Cloudflare Pages限制单个文件最大25MB，检查构建输出
2. **缓存文件未被排除** - 确保.cfignore或cfignore.txt包含所有webpack缓存目录
3. **环境变量问题** - 检查Cloudflare Pages环境变量设置

## 许可证

MIT