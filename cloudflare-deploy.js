// Cloudflare部署专用脚本
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

// 确保.cfignore文件存在且内容正确
function ensureCfIgnore() {
  console.log('确保.cfignore文件正确...');
  
  // 使用cfignore.txt作为配置源，将其复制到.cfignore
  const cfignorePath = path.join(process.cwd(), '.cfignore');
  const cfignoreTxtPath = path.join(process.cwd(), 'cfignore.txt');
  
  // 检查cfignore.txt是否存在
  if (fs.existsSync(cfignoreTxtPath)) {
    try {
      // 读取cfignore.txt的内容并写入.cfignore
      const content = fs.readFileSync(cfignoreTxtPath, 'utf8');
      fs.writeFileSync(cfignorePath, content, 'utf8');
      console.log('.cfignore文件已从cfignore.txt更新');
    } catch (err) {
      console.error('从cfignore.txt读取或写入.cfignore失败:', err);
      // 出错时创建默认内容
      createDefaultCfIgnore(cfignorePath);
    }
  } else {
    console.log('cfignore.txt不存在，将创建默认的.cfignore文件');
    createDefaultCfIgnore(cfignorePath);
  }
  
  // 验证.cfignore文件是否存在
  if (fs.existsSync(cfignorePath)) {
    console.log(`.cfignore文件已确认存在于 ${cfignorePath}`);
    const fileContent = fs.readFileSync(cfignorePath, 'utf8');
    console.log(`.cfignore文件大小: ${fileContent.length} 字节`);
    
    // 确保.cfignore包含必要的排除项
    const requiredPatterns = [
      "**/*.pack",
      "**/*.pack.gz",
      ".next/cache/**/*",
      ".next/cache/webpack/**/*"
    ];
    
    let contentModified = false;
    let contentLines = fileContent.split(/\r?\n/);
    
    for (const pattern of requiredPatterns) {
      if (!fileContent.includes(pattern)) {
        contentLines.push(pattern);
        contentModified = true;
      }
    }
    
    if (contentModified) {
      fs.writeFileSync(cfignorePath, contentLines.join('\n'), 'utf8');
      console.log('.cfignore文件已添加必要的排除项');
    }
  } else {
    console.error('警告: .cfignore文件创建失败!');
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
          console.log(`删除大文件: ${file} (超过${maxSizeMB}MB)`);
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

// 彻底清理webpack缓存文件
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
}

// 主函数
async function main() {
  try {
    // 执行预部署步骤
    ensureCfIgnore();
    
    // 彻底清理webpack缓存文件
    cleanWebpackCache();
    
    // 运行构建脚本
    console.log('执行cloudflare-pages-build.js...');
    execSync('node cloudflare-pages-build.js', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_DISABLE_CACHE: '1',
        NODE_OPTIONS: '--max-old-space-size=4096' // 增加Node内存限制
      }
    });
    
    // 最后一次检查是否有大文件
    console.log('最后检查是否存在大文件...');
    const nextDir = path.join(process.cwd(), '.next');
    removeLargeFiles(nextDir, 20); // 删除大于20MB的文件
    
    // 验证构建结果
    if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
      throw new Error('.next目录不存在，构建可能已失败');
    }
    
    // 最后的清理步骤，确保没有任何webpack缓存文件
    findAndDeleteFiles('.next', '*.pack');
    findAndDeleteFiles('.next', '*.pack.gz');
    
    // 显示成功消息
    console.log('✅ 部署准备完成! 执行wrangler部署命令...');
    
    // 读取项目名称从.cfconfig
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
    
    // 直接执行wrangler部署
    try {
      // 执行wrangler部署
      console.log(`开始部署到Cloudflare Pages，项目名称: ${projectName}...`);
      execSync(`npx wrangler pages deploy .next --project-name ${projectName} --commit-dirty=true`, { 
        stdio: 'inherit'
      });
      console.log('✅ 部署成功!');
    } catch (deployError) {
      console.error('❌ 部署失败:', deployError);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 部署准备失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 