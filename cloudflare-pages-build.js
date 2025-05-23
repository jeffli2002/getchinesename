// Cloudflare Pages 专用构建脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { rimraf } = require('rimraf');

console.log('===== Cloudflare Pages 专用构建脚本 =====');
console.log('当前目录:', process.cwd());

// 设置环境变量，确保禁用缓存
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_DISABLE_CACHE = '1';
process.env.MINIMIZE_ASSETS = 'true';

// 彻底清理缓存和构建目录
function cleanDirectories() {
  console.log('彻底清理缓存和构建目录...');
  
  // 彻底删除.next目录，确保完全清理所有缓存
  const dirsToClean = [
    '.next',
    '.next/cache',
    '.next/cache/webpack',
    '.next/cache/webpack/client-production',
    '.next/cache/webpack/server-production',
    'node_modules/.cache',
  ];
  
  dirsToClean.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        console.log(`尝试删除: ${dir}`);
        rimraf.sync(dirPath, { force: true });
        console.log(`已清理: ${dir}`);
      } catch (err) {
        console.error(`清理 ${dir} 失败:`, err);
        // 尝试使用系统命令强制删除
        try {
          if (process.platform === 'win32') {
            execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
          } else {
            execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
          }
          console.log(`使用系统命令成功清理: ${dir}`);
        } catch (cmdErr) {
          console.error(`即使使用系统命令也无法清理 ${dir}:`, cmdErr);
        }
      }
    }
  });
  
  // 额外检查并删除可能残留的pack文件
  findAndDeleteFiles('.next', '*.pack');
  findAndDeleteFiles('.next', '*.pack.gz');
}

// 递归查找并删除指定类型的文件
function findAndDeleteFiles(directory, pattern) {
  if (!fs.existsSync(directory)) {
    return;
  }
  
  console.log(`查找并删除 ${directory} 中的 ${pattern} 文件...`);
  
  try {
    if (process.platform === 'win32') {
      execSync(`del /s /q "${path.join(directory, pattern)}"`, { stdio: 'ignore' });
    } else {
      execSync(`find ${directory} -name "${pattern}" -type f -delete`, { stdio: 'ignore' });
    }
  } catch (err) {
    // 忽略错误，继续执行
  }
}

