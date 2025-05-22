/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // 配置路径别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    // 减小打包体积
    if (!isServer) {
      // 分割大模块
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 20 * 1024 * 1024, // 20MB限制
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](@react|react|react-dom|framer-motion)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // 安全处理模块上下文
              if (!module.context) return 'vendor';
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'vendor';
              return `npm.${match[1].replace('@', '')}`;
            },
            priority: 30,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: 'shared',
            minChunks: 3,
            priority: 10,
          },
        },
      };
    }
    
    return config;
  },
  async rewrites() {
    return [
      // API路由重写可以添加在这里
    ]
  },
  // 允许使用环境变量中的端口或默认端口
  serverRuntimeConfig: {
    // 不再硬编码端口
  },
  // 通过环境变量禁用遥测，而不是在配置中设置
  // Next.js 13.5.4中不支持在配置中设置telemetry属性
  
  // 添加Cloudflare Pages特定配置
  output: 'standalone',
  distDir: '.next',
  // 禁用基于webpack的缓存以减少文件大小
  experimental: {
    webpackBuildWorker: false,
    turbotrace: {
      memoryLimit: 4000,
    }
  }
}

module.exports = nextConfig 