# AI 任務管理系統 v5.0 - 交付文件

交付日期: 2025-11-27  
版本: v5.0  
專案名稱: AI 任務管理系統

---

## 📦 交付內容總覽

本次交付包含一個完整的 AI 任務管理系統前端應用程式,具備以下核心功能:

### ✅ 已完成功能

#### 1. 交通標誌風格符號系統
- **30個專業符號圖形**,分為三個等級:
  - 一級|營收: 10個金色圓形符號
  - 二級|流量: 10個藍色菱形符號
  - 三級|行政: 10個灰色方形符號
- **AI 自動判別機制**: 根據任務內容關鍵字自動匹配對應符號
- **符號字典檔**: 完整的符號定義與匹配規則 (`client/src/data/taskSymbols.ts`)
- **符號尺寸**: 120x120px,視覺層級醒目
- **分級標籤**: 符號右下角顯示「一級」「二級」「三級」標籤

#### 2. 任務卡片系統
- **卡片顯示格式**: 「負責人 → 任務名稱」
- **部門標籤**: 清楚標示所屬部門
- **協作單位**: 顯示協作人員姓名
- **AI 分析**: 顯示任務進度與缺失事項
- **符號圖標**: 大尺寸符號圖標 + 分級標籤

#### 3. 部門管理系統
- **五大部門**: 產品部、會計部、業務部、行銷部、行政部
- **部門卡片**: 顯示任務數量統計與成員清單
- **部門分組選擇器**: 新增任務時按部門分組選擇協作人員

#### 4. 任務篩選器
- **三維度篩選**:
  - 按部門篩選
  - 按任務狀態篩選(待辦/進行中/已完成)
  - 按負責人篩選
- **篩選標籤顯示**: 清楚顯示已套用的篩選條件
- **清除篩選**: 一鍵清除所有篩選條件

#### 5. 子任務時間追蹤
- **卡片式設計**: 每個子任務獨立卡片顯示
- **狀態管理**: 待辦/進行中/已完成
- **時間追蹤**: 開始/暫停/繼續/完成按鈕
- **實時計時**: 顯示已投入時間
- **暫停次數**: 統計並顯示暫停次數

#### 6. 任務詳情彈窗
- **統計卡片**: 整體進度、已投入時間、預估總時間
- **子任務列表**: 卡片式展示所有子任務
- **進度追蹤**: 實時更新整體進度百分比

#### 7. 時間統計圖表
- **今日時間投入**: 甜甜圈圖顯示今日總投入時間
- **任務分級時間佔比**: 圓餅圖顯示一級/二級/三級任務時間分配
- **每日時間分布**: 長條圖顯示每日時間趨勢
- **空狀態設計**: 尚無數據時顯示友善提示

#### 8. 新增任務功能
- **多種輸入方式**: 文字輸入、文件上傳、錄音上傳
- **AI 分析按鈕**: 自動分析任務內容並分級
- **負責人選擇**: 下拉選單選擇負責人
- **協作單位選擇**: 部門分組選擇協作人員

---

## 🏗️ 技術架構

### 前端技術棧
- **框架**: React 19 + TypeScript
- **路由**: Wouter
- **樣式**: Tailwind CSS 4
- **UI 元件**: shadcn/ui
- **圖表庫**: Recharts
- **圖標**: Lucide React
- **通知**: Sonner (Toast)

### 專案結構
```
client/
├── public/
│   └── symbols/          # 符號圖形素材
│       ├── revenue/      # 營收符號 (10個)
│       ├── traffic/      # 流量符號 (10個)
│       └── admin/        # 行政符號 (10個)
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui 基礎元件
│   │   ├── charts/       # 圖表元件
│   │   ├── TaskCard.tsx  # 任務卡片
│   │   ├── DepartmentCard.tsx  # 部門卡片
│   │   ├── TaskFilter.tsx      # 任務篩選器
│   │   ├── SubtaskCard.tsx     # 子任務卡片
│   │   ├── TaskDetailDialog.tsx # 任務詳情彈窗
│   │   ├── CreateTaskDialog.tsx # 新增任務對話框
│   │   └── DepartmentMemberSelector.tsx # 部門成員選擇器
│   ├── types/
│   │   ├── task.ts       # 任務類型定義
│   │   ├── department.ts # 部門類型定義
│   │   ├── actionLog.ts  # 操作記錄類型定義
│   │   └── timeTracking.ts # 時間統計類型定義
│   ├── data/
│   │   ├── taskSymbols.ts      # 符號字典檔
│   │   └── mockDepartments.ts  # 部門與使用者模擬資料
│   ├── utils/
│   │   └── timeStats.ts  # 時間統計工具函數
│   ├── pages/
│   │   └── Home.tsx      # 主頁面
│   ├── App.tsx           # 路由配置
│   └── index.css         # 全域樣式
```

