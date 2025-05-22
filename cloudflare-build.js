// Cloudflare Pages 专用构建脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { rimraf } = require('rimraf');

console.log('===== Cloudflare Pages 专用构建脚本 =====');
console.log('当前目录:', process.cwd());

// 清理缓存和build目录
function cleanDirectories() {
  console.log('清理缓存和构建目录...');
  const dirsToClean = [
    '.next',
    'node_modules/.cache',
  ];
  
  dirsToClean.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      rimraf.sync(dirPath);
      console.log(`已清理: ${dir}`);
    }
  });
}

// 修复所有TypeScript/React文件
function fixReactFiles() {
  console.log('修复React导入问题...');
  const srcDir = path.join(process.cwd(), 'src');
  
  // 递归处理所有.tsx/.jsx文件
  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        processDirectory(itemPath);
      } else if (itemPath.endsWith('.tsx') || itemPath.endsWith('.jsx')) {
        fixReactImports(itemPath);
      }
    }
  }
  
  function fixReactImports(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 处理React导入
      if (!content.includes('import React, { ReactNode }')) {
        if (content.includes('import React from \'react\';')) {
          content = content.replace('import React from \'react\';', 'import React, { ReactNode } from \'react\';');
          modified = true;
        } else if (content.includes('import React from "react";')) {
          content = content.replace('import React from "react";', 'import React, { ReactNode } from "react";');
          modified = true;
        } else if (!content.includes('import React')) {
          // 添加React导入
          content = 'import React, { ReactNode } from \'react\';\n' + content;
          modified = true;
        }
      }
      
      // 替换React.ReactNode为ReactNode
      if (content.includes('React.ReactNode')) {
        content = content.replace(/React\.ReactNode/g, 'ReactNode');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`已修复: ${filePath}`);
      }
    } catch (error) {
      console.error(`处理文件 ${filePath} 时出错:`, error);
    }
  }
  
  processDirectory(srcDir);
}

// 强制更新Layout.tsx
function forceUpdateLayout() {
  console.log('强制更新Layout.tsx...');
  const layoutPath = path.join(process.cwd(), 'src/components/layout/Layout.tsx');
  const layoutDir = path.dirname(layoutPath);
  
  if (!fs.existsSync(layoutDir)) {
    fs.mkdirSync(layoutDir, { recursive: true });
  }
  
  const layoutContent = `import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;`;
  
  fs.writeFileSync(layoutPath, layoutContent);
  console.log('Layout.tsx已更新');
}

// 创建或更新store/index.js
function updateStore() {
  console.log('更新store/index.js...');
  const storeDir = path.join(process.cwd(), 'src/store');
  const storeIndexPath = path.join(storeDir, 'index.js');
  const storeIndexTsPath = path.join(storeDir, 'index.ts');
  
  // 删除可能存在的.ts版本
  if (fs.existsSync(storeIndexTsPath)) {
    fs.unlinkSync(storeIndexTsPath);
    console.log('已删除store/index.ts');
  }
  
  // 确保目录存在
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }
  
  const storeContent = `import { create } from 'zustand';
import React from 'react';

// 创建语言状态存储
export const useLanguageStore = create((set) => ({
  language: 'en', // 默认语言为英文
  setLanguage: (lang) => set({ language: lang }),
}));

// 创建语言上下文
export const LanguageContext = React.createContext(null);

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const store = useLanguageStore();

  return (
    <LanguageContext.Provider value={store}>
      {children}
    </LanguageContext.Provider>
  );
};`;
  
  fs.writeFileSync(storeIndexPath, storeContent);
  console.log('store/index.js已更新');
}

// 更新配置文件
function updateConfigs() {
  console.log('更新配置文件...');
  
  // 更新babel.config.js
  const babelConfig = `module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource: 'react',
        },
      },
    ],
  ],
};`;
  
  fs.writeFileSync(path.join(process.cwd(), 'babel.config.js'), babelConfig);
  
  // 更新tsconfig.json
  try {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      if (tsConfig.compilerOptions) {
        tsConfig.compilerOptions.jsx = 'preserve';
        tsConfig.compilerOptions.esModuleInterop = true;
        tsConfig.compilerOptions.resolveJsonModule = true;
        tsConfig.compilerOptions.isolatedModules = true;
        tsConfig.compilerOptions.noEmit = true;
      }
      
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      console.log('tsconfig.json已更新');
    }
  } catch (error) {
    console.error('更新tsconfig.json时出错:', error);
  }
}

