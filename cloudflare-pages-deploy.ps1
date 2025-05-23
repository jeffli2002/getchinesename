# Windows PowerShell部署脚本 - Cloudflare Pages专用

# 显示当前目录
Write-Host "当前目录: $(Get-Location)"

# 删除node_modules和package-lock.json以进行干净的安装
Write-Host "清理旧依赖..."
if (Test-Path -Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path -Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
}

# 安装依赖
Write-Host "安装依赖..."
npm install --no-fund --no-audit

# 确保src/store目录存在
Write-Host "创建store/index.js..."
if (-not (Test-Path -Path "src/store")) {
    New-Item -Path "src/store" -ItemType Directory -Force
}

# 创建store/index.js
$storeContent = @"
import { create } from 'zustand';
import React from 'react';

// 创建语言状态存储
export const useLanguageStore = create((set) => ({
  language: 'en', // 默认语言为英文
  setLanguage: (lang) => set({ language: lang }),
}));

// 创建语言上下文
export const LanguageContext = React.createContext(null);

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const store = useLanguageStore();

  return (
    <LanguageContext.Provider value={store}>
      {children}
    </LanguageContext.Provider>
  );
};
"@
Set-Content -Path "src/store/index.js" -Value $storeContent -Encoding UTF8

# 创建babel.config.js
Write-Host "创建babel.config.js..."
$babelConfig = @"
module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource: 'react',
        },
      },
    ],
  ],
};
"@
Set-Content -Path "babel.config.js" -Value $babelConfig -Encoding UTF8
Write-Host "创建了babel.config.js"

# 直接修复Layout.tsx文件，确保其正确性
Write-Host "直接修复Layout.tsx文件..."
# 确保目录存在
if (-not (Test-Path -Path "src/components/layout")) {
    New-Item -Path "src/components/layout" -ItemType Directory -Force
}

# 创建Layout.tsx文件
$layoutContent = @"
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
"@
Set-Content -Path "src/components/layout/Layout.tsx" -Value $layoutContent -Encoding UTF8
Write-Host "成功修复Layout.tsx"

# 删除可能有问题的TypeScript文件
if (Test-Path -Path "src/store/index.ts") {
    Remove-Item -Path "src/store/index.ts" -Force
    Write-Host "删除了src/store/index.ts"
}

# 确保cloudflare-config目录存在
Write-Host "检查cloudflare-config目录..."
if (-not (Test-Path -Path "cloudflare-config")) {
    New-Item -Path "cloudflare-config" -ItemType Directory -Force
    New-Item -Path "cloudflare-config/workers-site" -ItemType Directory -Force
    Write-Host "创建cloudflare-config目录结构"
}

# 创建Cloudflare特定配置
Write-Host "创建Cloudflare Pages配置文件..."
$kvIgnoreContent = @"
{
  "ignorePatterns": [
    ".next/cache/**/*",
    ".next/cache/webpack/**/*",
    ".next/cache/webpack/client-production/*",
    ".next/cache/webpack/server-production/*",
    "**/*.pack",
    "**/*.pack.gz",
    "node_modules/.cache/**/*"
  ]
}
"@
Set-Content -Path "cloudflare-config/kv-ignore.json" -Value $kvIgnoreContent -Encoding UTF8

$pagesConfigContent = @"
{
  "name": "getchinesename",
  "build": {
    "baseDir": ".next",
    "command": "npm run cloudflare-build",
    "publicPath": "",
    "ignoredFiles": ["node_modules/.cache/**", ".next/cache/**"]
  },
  "deployment": {
    "routes": [
      { "pattern": "/*", "script": "index.js" }
    ],
    "kv": {
      "ASSETS": {
        "binding": "ASSETS"
      }
    }
  },
  "env": {
    "NODE_VERSION": "18",
    "NEXT_TELEMETRY_DISABLED": "1",
    "NEXT_RUNTIME": "edge"
  },
  "limits": {
    "kv_max_entry_size": "24MiB"
  },
  "build_config": {
    "upload_config": {
      "max_file_size": 25000000,
      "chunk_size": 10000000,
      "max_chunks": 100
    },
    "optimization": {
      "minify_js": true,
      "minify_css": true,
      "minify_html": true,
      "treeshake": true
    }
  }
}
"@
Set-Content -Path "cloudflare-config/pages-config.json" -Value $pagesConfigContent -Encoding UTF8

