// 删除.pack文件和大文件的脚本
const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('开始检查并删除.pack文件和大文件...');

// 删除所有.pack文件
function removePackFiles() {
  console.log('查找并删除.pack文件...');
  const packFiles = glob.sync('.next/**/*.pack')
    .concat(glob.sync('.next/**/*.pack.gz'));
  
  if (packFiles.length > 0) {
    console.log(`找到 ${packFiles.length} 个.pack文件`);
    packFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`已删除: ${file}`);
      } catch (err) {
        console.error(`删除文件 ${file} 失败:`, err);
      }
    });
  } else {
    console.log('未找到.pack文件');
  }
}

// 查找并删除大文件
function removeLargeFiles(maxSizeMB = 15) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  console.log(`查找并删除大于 ${maxSizeMB}MB 的文件...`);
  
  // 递归查找大文件
  function findLargeFilesRecursive(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findLargeFilesRecursive(fullPath);
      } else if (entry.isFile()) {
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size > maxSizeBytes) {
            console.log(`发现大文件: ${fullPath} (${(stats.size/1024/1024).toFixed(2)}MB)`);
            try {
              fs.unlinkSync(fullPath);
              console.log(`已删除大文件: ${fullPath}`);
            } catch (err) {
              console.error(`删除大文件失败: ${fullPath}`, err);
            }
          }
        } catch (err) {
          console.error(`检查文件大小失败: ${fullPath}`, err);
        }
      }
    }
  }
  
  findLargeFilesRecursive(path.join(process.cwd(), '.next'));
}

// 运行清理
removePackFiles();
removeLargeFiles();

console.log('清理完成!'); 