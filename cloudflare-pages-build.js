// Cloudflare Pages 专用构建脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { rimraf } = require('rimraf');

console.log('===== Cloudflare Pages 专用构建脚本 =====');

// 清理缓存和构建目录
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

// 递归删除文件大小超过指定大小的文件
function removeLargeFiles(dir, maxSizeMB = 20) {
  console.log(`检查目录 ${dir} 中大于 ${maxSizeMB}MB 的文件...`);
  
  if (!fs.existsSync(dir)) {
    console.log(`目录 ${dir} 不存在，跳过`);
    return;
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    
    try {
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        removeLargeFiles(filePath, maxSizeMB);
      } else if (stats.size > maxSizeBytes) {
        console.log(`删除大文件: ${filePath} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`删除文件失败: ${filePath}`, err);
        }
      }
    } catch (err) {
      console.error(`无法读取文件信息: ${filePath}`, err);
    }
  }
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

// 更新babel.config.js
function updateBabelConfig() {
  console.log('更新babel.config.js...');
  
  const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
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
  
  fs.writeFileSync(babelConfigPath, babelConfig);
  console.log('babel.config.js已更新');
}

// 确保.cfignore文件存在且内容正确
function ensureCfIgnore() {
  console.log('确保.cfignore文件正确...');
  
  const cfignorePath = path.join(process.cwd(), '.cfignore');
  const cfignoreTxtPath = path.join(process.cwd(), 'cfignore.txt');
  
  // 尝试从cfignore.txt读取
  if (fs.existsSync(cfignoreTxtPath)) {
    try {
      const content = fs.readFileSync(cfignoreTxtPath, 'utf8');
      fs.writeFileSync(cfignorePath, content, 'utf8');
      console.log('已从cfignore.txt更新.cfignore文件');
    } catch (err) {
      console.error('从cfignore.txt读取失败:', err);
      createDefaultCfIgnore(cfignorePath);
    }
  } else {
    // 如果cfignore.txt不存在，创建默认内容
    console.log('未找到cfignore.txt，将创建默认的.cfignore');
    createDefaultCfIgnore(cfignorePath);
  }
}

// 创建默认的.cfignore内容
function createDefaultCfIgnore(filePath) {
  const defaultContent = `# 忽略文件夹
node_modules/
.next/cache/
.next/cache/webpack/
.next/cache/webpack/client-production/
.next/cache/webpack/server-production/
.cloudflare/

# 忽略大型文件
**/*.pack
**/*.pack.gz
**/*.wasm
**/.git

# 忽略开发文件
.env.local
.env.development
.env.development.local
.npm/
.eslintcache
.vscode/
.idea/

# 忽略日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
logs/
*.log

# 忽略测试文件
coverage/
.nyc_output/
playwright-report/
test-results/

# 忽略备份文件
**/*~
**/*.bak
**/*.swp
**/*.swo`;
  
  try {
    fs.writeFileSync(filePath, defaultContent, 'utf8');
    console.log(`创建了默认的${filePath}文件`);
    
    // 同时创建cfignore.txt供后续使用
    const cfignoreTxtPath = path.join(process.cwd(), 'cfignore.txt');
    if (!fs.existsSync(cfignoreTxtPath)) {
      fs.writeFileSync(cfignoreTxtPath, defaultContent, 'utf8');
      console.log('同时创建了cfignore.txt文件供后续使用');
    }
  } catch (err) {
    console.error(`创建${filePath}失败:`, err);
  }
}

// 构建项目
function buildProject() {
  console.log('开始构建项目...');
  
  // 设置环境变量
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NODE_ENV = 'production';
  process.env.MINIMIZE_ASSETS = 'true'; 
  
  try {
    // 使用Next.js构建
    execSync('npx next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
      }
    });
    
    console.log('Next.js构建完成');
  } catch (error) {
    console.error('构建失败:', error);
    process.exit(1);
  }
}

// 清理webpack缓存文件
function cleanWebpackCache() {
  console.log('彻底清理webpack缓存文件...');
  
  // 删除webpack缓存目录
  const webpackCacheDir = path.join(process.cwd(), '.next/cache/webpack');
  if (fs.existsSync(webpackCacheDir)) {
    try {
      rimraf.sync(webpackCacheDir);
      console.log('已清理webpack缓存目录');
    } catch (err) {
      console.error('清理webpack缓存失败:', err);
      
      // 尝试使用命令行工具删除
      try {
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${webpackCacheDir}"`);
        } else {
          execSync(`rm -rf "${webpackCacheDir}"`);
        }
        console.log('通过命令行删除webpack缓存成功');
      } catch (cmdErr) {
        console.error('通过命令行删除失败:', cmdErr);
      }
    }
  }
  
  // 递归检查.next目录并删除大文件
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    // 删除大文件
    removeLargeFiles(nextDir);
  }
  
  // 创建空的webpack缓存目录结构
  const clientProductionDir = path.join(process.cwd(), '.next/cache/webpack/client-production');
  const serverProductionDir = path.join(process.cwd(), '.next/cache/webpack/server-production');
  
  fs.mkdirSync(clientProductionDir, { recursive: true });
  fs.mkdirSync(serverProductionDir, { recursive: true });
  
  // 创建占位符文件
  fs.writeFileSync(path.join(clientProductionDir, '.gitkeep'), '');
  fs.writeFileSync(path.join(serverProductionDir, '.gitkeep'), '');
  
  console.log('已重建webpack缓存目录结构');
}

