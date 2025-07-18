# 部署指南

本指南详细介绍了如何在不同环境中部署 Semantic Writing Assistant，包括开发环境、测试环境和生产环境的部署方案。

## 目录

- [环境要求](#环境要求)
- [开发环境部署](#开发环境部署)
- [生产环境构建](#生产环境构建)
- [桌面应用部署](#桌面应用部署)
- [Web版本部署](#web版本部署)
- [CI/CD配置](#cicd配置)
- [监控和维护](#监控和维护)

## 环境要求

### 基础要求

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| Node.js | 18.0.0 | 20.x.x | JavaScript运行时 |
| Rust | 1.70.0 | 1.75.x | 系统编程语言 |
| pnpm | 8.0.0 | 8.x.x | 包管理器（推荐） |
| Git | 2.30.0 | 最新版本 | 版本控制 |

### 系统要求

#### Windows
- Windows 10 版本 1903 或更高
- Visual Studio Build Tools 2019 或更高
- WebView2 运行时

#### macOS
- macOS 10.15 (Catalina) 或更高
- Xcode Command Line Tools
- Rust 目标：x86_64-apple-darwin, aarch64-apple-darwin

#### Linux
- Ubuntu 18.04 或更高 / CentOS 7 或更高
- 必要的系统库：
  ```bash
  sudo apt-get install -y \
    libgtk-3-dev \
    webkit2gtk-4.0-dev \
    libappindicator3-dev \
    librsvg2-dev \
    patchelf
  ```

## 开发环境部署

### 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/your-username/semantic-writing-assistant.git
cd semantic-writing-assistant

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置

# 4. 启动开发服务器
pnpm tauri dev
```

### 详细配置

#### 1. 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量文件
nano .env
```

必要的配置项：
```env
# 开发环境标识
NODE_ENV=development
VITE_DEV_MODE=true

# AI API密钥（至少配置一个）
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# 数据库配置
VITE_DB_NAME=semantic_writing_dev.sqlite
```

#### 2. 数据库初始化

```bash
# Tauri会自动创建和初始化数据库
# 如需手动初始化：
pnpm tauri dev --no-watch
```

#### 3. 开发工具配置

**VS Code 配置** (`.vscode/settings.json`):
```json
{
  "rust-analyzer.cargo.target": "x86_64-pc-windows-msvc",
  "rust-analyzer.checkOnSave.command": "clippy",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**推荐的VS Code扩展**:
```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "tauri-apps.tauri-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

## 生产环境构建

### 构建前准备

#### 1. 环境检查

```bash
# 检查构建环境
./scripts/check-build-env.sh

# 或手动检查
node --version    # >= 18.0.0
rustc --version   # >= 1.70.0
pnpm --version    # >= 8.0.0
```

#### 2. 依赖安装

```bash
# 清理旧的依赖
rm -rf node_modules
rm -rf src-tauri/target

# 安装生产依赖
pnpm install --frozen-lockfile
```

#### 3. 代码质量检查

```bash
# 运行代码检查
pnpm lint
pnpm type-check

# 运行测试
pnpm test:unit
pnpm test:integration

# 安全审计
pnpm audit
```

### 构建流程

#### 1. 前端构建

```bash
# 构建前端资源
pnpm build

# 检查构建产物
ls -la dist/
```

#### 2. Tauri应用构建

```bash
# 构建桌面应用
pnpm tauri build

# 构建特定平台
pnpm tauri build --target x86_64-pc-windows-msvc  # Windows
pnpm tauri build --target x86_64-apple-darwin     # macOS Intel
pnpm tauri build --target aarch64-apple-darwin    # macOS Apple Silicon
pnpm tauri build --target x86_64-unknown-linux-gnu # Linux
```

#### 3. 构建产物

构建完成后，产物位置：
```
src-tauri/target/release/bundle/
├── macos/
│   └── Semantic Writing Assistant.app
├── msi/
│   └── Semantic Writing Assistant_1.0.0_x64_en-US.msi
├── deb/
│   └── semantic-writing-assistant_1.0.0_amd64.deb
└── appimage/
    └── semantic-writing-assistant_1.0.0_amd64.AppImage
```

## 桌面应用部署

### Windows部署

#### 1. 构建Windows应用

```bash
# 设置Windows构建环境
rustup target add x86_64-pc-windows-msvc

# 构建Windows应用
pnpm tauri build --target x86_64-pc-windows-msvc
```

#### 2. 代码签名

```bash
# 使用signtool进行代码签名
signtool sign /f "certificate.pfx" /p "password" /t "http://timestamp.digicert.com" \
  "./src-tauri/target/release/bundle/msi/Semantic Writing Assistant_1.0.0_x64_en-US.msi"
```

#### 3. 创建安装程序

使用NSIS或Inno Setup创建安装程序：

**NSIS脚本示例**:
```nsis
!define APP_NAME "Semantic Writing Assistant"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "Your Company"

Name "${APP_NAME}"
OutFile "${APP_NAME}_Setup_${APP_VERSION}.exe"
InstallDir "$PROGRAMFILES\${APP_NAME}"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  File "Semantic Writing Assistant.exe"
  CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\Semantic Writing Assistant.exe"
SectionEnd
```

### macOS部署

#### 1. 构建macOS应用

```bash
# 添加macOS目标
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin

# 构建Universal Binary
pnpm tauri build --target universal-apple-darwin
```

#### 2. 代码签名和公证

```bash
# 代码签名
codesign --force --deep --sign "Developer ID Application: Your Name (TEAM_ID)" \
  "./src-tauri/target/release/bundle/macos/Semantic Writing Assistant.app"

# 创建DMG
hdiutil create -volname "Semantic Writing Assistant" -srcfolder \
  "./src-tauri/target/release/bundle/macos/Semantic Writing Assistant.app" \
  -ov -format UDZO "Semantic Writing Assistant.dmg"

# 公证DMG
xcrun notarytool submit "Semantic Writing Assistant.dmg" \
  --keychain-profile "notarytool-profile" --wait

# 装订公证票据
xcrun stapler staple "Semantic Writing Assistant.dmg"
```

#### 3. 创建DMG安装包

```bash
# 使用create-dmg创建美观的DMG
npm install -g create-dmg

create-dmg \
  --volname "Semantic Writing Assistant" \
  --window-pos 200 120 \
  --window-size 600 300 \
  --icon-size 100 \
  --icon "Semantic Writing Assistant.app" 175 120 \
  --hide-extension "Semantic Writing Assistant.app" \
  --app-drop-link 425 120 \
  "Semantic Writing Assistant.dmg" \
  "./src-tauri/target/release/bundle/macos/"
```

### Linux部署

#### 1. 构建Linux应用

```bash
# 构建Linux应用
pnpm tauri build --target x86_64-unknown-linux-gnu
```

#### 2. 创建发行包

**Debian/Ubuntu (.deb)**:
```bash
# DEB包已在构建时自动生成
ls src-tauri/target/release/bundle/deb/
```

**Red Hat/CentOS (.rpm)**:
```bash
# 安装rpm构建工具
sudo dnf install rpm-build

# 创建RPM包
rpmbuild -bb semantic-writing-assistant.spec
```

**AppImage**:
```bash
# AppImage已在构建时自动生成
ls src-tauri/target/release/bundle/appimage/
```

**Flatpak**:
```yaml
# flatpak.yml
app-id: com.semantic.writing.assistant
runtime: org.freedesktop.Platform
runtime-version: '22.08'
sdk: org.freedesktop.Sdk
command: semantic-writing-assistant

modules:
  - name: semantic-writing-assistant
    buildsystem: simple
    build-commands:
      - install -Dm755 semantic-writing-assistant /app/bin/semantic-writing-assistant
    sources:
      - type: file
        path: semantic-writing-assistant
```

## Web版本部署

### 静态网站部署

#### 1. 构建Web版本

```bash
# 构建Web版本
pnpm build

# 检查构建产物
ls -la dist/
```

#### 2. Vercel部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel --prod
```

**vercel.json配置**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 3. Netlify部署

```bash
# 构建项目
pnpm build

# 部署到Netlify
npx netlify-cli deploy --prod --dir=dist
```

**netlify.toml配置**:
```toml
[build]
  publish = "dist"
  command = "pnpm build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### 4. GitHub Pages部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build
      run: pnpm build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 服务器部署

#### 1. Docker部署

**Dockerfile**:
```dockerfile
# 多阶段构建
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  semantic-writing-assistant:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped

  # 可选：添加数据库服务
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: semantic_writing
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 2. Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    # 启用Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## CI/CD配置

### GitHub Actions

#### 1. 基础工作流

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  RUST_VERSION: 'stable'

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'pnpm'
    
    - name: Setup Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: ${{ env.RUST_VERSION }}
        override: true
        components: rustfmt, clippy
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Lint
      run: |
        pnpm lint
        cargo fmt --check
        cargo clippy -- -D warnings
    
    - name: Test
      run: |
        pnpm test:unit
        pnpm test:integration
        cargo test

  build:
    name: Build
    needs: test
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'pnpm'
    
    - name: Setup Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: ${{ env.RUST_VERSION }}
        override: true
    
    - name: Install system dependencies (Ubuntu)
      if: matrix.platform == 'ubuntu-latest'
      run: |
        sudo apt-get update
        sudo apt-get install -y libgtk-3-dev webkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build application
      run: pnpm tauri build
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: app-${{ matrix.platform }}
        path: src-tauri/target/release/bundle/
```

#### 2. 发布工作流

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    outputs:
      upload_url: ${{ steps.create_release.outputs.upload_url }}
    
    steps:
    - name: Create Release
      id: create_release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false

  build-and-upload:
    name: Build and Upload
    needs: create-release
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    
    steps:
    - uses: actions/checkout@v3
    
    # ... (构建步骤同上)
    
    - name: Upload Release Asset
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: ${{ needs.create-release.outputs.upload_url }}
        asset_path: ./release-asset.zip
        asset_name: semantic-writing-assistant-${{ matrix.platform }}.zip
        asset_content_type: application/zip
```

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  RUST_VERSION: "stable"

test:
  stage: test
  image: node:18
  before_script:
    - curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    - source ~/.cargo/env
    - npm install -g pnpm
    - pnpm install
  script:
    - pnpm lint
    - pnpm test:unit
    - cargo test
  artifacts:
    reports:
      coverage: coverage/
    expire_in: 1 week

build:linux:
  stage: build
  image: ubuntu:22.04
  before_script:
    - apt-get update
    - apt-get install -y curl build-essential libgtk-3-dev webkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
    - curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    - apt-get install -y nodejs
    - curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    - source ~/.cargo/env
    - npm install -g pnpm
    - pnpm install
  script:
    - pnpm tauri build
  artifacts:
    paths:
      - src-tauri/target/release/bundle/
    expire_in: 1 week
  only:
    - main
    - tags

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - echo "Deploying application..."
    # 部署脚本
  only:
    - main
    - tags
```

## 监控和维护

### 应用监控

#### 1. 错误监控

**Sentry集成**:
```typescript
// src/utils/monitoring.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, { extra: context });
};
```

#### 2. 性能监控

```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  static measureFunction<T>(
    name: string,
    fn: () => T
  ): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    
    // 发送到监控服务
    this.sendMetric(name, end - start);
    
    return result;
  }

  private static sendMetric(name: string, duration: number) {
    // 发送性能指标到监控服务
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({ name, duration, timestamp: Date.now() })
    });
  }
}
```

#### 3. 用户行为分析

```typescript
// src/utils/analytics.ts
export class Analytics {
  static trackEvent(event: string, properties?: Record<string, any>) {
    if (process.env.VITE_ENABLE_ANALYTICS === 'true') {
      // 发送到分析服务
      fetch('/api/analytics/events', {
        method: 'POST',
        body: JSON.stringify({
          event,
          properties,
          timestamp: Date.now(),
          userId: this.getUserId()
        })
      });
    }
  }

  static trackPageView(page: string) {
    this.trackEvent('page_view', { page });
  }

  private static getUserId(): string {
    // 获取匿名用户ID
    return localStorage.getItem('user_id') || 'anonymous';
  }
}
```

### 自动更新

#### 1. Tauri自动更新

```rust
// src-tauri/src/main.rs
use tauri::updater;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 检查更新
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                if let Ok(update) = handle.updater().check().await {
                    if update.is_update_available() {
                        println!("Update available: {}", update.latest_version());
                        
                        // 下载并安装更新
                        update.download_and_install().await.unwrap();
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 2. 更新配置

```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.example.com/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### 备份和恢复

#### 1. 数据备份脚本

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/path/to/backups"
APP_DATA_DIR="$HOME/.semantic-writing-assistant"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份用户数据
tar -czf "$BACKUP_DIR/user_data_$DATE.tar.gz" "$APP_DATA_DIR"

# 清理旧备份（保留30天）
find "$BACKUP_DIR" -name "user_data_*.tar.gz" -mtime +30 -delete

echo "Backup completed: user_data_$DATE.tar.gz"
```

#### 2. 自动备份配置

```yaml
# 使用cron定时备份
# crontab -e
0 2 * * * /path/to/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### 日志管理

#### 1. 日志配置

```rust
// src-tauri/src/main.rs
use log::{info, warn, error};
use env_logger;

fn main() {
    // 初始化日志
    env_logger::Builder::from_env(
        env_logger::Env::default().default_filter_or("info")
    ).init();

    info!("Application starting...");
    
    // 应用逻辑
}
```

#### 2. 日志轮转

```bash
# /etc/logrotate.d/semantic-writing-assistant
/var/log/semantic-writing-assistant/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 app app
    postrotate
        systemctl reload semantic-writing-assistant
    endscript
}
```

### 健康检查

#### 1. 应用健康检查

```typescript
// src/utils/healthCheck.ts
export class HealthChecker {
  static async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkAIServices(),
      this.checkFileSystem(),
      this.checkMemoryUsage()
    ]);

    return {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: checks.map((check, index) => ({
        name: ['database', 'ai_services', 'file_system', 'memory'][index],
        status: check.status,
        error: check.status === 'rejected' ? check.reason : undefined
      }))
    };
  }

  private static async checkDatabase(): Promise<void> {
    // 检查数据库连接
  }

  private static async checkAIServices(): Promise<void> {
    // 检查AI服务可用性
  }

  private static async checkFileSystem(): Promise<void> {
    // 检查文件系统权限
  }

  private static async checkMemoryUsage(): Promise<void> {
    // 检查内存使用情况
  }
}
```

---

## 故障排除

### 常见构建问题

#### 1. Rust编译错误
```bash
# 清理Rust缓存
cargo clean

# 更新Rust工具链
rustup update

# 重新构建
pnpm tauri build
```

#### 2. Node.js依赖问题
```bash
# 清理依赖
rm -rf node_modules package-lock.json

# 重新安装
pnpm install
```

#### 3. 平台特定问题

**Windows**:
- 确保安装了Visual Studio Build Tools
- 检查WebView2运行时是否安装

**macOS**:
- 确保安装了Xcode Command Line Tools
- 检查代码签名证书配置

**Linux**:
- 安装必要的系统依赖
- 检查AppImage权限设置

### 部署问题诊断

#### 1. 应用无法启动
```bash
# 检查依赖
ldd semantic-writing-assistant  # Linux
otool -L semantic-writing-assistant  # macOS

# 检查权限
chmod +x semantic-writing-assistant

# 查看错误日志
./semantic-writing-assistant --debug
```

#### 2. 网络连接问题
```bash
# 测试API连接
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.openai.com/v1/models

# 检查防火墙设置
sudo ufw status  # Ubuntu
```

#### 3. 性能问题
```bash
# 监控资源使用
top -p $(pgrep semantic-writing-assistant)

# 检查内存泄漏
valgrind --leak-check=full ./semantic-writing-assistant
```

---

这个部署指南提供了完整的部署流程和最佳实践，帮助您在各种环境中成功部署 Semantic Writing Assistant。