// 修改Next.js配置以控制文件大小
function updateNextConfig() {
  console.log('更新next.config.js以控制文件大小...');
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  // 读取现有配置
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // 修改webpack配置，增加分块大小控制
  if (!nextConfig.includes('minSize: 10000')) {
    nextConfig = nextConfig.replace(
      /webpack: \(config, {(.+?)}\) => {/s,
      `webpack: (config, {$1}) => {
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
            test: /[\\\\/]node_modules[\\\\/](react|react-dom|scheduler|prop-types|next)[\\\\/]/,
            priority: 40,
            chunks: 'all',
          },
          lib: {
            test: /[\\\\/]node_modules[\\\\/]/,
            priority: 30,
            minChunks: 2,
            maxSize: 20000000, // 20MB
            chunks: 'all',
          },
          components: {
            name: 'components',
            test: /[\\\\/]src[\\\\/]components[\\\\/]/,
            minChunks: 2,
            priority: 20,
            chunks: 'all',
          },
          utils: {
            name: 'utils',
            test: /[\\\\/]src[\\\\/]utils[\\\\/]/,
            minChunks: 2,
            priority: 10,
            chunks: 'all',
          },
        },
      };
    }`
    );
  }
  
  // 保存修改后的配置
  fs.writeFileSync(nextConfigPath, nextConfig);
  console.log('next.config.js已更新');
}

// 创建Cloudflare特定配置
function createCloudflareConfig() {
  console.log('创建Cloudflare Pages配置文件...');
  
  // 确保目录存在
  const configDir = path.join(process.cwd(), 'cloudflare-config');
  const workersDir = path.join(configDir, 'workers-site');
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  if (!fs.existsSync(workersDir)) {
    fs.mkdirSync(workersDir, { recursive: true });
  }
  
  // 创建或更新 kv-ignore.json
  const kvIgnorePath = path.join(configDir, 'kv-ignore.json');
  const kvIgnoreContent = {
    ignorePatterns: [
      ".next/cache/**/*",
      ".next/cache/webpack/**/*",
      ".next/cache/webpack/client-production/*",
      ".next/cache/webpack/server-production/*",
      "**/*.pack",
      "**/*.pack.gz",
      "node_modules/.cache/**/*"
    ]
  };
  
  fs.writeFileSync(kvIgnorePath, JSON.stringify(kvIgnoreContent, null, 2));
  console.log('已创建 cloudflare-config/kv-ignore.json');
  
  // 创建或更新 pages-config.json
  const pagesConfigPath = path.join(configDir, 'pages-config.json');
  const pagesConfigContent = {
    name: "getchinesename",
    build: {
      baseDir: ".next",
      command: "npm run cloudflare-build",
      publicPath: "",
      ignoredFiles: ["node_modules/.cache/**", ".next/cache/**"]
    },
    deployment: {
      routes: [
        { pattern: "/*", script: "index.js" }
      ],
      kv: {
        ASSETS: {
          binding: "ASSETS"
        }
      }
    },
    env: {
      NODE_VERSION: "18",
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_RUNTIME: "edge"
    },
    limits: {
      kv_max_entry_size: "24MiB"
    },
    build_config: {
      upload_config: {
        max_file_size: 25000000,
        chunk_size: 10000000,
        max_chunks: 100
      },
      optimization: {
        minify_js: true,
        minify_css: true,
        minify_html: true,
        treeshake: true
      }
    }
  };
  
  fs.writeFileSync(pagesConfigPath, JSON.stringify(pagesConfigContent, null, 2));
  console.log('已创建 cloudflare-config/pages-config.json');
  
  // 创建或更新 workers-site/index.js
  const workerIndexPath = path.join(workersDir, 'index.js');
  const workerIndexContent = `import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

/**
 * Cloudflare Pages优化配置
 */
addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  const url = new URL(event.request.url)
  let options = {}

  /**
   * 为了提高性能，我们禁用缓存在开发环境中，
   * 但在生产环境中启用缓存
   */
  if (DEBUG) {
    options.cacheControl = {
      bypassCache: true,
    }
  } else {
    options.cacheControl = {
      browserTTL: 60 * 60 * 24, // 24小时
      edgeTTL: 60 * 60 * 24 * 7, // 7天
      bypassCache: false,
    }
  }

  try {
    // 首先尝试从KV存储中获取资产
    const page = await getAssetFromKV(event, options)

    // 允许设置自定义缓存控制和其他响应头
    const response = new Response(page.body, page)

    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // 对于HTML页面，我们添加安全头部
    if (response.headers.get('content-type') && response.headers.get('content-type').includes('text/html')) {
      response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;")
    }

    return response
  } catch (e) {
    // 如果是404错误，尝试提供自定义404页面
    if (e.status === 404) {
      // 处理Next.js客户端路由的所有路径，返回index.html
      if (url.pathname.startsWith('/')) {
        try {
          // 返回主页，让客户端路由处理
          const notFoundResponse = await getAssetFromKV(event, {
            mapRequestToAsset: req => new Request(\`\${new URL(req.url).origin}/index.html\`, req),
          })
          
          return new Response(notFoundResponse.body, {
            ...notFoundResponse,
            status: 200, // 返回200而不是404，让客户端路由处理
          })
        } catch (e) {
          // 如果主页也不可用，返回默认404
        }
      }
    }

    return new Response(e.message || e.toString(), { status: e.status || 500 })
  }
}`;
  
  fs.writeFileSync(workerIndexPath, workerIndexContent);
  console.log('已创建 cloudflare-config/workers-site/index.js');
}

// 主函数
async function main() {
  try {
    // 设置环境变量
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.NODE_ENV = 'production';
    process.env.NEXT_RUNTIME = 'edge'; // 使用Edge运行时
    
    // 执行清理和修复
    cleanDirectories();
    updateConfigs();
    updateStore();
    fixReactFiles();
    forceUpdateLayout();
    updateNextConfig(); // 控制文件大小
    createCloudflareConfig(); // 添加这行来创建 Cloudflare 配置
    
    // 执行部署.js脚本
    console.log('执行deploy.js...');
    execSync('node deploy.js', { stdio: 'inherit' });
    
    // 构建项目，添加参数减小构建体积
    console.log('开始构建项目...');
    execSync('npx next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_ENV: 'production',
        MINIMIZE_ASSETS: 'true', // 添加自定义变量以最小化资产
      }
    });
    
    // 删除可能导致问题的缓存文件
    console.log('清理webpack缓存文件...');
    const webpackCacheDir = path.join(process.cwd(), '.next/cache/webpack');
    if (fs.existsSync(webpackCacheDir)) {
      rimraf.sync(webpackCacheDir);
      console.log('已清理webpack缓存文件');
    }
    
    // 添加：强制清理所有缓存文件，尤其是大型pack文件
    console.log('强制删除所有大型缓存文件...');
    // 明确删除client-production和server-production中的pack文件
    const clientProductionDir = path.join(process.cwd(), '.next/cache/webpack/client-production');
    const serverProductionDir = path.join(process.cwd(), '.next/cache/webpack/server-production');
    
    if (fs.existsSync(clientProductionDir)) {
      fs.readdirSync(clientProductionDir).forEach(file => {
        if (file.endsWith('.pack') || file.endsWith('.pack.gz')) {
          const filePath = path.join(clientProductionDir, file);
          try {
            fs.unlinkSync(filePath);
            console.log(`已删除: ${filePath}`);
          } catch (err) {
            console.error(`删除文件失败: ${filePath}`, err);
          }
        }
      });
    }
    
    if (fs.existsSync(serverProductionDir)) {
      fs.readdirSync(serverProductionDir).forEach(file => {
        if (file.endsWith('.pack') || file.endsWith('.pack.gz')) {
          const filePath = path.join(serverProductionDir, file);
          try {
            fs.unlinkSync(filePath);
            console.log(`已删除: ${filePath}`);
          } catch (err) {
            console.error(`删除文件失败: ${filePath}`, err);
          }
        }
      });
    }
    
    console.log('✅ 构建完成!');
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 