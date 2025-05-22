import { create } from 'zustand';
import React from 'react';

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

// 创建语言状态存储
export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en', // 默认语言为英文
  setLanguage: (lang: string) => set({ language: lang }),
}));

// 创建语言上下文
export const LanguageContext = React.createContext<LanguageState | null>(null);

// 语言提供者组件
interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const store = useLanguageStore();
  
  return (
    <LanguageContext.Provider value={store}>
      {children}
    </LanguageContext.Provider>
  );
}; 