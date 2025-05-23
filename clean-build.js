// 清理构建脚本 - 彻底删除webpack缓存文件
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const rimraf = require('rimraf');

console.log('开始清理构建环境...');

// 设置环境变量
process.env.NEXT_DISABLE_CACHE = '1';
process.env.NODE_ENV = 'production';

// 需要删除的目录
const dirsToDelete = [
  '.next',
  '.next/cache',
  '.next/cache/webpack',
  '.next/cache/webpack/client-production',
  '.next/cache/webpack/server-production',
  'node_modules/.cache'
];

// 删除目录
dirsToDelete.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`删除目录: ${dir}`);
    try {
      rimraf.sync(dirPath, { force: true });
    } catch (err) {
      console.error(`使用rimraf删除${dir}失败:`, err);
      
      // 尝试使用系统命令强制删除
      try {
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
        } else {
          execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
        }
        console.log(`使用系统命令删除${dir}成功`);
      } catch (cmdErr) {
        console.error(`使用系统命令删除${dir}失败:`, cmdErr);
      }
    }
  }
});

// 创建空的.next/cache目录结构
console.log('创建空的缓存目录结构...');
const cacheDir = path.join(process.cwd(), '.next', 'cache');

try {
  // 创建.next目录
  if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
    fs.mkdirSync(path.join(process.cwd(), '.next'));
  }
  
  // 创建cache目录
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  
  // 创建.gitkeep文件确保目录存在
  fs.writeFileSync(path.join(cacheDir, '.gitkeep'), '');
  console.log('创建了空的.next/cache目录结构');
} catch (err) {
  console.error('创建缓存目录结构失败:', err);
}

// 安装缺失的依赖
console.log('检查并安装缺失的依赖...');
try {
  execSync('npm install react-icons --save', { stdio: 'inherit' });
  console.log('已安装react-icons依赖');
} catch (err) {
  console.error('安装依赖失败:', err);
}

console.log('清理完成! 现在可以运行构建命令了');
console.log('推荐使用: npm run build:nocache 或 npm run cf:nopack'); 