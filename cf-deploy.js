/**
 * Cloudflare Pages超简化部署脚本
 * 这个脚本专为解决Cloudflare Pages 25MB文件大小限制问题设计
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 设置环境变量
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_DISABLE_CACHE = '1';

console.log('===== Cloudflare Pages 简化部署脚本 =====');
console.log('当前目录:', process.cwd());

// 确保.cfignore文件存在
if (fs.existsSync(path.join(process.cwd(), 'cfignore.txt'))) {
  fs.copyFileSync(
    path.join(process.cwd(), 'cfignore.txt'),
    path.join(process.cwd(), '.cfignore')
  );
  console.log('已从cfignore.txt创建.cfignore文件');
} else {
  console.log('警告: 未找到cfignore.txt文件!');
}

// 1. 清理所有缓存和构建目录
console.log('清理缓存和构建目录...');
try {
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    fs.rmSync(path.join(process.cwd(), '.next'), { recursive: true, force: true });
  }
  console.log('已删除.next目录');
} catch (err) {
  console.error('删除.next目录失败:', err);
}

// 2. 执行构建 - 禁用缓存
console.log('执行无缓存构建...');
try {
  const buildCommand = process.platform === 'win32'
    ? 'set NEXT_DISABLE_CACHE=1 && npx next build --no-cache'
    : 'NEXT_DISABLE_CACHE=1 npx next build --no-cache';
  
  execSync(buildCommand, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_DISABLE_CACHE: '1',
      NODE_ENV: 'production'
    }
  });
  console.log('构建完成');
} catch (err) {
  console.error('构建失败:', err);
  process.exit(1);
}

// 3. 删除所有.pack文件
console.log('删除所有.pack文件...');
try {
  const nextDir = path.join(process.cwd(), '.next');
  
  const findPackFiles = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findPackFiles(fullPath);
      } else if (entry.name.endsWith('.pack') || entry.name.endsWith('.pack.gz')) {
        console.log(`删除文件: ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
    }
  };
  
  findPackFiles(nextDir);
  console.log('所有.pack文件已删除');
} catch (err) {
  console.error('删除.pack文件失败:', err);
}

// 4. 查找并删除所有超过20MB的文件
console.log('删除大文件...');
try {
  const nextDir = path.join(process.cwd(), '.next');
  const maxSizeMB = 20;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const findLargeFiles = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findLargeFiles(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        if (stats.size > maxSizeBytes) {
          console.log(`删除大文件: ${fullPath} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
          fs.unlinkSync(fullPath);
        }
      }
    }
  };
  
  findLargeFiles(nextDir);
  console.log('所有大文件已删除');
} catch (err) {
  console.error('删除大文件失败:', err);
}

// 5. 执行部署
console.log('执行部署...');
try {
  // 使用项目名称getchinesename
  const projectName = "getchinesename";
  
  execSync(`npx wrangler pages deploy .next --project-name ${projectName} --commit-dirty=true`, {
    stdio: 'inherit'
  });
  
  console.log('✅ 部署成功!');
} catch (err) {
  console.error('❌ 部署失败:', err);
  process.exit(1);
} 