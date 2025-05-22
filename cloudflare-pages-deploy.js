// Windows版本的部署脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { rimraf } = require('rimraf');

// 输出当前目录
console.log('当前目录:', process.cwd());

try {
  // 设置环境变量
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  // 只在非Windows环境下尝试删除node_modules
  const isWindows = process.platform === 'win32';
  
  if (!isWindows) {
    // 清理旧依赖
    console.log('清理旧依赖...');
    if (fs.existsSync('node_modules')) {
      rimraf.sync('node_modules');
    }
    if (fs.existsSync('package-lock.json')) {
      fs.unlinkSync('package-lock.json');
    }

    // 安装依赖
    console.log('安装依赖...');
    execSync('npm install --no-fund --no-audit', { stdio: 'inherit' });
  } else {
    console.log('Windows环境检测，跳过删除node_modules...');
    
    // 在Windows上只更新package-lock.json
    if (fs.existsSync('package-lock.json')) {
      console.log('更新依赖...');
      execSync('npm install --no-fund --no-audit', { stdio: 'inherit' });
    }
  }

  // 运行deploy.js
  console.log('执行部署准备脚本...');
  require('./deploy.js');

  // 清理.next缓存目录
  console.log('清理.next/cache目录...');
  const nextCachePath = path.join(process.cwd(), '.next/cache');
  if (fs.existsSync(nextCachePath)) {
    rimraf.sync(nextCachePath);
  }

  // Windows环境中使用特定的命令
  if (isWindows) {
    console.log('Windows环境构建应用...');
    execSync('npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } 
    });
  } else {
    // 构建应用
    console.log('构建应用...');
    execSync('NEXT_TELEMETRY_DISABLED=1 npm run build', { stdio: 'inherit' });
  }

  console.log('部署准备完成');
} catch (error) {
  console.error('部署过程中出错:', error);
  process.exit(1);
} 