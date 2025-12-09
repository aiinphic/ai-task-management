# AI 任務管理系統 v15.0 修復與優化待辦清單

## 需求概述

### 問題 1: 新增任務錯誤
- **現象**: 新增任務後送出任務都無法正常建立任務,會出現錯誤
- **需要**: 檢查錯誤訊息並修正

### 問題 2: AI 優先處理清單排序優化
- **現況**: 目前排序是根據優先級分數(綜合多個維度)
- **需要**: 改為以層級為主要排序依據
  - 1級|營收 > 2級|流量 > 3級|行政 > 4級|日常
  - 同級內再根據其他維度(截止日期、工作量、權重等)排序

---

## 實作計畫

### 階段 1: 檢查並修復新增任務錯誤

**步驟**:
1. 開啟瀏覽器測試新增任務功能
2. 查看 Console 錯誤訊息
3. 檢查 CreateTaskDialog 元件
4. 檢查 Home.tsx 中的 handleCreateTask 函數
5. 修正錯誤

**可能原因**:
- 缺少必要欄位
- 類型不匹配
- State 更新問題
- 資料驗證失敗

---

### 階段 2: 優化 AI 優先處理清單排序邏輯

**目標排序規則**:
```
第一優先: 層級
  1級|營收 (LEVEL_1_REVENUE)
  2級|流量 (LEVEL_2_TRAFFIC)
  3級|行政 (LEVEL_3_ADMIN)
  4級|日常 (LEVEL_4_DAILY)

第二優先: 權重 (同級內)
  CRITICAL > HIGH > MEDIUM > LOW

第三優先: 截止日期 (同級同權重內)
  越接近截止日期越優先

第四優先: 建立時間 (同級同權重同截止日期內)
  越早建立越優先
```

**實作位置**:
- `PersonalExecutionView.tsx` 中的 priorityTasks 排序邏輯

**實作方式**:
```typescript
const priorityTasks = memberTasks
  .filter(task => task.status === 'pending' || task.status === 'in-progress')
  .sort((a, b) => {
    // 第一優先: 層級
    const levelOrder = {
      'LEVEL_1_REVENUE': 1,
      'LEVEL_2_TRAFFIC': 2,
      'LEVEL_3_ADMIN': 3,
      'LEVEL_4_DAILY': 4,
    };
    const levelDiff = levelOrder[a.level] - levelOrder[b.level];
    if (levelDiff !== 0) return levelDiff;

    // 第二優先: 權重
    const weightOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
    const weightDiff = weightOrder[a.weight] - weightOrder[b.weight];
    if (weightDiff !== 0) return weightDiff;

    // 第三優先: 截止日期
    if (a.deadline && b.deadline) {
      const deadlineDiff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (deadlineDiff !== 0) return deadlineDiff;
    }

    // 第四優先: 建立時間
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return 0;
  })
  .slice(0, 10);
```

---

## 預期成果

### 修復新增任務錯誤
- ✅ 新增任務後任務卡片立即顯示在任務列表
- ✅ 無錯誤訊息
- ✅ 任務資料完整

### 優化 AI 優先處理清單排序
- ✅ 1級任務永遠排在最前面
- ✅ 同級任務根據權重排序
- ✅ 同級同權重任務根據截止日期排序
- ✅ 排序邏輯清晰易懂

---

## 測試計畫

### 測試 1: 新增任務功能
1. 點擊「新增任務」按鈕
2. 填寫任務資訊
3. 送出任務
4. 確認任務卡片出現在任務列表
5. 確認無錯誤訊息

### 測試 2: AI 優先處理清單排序
1. 進入執行模式
2. 選擇部門和人員
3. 查看 AI 優先處理清單
4. 確認 1級任務排在最前面
5. 確認同級任務根據權重排序
6. 確認排序符合預期

---

## 備註

- 新增任務錯誤可能與 CreateTaskDialog 元件的資料驗證有關
- AI 優先處理清單排序需要在 PersonalExecutionView 元件中修改
- 測試時需要確保有不同層級、不同權重的任務資料
