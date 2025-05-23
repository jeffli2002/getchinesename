// Cloudflare部署专用脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { rimraf } = require('rimraf');

console.log('===== Cloudflare Pages 专用部署脚本 =====');

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
  } catch (err) {
    console.error(`创建${filePath}失败:`, err);
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
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
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
  }
}

// 强制清理webpack缓存文件
function cleanWebpackCache() {
  console.log('彻底清理webpack缓存文件...');
  
  // 删除整个webpack缓存目录
  const webpackCacheDir = path.join(process.cwd(), '.next/cache/webpack');
  if (fs.existsSync(webpackCacheDir)) {
    try {
      rimraf.sync(webpackCacheDir);
      console.log('已清理webpack缓存目录');
    } catch (err) {
      console.error('清理webpack缓存失败，尝试强制删除:', err);
      
      // 尝试使用命令行工具强制删除
      try {
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${webpackCacheDir}"`, { stdio: 'inherit' });
        } else {
          execSync(`rm -rf "${webpackCacheDir}"`, { stdio: 'inherit' });
        }
        console.log('通过命令行强制删除webpack缓存成功');
      } catch (cmdErr) {
        console.error('通过命令行删除失败:', cmdErr);
      }
    }
  }
  
  // 删除所有大型缓存文件
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    removeLargeFiles(nextDir);
  }
  
  // 创建空目录以保持结构
  const clientProductionDir = path.join(process.cwd(), '.next/cache/webpack/client-production');
  const serverProductionDir = path.join(process.cwd(), '.next/cache/webpack/server-production');
  
  fs.mkdirSync(clientProductionDir, { recursive: true });
  fs.mkdirSync(serverProductionDir, { recursive: true });
  
  // 创建一个空的.gitkeep文件以保持目录结构
  fs.writeFileSync(path.join(clientProductionDir, '.gitkeep'), '');
  fs.writeFileSync(path.join(serverProductionDir, '.gitkeep'), '');
  
  console.log('已重建webpack缓存目录结构');
  
  // 创建一个隐藏标记文件，表示缓存已被清理
  fs.writeFileSync(path.join(process.cwd(), '.next', '.cache_cleaned'), new Date().toISOString());
}

// 复制cloudflare配置
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
    const configFiles = fs.readdirSync(configSourceDir);
    configFiles.forEach(file => {
      const sourcePath = path.join(configSourceDir, file);
      const targetPath = path.join(cloudflareDir, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        // 递归复制目录
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        
        const subFiles = fs.readdirSync(sourcePath);
        subFiles.forEach(subFile => {
          const subSourcePath = path.join(sourcePath, subFile);
          const subTargetPath = path.join(targetPath, subFile);
          
          if (!fs.statSync(subSourcePath).isDirectory()) {
            fs.copyFileSync(subSourcePath, subTargetPath);
          }
        });
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
    
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

// 创建自定义构建输出，不包含大文件
function createCustomBuildOutput() {
  console.log('创建不包含大文件的自定义构建输出...');
  
  const sourceDir = path.join(process.cwd(), '.next');
  const targetDir = path.join(process.cwd(), '.next-deploy');
  
  // 清理目标目录
  if (fs.existsSync(targetDir)) {
    rimraf.sync(targetDir);
  }
  
  // 创建目标目录
  fs.mkdirSync(targetDir, { recursive: true });
  
  // 使用命令行复制文件，排除大文件
  try {
    if (process.platform === 'win32') {
      execSync(`xcopy "${sourceDir}" "${targetDir}" /E /I /Y /EXCLUDE:cfignore.txt`, { stdio: 'inherit' });
    } else {
      execSync(`cp -R "${sourceDir}/"* "${targetDir}/" || true`, { stdio: 'inherit' });
    }
    console.log('已创建自定义构建输出');
  } catch (err) {
    console.error('创建自定义构建输出失败:', err);
  }
  
  // 扫描并删除大文件
  removeLargeFiles(targetDir);
}

// 主函数
async function main() {
  try {
    // 执行预部署步骤
    ensureCfIgnore();
    
    // 运行构建脚本
    console.log('执行cloudflare-build.js...');
    execSync('node cloudflare-build.js', { stdio: 'inherit' });
    
    // 彻底清理webpack缓存文件
    cleanWebpackCache();
    
    // 创建自定义构建输出
    // createCustomBuildOutput();  // 暂时注释掉，如果上面的方法仍然失败，可以尝试启用这个
    
    // 复制Cloudflare配置
    copyCloudflareConfig();
    
    // 最后一次检查是否有大文件
    console.log('最后检查是否存在大文件...');
    const nextDir = path.join(process.cwd(), '.next');
    removeLargeFiles(nextDir);
    
    // 显示成功消息
    console.log('✅ 部署准备完成! 现在可以将项目部署到Cloudflare Pages。');
    console.log('命令: npx wrangler pages deploy .next');
  } catch (error) {
    console.error('❌ 部署准备失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 