// 复制Cloudflare配置
function copyCloudflareConfig() {
  console.log('复制Cloudflare配置...');
  
  // 确保.cloudflare目录存在
  const cloudflareDir = path.join(process.cwd(), '.cloudflare');
  if (!fs.existsSync(cloudflareDir)) {
    fs.mkdirSync(cloudflareDir, { recursive: true });
  }
  
  // 复制配置文件
  const configSourceDir = path.join(process.cwd(), 'cloudflare-config');
  if (fs.existsSync(configSourceDir)) {
    // 复制kv-ignore.json
    const kvIgnorePath = path.join(configSourceDir, 'kv-ignore.json');
    if (fs.existsSync(kvIgnorePath)) {
      fs.copyFileSync(kvIgnorePath, path.join(cloudflareDir, 'kv-ignore.json'));
    }
    
    // 确保workers-site目录存在
    const workersDir = path.join(cloudflareDir, 'workers-site');
    if (!fs.existsSync(workersDir)) {
      fs.mkdirSync(workersDir, { recursive: true });
    }
    
    // 复制workers-site/index.js
    const workerIndexPath = path.join(configSourceDir, 'workers-site/index.js');
    if (fs.existsSync(workerIndexPath)) {
      fs.copyFileSync(workerIndexPath, path.join(workersDir, 'index.js'));
    }
    
    console.log('Cloudflare配置文件已复制');
  }

  // 创建.cfconfig文件 - 包含Cloudflare配置的汇总
  const cfconfigPath = path.join(process.cwd(), '.cfconfig');
  const cfconfigContent = {
    name: "getchinesename",
    config_dir: "cloudflare-config",
    site: {
      bucket: ".next",
      exclude: [
        "**/*.pack", 
        "**/*.pack.gz", 
        ".next/cache/**/*",
        ".next/cache/webpack/**/*"
      ]
    },
    build: {
      command: "node cloudflare-pages-build.js",
      upload: {
        format: "service-worker",
        dir: ".next",
        include: ["**/*"],
        exclude: [
          "**/*.pack", 
          "**/*.pack.gz", 
          ".next/cache/**/*"
        ]
      }
    },
    wrangler_version: "4.16.1",
    compatibility_date: "2023-09-01",
    compatibility_flags: ["nodejs_compat"],
    last_updated: new Date().toISOString()
  };
  
  fs.writeFileSync(cfconfigPath, JSON.stringify(cfconfigContent, null, 2));
  console.log('.cfconfig文件已创建');
}

// 主函数
async function main() {
  try {
    console.log('开始Cloudflare Pages构建...');
    
    // 首先确保.cfignore文件存在
    ensureCfIgnore();
    
    // 清理目录
    cleanDirectories();
    
    // 更新配置文件 - 首先确保.cfignore文件存在
    updateBabelConfig();
    updateStore();
    
    // 构建项目
    buildProject();
    
    // 构建后再次确保.cfignore文件存在，可能会在构建过程中被覆盖
    ensureCfIgnore();
    
    // 构建后清理和优化
    cleanWebpackCache();
    copyCloudflareConfig();
    
    // 最后检查
    console.log('最后检查大文件...');
    removeLargeFiles(path.join(process.cwd(), '.next'));
    
    // 最后再次确认.cfignore文件是否存在
    const cfignorePath = path.join(process.cwd(), '.cfignore');
    if (fs.existsSync(cfignorePath)) {
      console.log('✅ .cfignore文件已存在并将用于部署');
    } else {
      console.error('❌ 警告: .cfignore文件不存在，这可能会导致部署问题!');
      ensureCfIgnore(); // 最后一次尝试
    }
    
    console.log('✅ Cloudflare Pages 构建完成!');
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 