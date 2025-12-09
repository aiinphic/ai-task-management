# AI 任務管理系統 v10.0 優化需求

## 📋 需求總覽

### 1. 移除任務列表的部門篩選功能
- [ ] 從「所有任務列表」移除 TaskFilter 元件中的部門篩選
- [ ] 只保留狀態和負責人篩選
- [ ] 部門篩選功能保留在「部門概況」分頁

### 2. 簡化任務卡片樣式
- [ ] 移除 AI 分析進度框框
- [ ] 只顯示:符號圖示、負責人名稱、任務標題
- [ ] 保留協作人員標籤(如果有)
- [ ] 保留進度條(如果任務進行中)

---

## 🎨 任務卡片新版設計

### 舊版佈局

```
┌────────────────────────────────┐
│ [符號]  李美華 → 產品銷售簡報   │
│         業務部                  │
│         協作: 王小明            │
│                                │
│ ┌──────────────────────────┐  │
│ │ AI 分析進度: 已完成...    │  │ ← 移除此區塊
│ │ 待補充: 價格方案...       │  │
│ └──────────────────────────┘  │
│                                │
│ 執行進度 45%                   │
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░          │
└────────────────────────────────┘
```

### 新版佈局

```
┌────────────────────────────────┐
│ [符號]  李美華 → 產品銷售簡報   │
│         協作: 王小明            │
│                                │
│ 執行進度 45%                   │
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░          │
└────────────────────────────────┘
```

---

## 🔧 技術實作

### 1. 修改 TaskFilter 元件

**移除部門篩選選項**:

```typescript
// 舊版
<TaskFilter
  filters={filters}
  onFilterChange={setFilters}
  departments={uniqueDepartments}  // ← 移除
  assignees={uniqueAssignees}
/>

// 新版
<TaskFilter
  filters={filters}
  onFilterChange={setFilters}
  assignees={uniqueAssignees}
/>
```

### 2. 修改 TaskCard 元件

**移除 AI 分析進度區塊**:

```typescript
// 舊版
{task.aiAnalysis && (
  <div className="mb-3 p-3 bg-muted/50 rounded-md">
    <div className="text-xs text-muted-foreground mb-1">
      <span className="font-semibold">AI 分析進度:</span> {task.aiAnalysis.progress}
    </div>
    {task.aiAnalysis.missingItems.length > 0 && (
      <div className="flex items-start gap-1 text-xs text-orange-600 mt-1">
        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span>待補充: {task.aiAnalysis.missingItems.join(", ")}</span>
      </div>
    )}
  </div>
)}

// 新版
// 完全移除此區塊
```

**簡化卡片結構**:

```typescript
<Card>
  <div className="p-4 bg-card">
    {/* Header with Symbol */}
    <div className="flex items-start gap-4 mb-3">
      {/* Symbol Icon */}
      {symbol && (
        <div className="flex-shrink-0 relative">
          <img src={symbol.iconPath} ... />
          <div className="absolute -bottom-1 -right-1 ...">
            {levelLabel}
          </div>
        </div>
      )}
      
      {/* Task Info */}
      <div className="flex-1 min-w-0">
        {/* Title: 負責人 → 任務名稱 */}
        <h3 className="font-bold text-base">
          <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
          <span className="mx-2">→</span>
          <span>{task.title}</span>
        </h3>
      </div>
    </div>

    {/* Collaborators */}
    {task.collaborators.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-3">
        {task.collaborators.map((collab) => (
          <Badge key={collab.id} variant="secondary">
            {collab.name}
          </Badge>
        ))}
      </div>
    )}

    {/* Progress Bar (if in-progress) */}
    {task.status === "in-progress" && task.progress !== undefined && (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>執行進度</span>
          <span>{task.progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
    )}
  </div>
</Card>
```

---

## ✅ 驗收標準

### 1. 任務列表篩選
- ✅ 所有任務列表不顯示部門篩選選項
- ✅ 只顯示狀態和負責人篩選
- ✅ 篩選功能正常運作

### 2. 任務卡片
- ✅ 移除 AI 分析進度框框
- ✅ 只顯示負責人名稱和任務標題
- ✅ 協作人員標籤正常顯示
- ✅ 進度條正常顯示(進行中任務)
- ✅ 符號大小權重視覺化正常運作

---

## 🔧 實作步驟

1. **Phase 2: 移除任務列表的部門篩選功能**
   - 檢查 TaskFilter 元件定義
   - 移除 departments 參數
   - 更新 Home.tsx 中的 TaskFilter 調用

2. **Phase 3: 簡化任務卡片樣式**
   - 修改 TaskCard.tsx
   - 移除 AI 分析進度區塊
   - 移除部門顯示
   - 保留符號、標題、協作人員、進度條

3. **Phase 4: 測試所有功能**
   - 測試任務列表篩選
   - 測試任務卡片顯示
   - 測試分類書籤切換
   - 儲存檢查點

4. **Phase 5: 交付成果**
   - 提供檢查點連結
   - 說明優化內容
   - 建議後續開發方向
