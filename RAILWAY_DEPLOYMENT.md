# Railway 部署指南 - INPHIC AI 任務管理系統

## 🚀 快速部署步驟

### 1. 前往 Railway
👉 https://railway.app/dashboard

### 2. 建立新專案
- 點擊右上角「+ Create」
- 選擇「Deploy from GitHub repo」
- 選擇 `aiinphic/ai-task-management`
- 點擊「Deploy Now」

### 3. 新增 PostgreSQL 資料庫
- 在專案中點擊「+ Create」
- 選擇「Database」
- 選擇「Add PostgreSQL」
- Railway 會自動設定 `DATABASE_URL` 環境變數

### 4. 設定環境變數
進入 `ai-task-management` 服務 → Variables 標籤：

**必要變數**：
- `NODE_ENV` = `production`
- `DATABASE_URL` = (自動從 PostgreSQL 連結)

**可選變數**：
- `PORT` = `3000` (Railway 會自動設定)

### 5. 等待部署完成
- 建置時間約 3-5 分鐘
- 查看 Logs 確認沒有錯誤
- 部署成功後會顯示「Active」狀態

### 6. 取得公開網址
- 進入 `ai-task-management` 服務
- 切換到「Settings」標籤
- 找到「Public Networking」
- 點擊「Generate Domain」
- 複製生成的網址（例如：`https://ai-task-management-production.up.railway.app`）

### 7. 執行資料庫 Migration（重要！）

**方法 A - 使用 Railway CLI**：
```bash
# 安裝 Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# 登入並連結專案
railway login
cd /path/to/ai-task-management
railway link

# 執行 Migration（如果有 db:migrate 腳本）
railway run pnpm run db:migrate
railway run pnpm run db:seed
```

**方法 B - 手動執行**：
目前專案沒有 Migration 腳本，資料庫結構需要手動建立或透過 ORM 自動生成。

---

## 📋 部署檢查清單

- [ ] Railway 專案已建立
- [ ] GitHub Repository 已連結
- [ ] PostgreSQL 資料庫已新增
- [ ] 環境變數 `NODE_ENV=production` 已設定
- [ ] `DATABASE_URL` 已自動連結
- [ ] 部署狀態顯示「Active」
- [ ] 公開網址已生成
- [ ] 網站可正常訪問
- [ ] 所有頁面可正常切換

---

## 🔧 常見問題排除

### 問題 1: 部署失敗 - "DATABASE_URL environment variable is not set"
**解決方法**：
1. 確認 PostgreSQL 資料庫已建立
2. 檢查 Variables 標籤中是否有 `DATABASE_URL`
3. 如果沒有，手動新增並從 Postgres 服務複製連線字串

### 問題 2: 服務顯示 "Service is offline"
**解決方法**：
1. 檢查 Railway 帳號餘額（右上角）
2. 新增付款方式（Settings → Billing）
3. Railway 提供每月 $5 免費額度

### 問題 3: 建置失敗 - "pnpm install failed"
**解決方法**：
1. 檢查 Build Logs 查看具體錯誤
2. 確認 `package.json` 中的依賴正確
3. 可能需要在 Settings 中設定 Node.js 版本

### 問題 4: 網站無法訪問 - 404 或 502 錯誤
**解決方法**：
1. 檢查 Deploy Logs 確認啟動成功
2. 確認 `start` 腳本正確：`NODE_ENV=production node dist/index.js`
3. 確認建置產物在 `dist/` 目錄

### 問題 5: 前端頁面空白
**解決方法**：
1. 檢查瀏覽器 Console 是否有錯誤
2. 確認 `vite build` 成功執行
3. 確認靜態檔案路徑正確

---

## 💰 Railway 定價

- ✅ 每月 $5 免費額度
- ✅ 超過免費額度後按使用量計費
- ✅ 小型專案通常在免費額度內
- ✅ 可隨時查看使用量（Dashboard → Usage）

---

## 📞 技術支援

- Railway 文件：https://docs.railway.app/
- Railway Discord：https://discord.gg/railway
- GitHub Issues：https://github.com/aiinphic/ai-task-management/issues

---

## 🎯 部署成功後

您將擁有：
- ✅ 永久的公開網址
- ✅ 自動 HTTPS 加密
- ✅ PostgreSQL 資料庫
- ✅ 自動備份與監控
- ✅ 推送至 GitHub 自動重新部署

---

**祝您部署順利！** 🚀
