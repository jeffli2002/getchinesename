// 专用于Cloudflare Pages的部署脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { rimraf } = require('rimraf');

console.log('===== Cloudflare Pages 专用部署脚本 =====');
console.log('当前目录:', process.cwd());

// 设置环境变量，确保禁用缓存
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_DISABLE_CACHE = '1';
process.env.MINIMIZE_ASSETS = 'true';

// 彻底清理缓存和构建目录
function forceCleanDirectories() {
  console.log('彻底强制清理所有缓存和构建目录...');
  
  // 要删除的所有目录
  const dirsToClean = [
    '.next',
    '.next/cache',
    '.next/cache/webpack',
    '.next/cache/webpack/client-production',
    '.next/cache/webpack/server-production',
    'node_modules/.cache',
  ];
  
  // 首先用rimraf尝试删除
  dirsToClean.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        console.log(`尝试删除: ${dir}`);
        rimraf.sync(dirPath, { force: true });
        console.log(`已清理: ${dir}`);
      } catch (err) {
        console.error(`清理 ${dir} 失败，将尝试使用系统命令:`, err);
      }
    }
  });

  // 删除所有.pack文件 - 无论在哪个目录
  try {
    console.log('删除所有.pack文件...');
    if (process.platform === 'win32') {
      execSync('del /s /q "*.pack"', { stdio: 'inherit' });
      execSync('del /s /q "*.pack.gz"', { stdio: 'inherit' });
    } else {
      execSync('find . -name "*.pack" -type f -delete', { stdio: 'inherit' });
      execSync('find . -name "*.pack.gz" -type f -delete', { stdio: 'inherit' });
    }
  } catch (err) {
    console.error('删除.pack文件失败:', err);
  }
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
      console.error('从cfignore.txt读取失败，创建默认内容:', err);
      createDefaultCfIgnore(cfignorePath);
    }
  } else {
    console.log('未找到cfignore.txt，将创建默认的.cfignore');
    createDefaultCfIgnore(cfignorePath);
  }
  
  // 确保.cfignore文件是否存在
  if (fs.existsSync(cfignorePath)) {
    console.log('.cfignore文件已存在');
    
    // 强制将必要的排除项添加到.cfignore文件中
    const content = fs.readFileSync(cfignorePath, 'utf8');
    const requiredPatterns = [
      '**/*.pack',
      '**/*.pack.gz',
      '.next/cache/',
      '.next/cache/**/*',
      '.next/cache/webpack/',
      '.next/cache/webpack/client-production/',
      '.next/cache/webpack/server-production/',
    ];
    
    let contentUpdated = false;
    let contentLines = content.split('\n');
    
    for (const pattern of requiredPatterns) {
      if (!content.includes(pattern)) {
        contentLines.push(pattern);
        contentUpdated = true;
      }
    }
    
    if (contentUpdated) {
      fs.writeFileSync(cfignorePath, contentLines.join('\n'), 'utf8');
      console.log('.cfignore文件已添加必要的排除项');
    }
  } else {
    console.error('警告: .cfignore文件不存在!');
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
**/*.map
**/.git
**/*.gz

# 忽略所有webpack缓存相关文件
**/*.hot-update.*
**/.cache
**/.next/cache/**/*
**/cache/webpack/client-production/**
**/cache/webpack/server-production/**

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
    console.log(`创建了默认的.cfignore文件: ${filePath}`);
    
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

// 主函数
async function main() {
  try {
    // 首先强制清理所有缓存
    forceCleanDirectories();
    
    // 确保.cfignore文件存在
    ensureCfIgnore();
    
    // 再次清理所有webpack缓存
    const cacheDirectories = [
      '.next/cache',
      '.next/cache/webpack',
      '.next/cache/webpack/client-production',
      '.next/cache/webpack/server-production',
      'node_modules/.cache'
    ];
    
    for (const dir of cacheDirectories) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        try {
          console.log(`删除缓存目录: ${dir}`);
          rimraf.sync(dirPath, { force: true });
        } catch (err) {
          console.error(`通过rimraf删除${dir}失败:`, err);
        }
      }
    }
    
    // 运行我们优化的构建脚本，使用禁用缓存的环境变量
    console.log('执行优化的构建过程...');
    try {
      // 使用Next.js构建，传递--no-cache参数禁用缓存
      execSync('NEXT_DISABLE_CACHE=1 NODE_OPTIONS="--max-old-space-size=4096" npx next build --no-cache', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          NEXT_TELEMETRY_DISABLED: '1',
          NEXT_DISABLE_CACHE: '1',
          NODE_ENV: 'production'
        }
      });
      
      console.log('构建完成');
    } catch (error) {
      console.error('构建失败:', error);
      process.exit(1);
    }
    
    // 构建后清理所有可能存在的大文件
    console.log('构建后清理...');
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      // 查找并删除所有大文件
      try {
        console.log('删除所有大于20MB的文件...');
        if (process.platform === 'win32') {
          execSync('forfiles /P .next /S /M *.* /C "cmd /c if @fsize GEQ 20971520 echo @path is too large, deleting... && del @path"', { stdio: 'inherit' });
        } else {
          execSync('find .next -type f -size +20M -exec rm -f {} \\;', { stdio: 'inherit' });
        }
      } catch (err) {
        console.error('删除大文件失败:', err);
      }
      
      // 删除所有.pack文件
      try {
        console.log('删除所有.pack文件...');
        if (process.platform === 'win32') {
          execSync('del /s /q ".next\\*.pack"', { stdio: 'inherit' });
          execSync('del /s /q ".next\\*.pack.gz"', { stdio: 'inherit' });
        } else {
          execSync('find .next -name "*.pack" -type f -delete', { stdio: 'inherit' });
          execSync('find .next -name "*.pack.gz" -type f -delete', { stdio: 'inherit' });
        }
      } catch (err) {
        console.error('删除.pack文件失败:', err);
      }
    }
    
    // 最后检查是否有任何大于25MB的文件
    const scriptToFindLargeFiles = `
      const fs = require('fs');
      const path = require('path');
      const MAX_SIZE = 25 * 1024 * 1024;

      function findLargeFiles(dir, maxSize) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let found = false;
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (findLargeFiles(fullPath, maxSize)) found = true;
          } else {
            const stats = fs.statSync(fullPath);
            if (stats.size > maxSize) {
              console.error(\`File \${fullPath} is \${(stats.size / (1024 * 1024)).toFixed(2)}MB and exceeds the 25MB limit!\`);
              found = true;
            }
          }
        }
        
        return found;
      }

      if (findLargeFiles('.next', MAX_SIZE)) {
        console.error('Found files larger than 25MB! Deployment would fail.');
        process.exit(1);
      } else {
        console.log('No files found that exceed the 25MB limit. Safe to deploy.');
      }
    `;
    
    try {
      console.log('检查是否有超过限制的大文件...');
      execSync(`node -e "${scriptToFindLargeFiles.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    } catch (err) {
      console.error('发现大文件，部署可能会失败:', err);
      process.exit(1);
    }
    
    // 读取项目名称
    let projectName = "getchinesename";
    try {
      if (fs.existsSync(path.join(process.cwd(), '.cfconfig'))) {
        const cfconfigContent = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.cfconfig'), 'utf8'));
        if (cfconfigContent.name) {
          projectName = cfconfigContent.name;
        }
      }
    } catch (err) {
      console.error('读取.cfconfig失败，使用默认项目名称:', err);
    }
    
    // 执行部署
    console.log(`开始部署到Cloudflare Pages，项目名称: ${projectName}...`);
    execSync(`npx wrangler pages deploy .next --project-name ${projectName} --commit-dirty=true`, { 
      stdio: 'inherit'
    });
    
    console.log('✅ 部署成功!');
  } catch (error) {
    console.error('❌ 部署失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 