/** @type {import('next').NextConfig} */
const path = require('path');
const webpack = require('webpack');

// 获取Cloudflare Pages环境变量
const isProd = process.env.NODE_ENV === 'production';
const isCloudflarePages = process.env.CF_PAGES === '1';

// 检查是否是Cloudflare部署
const isCloudflare = isCloudflarePages || process.env.NEXT_RUNTIME === 'edge';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
    disableStaticImages: true,
  },
  
  // 配置路径别名
  webpack: (config, { dev, isServer }) => {
    // 彻底禁用webpack缓存，避免生成大型.pack文件
    config.cache = false;
    
    // 启用压缩和分块策略
    if (!dev) {
      config.optimization.minimize = true;
      
      // 强制禁用持久化缓存
      if (config.optimization) {
        // 使用更确定性的模块ID算法
        config.optimization.moduleIds = 'named';
        
        // 使用更确定性的chunk ID算法
        config.optimization.chunkIds = 'named';
        
        // 禁用资产大小提示
        config.performance = {
          hints: false,
          maxEntrypointSize: 512000,
          maxAssetSize: 512000
        };
        
        // 将第三方库拆分为单独的块
        config.optimization.splitChunks = {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 1024 * 1024 * 5, // 最大5MB
              enforce: true
            }
          }
        };
      }
      
      // 避免动态链接库
      if (config.plugins) {
        const dlls = config.plugins.filter((plugin) => plugin.constructor.name === 'DllReferencePlugin');
        config.plugins = config.plugins.filter((plugin) => plugin.constructor.name !== 'DllReferencePlugin');
      }
    }
    
    // 配置额外的路径别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    
    return config;
  },
  
  // 修改构建参数
  experimental: {
    // 禁用静态图像，避免大文件问题
    // 注意: 此配置在Next.js 13+中不再需要，已移至images配置
    forceSwcTransforms: true,
    optimizeCss: true,
    optimizeServerReact: true,
    scrollRestoration: true,
  },
  
  // Cloudflare Pages的特殊配置
  ...(isCloudflare && {
    output: 'standalone',
    distDir: '.next',
  }),
  
  // 配置环境变量
  env: {
    NEXT_PUBLIC_APP_ENV: isProd ? 'production' : 'development',
    NEXT_DISABLE_WEBPACK_CACHE: '1',
  },
  
  // 禁用TypeScript检查，加快构建速度
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 禁用ESLint检查，加快构建速度
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 只生成所需页面
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' },
    };
  },
};

module.exports = nextConfig; 