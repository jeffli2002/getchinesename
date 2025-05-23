/**
 * Cloudflare Pages超简化部署脚本
 * 这个脚本专为解决Cloudflare Pages 25MB文件大小限制问题设计
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const rimraf = require('rimraf');
const glob = require('glob');

// 设置环境变量
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_DISABLE_CACHE = '1';

console.log('===== Cloudflare Pages 简化部署脚本 =====');
console.log('当前目录:', process.cwd());

// 确保.cfignore文件存在
function ensureCfIgnore() {
  if (fs.existsSync(path.join(process.cwd(), 'cfignore.txt'))) {
    fs.copyFileSync(
      path.join(process.cwd(), 'cfignore.txt'),
      path.join(process.cwd(), '.cfignore')
    );
    console.log('已从cfignore.txt创建.cfignore文件');
  } else {
    console.log('警告: 未找到cfignore.txt文件!');
  }
}

// 禁用webpack缓存 - 直接修改next.config.js文件
function disableWebpackCache() {
  console.log('禁用webpack缓存...');
  
  // 修改next.config.js，确保cache选项为false
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  if (fs.existsSync(nextConfigPath)) {
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // 强制设置为false
    if (!configContent.includes('config.cache = false')) {
      // 备份原配置
      fs.copyFileSync(nextConfigPath, `${nextConfigPath}.bak`);
      
      // 添加cache: false配置
      if (configContent.includes('webpack:')) {
        configContent = configContent.replace(
          /webpack:\s*\(\s*config\s*,/,
          'webpack: (config, // 禁用webpack缓存\n  config.cache = false;\n  '
        );
      } else {
        console.log('无法找到webpack配置块，将添加新的配置');
        configContent = configContent.replace(
          'module.exports = {',
          'module.exports = {\n  webpack: (config) => {\n    // 禁用webpack缓存\n    config.cache = false;\n    return config;\n  },'
        );
      }
      
      fs.writeFileSync(nextConfigPath, configContent, 'utf8');
      console.log('已更新next.config.js以禁用webpack缓存');
    } else {
      console.log('next.config.js已禁用webpack缓存');
    }
  }
}

// 预处理 - 执行deploy.js进行React和Store修复
console.log('执行预处理...');
try {
  execSync('node deploy.js', { stdio: 'inherit' });
  console.log('预处理完成');
} catch (err) {
  console.error('预处理失败:', err);
  // 继续执行，不退出
}

// 更新.cfignore
ensureCfIgnore();

// 强制禁用webpack缓存
disableWebpackCache();

// 1. 清理所有缓存和构建目录
console.log('清理缓存和构建目录...');
try {
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    if (process.platform === 'win32') {
      execSync('rmdir /s /q .next', { stdio: 'inherit' });
    } else {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }
  }
  
  // 清除node_modules缓存
  try {
    const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      if (process.platform === 'win32') {
        execSync('rmdir /s /q "node_modules\\.cache"', { stdio: 'inherit' });
      } else {
        execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
      }
    }
  } catch (err) {
    console.error('清理node_modules/.cache失败:', err);
  }
  
  console.log('已删除.next和缓存目录');
} catch (err) {
  console.error('删除.next目录失败:', err);
}

// 2. 执行构建 - 禁用缓存
console.log('执行无缓存构建...');
try {
  // 确保使用正确的构建命令和环境变量
  const buildCmd = process.platform === 'win32'
    ? 'set NEXT_DISABLE_CACHE=1 && set NODE_OPTIONS=--max-old-space-size=4096 && npx next build'
    : 'NEXT_DISABLE_CACHE=1 NODE_OPTIONS=--max-old-space-size=4096 npx next build';
  
  execSync(buildCmd, {
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

// 3. 强制删除所有缓存目录和.pack文件
console.log('删除所有webpack缓存文件...');
try {
  // 确保缓存目录被删除
  const cacheDirs = [
    path.join(process.cwd(), '.next', 'cache'),
    path.join(process.cwd(), '.next', 'cache', 'webpack'),
    path.join(process.cwd(), '.next', 'cache', 'webpack', 'client-production'),
    path.join(process.cwd(), '.next', 'cache', 'webpack', 'server-production')
  ];
  
  // 使用系统命令强制删除
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${dir}"`, { stdio: 'inherit' });
        } else {
          execSync(`rm -rf "${dir}"`, { stdio: 'inherit' });
        }
        console.log(`删除缓存目录: ${dir}`);
      } catch (err) {
        console.error(`删除缓存目录失败: ${dir}`, err);
      }
    }
  });
  
  // 特别检查并删除client-production中的.pack文件
  const clientProductionDir = path.join(process.cwd(), '.next', 'cache', 'webpack', 'client-production');
  if (fs.existsSync(clientProductionDir)) {
    console.log('特别检查client-production目录中的.pack文件...');
    try {
      if (process.platform === 'win32') {
        execSync(`powershell -Command "Get-ChildItem -Path '${clientProductionDir}' -Recurse -File -Include *.pack,*.pack.gz | Remove-Item -Force -Verbose"`, 
          { stdio: 'inherit' });
      } else {
        execSync(`find "${clientProductionDir}" -name "*.pack" -type f -exec rm -fv {} \\;`, { stdio: 'inherit' });
        execSync(`find "${clientProductionDir}" -name "*.pack.gz" -type f -exec rm -fv {} \\;`, { stdio: 'inherit' });
      }
    } catch (err) {
      console.error('删除client-production .pack文件失败:', err);
    }
  }
  
  // 查找并删除所有.pack和.pack.gz文件
  console.log('查找并删除所有.pack文件...');
  if (process.platform === 'win32') {
    // Windows系统使用PowerShell查找并删除
    execSync(`powershell -Command "Get-ChildItem -Path '.next' -Recurse -File -Include *.pack,*.pack.gz | ForEach-Object { Write-Host ('删除pack文件: ' + $_.FullName); Remove-Item -Force $_.FullName }"`, 
      { stdio: 'inherit' });
  } else {
    // Unix系统使用find命令
    execSync('find .next -name "*.pack" -type f -exec echo "删除pack文件: {}" \\; -exec rm -f {} \\;', { stdio: 'inherit' });
    execSync('find .next -name "*.pack.gz" -type f -exec echo "删除pack文件: {}" \\; -exec rm -f {} \\;', { stdio: 'inherit' });
  }
  
  console.log('所有.pack文件已删除');
} catch (err) {
  console.error('删除.pack文件失败:', err);
}

// 4. 查找并删除所有超过20MB的文件
console.log('删除大文件...');
try {
  // 降低大文件阈值到15MB，避免接近限制
  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  
  console.log(`检查超过${MAX_FILE_SIZE_MB}MB的文件...`);
  
  if (process.platform === 'win32') {
    // Windows系统使用PowerShell查找并删除大文件
    execSync(`powershell -Command "Get-ChildItem -Path '.next' -Recurse -File | Where-Object { $_.Length -gt ${MAX_FILE_SIZE_BYTES} } | ForEach-Object { Write-Host ('删除大文件: ' + $_.FullName + ' (' + [math]::Round($_.Length / 1MB, 2) + 'MB)'); Remove-Item -Force $_.FullName }"`, 
      { stdio: 'inherit' });
  } else {
    // Unix系统使用find命令
    execSync(`find .next -type f -size +${MAX_FILE_SIZE_MB}M -exec echo "删除大文件: {}" \\; -exec rm -f {} \\;`, 
      { stdio: 'inherit' });
  }
  
  // 特别检查webpack缓存目录
  const packDirs = [
    path.join(process.cwd(), '.next', 'cache', 'webpack'),
    path.join(process.cwd(), '.next', 'static', 'chunks')
  ];
  
  packDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`特别检查目录: ${dir}`);
      try {
        if (process.platform === 'win32') {
          execSync(`powershell -Command "Get-ChildItem -Path '${dir}' -Recurse -File | Where-Object { $_.Length -gt 10485760 } | ForEach-Object { Write-Host ('清理大文件: ' + $_.FullName + ' (' + [math]::Round($_.Length / 1MB, 2) + 'MB)'); Remove-Item -Force $_.FullName }"`, 
            { stdio: 'inherit' });
        } else {
          execSync(`find "${dir}" -type f -size +10M -exec echo "清理大文件: {}" \\; -exec rm -f {} \\;`, 
            { stdio: 'inherit' });
        }
      } catch (err) {
        console.error(`检查大文件目录失败: ${dir}`, err);
      }
    }
  });
  
  console.log('所有大文件已删除');
} catch (err) {
  console.error('删除大文件失败:', err);
}

// 5. 最终清理并执行部署
console.log('执行最终清理...');
try {
  // 确保正确使用.cfignore - 再次确认
  ensureCfIgnore();
  
  // 从.cfconfig读取项目名称
  let projectName = "getchinesename";
  try {
    const cfConfigPath = path.join(process.cwd(), '.cfconfig');
    if (fs.existsSync(cfConfigPath)) {
      const cfConfig = JSON.parse(fs.readFileSync(cfConfigPath, 'utf8'));
      if (cfConfig.name) {
        projectName = cfConfig.name;
      }
    }
  } catch (err) {
    console.error('读取.cfconfig失败，使用默认项目名称:', err);
  }
  
  console.log(`使用项目名称: ${projectName}`);
  
  // 最后一次检查并删除所有.pack文件
  console.log('最终检查和删除pack文件...');
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Get-ChildItem -Path '.next' -Recurse -File -Include *.pack,*.pack.gz | Remove-Item -Force"`, 
      { stdio: 'inherit' });
  } else {
    execSync('find .next -name "*.pack" -type f -delete', { stdio: 'inherit' });
    execSync('find .next -name "*.pack.gz" -type f -delete', { stdio: 'inherit' });
  }
  
  // 使用npx wrangler pages deploy命令部署
  console.log('执行部署...');
  execSync(`npx wrangler pages deploy .next --project-name ${projectName} --commit-dirty=true`, {
    stdio: 'inherit'
  });
  
  console.log('✅ 部署成功!');
} catch (err) {
  console.error('❌ 部署失败:', err);
  console.error(err);
  process.exit(1);
}

function cleanWebpackCache() {
  console.log('彻底清理webpack缓存文件...');
  
  // 删除整个webpack缓存目录
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
        console.log(`已清理${dir}`);
      } catch (err) {
        console.error(`清理${dir}失败, 尝试强制删除:`, err);
        
        // 尝试使用命令行工具强制删除
        try {
          if (process.platform === 'win32') {
            execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
          } else {
            execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
          }
          console.log(`通过命令行强制删除${dir}成功`);
        } catch (cmdErr) {
          console.error(`通过命令行删除失败:`, cmdErr);
        }
      }
    }
  }
  
  // 额外检查并删除可能残留的pack文件
  findAndDeleteFiles('.next', '*.pack');
  findAndDeleteFiles('.next', '*.pack.gz');

  // 强制创建.next/cache目录但确保它是空的
  try {
    const cacheDir = path.join(process.cwd(), '.next/cache');
    if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
      fs.mkdirSync(path.join(process.cwd(), '.next'));
    }
    
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }
    
    // 创建一个.gitkeep文件确保目录存在但为空
    fs.writeFileSync(path.join(cacheDir, '.gitkeep'), '');
    console.log('创建了空的.next/cache目录，防止构建过程中的错误');
  } catch (err) {
    console.error('创建空的缓存目录失败:', err);
  }
}

// 查找并删除指定文件
function findAndDeleteFiles(directory, pattern) {
  try {
    const files = glob.sync(`${directory}/**/${pattern}`);
    if (files.length > 0) {
      console.log(`找到${files.length}个匹配 ${pattern} 的文件`);
      files.forEach(file => {
        try {
          fs.unlinkSync(file);
          console.log(`已删除: ${file}`);
        } catch (err) {
          console.error(`删除文件 ${file} 失败:`, err);
        }
      });
    } else {
      console.log(`未找到匹配 ${pattern} 的文件`);
    }
  } catch (err) {
    console.error(`搜索 ${pattern} 文件时出错:`, err);
  }
}

// 构建后清理
function cleanupAfterBuild() {
  console.log('构建后清理大文件...');
  // 再次检查并删除大文件
  findAndDeleteFiles('.next', '*.pack');
  findAndDeleteFiles('.next', '*.pack.gz');
  
  // 查找所有超过15MB的文件
  findLargeFiles('.next', 15 * 1024 * 1024); // 15MB
}

// 查找大文件
function findLargeFiles(directory, sizeLimit) {
  console.log(`查找 ${directory} 中大于 ${sizeLimit/1024/1024}MB 的文件...`);
  try {
    const findLargeFilesRecursive = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          findLargeFilesRecursive(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            if (stats.size > sizeLimit) {
              console.log(`发现大文件: ${fullPath} (${(stats.size/1024/1024).toFixed(2)}MB)`);
              try {
                fs.unlinkSync(fullPath);
                console.log(`删除了大文件: ${fullPath}`);
              } catch (err) {
                console.error(`删除大文件失败: ${fullPath}`, err);
              }
            }
          } catch (err) {
            console.error(`检查文件大小失败: ${fullPath}`, err);
          }
        }
      }
    };
    
    findLargeFilesRecursive(directory);
  } catch (err) {
    console.error(`查找大文件时出错:`, err);
  }
}

// 部署到Cloudflare Pages
function deployToCloudflare() {
  console.log('部署到Cloudflare Pages...');
  // 这里添加部署逻辑
}

// 主函数
async function main() {
  try {
    // 清理webpack缓存
    cleanWebpackCache();
    
    // 确保.cfignore文件存在
    ensureCfIgnore();
    
    // 禁用webpack缓存
    disableWebpackCache();
    
    // 使用Next.js构建，传递--no-cache参数禁用缓存
    console.log('执行构建过程，禁用缓存...');
    execSync('npx next build --no-cache', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_DISABLE_CACHE: '1',
        NODE_ENV: 'production'
      }
    });
    
    // 构建后再次清理所有可能存在的大文件
    cleanupAfterBuild();
    
    // 部署到Cloudflare Pages
    deployToCloudflare();
    
  } catch (err) {
    console.error('部署过程中发生错误:', err);
    process.exit(1);
  }
}

// 运行主函数
main(); 