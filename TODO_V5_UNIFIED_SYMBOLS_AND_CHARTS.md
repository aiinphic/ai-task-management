# AI 任務管理系統 v5.0 - 符號統一與時間統計圖表

## 目標
1. 統一符號系統背景色,確保同級別任務的符號背景色完全一致
2. 實作時間統計與圖表視覺化功能

---

## Phase 1: 規劃符號色彩統一方案與時間統計架構

### 符號色彩統一方案
- [ ] 確認三級任務的標準色值
  - 一級|營收: #F59E0B (金色/橙色)
  - 二級|流量: #3B82F6 (藍色)
  - 三級|行政: #6B7280 (灰色)
- [ ] 檢查現有30個符號的背景色是否一致
- [ ] 記錄需要調整的符號清單

### 時間統計架構設計
- [ ] 設計資料結構 (TaskTimeLog)
- [ ] 規劃統計維度 (日/週/月/分級/部門/負責人)
- [ ] 選擇圖表類型 (圓餅圖/長條圖/甜甜圈圖/時間軸圖)
- [ ] 確認使用 Recharts 作為圖表庫

---

## Phase 2: 調整符號背景色確保同級別完全一致

- [ ] 檢查所有營收符號 (10個) 的背景色
- [ ] 檢查所有流量符號 (10個) 的背景色
- [ ] 檢查所有行政符號 (10個) 的背景色
- [ ] 如有不一致,重新生成符號圖片
- [ ] 更新符號字典檔的色值定義

---

## Phase 3: 建立時間統計資料結構與邏輯

- [ ] 建立 TaskTimeLog 類型定義
- [ ] 建立時間統計工具函數
  - [ ] calculateDailyTimeDistribution()
  - [ ] calculateWeeklyTimeDistribution()
  - [ ] calculateMonthlyTimeDistribution()
  - [ ] calculateTimeByPriority()
  - [ ] calculateTimeByDepartment()
  - [ ] calculateTimeByUser()
- [ ] 整合到現有任務資料結構
- [ ] 實作時間追蹤邏輯 (開始/暫停/繼續/完成)

---

## Phase 4: 整合 Recharts 並建立圖表元件

- [ ] 安裝 Recharts: `pnpm add recharts`
- [ ] 建立圖表元件
  - [ ] PieChartCard.tsx (圓餅圖 - 任務分級時間佔比)
  - [ ] BarChartCard.tsx (長條圖 - 每日/每週時間分布)
  - [ ] DonutChartCard.tsx (甜甜圈圖 - 今日時間投入概況)
  - [ ] TimelineChart.tsx (時間軸圖 - 個人每日工作時間軸)
- [ ] 整合到儀表板頁面
- [ ] 新增「時間統計」獨立頁面

---

## Phase 5: 測試符號統一與圖表功能

- [ ] 測試所有符號背景色是否一致
- [ ] 測試圓餅圖顯示與數據準確性
- [ ] 測試長條圖顯示與數據準確性
- [ ] 測試甜甜圈圖顯示與數據準確性
- [ ] 測試時間軸圖顯示與數據準確性
- [ ] 測試響應式設計 (手機/平板/桌面)

---

## Phase 6: 交付最終成果

- [ ] 儲存檢查點
- [ ] 撰寫測試報告
- [ ] 準備交付文件
- [ ] 提供下一步建議

---

## 技術規格

### 資料結構
```typescript
interface TaskTimeLog {
  id: string;
  taskId: string;
  subtaskId?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 分鐘
  status: 'pending' | 'in-progress' | 'paused' | 'completed';
  createdAt: Date;
}
```

### 統計維度
- 每日時間分配
- 每週時間分配
- 每月時間分配
- 按任務分級統計 (一級/二級/三級)
- 按部門統計
- 按負責人統計

### 圖表庫
- **Recharts** (React 專用,輕量級)
- 支援響應式設計
- API 簡潔易用

---

## 預期成果

1. 所有符號背景色完全統一,視覺一致性提升
2. 儀表板新增時間統計圖表卡片
3. 新增「時間統計」獨立頁面
4. 支援多維度時間分析
5. 所有時間數據可追溯可稽核
