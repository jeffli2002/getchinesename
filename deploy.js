// 部署辅助脚本
const fs = require('fs');
const path = require('path');
const { rimraf } = require('rimraf');
const { execSync } = require('child_process');

// 创建babel.config.js文件
function createBabelConfig() {
  const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
  
  const babelConfigContent = `module.exports = {
  presets: [
    ['next/babel', {
      'preset-react': {
        runtime: 'automatic',
      },
    }],
  ],
};`;
  
  fs.writeFileSync(babelConfigPath, babelConfigContent);
  console.log('创建/更新了babel.config.js');
}

// 创建404.js API处理程序
function create404Handler() {
  const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');
  
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  const handler404Path = path.join(apiDir, '404.js');
  
  if (!fs.existsSync(handler404Path)) {
    const handler404Content = `
export default function handler(req, res) {
  res.status(404).json({ error: 'API endpoint not found' });
}
`;
    
    fs.writeFileSync(handler404Path, handler404Content);
    console.log('创建了API 404处理程序');
  }
}

// 创建jsconfig.json文件
function createJsConfig() {
  const srcDir = path.join(process.cwd(), 'src');
  const jsConfigPath = path.join(srcDir, 'jsconfig.json');
  
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  if (!fs.existsSync(jsConfigPath)) {
    const jsConfigContent = {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['./*']
        }
      }
    };
    
    fs.writeFileSync(jsConfigPath, JSON.stringify(jsConfigContent, null, 2));
    console.log('创建了jsconfig.json');
  }
}

// 创建tsconfig.json文件
function createTsConfig() {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    const tsConfigContent = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"]
    };
    
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfigContent, null, 2));
    console.log('创建了tsconfig.json');
  }
}

// 创建store/index.js文件
function createStoreIndexJs() {
  const storeDir = path.join(process.cwd(), 'src', 'store');
  const storeIndexJsPath = path.join(storeDir, 'index.js');
  
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }
  
  // 创建新的store/index.js文件内容
  const storeIndexJsContent = `import { create } from 'zustand';
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
  
  // 写入文件
  fs.writeFileSync(storeIndexJsPath, storeIndexJsContent);
  console.log('创建/更新了store/index.js');
}

// 修复组件中的React导入
function fixReactImports() {
  const srcDir = path.join(process.cwd(), 'src');
  
  // 寻找所有的.tsx和.ts文件
  try {
    const findTsxFiles = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files = [];
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files = files.concat(findTsxFiles(fullPath));
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
      
      return files;
    };
    
    const tsxFiles = findTsxFiles(srcDir);
    
    for (const file of tsxFiles) {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;
      
      // 修复React导入
      if (content.includes('import React from "react"') || content.includes("import React from 'react'")) {
        content = content.replace(/import React from ["']react["'];?/g, 'import React, { ReactNode } from "react";');
        changed = true;
      }
      
      // 修复 React.ReactNode 为 ReactNode
      if (content.includes('React.ReactNode')) {
        content = content.replace(/React\.ReactNode/g, 'ReactNode');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(file, content);
        console.log(`修复了React导入: ${file}`);
      }
    }
    
    console.log('\n完成React导入修复');
  } catch (error) {
    console.error('修复React导入失败:', error);
  }
}

// 删除可能引起问题的文件
function deleteProblematicFiles() {
  const storeIndexPath = path.join(process.cwd(), 'src', 'store', 'index.ts');
  
  if (fs.existsSync(storeIndexPath)) {
    fs.unlinkSync(storeIndexPath);
    console.log('删除store/index.ts');
  }
  
  // 删除一些不必要的图片文件
  const imageFilesToDelete = [
    'public/images/chinese-calligraphy.svg',
    'public/images/chinese-background.svg',
    'public/images/new-chinese-calligraphy.svg',
    'public/images/new-chinese-background.svg',
    'public/images/chinese-landscape.html',
    'public/images/chinese-landscape.jpg',
    'public/images/chinese-landscape.jpg.html'
  ];
  
  imageFilesToDelete.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`删除${filePath}`);
    }
  });
}

// 主函数
function main() {
  try {
    deleteProblematicFiles();
    createJsConfig();
    createTsConfig();
    create404Handler();
    createStoreIndexJs();
    createBabelConfig();
    fixReactImports();
    
    console.log('部署准备完成');
  } catch (error) {
    console.error('部署过程中出错:', error);
    process.exit(1);
  }
}

// 运行主函数
main(); 