---

## 🎯 核心功能說明

### 1. 符號系統運作流程

**符號匹配邏輯** (`client/src/data/taskSymbols.ts`):
```typescript
export function matchSymbolByKeywords(text: string): TaskSymbol | null {
  const lowerText = text.toLowerCase();
  
  for (const symbol of taskSymbols) {
    if (symbol.keywords.some(keyword => lowerText.includes(keyword))) {
      return symbol;
    }
  }
  
  return null;
}
```

**使用範例**:
```typescript
const symbol = matchSymbolByKeywords("撰寫Q4季度營收報告");
// 返回: { id: "revenue-analysis", category: "revenue", ... }
```

### 2. 時間追蹤架構

**操作記錄類型** (`client/src/types/actionLog.ts`):
```typescript
export interface TaskActionLog {
  id: string;
  timestamp: Date;
  action: 'start' | 'pause' | 'resume' | 'complete';
  subtaskId?: string;
  note?: string;
}
```

**工具函數**:
- `calculateActualTime(logs)`: 計算實際投入時間(扣除暫停時間)
- `calculatePauseCount(logs)`: 計算暫停次數
- `getTimeSegments(logs)`: 獲取時間區間列表
- `formatDuration(milliseconds)`: 格式化時間顯示

### 3. 部門與使用者管理

**部門結構** (`client/src/data/mockDepartments.ts`):
```typescript
export const mockDepartments: Department[] = [
  {
    id: "dept-product",
    name: "產品部",
    icon: "Package",
    color: "#3B82F6",
    memberIds: ["user-001", "user-002", ...],
  },
  // ... 其他部門
];
```

---

## 📊 數據流程

### 任務狀態管理
```
待辦 (pending)
  ↓ 點擊「開始」
進行中 (in-progress)
  ↓ 點擊「暫停」
進行中 (paused)
  ↓ 點擊「繼續」
進行中 (in-progress)
  ↓ 點擊「完成」
已完成 (completed)
```

### 時間追蹤流程
```
1. 使用者點擊「開始」
   → 建立 TaskActionLog { action: 'start', timestamp: Date }
   → 儲存到 subtask.actionLogs[]

2. 使用者點擊「暫停」
   → 建立 TaskActionLog { action: 'pause', timestamp: Date }
   → 計算本次投入時間
   → 更新 subtask.actualTime

3. 使用者點擊「繼續」
   → 建立 TaskActionLog { action: 'resume', timestamp: Date }
   → 繼續計時

4. 使用者點擊「完成」
   → 建立 TaskActionLog { action: 'complete', timestamp: Date }
   → 計算總投入時間
   → 更新任務狀態為 'completed'
```

---

## 🚀 後續開發指南

### Phase 1: 完成時間追蹤功能

#### 1.1 更新 TaskDetailDialog
**檔案**: `client/src/components/TaskDetailDialog.tsx`

**需求**: 處理 SubtaskCard 傳回的 actionLog 並儲存

**實作步驟**:
```typescript
// 1. 更新 handleSubtaskStatusChange 函數簽名
const handleSubtaskStatusChange = (
  subtaskId: string,
  newStatus: Subtask['status'],
  actualTime?: number,
  actionLog?: TaskActionLog
) => {
  setTask(prev => {
    const updatedSubtasks = prev.subtasks?.map(st => {
      if (st.id === subtaskId) {
        // 2. 儲存操作記錄
        const updatedLogs = st.actionLogs || [];
        if (actionLog) {
          updatedLogs.push(actionLog);
        }
        
        return {
          ...st,
          status: newStatus,
          actualTime: actualTime || st.actualTime,
          actionLogs: updatedLogs,
          // 3. 記錄開始/結束時間
          startTime: newStatus === 'in-progress' && !st.startTime 
            ? new Date().toLocaleTimeString('zh-TW') 
            : st.startTime,
          endTime: newStatus === 'completed' 
            ? new Date().toLocaleTimeString('zh-TW') 
            : st.endTime,
        };
      }
      return st;
    });
    
    return { ...prev, subtasks: updatedSubtasks };
  });
};
```

