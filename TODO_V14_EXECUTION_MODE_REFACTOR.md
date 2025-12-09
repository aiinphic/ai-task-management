# AI 任務管理系統 v14.0 - 執行模式重構待辦清單

## 📋 需求總覽

### 第一階段:重構執行模式為三層架構
- [ ] 建立部門選擇器元件
- [ ] 建立人員選擇器元件
- [ ] 建立個人執行視窗元件
- [ ] 實作三層導航流程

### 第二階段:優化 AI 優先處理清單
- [ ] 根據選中的人員篩選任務(負責人 = 選中的人員)
- [ ] 只顯示該人員負責的任務
- [ ] 確保資料來源正確

### 第三階段:優化最近 5 天時間分析
- [ ] 顯示每天實際執行的任務列表
- [ ] 顯示每個任務花費的時間
- [ ] 顯示時間佔比(圓餅圖或長條圖)
- [ ] 串接真實資料(目前使用模擬資料)

## 🎯 功能細節

### 三層架構設計

```
執行模式頁面
├── 第一層:部門選擇器
│   └── 顯示所有部門卡片
│       └── 點擊部門 → 進入第二層
│
├── 第二層:人員選擇器
│   └── 顯示該部門所有人員列表
│       └── 點擊人員 → 進入第三層
│
└── 第三層:個人執行視窗
    ├── 最近 5 天時間分析
    ├── 逾期任務提醒
    ├── AI 優先處理清單(只顯示該人員負責的任務)
    └── 執行控制區
```

---

### 第一層:部門選擇器

