# AI 任務管理系統 v13.0 - 執行模式開發待辦清單

## 📋 需求總覽

### 第一階段:修復新增任務功能
- [ ] 在 Home.tsx 中建立 tasks state 管理
- [ ] 實作 handleAddTask 函數
- [ ] 整合新增任務對話框到 tasks state
- [ ] 確保新增任務後卡片立即顯示

### 第二階段:建立執行模式頁面
- [ ] 新增「執行模式」導航分頁
- [ ] 建立 ExecutionMode.tsx 頁面元件
- [ ] 設計頁面布局(上方分析區 + 下方執行區)

### 第三階段:最近5天時間分析
- [ ] 建立 RecentDaysAnalysis 元件
- [ ] 從所有任務列表計算每天的時間投入
- [ ] 顯示 5 張日期卡片(昨天、前天、3天前、4天前、5天前)
- [ ] 每張卡片顯示:日期、總時間、主要分級佔比
- [ ] 實作逾期任務檢測
- [ ] 實作 AI 建議文字生成

### 第四階段:AI優先處理清單
- [ ] 建立 PriorityTaskList 元件
- [ ] 根據優先級評分自動排序任務
- [ ] 只顯示「待處理」和「進行中」的任務
- [ ] 顯示任務層級、標題、預估時間、截止日期
- [ ] 支援點擊選擇任務

### 第五階段:執行控制區
- [ ] 建立 ExecutionControl 元件
- [ ] 實作「開始」按鈕(需先選擇任務)
- [ ] 實作計時器功能
- [ ] 記錄開始時間到 console(資料庫整合後續)
- [ ] 實作「結束」按鈕
- [ ] 記錄結束時間與實際花費時間
- [ ] 實作「規劃框」按鈕(可隨時開啟)
- [ ] 整合 SupplementDialog 元件

## 🎯 功能細節

### 新增任務功能修復

**問題**:
- 目前新增任務後沒有實際加入到任務列表

**解決方案**:
```tsx
// Home.tsx
const [tasks, setTasks] = useState<Task[]>([...mockTasks]);

const handleAddTask = (taskData: {
  title: string;
  description: string;
  assignee: User;
  deadline: string;
}) => {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: taskData.title,
    description: taskData.description,
    assignee: taskData.assignee,
    level: 'LEVEL_4_DAILY', // 預設為無法歸類,後續可整合 AI 判斷
    weight: 'MEDIUM',
    symbolId: 'system-maintenance', // 預設符號
    status: 'pending',
    progress: 0,
    collaborators: [],
    deadline: taskData.deadline,
    createdAt: new Date().toISOString(),
    estimatedHours: 0,
    department: { id: 'dept1', name: '未分配' },
    subtasks: [],
  };
  
  setTasks([newTask, ...tasks]); // 新任務放在最前面
};
```

---

### 執行模式頁面架構

```tsx
// ExecutionMode.tsx
export function ExecutionMode() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  return (
    <div className="space-y-6">
      {/* 最近 5 天時間分析 */}
      <RecentDaysAnalysis tasks={tasks} />
      
      {/* 逾期任務提醒 + AI 建議 */}
      <OverdueAlert tasks={tasks} />
      
      {/* 執行區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側:AI 優先處理清單 */}
        <PriorityTaskList
          tasks={tasks}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTask}
        />
        
        {/* 右側:執行控制區 */}
        <ExecutionControl
          selectedTask={selectedTask}
          isExecuting={isExecuting}
          elapsedTime={elapsedTime}
          onStart={handleStart}
          onEnd={handleEnd}
        />
      </div>
    </div>
  );
}
```

---

### 最近 5 天時間分析邏輯

```tsx
// 計算最近 5 天的時間分配
const calculateRecentDays = (tasks: Task[]) => {
  const days = [];
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // 篩選該天的任務(根據 createdAt 或 completedAt)
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.toDateString() === date.toDateString();
    });
    
    // 計算總時間
    const totalHours = dayTasks.reduce((sum, task) => {
      return sum + (task.actualTime || task.estimatedHours || 0);
    }, 0);
    
    // 計算分級佔比
    const levelDistribution = {
      LEVEL_1_REVENUE: 0,
      LEVEL_2_TRAFFIC: 0,
      LEVEL_3_ADMIN: 0,
      LEVEL_4_DAILY: 0,
    };
    
    dayTasks.forEach(task => {
      levelDistribution[task.level] += (task.actualTime || task.estimatedHours || 0);
    });
    
    days.push({
      date,
      totalHours,
      levelDistribution,
      tasks: dayTasks,
    });
  }
  
  return days;
};
```

---

### AI 優先處理清單排序

```tsx
// 根據優先級評分排序
const sortedTasks = tasks
  .filter(task => task.status === 'pending' || task.status === 'in-progress')
  .sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    return scoreB.totalScore - scoreA.totalScore;
  })
  .slice(0, 10); // 只顯示前 10 個任務
```

---

### 執行控制區計時器

```tsx
const [elapsedTime, setElapsedTime] = useState(0);
const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

const handleStart = () => {
  if (!selectedTask) {
    alert('請先選擇一個任務');
    return;
  }
  
  setIsExecuting(true);
  setStartTime(new Date());
  
  const id = setInterval(() => {
    setElapsedTime(prev => prev + 1);
  }, 1000);
  
  setIntervalId(id);
  
  console.log('開始執行任務:', selectedTask.title, '開始時間:', new Date());
};

const handleEnd = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  setIsExecuting(false);
  
  const endTime = new Date();
  const actualMinutes = Math.floor(elapsedTime / 60);
  
  console.log('結束執行任務:', selectedTask?.title);
  console.log('開始時間:', startTime);
  console.log('結束時間:', endTime);
  console.log('實際花費:', actualMinutes, '分鐘');
  
  // TODO: 儲存到資料庫
  
  // 重置狀態
  setElapsedTime(0);
  setStartTime(null);
  setSelectedTask(null);
};
```

---

## ✅ 驗收標準

### 新增任務功能
- [ ] 新增任務後,任務卡片立即出現在「所有任務列表」分頁
- [ ] 新任務顯示在列表最前面
- [ ] 新任務包含所有必要欄位

### 執行模式頁面
- [ ] 導航欄新增「執行模式」分頁
- [ ] 頁面包含:最近5天分析、逾期提醒、優先清單、執行控制區
- [ ] 最近5天卡片正確顯示日期、時間、分級佔比
- [ ] AI 優先處理清單正確排序
- [ ] 可點擊選擇任務
- [ ] 點擊「開始」按鈕後開始計時
- [ ] 計時器正確顯示經過時間(HH:MM:SS)
- [ ] 點擊「結束」按鈕後停止計時並記錄
- [ ] 規劃框按鈕可隨時開啟 SupplementDialog

---

## 📝 備註

- 資料庫整合將在後續階段實作
- 目前先使用 console.log 記錄執行資料
- AI 分析功能(逾期建議、時間分配建議)將在後續階段實作
