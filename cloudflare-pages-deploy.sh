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

# 确保.cloudflare目录存在
echo "检查.cloudflare目录..."
if [ ! -d ".cloudflare" ]; then
  mkdir -p .cloudflare
  mkdir -p .cloudflare/workers-site
  echo "创建.cloudflare目录结构"
fi

# 确保src/store目录存在并创建index.js
echo "创建store/index.js..."
mkdir -p src/store
cat > src/store/index.js << EOF
import { create } from 'zustand';
import React from 'react';

// 创建语言状态存储
export const useLanguageStore = create((set) => ({
  language: 'en', // 默认语言为英文
  setLanguage: (lang) => set({ language: lang }),
}));

// 创建语言上下文
export const LanguageContext = React.createContext(null);

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const store = useLanguageStore();

  return (
    <LanguageContext.Provider value={store}>
      {children}
    </LanguageContext.Provider>
  );
};
EOF

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
echo "创建babel.config.js..."
cat > babel.config.js << EOF
module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource: 'react',
        },
      },
    ],
  ],
};
EOF
echo "创建了babel.config.js"

# 直接修复Layout.tsx文件，确保其正确性
echo "直接修复Layout.tsx文件..."
# 确保目录存在
mkdir -p src/components/layout
# 强制重写Layout.tsx文件
cat > src/components/layout/Layout.tsx << EOF
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
EOF
echo "成功修复Layout.tsx"

# 检查并修复每个React组件的导入
echo "修复React组件导入..."
find src -name "*.tsx" -exec sed -i 's/import React from "react";/import React, { ReactNode } from "react";/g' {} \;
find src -name "*.tsx" -exec sed -i "s/import React from 'react';/import React, { ReactNode } from 'react';/g" {} \;
find src -name "*.tsx" -exec sed -i 's/React\.ReactNode/ReactNode/g' {} \;

# 删除可能有问题的TypeScript文件
if [ -f "src/store/index.ts" ]; then
  rm src/store/index.ts
  echo "删除了src/store/index.ts"
fi

# 确保cloudflare-config目录存在
echo "检查cloudflare-config目录..."
if [ ! -d "cloudflare-config" ]; then
  mkdir -p cloudflare-config
  mkdir -p cloudflare-config/workers-site
  echo "创建cloudflare-config目录结构"
fi

# 创建Cloudflare特定配置
echo "创建Cloudflare Pages配置文件..."
mkdir -p cloudflare-config
cat > cloudflare-config/kv-ignore.json << EOF
{
  "ignorePatterns": [
    ".next/cache/**/*",
    ".next/cache/webpack/**/*",
    ".next/cache/webpack/client-production/*",
    ".next/cache/webpack/server-production/*",
    "**/*.pack",
    "**/*.pack.gz",
    "node_modules/.cache/**/*"
  ]
}
EOF

cat > cloudflare-config/pages-config.json << EOF
{
  "name": "getchinesename",
  "build": {
    "baseDir": ".next",
    "command": "npm run cloudflare-build",
    "publicPath": "",
    "ignoredFiles": ["node_modules/.cache/**", ".next/cache/**"]
  },
  "deployment": {
    "routes": [
      { "pattern": "/*", "script": "index.js" }
    ],
    "kv": {
      "ASSETS": {
        "binding": "ASSETS"
      }
    }
  },
  "env": {
    "NODE_VERSION": "18",
    "NEXT_TELEMETRY_DISABLED": "1",
    "NEXT_RUNTIME": "edge"
  },
  "limits": {
    "kv_max_entry_size": "24MiB"
  },
  "build_config": {
    "upload_config": {
      "max_file_size": 25000000,
      "chunk_size": 10000000,
      "max_chunks": 100
    },
    "optimization": {
      "minify_js": true,
      "minify_css": true,
      "minify_html": true,
      "treeshake": true
    }
  }
}
EOF

# 运行cloudflare-build.js脚本
echo "执行cloudflare-build.js脚本..."
node cloudflare-build.js

# 清理webpack缓存文件，避免文件大小问题
echo "清理webpack缓存文件..."
rm -rf .next/cache/webpack

echo "部署脚本完成!" 