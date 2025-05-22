/** @type {import('next').NextConfig} */
const path = require('path');

// 获取Cloudflare Pages环境变量
const isProd = process.env.NODE_ENV === 'production';
const isCloudflarePages = process.env.CF_PAGES === '1';

// 检查是否是Cloudflare部署
const isCloudflare = isCloudflarePages || process.env.NEXT_RUNTIME === 'edge';

const nextConfig = {
  reactStrictMode: false, // 关闭严格模式，减少重复渲染和一些React警告
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  
  // 配置路径别名
  webpack: (config, { isServer, webpack }) => {
    // 禁用持久缓存，避免大文件问题
    config.cache = false;
    
    // 调整代码分块策略，避免大文件
    if (config.optimization && config.optimization.splitChunks) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        minSize: 10000,
        maxSize: 20000000, // 20MB，保持在Cloudflare限制以下
        cacheGroups: {
          vendors: false, // 禁用默认的vendor分组
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|next)[\\/]/,
            priority: 40,
            chunks: 'all',
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            minChunks: 2,
            maxSize: 20000000, // 20MB
            chunks: 'all',
          },
          components: {
            name: 'components',
            test: /[\\/]src[\\/]components[\\/]/,
            minChunks: 2,
            priority: 20,
            chunks: 'all',
          },
          utils: {
            name: 'utils',
            test: /[\\/]src[\\/]utils[\\/]/,
            minChunks: 2,
            priority: 10,
            chunks: 'all',
          },
        },
      };
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

    // 强制禁用缓存，避免大文件问题
    config.cache = false;
    
    // 优化分块策略，减小文件大小
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      maxSize: 20 * 1024 * 1024, // 20MB，低于Cloudflare的25MB限制
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // 得到 node_modules/packageName/sub/path 中的 packageName
            if (!module.context) return 'vendor';
            const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
            const packageName = match ? match[1] : 'vendor';
            // 避免不符合规范的包名
            return `npm.${packageName.replace('@', '')}`;
          },
          priority: 10,
        },
        commons: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    };
    
    // 减小生成文件的大小，禁用不必要的功能
    if (isProd) {
      // 禁用热更新代码
      config.plugins = config.plugins.filter(
        (plugin) => plugin.constructor.name !== 'HotModuleReplacementPlugin'
      );
      
      // 禁用source maps
      config.devtool = false;
      
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
        config.optimization.splitChunks.maxSize = 15 * 1024 * 1024; // 15MB，留有余量
      }
      
      // 完全禁用缓存持久化
      config.cache = false;
      
      // 确保所有缓存文件不会被输出
      config.output = {
        ...config.output,
        path: path.join(__dirname, '.next'),
        clean: true, // 构建前清理输出目录
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
};

module.exports = nextConfig; 