```tsx
// DepartmentSelector.tsx
export function DepartmentSelector({ onSelectDepartment }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">選擇部門</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {departments.map(dept => (
          <Card
            key={dept.id}
            className="p-6 cursor-pointer hover:bg-secondary/50"
            onClick={() => onSelectDepartment(dept)}
          >
            <h3 className="font-bold text-lg">{dept.name}</h3>
            <p className="text-sm text-muted-foreground">
              {dept.memberCount} 人
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

### 第二層:人員選擇器

```tsx
// MemberSelector.tsx
export function MemberSelector({ department, onSelectMember, onBack }: Props) {
  const members = mockUsers.filter(user => user.department === department.name);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h2 className="text-2xl font-bold">{department.name} - 選擇人員</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map(member => (
          <Card
            key={member.id}
            className="p-6 cursor-pointer hover:bg-secondary/50"
            onClick={() => onSelectMember(member)}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{member.avatar}</div>
              <h3 className="font-bold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

### 第三層:個人執行視窗

```tsx
// PersonalExecutionView.tsx
export function PersonalExecutionView({ member, tasks, onBack }: Props) {
  // 篩選該人員負責的任務
  const memberTasks = tasks.filter(task => task.assignee.id === member.id);

  // 計算該人員最近 5 天的時間分析
  const recentDaysAnalysis = calculatePersonalRecentDays(memberTasks, member.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {member.avatar} {member.name} - 執行模式
          </h2>
          <p className="text-sm text-muted-foreground">
            {member.department} | {member.role}
          </p>
        </div>
      </div>

      {/* 最近 5 天時間分析 */}
      <RecentDaysAnalysis data={recentDaysAnalysis} member={member} />

      {/* 逾期任務提醒 */}
      <OverdueAlert tasks={memberTasks} />

      {/* 執行區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI 優先處理清單 */}
        <PriorityTaskList tasks={memberTasks} />
        
        {/* 執行控制區 */}
        <ExecutionControl />
      </div>
    </div>
  );
}
```

---

### 優化 AI 優先處理清單

**問題**:
- 目前顯示所有任務,沒有根據選中的人員篩選

**解決方案**:
```tsx
// 篩選該人員負責的任務
const memberTasks = tasks.filter(task => task.assignee.id === member.id);

// AI 優先處理清單
const priorityTasks = memberTasks
  .filter(task => task.status === 'pending' || task.status === 'in-progress')
  .map(task => ({
    task,
    score: calculatePriorityScore(task),
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);
```

---

### 優化最近 5 天時間分析

**問題**:
- 目前數據不清楚,看不出時間怎麼花的
- 只顯示總時間和主要分級,沒有顯示具體任務

**解決方案**:

#### 1. 顯示每天的任務列表

```tsx
// RecentDaysAnalysis.tsx
export function RecentDaysAnalysis({ data, member }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">最近 5 天時間分析</h2>
      <div className="grid grid-cols-5 gap-4">
        {data.map((day, index) => (
          <Card key={index} className="p-4">
            {/* 日期 */}
            <p className="text-sm text-muted-foreground mb-2">{day.label}</p>
            
            {/* 總時間 */}
            <p className="text-2xl font-bold mb-2">{day.totalHours.toFixed(1)}h</p>
            
            {/* 任務列表 */}
            <div className="space-y-1">
              {day.tasks.slice(0, 3).map(task => (
                <div key={task.id} className="text-xs">
                  <p className="font-semibold truncate">{task.title}</p>
                  <p className="text-muted-foreground">
                    {task.actualTime ? `${task.actualTime}分鐘` : '未記錄'}
                  </p>
                </div>
              ))}
              {day.tasks.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{day.tasks.length - 3} 個任務
                </p>
              )}
            </div>
            
            {/* 分級佔比 */}
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {day.topLevel}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### 2. 計算真實時間數據

```tsx
// 計算個人最近 5 天的時間分析
function calculatePersonalRecentDays(tasks: Task[], memberId: string) {
  const days = [];
  const labels = ['昨天', '前天', '3天前', '4天前', '5天前'];

  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // 篩選該人員該天的任務
    const dayTasks = tasks.filter(task => {
      // 檢查任務是否在該天執行過
      if (!task.startTime) return false;
      
      const taskDate = new Date(task.startTime);
      return taskDate >= date && taskDate < nextDate && task.assignee.id === memberId;
    });

    // 計算總時間(使用 actualTime 或 totalTimeSpent)
    const totalMinutes = dayTasks.reduce((sum, task) => {
      return sum + (task.totalTimeSpent || task.estimatedMinutes || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;

    // 計算分級佔比
    const levelCounts = {
      'LEVEL_1_REVENUE': 0,
      'LEVEL_2_TRAFFIC': 0,
      'LEVEL_3_ADMIN': 0,
      'LEVEL_4_DAILY': 0,
    };

    dayTasks.forEach(task => {
      if (task.level) {
        levelCounts[task.level]++;
      }
    });

    const topLevel = Object.entries(levelCounts)
      .sort((a, b) => b[1] - a[1])[0];

    const topLevelLabel = topLevel && topLevel[1] > 0
      ? topLevel[0] === 'LEVEL_1_REVENUE' ? '營收'
      : topLevel[0] === 'LEVEL_2_TRAFFIC' ? '流量'
      : topLevel[0] === 'LEVEL_3_ADMIN' ? '行政'
      : '日常'
      : '無資料';

    days.push({
      label: labels[i - 1],
      date,
      totalHours,
      totalMinutes,
      topLevel: topLevelLabel,
      tasks: dayTasks,
    });
  }

  return days;
}
```

#### 3. 顯示時間佔比圖表

```tsx
// 在每張日期卡片下方新增圓餅圖
<div className="mt-2">
  <ResponsiveContainer width="100%" height={100}>
    <PieChart>
      <Pie
        data={[
          { name: '營收', value: day.levelDistribution.LEVEL_1_REVENUE },
          { name: '流量', value: day.levelDistribution.LEVEL_2_TRAFFIC },
          { name: '行政', value: day.levelDistribution.LEVEL_3_ADMIN },
          { name: '日常', value: day.levelDistribution.LEVEL_4_DAILY },
        ]}
        cx="50%"
        cy="50%"
        innerRadius={20}
        outerRadius={40}
        fill="#8884d8"
        dataKey="value"
      >
        <Cell fill="#f59e0b" />
        <Cell fill="#3b82f6" />
        <Cell fill="#6b7280" />
        <Cell fill="#d1d5db" />
      </Pie>
    </PieChart>
  </ResponsiveContainer>
</div>
```

---

## ✅ 驗收標準

### 三層架構
- [ ] 執行模式頁面顯示部門選擇器
- [ ] 點擊部門後顯示該部門所有人員
- [ ] 點擊人員後顯示個人執行視窗
- [ ] 可以返回上一層

### AI 優先處理清單
- [ ] 只顯示選中人員負責的任務
- [ ] 任務正確排序(根據優先級分數)
- [ ] 顯示任務層級、標題、預估時間、截止日期

### 最近 5 天時間分析
- [ ] 顯示每天的總時間
- [ ] 顯示每天的任務列表(最多3個,超過顯示「+X個任務」)
- [ ] 顯示每個任務的實際花費時間
- [ ] 顯示時間佔比(主要分級)
- [ ] 數據來源正確(使用 startTime, totalTimeSpent 等欄位)

---

## 📝 備註

- 目前使用模擬資料,後續需要整合資料庫
- 任務的 startTime, endTime, totalTimeSpent 欄位需要在執行控制區記錄
- 最近 5 天時間分析需要根據 startTime 判斷任務是否在該天執行