#### 1.2 實現已完成任務回溯

**檔案**: `client/src/components/CompletedTaskDialog.tsx` (新建)

**功能**:
- 時間軸式摘要顯示
- 詳細操作記錄展開
- 時間分布圓餅圖

**範例程式碼**:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task, Subtask } from "@/types/task";
import { calculateActualTime, calculatePauseCount, getTimeSegments } from "@/types/actionLog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface CompletedTaskDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export function CompletedTaskDialog({ task, open, onClose }: CompletedTaskDialogProps) {
  // 計算每個子任務的時間佔比
  const chartData = task.subtasks?.map(st => ({
    name: st.title,
    value: st.actualTime,
  })) || [];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title} - 執行記錄</DialogTitle>
        </DialogHeader>
        
        {/* 統計卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{task.totalTimeSpent}h</div>
              <div className="text-sm text-muted-foreground">總投入時間</div>
            </CardContent>
          </Card>
          {/* ... 其他統計 */}
        </div>
        
        {/* 時間軸 */}
        <div className="space-y-4">
          <h3 className="font-semibold">執行時間軸</h3>
          {task.subtasks?.map((subtask, index) => (
            <SubtaskTimeline key={subtask.id} subtask={subtask} />
          ))}
        </div>
        
        {/* 時間分布圓餅圖 */}
        <div className="mt-6">
          <h3 className="font-semibold mb-4">時間分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 1.3 新增時間分布按鈕

**檔案**: `client/src/components/TaskCard.tsx`

**修改位置**: 在任務卡片右上角或底部新增按鈕

```typescript
<Button 
  size="sm" 
  variant="outline" 
  onClick={() => setShowTimeDistribution(true)}
  className="ml-auto"
>
  <PieChartIcon className="w-4 h-4 mr-1" />
  時間分布
</Button>
```

---

### Phase 2: 建立獨立時間分析頁面

#### 2.1 新增路由

**檔案**: `client/src/App.tsx`

```typescript
import TimeAnalysis from "./pages/TimeAnalysis";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/time-analysis"} component={TimeAnalysis} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

#### 2.2 建立時間分析頁面

**檔案**: `client/src/pages/TimeAnalysis.tsx` (新建)

**功能區塊**:
1. 總覽區塊
   - 本週總投入時間
   - 各部門時間佔比(圓餅圖)
   - 各任務分級時間佔比(圓餅圖)

2. 任務排行榜
   - 最耗時任務 TOP 10(長條圖)
   - 效率最高任務 TOP 10

3. 人員效率分析
   - 各成員投入時間統計(長條圖)
   - 任務完成率比較

4. 篩選器
   - 時間範圍(今日/本週/本月/自訂)
   - 部門
   - 負責人

---

### Phase 3: 整合後端資料庫

#### 3.1 資料庫設計

**建議使用**: PostgreSQL

**資料表結構**:

```sql
-- 使用者表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  role VARCHAR(50),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 部門表
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 任務表
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  symbol_id VARCHAR(50),
  assignee_id UUID REFERENCES users(id),
  department_id UUID REFERENCES departments(id),
  estimated_time INTEGER, -- 分鐘
  actual_time INTEGER,    -- 分鐘
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 協作人員表
CREATE TABLE task_collaborators (
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES users(id),
  PRIMARY KEY (task_id, user_id)
);

