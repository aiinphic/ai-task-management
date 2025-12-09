# AI 任務管理系統 v8.0 優化需求

## 📋 需求總覽

### 1. 任務詳細頁面優化
- [ ] 新增「任務方向」欄位(AI 生成)
- [ ] 新增「任務大綱」欄位(AI 生成)
- [ ] 新增「文字敘述」欄位(AI 生成)
- [ ] 移除任務細項中的「預估時間」
- [ ] 移除任務細項中的「開始按鈕」
- [ ] 確保整個詳細頁面都是純閱讀模式

### 2. 同級任務權重排序系統
- [ ] 設計權重分級機制(極高/高/中/低)
- [ ] 實作符號大小視覺化(根據權重調整符號尺寸)
- [ ] 更新 Task 類型定義,新增 weight 欄位
- [ ] 更新 TaskCard 元件,根據 weight 動態調整符號大小
- [ ] 更新任務資料,為每個任務設定權重

---

## 🎯 同級任務權重分級設計

### 權重等級定義

#### 1級|營收 任務權重
- **極高權重** (CRITICAL) - 符號 56px
  - 例如:即將到期的大客戶簽約、重要產品發布
  
- **高權重** (HIGH) - 符號 48px
  - 例如:一般客戶簽約、產品銷售簡報
  
- **中權重** (MEDIUM) - 符號 40px
  - 例如:客戶需求訪談、市場調研
  
- **低權重** (LOW) - 符號 32px
  - 例如:資料整理、文件準備

#### 2級|流量 任務權重
- **極高權重** (CRITICAL) - 符號 48px
- **高權重** (HIGH) - 符號 40px
- **中權重** (MEDIUM) - 符號 32px
- **低權重** (LOW) - 符號 28px

#### 3級|行政 任務權重
- **極高權重** (CRITICAL) - 符號 40px
- **高權重** (HIGH) - 符號 32px
- **中權重** (MEDIUM) - 符號 28px
- **低權重** (LOW) - 符號 24px

#### 4級|日常 任務權重
- **極高權重** (CRITICAL) - 符號 32px
- **高權重** (HIGH) - 符號 28px
- **中權重** (MEDIUM) - 符號 24px
- **低權重** (LOW) - 符號 20px

### 權重計算邏輯

權重由以下因素決定:
1. **截止日期緊急度** (40%)
   - 今日內到期 → CRITICAL
   - 1-2 天內 → HIGH
   - 3-5 天內 → MEDIUM
   - 超過 1 週 → LOW

2. **影響範圍** (30%)
   - 影響公司整體營收 → CRITICAL
   - 影響部門績效 → HIGH
   - 影響團隊進度 → MEDIUM
   - 個人任務 → LOW

3. **預估工作量** (20%)
   - 超過 8 小時 → CRITICAL
   - 4-8 小時 → HIGH
   - 1-4 小時 → MEDIUM
   - 少於 1 小時 → LOW

4. **符號權重** (10%)
   - 每個符號有固定基礎權重

---

## 📊 任務詳細頁面新增欄位

### AI 生成內容結構

```typescript
interface AIGeneratedContent {
  direction: string;      // 任務方向
  outline: string[];      // 任務大綱(條列式)
  description: string;    // 文字敘述
  estimatedTime: number;  // 預估時間(分鐘) - 僅供後台計算,不顯示
}
```

### 範例內容

**任務方向**:
> 本任務旨在完成產品銷售簡報,向潛在客戶展示產品核心價值與競爭優勢,促成簽約成交。

**任務大綱**:
1. 分析目標客戶需求與痛點
2. 準備產品功能展示素材
3. 設計價格方案與優惠策略
4. 製作簡報投影片
5. 預演簡報流程

**文字敘述**:
> 此次簡報對象為 ABC 公司採購部門,該公司目前使用競品 X,但對其價格與客服不滿。我們需要強調產品的性價比優勢與完善的售後服務,並提供首年 8 折優惠方案,預計簽約金額為 50 萬元。

---

## 🔧 技術實作細節

### 1. 更新 Task 類型定義

```typescript
export type TaskWeight = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Task {
  // ... 現有欄位
  weight: TaskWeight;  // 新增權重欄位
  aiGeneratedContent?: {  // 新增 AI 生成內容
    direction: string;
    outline: string[];
    description: string;
  };
}
```

### 2. 符號大小映射表

```typescript
const SYMBOL_SIZE_MAP: Record<TaskLevel, Record<TaskWeight, number>> = {
  LEVEL_1_REVENUE: {
    CRITICAL: 56,
    HIGH: 48,
    MEDIUM: 40,
    LOW: 32,
  },
  LEVEL_2_TRAFFIC: {
    CRITICAL: 48,
    HIGH: 40,
    MEDIUM: 32,
    LOW: 28,
  },
  LEVEL_3_ADMIN: {
    CRITICAL: 40,
    HIGH: 32,
    MEDIUM: 28,
    LOW: 24,
  },
  LEVEL_4_DAILY: {
    CRITICAL: 32,
    HIGH: 28,
    MEDIUM: 24,
    LOW: 20,
  },
};
```

### 3. TaskCard 元件更新

```typescript
// 根據 level 和 weight 計算符號大小
const symbolSize = SYMBOL_SIZE_MAP[task.level][task.weight];

<img 
  src={symbol.iconPath} 
  alt={symbol.name}
  style={{ width: `${symbolSize}px`, height: `${symbolSize}px` }}
/>
```

---

## ✅ 驗收標準

1. 點擊任務卡片後,詳細對話框顯示:
   - ✅ 任務方向
   - ✅ 任務大綱(條列式)
   - ✅ 文字敘述
   - ✅ 無預估時間顯示
   - ✅ 無開始按鈕

2. 同級任務視覺化:
   - ✅ 同樣是 1級|營收,權重越高符號越大
   - ✅ 符號大小差異明顯(至少 8px 差距)
   - ✅ 任務卡片按權重排序(CRITICAL > HIGH > MEDIUM > LOW)

3. 整體體驗:
   - ✅ 純閱讀模式,無任何執行面元素
   - ✅ AI 生成內容清晰易讀
   - ✅ 符號大小視覺層次分明
