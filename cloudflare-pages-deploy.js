// Windows版本的部署脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { rimraf } = require('rimraf');

// 输出当前目录
console.log('当前目录:', process.cwd());

try {
  // 设置环境变量
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NODE_OPTIONS = '--max-old-space-size=3072';
  
  // 清理缓存目录
  console.log('清理缓存目录...');
  const cacheDirs = [
    path.join(process.cwd(), '.next'),
    path.join(process.cwd(), 'node_modules/.cache')
  ];
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      rimraf.sync(dir);
      console.log(`已清理: ${dir}`);
    }
  });
  
  // 确保src/store目录存在并创建index.js
  console.log('创建store/index.js...');
  const storeDir = path.join(process.cwd(), 'src/store');
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }
  
  const storeIndexContent = `import { create } from 'zustand';
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
};`;
  
  fs.writeFileSync(path.join(storeDir, 'index.js'), storeIndexContent);
  
  // 创建jsconfig.json
  console.log('创建src/jsconfig.json...');
  const srcDir = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  const jsConfigContent = `{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}`;
  
  fs.writeFileSync(path.join(srcDir, 'jsconfig.json'), jsConfigContent);
  
  // 确保babel.config.js存在
  console.log('创建babel.config.js...');
  const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
  const babelConfigContent = `module.exports = {
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
};`;
  
  fs.writeFileSync(babelConfigPath, babelConfigContent);
  console.log('创建了babel.config.js');
  
  // 修复React组件导入 - 全面递归遍历
  console.log('修复React组件导入...');
  function fixReactImports() {
    const componentsDir = path.join(process.cwd(), 'src');
    
    if (!fs.existsSync(componentsDir)) {
      return;
    }
    
    // 递归遍历目录并修复React导入
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          fixFileReactImports(filePath);
        }
      }
    }
    
    // 修复文件中的React导入
    function fixFileReactImports(filePath) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 完全替换或添加React导入
        if (!content.includes('import React, { ReactNode }')) {
          if (content.includes('import React from \'react\';')) {
            content = content.replace('import React from \'react\';', 'import React, { ReactNode } from \'react\';');
            modified = true;
          } else if (content.includes('import React from "react";')) {
            content = content.replace('import React from "react";', 'import React, { ReactNode } from "react";');
            modified = true;
          } else if (!content.includes('import React')) {
            // 如果没有任何React导入，在文件顶部添加导入
            content = 'import React, { ReactNode } from \'react\';\n' + content;
            modified = true;
          }
        }
        
        // 替换 React.ReactNode 为 ReactNode
        if (content.includes('React.ReactNode')) {
          content = content.replace(/React\.ReactNode/g, 'ReactNode');
          modified = true;
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          console.log(`修复了React导入: ${filePath}`);
        }
      } catch (error) {
        console.error(`修复文件时出错 ${filePath}:`, error);
      }
    }
    
    // 开始修复
    walkDir(componentsDir);
    console.log('完成React导入修复');
  }
  
  // 执行修复
  fixReactImports();
  
  // 直接修复Layout.tsx文件，确保其正确性
  const layoutPath = path.join(process.cwd(), 'src/components/layout/Layout.tsx');
  console.log('直接修复Layout.tsx文件...');
  
  // 确保目录存在
  const layoutDir = path.join(process.cwd(), 'src/components/layout');
  if (!fs.existsSync(layoutDir)) {
    fs.mkdirSync(layoutDir, { recursive: true });
  }
  
  // 强制重写Layout.tsx文件
  const layoutContent = `import React, { ReactNode } from 'react';
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

export default Layout;`;
  
  fs.writeFileSync(layoutPath, layoutContent);
  console.log('成功修复Layout.tsx');
  
  // 确保store/index.ts不存在
  const storeIndexTsPath = path.join(process.cwd(), 'src/store/index.ts');
  if (fs.existsSync(storeIndexTsPath)) {
    fs.unlinkSync(storeIndexTsPath);
    console.log('删除store/index.ts');
  }
  
  // 优化TypeScript配置
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      // 确保jsx设置正确
      if (tsConfig.compilerOptions) {
        tsConfig.compilerOptions.jsx = 'preserve';
        // 在构建时忽略TypeScript错误
        tsConfig.compilerOptions.noEmit = true;
      }
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      console.log('优化了tsconfig.json');
    } catch (error) {
      console.error('更新tsconfig.json时出错:', error);
    }
  }
  
  // 运行deploy.js
  console.log('执行部署准备脚本...');
  execSync('node deploy.js', { stdio: 'inherit' });
  
  // 构建项目
  console.log('构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('部署脚本完成!');
} catch (error) {
  console.error('部署过程中出错:', error);
  process.exit(1);
} 