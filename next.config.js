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

    // 限制模块大小 - 针对Cloudflare的25MB限制调整
    if (isProd) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        minSize: 5000,
        maxSize: 15000000, // 15MB - 远低于Cloudflare的25MB限制
        cacheGroups: {
          vendors: false, // 禁用默认的vendor分组
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|next)[\\/]/,
            priority: 40,
            chunks: 'all',
            enforce: true,
          },
          // 进一步细分React相关库
          reactDom: {
            name: 'react-dom',
            test: /[\\/]node_modules[\\/]react-dom[\\/]/,
            priority: 39,
            chunks: 'all',
          },
          // 分割大型图标库
          icons: {
            name: 'icons',
            test: /[\\/]node_modules[\\/]react-icons[\\/]/,
            priority: 38,
            chunks: 'all',
          },
          // 分割动画库
          framerMotion: {
            name: 'framer-motion',
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            priority: 37,
            chunks: 'all',
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            minChunks: 2,
            maxSize: 15000000, // 15MB
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

      // 强制分割大型模块
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 100, // 显著增加分块数量，减小每个块的大小
        })
      );
      
      // 提高代码压缩级别，减小文件大小
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach(minimizer => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions?.compress,
                passes: 2,
                drop_console: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
            };
          }
        });
      }
    }

    // 安全处理模块上下文
    config.module.parser = {
      ...config.module.parser,
      javascript: {
        ...config.module.parser?.javascript,
        exportsPresence: 'error',
        importExportsPresence: false,
      },
    };

    // 添加对.tsx文件的明确处理
    if (isProd) {
      config.module.rules.push({
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ],
              plugins: []
            }
          }
        ],
        exclude: /node_modules/
      });
    }

    // 添加source-map以便调试
    if (!isProd) {
      config.devtool = 'eval-source-map';
    } else {
      // 生产环境禁用source map，减少文件大小
      config.devtool = false;
    }

    // 分析构建大小（可选）
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // 外部模块配置，减小构建大小
  experimental: {
    esmExternals: 'loose',
  },

  // 添加重写规则
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // 避免一些特定的TypeScript错误
  typescript: {
    ignoreBuildErrors: true, // 忽略TypeScript错误
  },

  // 修正路径别名
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