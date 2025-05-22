#!/bin/bash
set -e

# 显示当前目录
echo "当前目录: $(pwd)"

# 删除node_modules和package-lock.json以进行干净的安装
echo "清理旧依赖..."
rm -rf node_modules
rm -f package-lock.json

# 安装依赖
echo "安装依赖..."
npm install --no-fund --no-audit

# 确保workers-site目录存在
echo "检查workers-site目录..."
if [ ! -d "workers-site" ]; then
  mkdir -p workers-site
  echo "创建workers-site目录"
fi

# 创建jsconfig.json
echo "创建src/jsconfig.json..."
mkdir -p src
cat > src/jsconfig.json << EOF
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
EOF

# 确保babel.config.js存在
echo "检查babel.config.js..."
if [ ! -f "babel.config.js" ]; then
  cat > babel.config.js << EOF
module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
        },
      },
    ],
  ],
};
EOF
  echo "创建babel.config.js"
fi

# 运行deploy.js
echo "执行部署准备脚本..."
node deploy.js

# 清理.next缓存目录
echo "清理.next/cache目录..."
rm -rf .next/cache

# 构建应用
echo "构建应用..."
NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max-old-space-size=3072" npm run build

# 构建完成后复制必要的文件
echo "复制必要文件到.next目录..."
if [ -f "_routes.json" ]; then
  cp _routes.json .next/
  echo "复制了_routes.json"
fi

if [ -f "_headers" ]; then
  cp _headers .next/
  echo "复制了_headers"
fi

if [ -f "_redirects" ]; then
  cp _redirects .next/
  echo "复制了_redirects"
fi

# 确保typescript模块可用
echo "确保TypeScript模块可用..."
npm install --no-save typescript @types/node @types/react

echo "部署准备完成" 