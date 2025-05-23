# PowerShell部署脚本 - Cloudflare Pages专用

Write-Host "===== Cloudflare Pages 专用部署脚本 ====="
Write-Host "当前目录: $(Get-Location)"

# 设置环境变量，确保禁用缓存
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_ENV = "production"
$env:NEXT_DISABLE_CACHE = "1"
$env:MINIMIZE_ASSETS = "true"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# 强制删除缓存文件
Write-Host "强制删除所有缓存文件..."
if (Test-Path -Path ".next/cache") {
    Remove-Item -Path ".next/cache" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path -Path ".next/cache/webpack") {
    Remove-Item -Path ".next/cache/webpack" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path -Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path ".next" -Filter "*.pack" -Recurse -File | Remove-Item -Force
Get-ChildItem -Path ".next" -Filter "*.pack.gz" -Recurse -File | Remove-Item -Force

# 确保.cfignore文件正确更新
Write-Host "更新.cfignore文件..."
if (Test-Path -Path "cfignore.txt") {
    Copy-Item -Path "cfignore.txt" -Destination ".cfignore" -Force
    Write-Host "已从cfignore.txt更新.cfignore文件"
}
else {
    # 如果cfignore.txt不存在，创建默认的.cfignore文件
    @"
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
"@ | Out-File -FilePath ".cfignore" -Encoding utf8
    Write-Host "创建了默认的.cfignore文件"
}

# 执行预处理
Write-Host "执行部署预处理..."
node deploy.js

# 清理旧的构建
Write-Host "清理旧的构建..."
if (Test-Path -Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

# 运行构建
Write-Host "执行优化的构建过程..."
& node -e "
    process.env.NEXT_DISABLE_CACHE = '1';
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.NODE_ENV = 'production';
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';
    require('child_process').execSync('npx next build --no-cache', { stdio: 'inherit' });
"

# 清理构建后的大文件
Write-Host "构建后清理..."
if (Test-Path -Path ".next") {
    # 查找大于20MB的文件并删除
    Write-Host "查找并删除大文件..."
    $largeSizeLimit = 20MB
    Get-ChildItem -Path ".next" -Recurse -File | Where-Object { $_.Length -gt $largeSizeLimit } | ForEach-Object {
        Write-Host "删除大文件: $($_.FullName) ($([Math]::Round($_.Length / 1MB, 2)) MB)"
        Remove-Item -Path $_.FullName -Force
    }

    # 删除所有.pack文件
    Write-Host "删除所有.pack文件..."
    Get-ChildItem -Path ".next" -Filter "*.pack" -Recurse -File | Remove-Item -Force
    Get-ChildItem -Path ".next" -Filter "*.pack.gz" -Recurse -File | Remove-Item -Force
}

# 检查是否有超过25MB的文件
Write-Host "检查是否有超过限制的大文件..."
$maxFileSizeLimit = 25MB
$hasLargeFiles = $false

function Test-LargeFiles {
    param (
        [string]$Directory
    )

    $largeFiles = Get-ChildItem -Path $Directory -Recurse -File | Where-Object { $_.Length -gt $maxFileSizeLimit }
    foreach ($file in $largeFiles) {
        Write-Host "警告: 文件 $($file.FullName) 大小为 $([Math]::Round($file.Length / 1MB, 2)) MB, 超过了25MB限制!" -ForegroundColor Red
        $script:hasLargeFiles = $true
    }
}

Test-LargeFiles -Directory ".next"

if ($hasLargeFiles) {
    Write-Host "发现文件超过25MB限制! 部署可能会失败。" -ForegroundColor Red
    exit 1
}
else {
    Write-Host "没有发现超过25MB限制的文件。可以安全部署。" -ForegroundColor Green
}

# 读取项目名称
$projectName = "getchinesename"
if (Test-Path -Path ".cfconfig") {
    try {
        $configContent = Get-Content -Path ".cfconfig" -Raw | ConvertFrom-Json
        if ($configContent.name) {
            $projectName = $configContent.name
        }
    }
    catch {
        Write-Host "读取.cfconfig失败，使用默认项目名称: $_"
    }
}

# 执行部署
Write-Host "开始部署到Cloudflare Pages，项目名称: $projectName..."
& npx wrangler pages deploy .next --project-name $projectName --commit-dirty=true

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 部署成功!" -ForegroundColor Green
}
else {
    Write-Host "❌ 部署失败!" -ForegroundColor Red
} 