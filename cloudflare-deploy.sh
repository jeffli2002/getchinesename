#!/bin/bash
set -e

echo "===== Cloudflare Pages 专用部署脚本 ====="
echo "当前目录: $(pwd)"

# 强制删除缓存文件
echo "强制删除所有缓存文件..."
rm -rf .next/cache
rm -rf .next/cache/webpack
rm -rf node_modules/.cache
find .next -name "*.pack" -type f -delete
find .next -name "*.pack.gz" -type f -delete

# 确保.cfignore文件正确更新
echo "更新.cfignore文件..."
if [ -f "cfignore.txt" ]; then
  cp cfignore.txt .cfignore
  echo "已从cfignore.txt更新.cfignore文件"
else
  # 如果cfignore.txt不存在，创建默认的.cfignore文件
  cat > .cfignore << EOF
# 忽略文件夹
node_modules/
.next/cache/
.next/cache/webpack/
.next/cache/webpack/client-production/
.next/cache/webpack/server-production/
.cloudflare/

# 忽略所有webpack缓存相关文件
**/*.pack
**/*.pack.gz
**/*.hot-update.*
**/.cache
**/.next/cache/**/*

# 忽略大型文件
**/*.wasm
**/*.map
**/.git
**/*.gz

# 忽略开发文件
.env.local
.env.development
.env.development.local
.npm/
.eslintcache
.vscode/
.idea/

# 忽略日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
logs/
*.log

# 忽略测试文件
coverage/
.nyc_output/
playwright-report/
test-results/

# 忽略备份文件
**/*~
**/*.bak
**/*.swp
**/*.swo

# 限制大文件
**/*.+(jpg|jpeg|gif|png|ico|mp4|webm|ogg|mp3|wav|pdf|zip|tar|gz|7z|rar) size>10000000
EOF
  echo "创建了默认的.cfignore文件"
fi

# 优化Next.js构建设置
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production
export NEXT_DISABLE_CACHE=1
export NODE_OPTIONS="--max-old-space-size=4096"

# 清理旧的构建
echo "清理旧的构建..."
rm -rf .next

# 运行定制的构建脚本 - 使用我们优化过的构建脚本
echo "执行 Cloudflare Pages 专用构建..."
node cloudflare-pages-build.js

# 确保缓存目录被删除
echo "确保缓存目录已删除..."
rm -rf .next/cache
rm -rf .next/cache/webpack
rm -rf .next/cache/webpack/client-production
rm -rf .next/cache/webpack/server-production

# 查找大文件并删除
echo "查找并删除大文件..."
find .next -type f -size +20M -exec rm -f {} \;

# 查找所有的.pack文件并删除
echo "查找并删除所有.pack文件..."
find .next -name "*.pack" -type f -delete
find .next -name "*.pack.gz" -type f -delete

# 读取项目名称从.cfconfig
PROJECT_NAME=$(node -e "
  try {
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('.cfconfig', 'utf8'));
    console.log(config.name || 'getchinesename');
  } catch (err) {
    console.log('getchinesename');
  }
")

# 部署到 Cloudflare Pages
echo "部署到 Cloudflare Pages，项目名称: $PROJECT_NAME..."
npx wrangler pages deploy .next --project-name $PROJECT_NAME --commit-dirty=true

echo "部署完成!" 