// 递归删除文件大小超过指定大小的文件
function removeLargeFiles(dir, maxSizeMB = 20) {
  console.log(`检查目录 ${dir} 中大于 ${maxSizeMB}MB 的文件...`);
  
  if (!fs.existsSync(dir)) {
    console.log(`目录 ${dir} 不存在，跳过`);
    return;
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  try {
    let foundLargeFiles = false;
    
    // 在Windows上使用PowerShell查找大文件
    if (process.platform === 'win32') {
      const command = `powershell -Command "Get-ChildItem -Path '${dir}' -Recurse -File | Where-Object { $_.Length -gt ${maxSizeBytes} } | ForEach-Object { $_.FullName }"`;
      try {
        const output = execSync(command, { encoding: 'utf8' });
        const files = output.trim().split(/\r?\n/).filter(Boolean);
        
        for (const file of files) {
          console.log(`删除大文件: ${file}`);
          try {
            fs.unlinkSync(file);
            foundLargeFiles = true;
          } catch (err) {
            console.error(`删除文件失败: ${file}`, err);
          }
        }
      } catch (err) {
        // 忽略PowerShell错误，回退到常规方法
        foundLargeFiles = recursivelyCheckAndDeleteLargeFiles(dir, maxSizeBytes) || foundLargeFiles;
      }
    } else {
      // 在Unix系统上使用find命令
      try {
        const command = `find "${dir}" -type f -size +${maxSizeMB}M -print`;
        const output = execSync(command, { encoding: 'utf8' });
        const files = output.trim().split(/\r?\n/).filter(Boolean);
        
        for (const file of files) {
          console.log(`删除大文件: ${file}`);
          try {
            fs.unlinkSync(file);
            foundLargeFiles = true;
          } catch (err) {
            console.error(`删除文件失败: ${file}`, err);
          }
        }
      } catch (err) {
        // 忽略find命令错误，回退到常规方法
        foundLargeFiles = recursivelyCheckAndDeleteLargeFiles(dir, maxSizeBytes) || foundLargeFiles;
      }
    }
    
    if (!foundLargeFiles) {
      console.log(`在 ${dir} 中没有发现大于 ${maxSizeMB}MB 的文件`);
    }
  } catch (err) {
    console.error(`检查大文件时出错:`, err);
    // 回退到常规方法
    recursivelyCheckAndDeleteLargeFiles(dir, maxSizeBytes);
  }
}

// 递归检查并删除大文件的标准方法
function recursivelyCheckAndDeleteLargeFiles(dir, maxSizeBytes) {
  if (!fs.existsSync(dir)) {
    return false;
  }
  
  let foundLargeFiles = false;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    
    try {
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        foundLargeFiles = recursivelyCheckAndDeleteLargeFiles(filePath, maxSizeBytes) || foundLargeFiles;
      } else if (stats.size > maxSizeBytes) {
        console.log(`删除大文件: ${filePath} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
        try {
          fs.unlinkSync(filePath);
          foundLargeFiles = true;
        } catch (err) {
          console.error(`删除文件失败: ${filePath}`, err);
        }
      }
    } catch (err) {
      console.error(`无法读取文件信息: ${filePath}`, err);
    }
  }
  
  return foundLargeFiles;
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
  
  // 确保.cfignore文件正确，再次验证
  if (fs.existsSync(cfignorePath)) {
    const content = fs.readFileSync(cfignorePath, 'utf8');
    console.log('.cfignore文件内容长度:', content.length, '字节');
    
    // 确保.cfignore包含必要的排除项
    const requiredPatterns = [
      "**/*.pack",
      "**/*.pack.gz",
      ".next/cache/**/*"
    ];
    
    let contentModified = false;
    let contentLines = content.split(/\r?\n/);
    
    for (const pattern of requiredPatterns) {
      if (!content.includes(pattern)) {
        contentLines.push(pattern);
        contentModified = true;
      }
    }
    
    if (contentModified) {
      fs.writeFileSync(cfignorePath, contentLines.join('\n'), 'utf8');
      console.log('.cfignore文件已添加必要的排除项');
    }
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

# 忽略所有webpack缓存相关文件
**/*.hot-update.*
**/.cache
**/.next/cache/**/*

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
**/*.swo

# 限制大文件
**/*.+(jpg|jpeg|gif|png|ico|mp4|webm|ogg|mp3|wav|pdf|zip|tar|gz|7z|rar) size>10000000`;
  
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
  
  try {
    // 使用Next.js构建，传递--no-cache参数禁用缓存
    const buildCommand = 'npx next build --no-cache';
    console.log(`执行构建命令: ${buildCommand}`);
    
    execSync(buildCommand, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_DISABLE_CACHE: '1',
        NODE_OPTIONS: '--max-old-space-size=4096' // 增加Node内存限制
      }
    });
    
    console.log('Next.js构建完成');
  } catch (error) {
    console.error('构建失败:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  try {
    console.log('开始Cloudflare Pages构建...');
    
    // 首先彻底清理目录
    cleanDirectories();
    
    // 确保.cfignore文件存在
    ensureCfIgnore();
    
    // 更新配置文件
    updateBabelConfig();
    updateStore();
    
    // 构建项目
    buildProject();
    
    // 构建后再次确保.cfignore文件存在，可能会在构建过程中被覆盖
    ensureCfIgnore();
    
    // 构建后处理 - 删除大文件
    console.log('清理大文件...');
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      removeLargeFiles(nextDir, 20); // 删除大于20MB的文件
    }
    
    // 最后的清理步骤，确保没有任何webpack缓存文件
    findAndDeleteFiles('.next', '*.pack');
    findAndDeleteFiles('.next', '*.pack.gz');
    
    // 最后再次确认.cfignore文件是否存在
    const cfignorePath = path.join(process.cwd(), '.cfignore');
    if (fs.existsSync(cfignorePath)) {
      console.log('✅ .cfignore文件已存在并将用于部署');
      
      // 输出文件内容以确认
      const content = fs.readFileSync(cfignorePath, 'utf8');
      console.log('.cfignore内容:', content.substring(0, 100) + '... (已截断)');
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