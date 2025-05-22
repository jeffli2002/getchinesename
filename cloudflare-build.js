// Cloudflare Pages 专用构建脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { rimraf } = require('rimraf');

console.log('===== Cloudflare Pages 专用构建脚本 =====');
console.log('当前目录:', process.cwd());

// 清理缓存和build目录
function cleanDirectories() {
  console.log('清理缓存和构建目录...');
  const dirsToClean = [
    '.next',
    'node_modules/.cache',
  ];
  
  dirsToClean.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      rimraf.sync(dirPath);
      console.log(`已清理: ${dir}`);
    }
  });
}

// 修复所有TypeScript/React文件
function fixReactFiles() {
  console.log('修复React导入问题...');
  const srcDir = path.join(process.cwd(), 'src');
  
  // 递归处理所有.tsx/.jsx文件
  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        processDirectory(itemPath);
      } else if (itemPath.endsWith('.tsx') || itemPath.endsWith('.jsx')) {
        fixReactImports(itemPath);
      }
    }
  }
  
  function fixReactImports(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 处理React导入
      if (!content.includes('import React, { ReactNode }')) {
        if (content.includes('import React from \'react\';')) {
          content = content.replace('import React from \'react\';', 'import React, { ReactNode } from \'react\';');
          modified = true;
        } else if (content.includes('import React from "react";')) {
          content = content.replace('import React from "react";', 'import React, { ReactNode } from "react";');
          modified = true;
        } else if (!content.includes('import React')) {
          // 添加React导入
          content = 'import React, { ReactNode } from \'react\';\n' + content;
          modified = true;
        }
      }
      
      // 替换React.ReactNode为ReactNode
      if (content.includes('React.ReactNode')) {
        content = content.replace(/React\.ReactNode/g, 'ReactNode');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`已修复: ${filePath}`);
      }
    } catch (error) {
      console.error(`处理文件 ${filePath} 时出错:`, error);
    }
  }
  
  processDirectory(srcDir);
}

// 强制更新Layout.tsx
function forceUpdateLayout() {
  console.log('强制更新Layout.tsx...');
  const layoutPath = path.join(process.cwd(), 'src/components/layout/Layout.tsx');
  const layoutDir = path.dirname(layoutPath);
  
  if (!fs.existsSync(layoutDir)) {
    fs.mkdirSync(layoutDir, { recursive: true });
  }
  
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
  console.log('Layout.tsx已更新');
}

// 创建或更新store/index.js
function updateStore() {
  console.log('更新store/index.js...');
  const storeDir = path.join(process.cwd(), 'src/store');
  const storeIndexPath = path.join(storeDir, 'index.js');
  const storeIndexTsPath = path.join(storeDir, 'index.ts');
  
  // 删除可能存在的.ts版本
  if (fs.existsSync(storeIndexTsPath)) {
    fs.unlinkSync(storeIndexTsPath);
    console.log('已删除store/index.ts');
  }
  
  // 确保目录存在
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }
  
  const storeContent = `import { create } from 'zustand';
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
  
  fs.writeFileSync(storeIndexPath, storeContent);
  console.log('store/index.js已更新');
}

// 更新配置文件
function updateConfigs() {
  console.log('更新配置文件...');
  
  // 更新babel.config.js
  const babelConfig = `module.exports = {
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
};`;
  
  fs.writeFileSync(path.join(process.cwd(), 'babel.config.js'), babelConfig);
  
  // 更新tsconfig.json
  try {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      if (tsConfig.compilerOptions) {
        tsConfig.compilerOptions.jsx = 'preserve';
        tsConfig.compilerOptions.esModuleInterop = true;
        tsConfig.compilerOptions.resolveJsonModule = true;
        tsConfig.compilerOptions.isolatedModules = true;
        tsConfig.compilerOptions.noEmit = true;
      }
      
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      console.log('tsconfig.json已更新');
    }
  } catch (error) {
    console.error('更新tsconfig.json时出错:', error);
  }
}

// 主函数
async function main() {
  try {
    // 设置环境变量
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.NODE_ENV = 'production';
    
    // 执行清理和修复
    cleanDirectories();
    updateConfigs();
    updateStore();
    fixReactFiles();
    forceUpdateLayout();
    
    // 执行部署.js脚本
    console.log('执行deploy.js...');
    execSync('node deploy.js', { stdio: 'inherit' });
    
    // 构建项目
    console.log('开始构建项目...');
    execSync('npx next build', { stdio: 'inherit' });
    
    console.log('✅ 构建完成!');
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 