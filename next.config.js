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
    
    // 禁用持久化缓存
    if (config.optimization) {
      config.optimization.moduleIds = 'named';
      if (typeof config.optimization.emitOnErrors !== 'undefined') {
        config.optimization.emitOnErrors = true;
      }
    }
    
    // 设置代码分块策略
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 5000000, // 减小到5MB最大块
        cacheGroups: {
          default: false,
          vendors: false,
          // 框架代码
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // 工具库
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // 得到 node_modules/packageName/sub/path 中的 packageName
              if (!module.context) return 'vendor';
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              const packageName = match ? match[1] : 'vendor';
              // 避免不符合规范的包名
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // 常用工具函数
          commons: {
            name: 'commons',
            minChunks: 3,
            priority: 20,
          },
          // 其他业务代码
          shared: {
            name: 'shared',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          }
        },
      };
    }
    
    // 避免大型依赖
    if (!isServer) {
      config.externals = [...(config.externals || [])];
    }
    
    // 忽略生成大型source maps
    if (!dev && !isServer) {
      config.devtool = false;
    }
    
    // 添加路径别名
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    
    // 禁用某些大型模块
    if (isProd) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        })
      );
    }
    
    // 减小生成文件的大小，禁用不必要的功能
    if (isProd) {
      // 禁用热更新代码
      config.plugins = config.plugins.filter(
        (plugin) => plugin.constructor.name !== 'HotModuleReplacementPlugin'
      );
      
      // 禁用模块保留
      if (config.optimization) {
        config.optimization.moduleIds = 'named';
        
        // 优化缩小选项
        if (!config.optimization.minimizer) {
          config.optimization.minimizer = [];
        }
      }
    }
    
    // 专门针对Cloudflare Pages的优化
    if (isCloudflare || process.env.CLOUDFLARE_PAGES) {
      // 禁用webpack缓存
      config.output.pathinfo = false;
      
      // 设置更保守的分块大小
      if (config.optimization) {
        config.optimization.splitChunks.maxSize = 5 * 1024 * 1024; // 5MB，留有余量
      }
      
      // 完全禁用缓存持久化
      config.cache = false;
      
      // 确保所有缓存文件不会被输出
      config.output = {
        ...config.output,
        path: path.join(__dirname, '.next'),
        clean: true, // 构建前清理输出目录
      };
      
      // 禁用文件持久化缓存
      if (!config.plugins) {
        config.plugins = [];
      }
      
      // 避免大文件生成
      config.performance = {
        ...config.performance,
        maxAssetSize: 20000000, // 20MB
        maxEntrypointSize: 20000000, // 20MB
        hints: 'warning',
      };
    }
    
    return config;
  },
  
  // 输出配置
  output: 'standalone',
  
  // 禁用TypeScript检查，加快构建速度
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 禁用ESLint检查，加快构建速度
  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '',
  },
  
  // 禁用webpack5的持久缓存
  experimental: {
    disableStaticImages: true,
    cpus: 1,  // 限制CPU使用
  },

  // Cloudflare Pages优化配置
  // 这只会在Cloudflare Pages环境中应用
  ...(isCloudflare && {
    // 禁用webpack缓存以解决KV大小限制问题
    onDemandEntries: {
      // 避免长期缓存
      maxInactiveAge: 60 * 1000, // 1分钟
      pagesBufferLength: 1,      // 保持少量页面在内存中
    },
    
    // 优化构建
    compress: true,             // 启用压缩
    productionBrowserSourceMaps: false, // 禁用源映射以减小文件大小
    
    // 缓存控制
    generateEtags: true,
    
    // 优化图像
    images: {
      minimumCacheTTL: 60 * 60 * 24 * 7, // 7天
      deviceSizes: [640, 750, 828, 1080], // 减少图像尺寸变体
      imageSizes: [16, 32, 48, 64, 96],
      formats: ['image/webp'],           // 只使用WebP格式
    },
  }),

  // 只生成所需页面
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' },
    };
  },
};

module.exports = nextConfig; 