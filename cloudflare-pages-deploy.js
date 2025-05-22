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
  console.log('检查babel.config.js...');
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
  
  // 修复React组件导入 - Windows方式
  console.log('修复React组件导入...');
  const fixReactImports = (filePath) => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 修复导入
      content = content.replace(/import React from ['"]react['"];/g, 'import React, { ReactNode } from \'react\';');
      content = content.replace(/React\.ReactNode/g, 'ReactNode');
      
      fs.writeFileSync(filePath, content);
    }
  };
  
  // 检查并修复Layout.tsx
  const layoutPath = path.join(process.cwd(), 'src/components/layout/Layout.tsx');
  fixReactImports(layoutPath);
  
  // 检查并修复其他可能有问题的文件
  const filesToCheck = [
    'src/components/common/PronunciationButton.tsx',
    'src/components/sections/NameGenerator.tsx',
    'src/components/sections/Features.tsx'
  ];
  
  filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    fixReactImports(filePath);
  });
  
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