/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    // 配置路径别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
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
}

module.exports = nextConfig 