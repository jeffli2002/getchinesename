// 部署辅助脚本
const fs = require('fs');
const path = require('path');
const { rimraf } = require('rimraf');

// 创建404.js API处理程序
function create404Handler() {
  const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');
  
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  const handler404Path = path.join(apiDir, '404.js');
  
  if (!fs.existsSync(handler404Path)) {
    const handler404Content = `
export default function handler(req, res) {
  res.status(404).json({ error: 'API endpoint not found' });
}
`;
    
    fs.writeFileSync(handler404Path, handler404Content);
    console.log('创建了API 404处理程序');
  }
}

// 创建jsconfig.json文件
function createJsConfig() {
  const srcDir = path.join(process.cwd(), 'src');
  const jsConfigPath = path.join(srcDir, 'jsconfig.json');
  
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  if (!fs.existsSync(jsConfigPath)) {
    const jsConfigContent = {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['./*']
        }
      }
    };
    
    fs.writeFileSync(jsConfigPath, JSON.stringify(jsConfigContent, null, 2));
    console.log('创建了jsconfig.json');
  }
}

// 创建tsconfig.json文件
function createTsConfig() {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    const tsConfigContent = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"]
    };
    
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfigContent, null, 2));
    console.log('创建了tsconfig.json');
  }
}

// 删除可能引起问题的文件
function deleteProblematicFiles() {
  const storeIndexPath = path.join(process.cwd(), 'src', 'store', 'index.ts');
  
  if (fs.existsSync(storeIndexPath)) {
    fs.unlinkSync(storeIndexPath);
    console.log('删除store/index.ts');
  }
  
  // 删除一些不必要的图片文件
  const imageFilesToDelete = [
    'public/images/chinese-calligraphy.svg',
    'public/images/chinese-background.svg',
    'public/images/new-chinese-calligraphy.svg',
    'public/images/new-chinese-background.svg',
    'public/images/chinese-landscape.html',
    'public/images/chinese-landscape.jpg',
    'public/images/chinese-landscape.jpg.html'
  ];
  
  imageFilesToDelete.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`删除${filePath}`);
    }
  });
}

// 主函数
function main() {
  try {
    deleteProblematicFiles();
    createJsConfig();
    createTsConfig();
    create404Handler();
    
    console.log('部署准备完成');
  } catch (error) {
    console.error('部署过程中出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 