-- 子任務表
CREATE TABLE subtasks (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  title VARCHAR(200) NOT NULL,
  estimated_time INTEGER,
  actual_time INTEGER,
  status VARCHAR(20) NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 操作記錄表
CREATE TABLE action_logs (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  subtask_id UUID REFERENCES subtasks(id),
  action VARCHAR(20) NOT NULL, -- start, pause, resume, complete
  timestamp TIMESTAMP NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.2 API 設計

**建議使用**: RESTful API 或 tRPC

**核心 API 端點**:

```
GET    /api/tasks              # 獲取任務列表
POST   /api/tasks              # 建立新任務
GET    /api/tasks/:id          # 獲取任務詳情
PUT    /api/tasks/:id          # 更新任務
DELETE /api/tasks/:id          # 刪除任務

GET    /api/tasks/:id/subtasks # 獲取子任務列表
POST   /api/subtasks/:id/start # 開始子任務
POST   /api/subtasks/:id/pause # 暫停子任務
POST   /api/subtasks/:id/complete # 完成子任務

GET    /api/stats/time         # 獲取時間統計
GET    /api/stats/department   # 獲取部門統計
GET    /api/stats/user/:id     # 獲取使用者統計
```

---

## 🎨 設計規範

### 顏色系統
- **一級|營收**: `#F59E0B` (金色/橙色)
- **二級|流量**: `#3B82F6` (藍色)
- **三級|行政**: `#6B7280` (灰色)
- **主色調**: `#6366F1` (紫色)
- **成功**: `#10B981` (綠色)
- **警告**: `#F59E0B` (橙色)
- **錯誤**: `#EF4444` (紅色)

### 符號尺寸
- **任務卡片符號**: 120x120px
- **小型符號**: 60x60px
- **圖標**: 16x16px / 20x20px / 24x24px

### 間距系統
- **卡片間距**: 16px (gap-4)
- **區塊間距**: 24px (gap-6)
- **頁面邊距**: 32px (p-8)

---

## 📝 使用說明

### 新增任務
1. 點擊右上角「新增任務」按鈕
2. 輸入任務描述(或上傳文件/錄音)
3. 點擊「AI 分析任務」按鈕
4. 系統自動分析並顯示任務標題、分級、預估時間
5. 選擇負責人
6. 選擇協作單位(按部門分組)
7. 點擊「建立任務」

### 執行任務
1. 切換到「所有任務列表」分頁
2. 點擊任務卡片查看詳情
3. 點擊子任務的「開始」按鈕開始計時
4. 可隨時點擊「暫停」暫停計時
5. 點擊「繼續」恢復計時
6. 完成後點擊「完成」按鈕

### 查看時間統計
1. 在儀表板向下滾動到「時間統計分析」區塊
2. 查看今日時間投入、任務分級時間佔比、每日時間分布
3. (未來) 點擊「查看詳細分析」進入完整時間分析頁面

---

## 🐛 已知問題與限制

### 目前限制
1. **前端模擬資料**: 所有資料儲存在前端狀態,重新整理後會遺失
2. **無真實 AI**: AI 分析功能使用關鍵字匹配,非真實 AI 模型
3. **無檔案上傳**: 上傳文件/錄音功能為 UI 展示,未實作真實上傳
4. **無使用者認證**: 無登入/登出功能
5. **無權限控制**: 所有使用者可查看/編輯所有任務

### 待修復問題
1. 時間追蹤的 actionLogs 儲存邏輯尚未完全整合到 TaskDetailDialog
2. 已完成任務回溯功能尚未實作
3. 時間分布按鈕與圓餅圖尚未實作
4. 獨立時間分析頁面尚未建立

---

## 🔧 開發環境設定

### 安裝依賴
```bash
cd /home/ubuntu/ai-task-management
pnpm install
```

### 啟動開發伺服器
```bash
pnpm dev
```

### 建置生產版本
```bash
pnpm build
```

---

## 📚 參考資源

### 官方文件
- [React 19 文件](https://react.dev/)
- [TypeScript 文件](https://www.typescriptlang.org/)
- [Tailwind CSS 文件](https://tailwindcss.com/)
- [shadcn/ui 文件](https://ui.shadcn.com/)
- [Recharts 文件](https://recharts.org/)

### 相關檔案
- `TODO_V6_TIME_TRACKING.md`: 時間追蹤功能待辦清單
- `SYMBOL_SYSTEM_SHOWCASE.md`: 符號系統詳細說明
- `TRAFFIC_SIGN_RESEARCH.md`: 交通標誌設計研究筆記

---

## 💡 建議的優先順序

### 短期(1-2週)
1. ✅ 完成時間追蹤功能整合
2. ✅ 實現已完成任務回溯
3. ✅ 新增時間分布按鈕與圓餅圖

### 中期(1個月)
1. ✅ 建立獨立時間分析頁面
2. ✅ 整合後端資料庫與 API
3. ✅ 實現真實檔案上傳功能

### 長期(2-3個月)
1. ✅ 整合真實 AI 分析引擎(OpenAI GPT-4)
2. ✅ 實現使用者認證與權限控制
3. ✅ 開發行動版應用程式
4. ✅ 實現即時協作功能(WebSocket)

---

## 📞 技術支援

如有任何問題或需要協助,請參考:
- 專案 GitHub Repository (待建立)
- 技術文件 Wiki (待建立)
- 開發團隊聯絡方式 (待提供)

---

**交付日期**: 2025-11-27  
**版本**: v5.0  
**狀態**: ✅ 已完成基礎功能,待擴展進階功能
