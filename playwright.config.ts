import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 30000, // 每个测试的超时时间（30秒）
  retries: 2,     // 失败时重试次数
  use: {
    baseURL: 'http://localhost:3000', // 默认端口
    headless: true,                  // 默认使用无头模式以提高稳定性
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',    // 仅在测试失败时截图
    video: 'retain-on-failure',       // 仅在测试失败时保存视频
    trace: 'retain-on-failure',       // 仅在测试失败时保存跟踪
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    // 可以添加其他浏览器如 firefox, webkit
  ],
  // 在测试运行之前启动开发服务器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000', // 检查此URL是否响应
    reuseExistingServer: true,    // 如果服务器已经在运行，则重用
    timeout: 120000,              // 增加启动超时时间
  },
  expect: {
    timeout: 10000, // 增加断言的超时时间
  },
};

export default config; 