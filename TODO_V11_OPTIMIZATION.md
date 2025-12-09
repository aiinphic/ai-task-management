# AI 任務管理系統 v11.0 優化需求

## 📋 需求總覽

### 1. 重新設計任務卡片為正方形視覺化設計
- [ ] 改為正方形卡片(1:1 比例)
- [ ] 上半部(1/2):符號圖示(大圖)
- [ ] 下半部(1/2):任務標題(純文字) + 負責人標籤
- [ ] 在符號圖示上方顯示分級標籤(1級|營收、2級|流量、3級|行政、4級|日常)
- [ ] 移除協作人員標籤和進度條

### 2. 調整任務列表的 Grid 布局
- [ ] 調整 Grid 列數,適應正方形卡片
- [ ] 確保卡片間距合理

---

## 🎨 任務卡片新版設計

### 舊版佈局(橫向長方形)

```
┌────────────────────────────────┐
│ [符號]  李美華 → 產品銷售簡報   │
│         協作: 王小明            │
│                                │
│ 執行進度 45%                   │
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░          │
└────────────────────────────────┘
```

### 新版佈局(正方形)

```
┌──────────────────┐
│  [1級|營收]      │ ← 分級標籤(右上角)
│                  │
│                  │
│    [符號圖示]    │ ← 上半部(1/2)
│      大圖        │
│                  │
├──────────────────┤
│ 產品銷售簡報     │ ← 任務標題(純文字)
│                  │
│ [李美華]         │ ← 負責人標籤
└──────────────────┘
```

---

## 🔧 技術實作

### 1. 修改 TaskCard 元件

**新版結構**:

```tsx
<Card className="aspect-square overflow-hidden cursor-pointer hover:shadow-lg">
  {/* 上半部:符號圖示 */}
  <div className="relative h-1/2 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
    {/* 分級標籤(右上角) */}
    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
      {levelLabel}
    </div>
    
    {/* 符號圖示 */}
    {symbol && (
      <img 
        src={symbol.iconPath} 
        alt={symbol.name}
        className="w-24 h-24 object-contain"
      />
    )}
  </div>
  
  {/* 下半部:任務標題與負責人 */}
  <div className="h-1/2 p-4 flex flex-col justify-center">
    {/* 任務標題 */}
    <h3 className="font-bold text-base mb-3 line-clamp-2">
      {task.title}
    </h3>
    
    {/* 負責人標籤 */}
    <Badge variant="secondary" className="w-fit">
      {task.assignee.name}
    </Badge>
  </div>
</Card>
```

### 2. 調整 Grid 布局

**舊版**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**新版**:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
```

---

## 🎨 設計細節

### 符號圖示大小
- 固定大小:96px × 96px (w-24 h-24)
- 不再根據權重動態調整大小
- 權重差異透過排序順序體現

### 分級標籤位置
- 位置:右上角 (top-2 right-2)
- 樣式:漸層背景 + 白色文字 + 圓角 + 陰影
- 文字:1級|營收、2級|流量、3級|行政、4級|日常

### 卡片比例
- aspect-ratio: 1:1 (正方形)
- 上半部:h-1/2 (50%)
- 下半部:h-1/2 (50%)

### 任務標題
- 字體:font-bold text-base
- 行數限制:line-clamp-2 (最多2行)
- 超出部分顯示省略號

### 負責人標籤
- 樣式:Badge variant="secondary"
- 寬度:w-fit (自適應)

---

## ✅ 驗收標準

### 1. 任務卡片
- ✅ 卡片為正方形(1:1 比例)
- ✅ 符號圖示佔上半部,居中顯示
- ✅ 任務標題與負責人標籤佔下半部
- ✅ 分級標籤顯示在右上角
- ✅ 移除協作人員標籤和進度條
- ✅ 移除部門顯示和 AI 分析進度

### 2. Grid 布局
- ✅ 正方形卡片排列整齊
- ✅ 響應式設計正常運作
- ✅ 卡片間距合理

### 3. 視覺效果
- ✅ 圖像視覺為主,文字為輔
- ✅ 符號圖示清晰可見
- ✅ 分級標籤醒目

---

## 🔧 實作步驟

1. **Phase 2: 重新設計 TaskCard 元件**
   - 修改卡片為正方形(aspect-square)
   - 重新設計上半部:符號圖示區域
   - 重新設計下半部:任務標題與負責人區域
   - 移除協作人員標籤和進度條
   - 調整分級標籤位置到右上角

2. **Phase 3: 調整任務列表的 Grid 布局**
   - 修改 Home.tsx 中的 Grid 列數
   - 確保響應式設計正常運作

3. **Phase 4: 測試所有功能**
   - 測試任務卡片顯示
   - 測試 Grid 布局
   - 測試響應式設計
   - 儲存檢查點

4. **Phase 5: 交付成果**
   - 提供檢查點連結
   - 說明優化內容
   - 建議後續開發方向
