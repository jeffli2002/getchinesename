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

# 运行deploy.js脚本
echo "执行deploy.js脚本..."
node deploy.js

# 构建项目
echo "构建项目..."
npm run build

echo "部署脚本完成!" 