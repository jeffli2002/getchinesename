// 部署辅助脚本
const fs = require('fs');
const path = require('path');

// 确保在构建之前store/index.js存在
try {
  if (!fs.existsSync(path.join(__dirname, 'src/store/index.js'))) {
    console.log('创建store/index.js');
    
    const content = `import { create } from 'zustand';
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
    
    fs.writeFileSync(path.join(__dirname, 'src/store/index.js'), content);
  }
  
  // 删除可能存在的index.ts文件
  const tsFile = path.join(__dirname, 'src/store/index.ts');
  if (fs.existsSync(tsFile)) {
    console.log('删除store/index.ts');
    fs.unlinkSync(tsFile);
  }
  
  console.log('部署准备完成');
} catch (err) {
  console.error('部署准备失败:', err);
} 