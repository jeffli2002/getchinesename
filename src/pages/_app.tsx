import React, { ReactNode } from 'react';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { LanguageProvider } from '@/store/index.js';
import Layout from '@/components/layout/Layout';
// 导入刘建毛草字体 (类似王羲之行书风格)
import '@fontsource/liu-jian-mao-cao';
// 导入 Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }: AppProps) {
  // 强制样式重新计算
  useEffect(() => {
    document.body.classList.add('tailwind-loaded');
    return () => {
      document.body.classList.remove('tailwind-loaded');
    };
  }, []);

  return (
    <LanguageProvider>
      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </LanguageProvider>
  );
} 