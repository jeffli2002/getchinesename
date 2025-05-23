// 自动修复导入路径脚本
const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('开始修复导入路径...');

// 查找所有TypeScript和JavaScript文件
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
let fixedCount = 0;

files.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // 替换导入语句 - 从store/index.ts改为store/index.js
      const patterns = [
        {
          regex: /from ['"](.*)\/store\/index\.ts['"]/g,
          replacement: 'from \'$1/store/index.js\''
        },
        {
          regex: /from ['"](.*)\/store\/index['"]/g,
          replacement: 'from \'$1/store/index.js\''
        },
        {
          regex: /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](.*)\/store\/index['"]/g,
          replacement: 'import { $1 } from \'$2/store/index.js\''
        },
        {
          regex: /import\s+\*\s+as\s+(\w+)\s+from\s+['"](.*)\/store\/index['"]/g,
          replacement: 'import * as $1 from \'$2/store/index.js\''
        },
        {
          regex: /import\s+(\w+)\s+from\s+['"](.*)\/store\/index['"]/g,
          replacement: 'import $1 from \'$2/store/index.js\''
        }
      ];
      
      // 应用所有替换模式
      patterns.forEach(pattern => {
        const newContent = content.replace(pattern.regex, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });
      
      if (modified) {
        console.log(`修复文件: ${file}`);
        fs.writeFileSync(file, content);
        fixedCount++;
      }
    }
  } catch (err) {
    console.error(`处理文件 ${file} 时出错:`, err);
  }
});

// 检查是否需要创建空的store/index.ts文件以解决导入错误
const storeTsPath = path.join(process.cwd(), 'src', 'store', 'index.ts');
const storeJsPath = path.join(process.cwd(), 'src', 'store', 'index.js');

if (!fs.existsSync(storeTsPath) && fs.existsSync(storeJsPath)) {
  try {
    // 创建一个重定向文件，将import重定向到.js版本
    const redirectContent = `// 此文件自动生成，用于解决导入问题
// 重定向到index.js
export * from './index.js';
`;
    fs.writeFileSync(storeTsPath, redirectContent);
    console.log(`创建了重定向文件: ${storeTsPath}`);
    fixedCount++;
  } catch (err) {
    console.error(`创建重定向文件失败: ${err}`);
  }
}

console.log(`完成! 已修复 ${fixedCount} 个文件的导入路径`); 