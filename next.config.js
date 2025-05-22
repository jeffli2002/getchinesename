/** @type {import('next').NextConfig} */
const path = require('path');

// 获取Cloudflare Pages环境变量
const isProd = process.env.NODE_ENV === 'production';
const isCloudflarePages = process.env.CF_PAGES === '1';

const nextConfig = {
  reactStrictMode: true,
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

    // 限制模块大小
    if (isProd) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 1000000, // 1MB
      };
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

    // 解决Cloudflare Pages构建问题
    if (isCloudflarePages && isProd) {
      // 强制node_modules中的模块使用es5
      config.module.rules.push({
        test: /\.m?js$/,
        include: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { node: 'current' } }]
            ]
          }
        }
      });
    }

    // 添加source-map以便调试
    if (!isProd) {
      config.devtool = 'eval-source-map';
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

  // 关闭严格模式可以减少重复渲染
  reactStrictMode: false,
  
  // 避免一些特定的TypeScript错误
  typescript: {
    ignoreBuildErrors: isCloudflarePages, // 在Cloudflare Pages构建时忽略TypeScript错误
  },

  // 修正路径别名
  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '',
  }
};

module.exports = nextConfig; 