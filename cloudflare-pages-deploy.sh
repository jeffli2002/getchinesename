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

# 运行deploy.js
echo "执行部署准备脚本..."
node deploy.js

# 清理.next缓存目录
echo "清理.next/cache目录..."
rm -rf .next/cache

# 构建应用
echo "构建应用..."
NEXT_TELEMETRY_DISABLED=1 npm run build

echo "部署准备完成" 