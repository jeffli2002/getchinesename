/** @type {import('next').NextConfig} */
const path = require('path');
const webpack = require('webpack');

// 获取Cloudflare Pages环境变量
const isProd = process.env.NODE_ENV === 'production';
const isCloudflarePages = process.env.CF_PAGES === '1';

// 检查是否是Cloudflare部署
const isCloudflare = isCloudflarePages || process.env.NEXT_RUNTIME === 'edge';

// 检测是否是部署构建
const isBuildForDeploy = isProd || isCloudflare || process.env.NEXT_DISABLE_CACHE === '1';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  
  // 配置路径别名
  webpack: (config, { dev, isServer }) => {
    // 彻底禁用webpack缓存，避免生成大型.pack文件
    config.cache = false;
    
    // 确保watchOptions存在并正确设置ignored
    if (!config.watchOptions) {
      config.watchOptions = {};
    }
    
    // 正确设置watchOptions.ignored为数组
    config.watchOptions.ignored = [
      '**/.git/**',
      '**/node_modules/**',
      '**/.next/cache/**'
    ];
    
    // 控制文件大小 - 降低拆分阈值
    if (!dev) {
      // 配置性能提示
      config.performance = {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
      };
      
      // 优化拆分策略 - 确保文件小于Cloudflare的限制
      if (config.optimization) {
        // 使用确定性的模块ID算法
        config.optimization.moduleIds = 'named';
        
        // 使用确定性的chunk ID算法
        config.optimization.chunkIds = 'named';
        
        // 拆分chunks策略 - 确保文件小于10MB
        config.optimization.splitChunks = {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          maxSize: 10000000, // 最大10MB的块
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // 获取npm包名称
                if (!module.context) return 'vendor';
                
                const packageNameMatch = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!packageNameMatch) return 'vendor';
                
                const packageName = packageNameMatch[1];
                // 为每个包创建单独的chunk
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 20,
              reuseExistingChunk: true,
              maxSize: 5000000, // 5MB
            },
            default: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              maxSize: 5000000, // 5MB
            },
            styles: {
              name: 'styles',
              test: /\.css$/,
              chunks: 'all',
              enforce: true,
            }
          }
        };
        
        // 最小化设置
        config.optimization.minimize = true;
        if (config.optimization.minimizer) {
          for (const minimizer of config.optimization.minimizer) {
            if (minimizer.constructor.name === 'TerserPlugin') {
              minimizer.options.terserOptions = {
                ...minimizer.options.terserOptions,
                compress: {
                  ...minimizer.options.terserOptions?.compress,
                  reduce_vars: true,
                  pure_funcs: ['console.debug', 'console.log']
                },
                output: {
                  ...minimizer.options.terserOptions?.output,
                  comments: false
                }
              };
            }
          }
        }
      }
    }
    
    // 配置额外的路径别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    
    // 添加环境变量
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_DISABLE_CACHE': JSON.stringify('1'),
        'process.env.CLOUDFLARE_DEPLOYMENT': JSON.stringify(
          isCloudflare ? 'true' : 'false'
        ),
      })
    );
    
    return config;
  },
  
  // 修改构建参数
  experimental: {
    // 设置优化参数
    forceSwcTransforms: true,
    optimizeCss: false, // 禁用CSS优化以避免critters的问题
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
  
  // 禁用更多缓存和优化文件大小的设置
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig; 