# 运行cloudflare-build.js脚本
Write-Host "执行cloudflare-build.js脚本..."
node cloudflare-build.js

# 清理webpack缓存文件，避免文件大小问题
Write-Host "清理webpack缓存文件..."
if (Test-Path -Path ".next/cache/webpack") {
    Remove-Item -Path ".next/cache/webpack" -Recurse -Force -ErrorAction SilentlyContinue
}

# 检查.cfconfig文件是否存在
Write-Host "检查.cfconfig文件..."
if (-not (Test-Path -Path ".cfconfig")) {
    Write-Host "未找到.cfconfig文件，将创建默认配置..."
    $cfconfigScript = @"
    const fs = require('fs');
    const cfconfigContent = {
      name: 'getchinesename',
      config_dir: 'cloudflare-config',
      site: {
        bucket: '.next',
        exclude: ['**/*.pack', '**/*.pack.gz', '.next/cache/**/*']
      },
      build: {
        command: 'node cloudflare-pages-build.js'
      },
      compatibility_date: '2023-09-01',
      compatibility_flags: ['nodejs_compat'],
      last_updated: new Date().toISOString()
    };
    fs.writeFileSync('.cfconfig', JSON.stringify(cfconfigContent, null, 2));
    console.log('.cfconfig文件已创建');
"@
    node -e $cfconfigScript
}

# 清理旧的构建
Write-Host "清理旧的构建..."
if (Test-Path -Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

# 确保.cfignore文件正确更新
Write-Host "更新.cfignore文件..."
if (Test-Path -Path "cfignore.txt") {
    Copy-Item -Path "cfignore.txt" -Destination ".cfignore" -Force
    Write-Host "已从cfignore.txt更新.cfignore文件"
}
else {
    # 如果cfignore.txt不存在，创建默认的.cfignore文件
    $cfignoreContent = @"
# 忽略文件夹
node_modules/
.next/cache/
.next/cache/webpack/
.next/cache/webpack/client-production/
.next/cache/webpack/server-production/
.cloudflare/

# 忽略所有webpack缓存相关文件
**/*.pack
**/*.pack.gz
**/*.hot-update.*
**/.cache
**/.next/cache/**/*

# 忽略大型文件
**/*.wasm
**/*.map
**/.git
**/*.gz

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
**/*.+(jpg|jpeg|gif|png|ico|mp4|webm|ogg|mp3|wav|pdf|zip|tar|gz|7z|rar) size>10000000
"@
    Set-Content -Path ".cfignore" -Value $cfignoreContent -Encoding UTF8
    Write-Host "创建了默认的.cfignore文件"
}

# 运行定制的构建脚本
Write-Host "执行 Cloudflare Pages 专用构建..."
node cloudflare-pages-build.js

# 确保缓存目录已删除
Write-Host "确保缓存目录已删除..."
$cacheDirectories = @(
    ".next/cache",
    ".next/cache/webpack",
    ".next/cache/webpack/client-production",
    ".next/cache/webpack/server-production"
)

foreach ($dir in $cacheDirectories) {
    if (Test-Path -Path $dir) {
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# 查找大文件并删除
Write-Host "查找并删除大文件..."
$largeFiles = Get-ChildItem -Path ".next" -File -Recurse | Where-Object { $_.Length -gt 20MB }
foreach ($file in $largeFiles) {
    Write-Host "删除大文件: $($file.FullName) ($([math]::Round($file.Length / 1MB, 2)) MB)"
    Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
}

# 读取项目名称从.cfconfig
try {
    $cfconfigContent = Get-Content -Path ".cfconfig" -Raw | ConvertFrom-Json
    $projectName = $cfconfigContent.name
    if ([string]::IsNullOrEmpty($projectName)) {
        $projectName = "getchinesename"
    }
}
catch {
    $projectName = "getchinesename"
}

# 部署到 Cloudflare Pages
Write-Host "部署到 Cloudflare Pages，项目名称: $projectName..."
npx wrangler pages deploy .next --project-name $projectName

Write-Host "部署完成!" 