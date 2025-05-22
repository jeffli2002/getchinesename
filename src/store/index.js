import { create } from 'zustand';
import React, { createContext } from 'react';

// 创建语言状态存储
export const useLanguageStore = create((set) => ({
  language: 'en', // 默认语言为英文
  setLanguage: (lang) => set({ language: lang }),
}));

// 创建语言上下文
const LanguageContext = createContext(null);

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const store = useLanguageStore();
  
  return (
    <LanguageContext.Provider value={store}>
      {children}
    </LanguageContext.Provider>
  );
}; 