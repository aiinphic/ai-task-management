# AI 任務管理系統 v9.0 優化需求

## 📋 需求總覽

### 1. 任務列表分類書籤系統
- [ ] 新增分類標籤/書籤切換介面
- [ ] 實作 5 個分類:1級|營收、2級|流量、3級|行政、4級|日常、全部
- [ ] 每個分類只顯示對應層級的任務
- [ ] 預設顯示「全部」分類
- [ ] 切換分類時任務列表動態更新

### 2. 部門概況移動到獨立分頁
- [ ] 在導航欄新增「部門概況」分頁
- [ ] 從「所有任務列表」移除部門概況卡片區塊
- [ ] 所有任務列表只顯示任務卡片與分類書籤
- [ ] 更新導航結構:儀表板 | 所有任務列表 | 部門概況

### 3. 任務卡片優化
- [ ] 移除「協作 X 人」文字顯示
- [ ] 保留協作人員頭像/名稱標籤
- [ ] 簡化任務卡片佈局
- [ ] 確保符號大小權重視覺化正常運作

### 4. 任務詳細對話框優化
- [ ] 保留:AI 分析、任務方向、任務大綱、文字敘述
- [ ] 新增:待補充事項對話框(可輸入文字或上傳音檔)
- [ ] 移除:整體進度卡片
- [ ] 移除:已投入時間卡片
- [ ] 保留:進度條、任務細項列表

---

## 🎨 任務分類書籤設計

### 視覺設計

```
┌─────────────────────────────────────────────────────────┐
│  [全部]  [1級|營收]  [2級|流量]  [3級|行政]  [4級|日常]  │
└─────────────────────────────────────────────────────────┘
```

### 分類邏輯

- **全部**: 顯示所有任務(預設)
- **1級|營收**: 只顯示 `level === "LEVEL_1_REVENUE"` 的任務
- **2級|流量**: 只顯示 `level === "LEVEL_2_TRAFFIC"` 的任務
- **3級|行政**: 只顯示 `level === "LEVEL_3_ADMIN"` 的任務
- **4級|日常**: 只顯示 `level === "LEVEL_4_DAILY"` 的任務

### 技術實作

```typescript
const [selectedCategory, setSelectedCategory] = useState<TaskLevel | "ALL">("ALL");

const categoryFilteredTasks = useMemo(() => {
  if (selectedCategory === "ALL") return filteredTasks;
  return filteredTasks.filter(task => task.level === selectedCategory);
}, [selectedCategory, filteredTasks]);
```

---

## 🏢 部門概況獨立分頁

### 導航結構更新

**舊版**:
```
儀表板 | 所有任務列表
```

**新版**:
```
儀表板 | 所有任務列表 | 部門概況
```

### 所有任務列表頁面結構

**舊版**:
```
所有任務列表
├── 部門概覽 (5 張部門卡片)
├── 任務篩選器
└── 任務列表
```

**新版**:
```
所有任務列表
├── 分類書籤 (全部/1級/2級/3級/4級)
├── 任務篩選器
└── 任務列表
```

### 部門概況頁面結構

```
部門概況
└── 部門卡片列表 (5 張部門卡片)
```

---

## 🎴 任務卡片優化

### 舊版佈局

```
┌────────────────────────────────┐
│ [符號]  產品銷售簡報            │
│         業務部 • 協作 1 人      │ ← 移除「協作 1 人」
│         李美華                  │
└────────────────────────────────┘
```

### 新版佈局

```
┌────────────────────────────────┐
│ [符號]  產品銷售簡報            │
│         業務部                  │
│         協作: 李美華            │ ← 保留協作人員標籤
└────────────────────────────────┘
```

### 程式碼修改

```typescript
// 舊版
<div>
  {task.department} • 協作 {task.collaborators.length} 人
</div>

// 新版
<div>
  {task.department}
</div>
{task.collaborators.length > 0 && (
  <div className="flex items-center gap-1">
    <span className="text-xs text-muted-foreground">協作:</span>
    {task.collaborators.map(c => (
      <Badge key={c.id} variant="secondary" className="text-xs">
        {c.name}
      </Badge>
    ))}
  </div>
)}
```

