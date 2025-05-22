// Cloudflare部署专用脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { rimraf } = require('rimraf');

console.log('===== Cloudflare Pages 专用部署脚本 =====');

// 确保.cfignore文件存在且内容正确
function ensureCfIgnore() {
  console.log('确保.cfignore文件正确...');
  
  // 如果.cfignore不存在或出现问题，从非隐藏版本复制
  const cfignorePath = path.join(process.cwd(), '.cfignore');
  const cfignoreTxtPath = path.join(process.cwd(), 'cfignore.txt');
  
  if (fs.existsSync(cfignoreTxtPath)) {
    const content = fs.readFileSync(cfignoreTxtPath, 'utf8');
    fs.writeFileSync(cfignorePath, content, 'utf8');
    console.log('.cfignore文件已从cfignore.txt更新');
  }
}

// 清理webpack缓存文件
function cleanWebpackCache() {
  console.log('清理webpack缓存文件...');
  
  // 删除整个webpack缓存目录
  const webpackCacheDir = path.join(process.cwd(), '.next/cache/webpack');
  if (fs.existsSync(webpackCacheDir)) {
    rimraf.sync(webpackCacheDir);
    console.log('已清理webpack缓存目录');
  }
  
  // 创建空目录以保持结构
  const clientProductionDir = path.join(process.cwd(), '.next/cache/webpack/client-production');
  const serverProductionDir = path.join(process.cwd(), '.next/cache/webpack/server-production');
  
  fs.mkdirSync(clientProductionDir, { recursive: true });
  fs.mkdirSync(serverProductionDir, { recursive: true });
  
  console.log('已重建webpack缓存目录结构');
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
}

// 主函数
async function main() {
  try {
    // 执行预部署步骤
    ensureCfIgnore();
    
    // 运行构建脚本
    console.log('执行cloudflare-build.js...');
    execSync('node cloudflare-build.js', { stdio: 'inherit' });
    
    // 清理webpack缓存文件
    cleanWebpackCache();
    
    // 复制Cloudflare配置
    copyCloudflareConfig();
    
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