---

## 💬 任務詳細對話框優化

### 保留區塊

1. **任務基本資訊**
   - 任務標題
   - 負責人
   - 協作人員
   - 任務描述

2. **AI 生成內容**
   - 任務方向
   - 任務大綱
   - 文字敘述

3. **AI 分析**
   - 分析進度
   - 待補充事項

4. **進度追蹤**
   - 進度條
   - 任務細項列表

### 新增區塊

**待補充事項對話框**

```typescript
interface SupplementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { text?: string; audioFile?: File }) => void;
}

// 功能:
// 1. 文字輸入框 (Textarea)
// 2. 音檔上傳按鈕 (File input, accept=".mp3,.wav,.m4a")
// 3. 提交按鈕
```

### 移除區塊

1. **整體進度卡片** (grid-cols-2 的第一張卡片)
   ```typescript
   <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
     <div className="text-xs text-muted-foreground mb-1">整體進度</div>
     <div className="text-2xl font-bold text-blue-700">
       {completedCount} / {subtasks.length}
     </div>
     <div className="text-xs text-muted-foreground mt-1">{progressPercent}% 完成</div>
   </div>
   ```

2. **已投入時間卡片** (grid-cols-2 的第二張卡片)
   ```typescript
   <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
     <div className="text-xs text-muted-foreground mb-1">已投入時間</div>
     <div className="text-2xl font-bold text-purple-700">
       {Math.floor(totalActualTime / 60)}h {totalActualTime % 60}m
     </div>
     <div className="text-xs text-muted-foreground mt-1">實際執行</div>
   </div>
   ```

### 新版對話框結構

```
任務詳細對話框
├── 任務標題
├── 任務基本資訊 (負責人、協作人員)
├── 任務描述
├── AI 生成內容 (方向、大綱、敘述)
├── AI 分析 (進度、待補充事項)
│   └── [補充資料] 按鈕 → 開啟待補充對話框
├── 進度條
├── 任務細項列表
└── [關閉] 按鈕
```

---

## ✅ 驗收標準

### 1. 任務分類書籤
- ✅ 書籤切換流暢,無延遲
- ✅ 每個分類顯示正確的任務
- ✅ 預設顯示「全部」分類
- ✅ 書籤樣式清晰,選中狀態明顯

### 2. 部門概況分頁
- ✅ 導航欄顯示「部門概況」分頁
- ✅ 點擊後顯示 5 張部門卡片
- ✅ 所有任務列表不再顯示部門概況

### 3. 任務卡片
- ✅ 移除「協作 X 人」文字
- ✅ 協作人員以標籤形式顯示
- ✅ 佈局簡潔清晰

### 4. 任務詳細對話框
- ✅ 保留 AI 生成內容與分析
- ✅ 新增待補充對話框(文字/音檔)
- ✅ 移除整體進度與已投入時間卡片
- ✅ 保留進度條與任務細項

---

## 🔧 技術實作順序

1. **Phase 2: 實作任務分類書籤系統**
   - 新增分類狀態管理
   - 建立書籤 UI 元件
   - 實作分類篩選邏輯

2. **Phase 3: 移動部門概況到獨立分頁**
   - 在 Home.tsx 新增「部門概況」TabsContent
   - 從「所有任務列表」移除部門概況區塊
   - 更新導航標籤

3. **Phase 4: 優化任務卡片顯示**
   - 修改 TaskCard.tsx 移除「協作 X 人」
   - 改為標籤式顯示協作人員

4. **Phase 5: 優化任務詳細對話框**
   - 移除整體進度與已投入時間卡片
   - 新增待補充對話框元件
   - 整合文字輸入與音檔上傳功能

5. **Phase 6: 測試所有功能**
   - 測試分類書籤切換
   - 測試部門概況分頁
   - 測試任務卡片與詳細對話框
   - 儲存檢查點

6. **Phase 7: 交付成果**
   - 提供檢查點連結
   - 說明優化內容
   - 建議後續開發方向
