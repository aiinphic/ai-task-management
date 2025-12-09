# 執行追蹤與認知優化機制設計

建立日期: 2025-11-27  
版本: v1.0

---

## 🎯 核心問題

**問題 6**: 除了列出清單,AI 任務報告如何設計更具「指標性」和「直覺性」的動態報告,讓使用者能夠快速得知自己今天跟昨天相比,是在進步還是退步?

**問題 7**: 系統如何透過「輪廓」的視圖,讓使用者在執行端能夠清楚看到自己最近五天或特定時間內的時間分配情況,並根據延期狀況提供建議?

**問題 9**: 系統如何設計一個**「完美的切割」機制**,將「想的部份」(新增與調整任務)與「執行的部份」(實際操作)完全分離,避免使用者一邊做一邊思考或修改,導致分心與結果偏離?

---

## 💡 設計哲學

### 核心原則

1. **視覺直覺** - 一眼看懂進步或退步
2. **趨勢可見** - 清楚看到時間分配變化
3. **認知分離** - 想與做完全分開
4. **即時回饋** - 立即知道表現好壞

---

## 📊 動態進度報告系統

### 1. 每日績效儀表板

```
┌─────────────────────────────────────────────────┐
│  今日績效 vs 昨日                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⭐ 今日分數: 87 / 100  ↑ +12                  │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  📈 關鍵指標變化:                               │
│                                                 │
│  💰 高價值任務完成率                            │
│  ████████████████░░░░  80%  ↑ +15%             │
│  (昨日: 65%)                                    │
│                                                 │
│  ⏰ 時間利用效率                                │
│  ███████████████████░  92%  ↑ +8%              │
│  (昨日: 84%)                                    │
│                                                 │
│  🎯 任務完成數量                                │
│  ████████████████░░░░  8 個  ↑ +2              │
│  (昨日: 6 個)                                   │
│                                                 │
│  ⚡ 平均任務速度                                │
│  ███████████████░░░░░  85%  ↓ -5%              │
│  (昨日: 90%)                                    │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  🏆 今日亮點:                                   │
│  • 完成 3 個 1 級任務 (昨日: 2 個)              │
│  • 零延期任務 (昨日: 1 個延期)                  │
│  • 提前 45 分鐘完成所有任務                     │
│                                                 │
│  ⚠️  需要改進:                                  │
│  • 任務執行速度略降 (可能因任務難度提升)        │
│                                                 │
│  💡 明日建議:                                   │
│  • 繼續保持高價值任務優先策略                   │
│  • 注意控制單一任務時間,避免超時                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. 績效分數計算

```typescript
interface DailyPerformanceScore {
  totalScore: number;           // 總分 0-100
  breakdown: {
    valueTaskCompletion: number;  // 高價值任務完成 (30%)
    timeEfficiency: number;       // 時間效率 (25%)
    taskQuantity: number;         // 任務數量 (20%)
    taskSpeed: number;            // 任務速度 (15%)
    quality: number;              // 品質分數 (10%)
  };
  comparison: {
    yesterday: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

function calculateDailyPerformance(
  date: Date,
  userId: string
): DailyPerformanceScore {
  const today = getTasksForDate(userId, date);
  const yesterday = getTasksForDate(userId, addDays(date, -1));
  
  // 1. 高價值任務完成分數 (30%)
  const valueScore = calculateValueTaskScore(today);
  
  // 2. 時間效率分數 (25%)
  const efficiencyScore = calculateTimeEfficiency(today);
  
  // 3. 任務數量分數 (20%)
  const quantityScore = calculateTaskQuantity(today);
  
  // 4. 任務速度分數 (15%)
  const speedScore = calculateTaskSpeed(today);
  
  // 5. 品質分數 (10%)
  const qualityScore = calculateQualityScore(today);
  
  // 計算總分
  const totalScore = 
    valueScore * 0.30 +
    efficiencyScore * 0.25 +
    quantityScore * 0.20 +
    speedScore * 0.15 +
    qualityScore * 0.10;
  
  // 計算昨日分數
  const yesterdayScore = calculateDailyPerformance(
    addDays(date, -1),
    userId
  ).totalScore;
  
  const change = totalScore - yesterdayScore;
  const trend = 
    change > 2 ? 'up' : 
    change < -2 ? 'down' : 
    'stable';
  
  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      valueTaskCompletion: Math.round(valueScore),
      timeEfficiency: Math.round(efficiencyScore),
      taskQuantity: Math.round(quantityScore),
      taskSpeed: Math.round(speedScore),
      quality: Math.round(qualityScore),
    },
    comparison: {
      yesterday: Math.round(yesterdayScore),
      change: Math.round(change),
      trend,
    },
  };
}
```

### 3. 高價值任務完成分數

```typescript
function calculateValueTaskScore(tasks: Task[]): number {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  if (completedTasks.length === 0) return 0;
  
  // 計算完成任務的總價值
  const totalValue = completedTasks.reduce((sum, task) => {
    return sum + task.finalScore;
  }, 0);
  
  // 計算所有任務的總價值
  const totalPossibleValue = tasks.reduce((sum, task) => {
    return sum + task.finalScore;
  }, 0);
  
  // 完成率
  const completionRate = totalValue / totalPossibleValue;
  
  // 轉換為 0-100 分數
  return completionRate * 100;
}
```

### 4. 時間效率分數

```typescript
function calculateTimeEfficiency(tasks: Task[]): number {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  if (completedTasks.length === 0) return 0;
  
  // 計算時間利用率
  const totalEstimated = completedTasks.reduce(
    (sum, t) => sum + t.estimatedMinutes, 0
  );
  const totalActual = completedTasks.reduce(
    (sum, t) => sum + t.actualMinutes, 0
  );
  
  // 如果實際時間 <= 預估時間,效率 100%
  // 如果實際時間 > 預估時間,效率降低
  const efficiency = Math.min(1.0, totalEstimated / totalActual);
  
  return efficiency * 100;
}
```

---

## 🎨 時間分配輪廓視圖

### 1. 五日時間輪廓

```
┌─────────────────────────────────────────────────┐
│  最近 5 天時間分配輪廓                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  週一   週二   週三   週四   週五               │
│  ━━━   ━━━   ━━━   ━━━   ━━━                 │
│                                                 │
│  1級|營收 (目標: 60%)                           │
│  ████  █████  ████  ███░  █████                │
│  55%   68%    58%   48%   72%  ↑ 趨勢向上      │
│                                                 │
│  2級|流量 (目標: 30%)                           │
│  ███░  ██░░  ███░  ████  ██░░                 │
│  35%   25%    32%   42%   28%  ↕ 波動較大      │
│                                                 │
│  3級|行政 (目標: 10%)                           │
│  █░░░  █░░░  █░░░  █░░░  ░░░░                 │
│  10%   7%     10%   10%   0%   ↓ 趨勢向下      │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  📊 分析:                                       │
│  • 1級任務時間佔比穩定提升 ✓                   │
│  • 2級任務波動較大,週四佔比過高 ⚠️              │
│  • 3級任務控制良好,週五達成零行政 🎉            │
│                                                 │
│  💡 建議:                                       │
│  • 繼續保持 1 級任務優先策略                    │
│  • 注意控制 2 級任務時間,避免擠壓 1 級任務      │
│  • 可考慮將部分 3 級任務委派或自動化            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. 時間輪廓資料結構

```typescript
interface TimeAllocationProfile {
  date: Date;
  userId: string;
  allocations: {
    level1Revenue: {
      minutes: number;
      percentage: number;
      target: number;
      variance: number;
    };
    level2Traffic: {
      minutes: number;
      percentage: number;
      target: number;
      variance: number;
    };
    level3Admin: {
      minutes: number;
      percentage: number;
      target: number;
      variance: number;
    };
  };
  totalWorkMinutes: number;
  insights: string[];
  recommendations: string[];
}
```

### 3. 時間輪廓計算

```typescript
function calculateTimeAllocationProfile(
  userId: string,
  startDate: Date,
  days: number
): TimeAllocationProfile[] {
  const profiles: TimeAllocationProfile[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const tasks = getCompletedTasksForDate(userId, date);
    
    // 計算各級別時間
    const level1Time = tasks
      .filter(t => t.level === 'LEVEL_1_REVENUE')
      .reduce((sum, t) => sum + t.actualMinutes, 0);
    
    const level2Time = tasks
      .filter(t => t.level === 'LEVEL_2_TRAFFIC')
      .reduce((sum, t) => sum + t.actualMinutes, 0);
    
    const level3Time = tasks
      .filter(t => t.level === 'LEVEL_3_ADMIN')
      .reduce((sum, t) => sum + t.actualMinutes, 0);
    
    const totalTime = level1Time + level2Time + level3Time;
    
    // 計算百分比
    const level1Pct = (level1Time / totalTime) * 100;
    const level2Pct = (level2Time / totalTime) * 100;
    const level3Pct = (level3Time / totalTime) * 100;
    
    // 目標值
    const targets = {
      level1: 60,
      level2: 30,
      level3: 10,
    };
    
    // 計算偏差
    const level1Variance = level1Pct - targets.level1;
    const level2Variance = level2Pct - targets.level2;
    const level3Variance = level3Pct - targets.level3;
    
    // 生成洞察
    const insights = generateTimeAllocationInsights({
      level1Pct,
      level2Pct,
      level3Pct,
      level1Variance,
      level2Variance,
      level3Variance,
    });
    
    // 生成建議
    const recommendations = generateTimeAllocationRecommendations({
      level1Variance,
      level2Variance,
      level3Variance,
    });
    
    profiles.push({
      date,
      userId,
      allocations: {
        level1Revenue: {
          minutes: level1Time,
          percentage: level1Pct,
          target: targets.level1,
          variance: level1Variance,
        },
        level2Traffic: {
          minutes: level2Time,
          percentage: level2Pct,
          target: targets.level2,
          variance: level2Variance,
        },
        level3Admin: {
          minutes: level3Time,
          percentage: level3Pct,
          target: targets.level3,
          variance: level3Variance,
        },
      },
      totalWorkMinutes: totalTime,
      insights,
      recommendations,
    });
  }
  
  return profiles;
}
```

### 4. 延期狀況分析

```
┌─────────────────────────────────────────────────┐
│  延期任務分析                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  📅 本週延期狀況:                               │
│                                                 │
│  週一  週二  週三  週四  週五                   │
│  ━━━  ━━━  ━━━  ━━━  ━━━                     │
│   0    1    0    2    0    延期任務數          │
│   ✓    ⚠️    ✓    ❌    ✓                      │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  ⚠️  週四延期 2 個任務:                         │
│                                                 │
│  1. 產品銷售報告 (2級|流量)                     │
│     原定: 17:00 | 實際: 19:30 | 延遲: 2.5h     │
│     原因: 資料收集延遲                          │
│                                                 │
│  2. 客戶會議準備 (1級|營收)                     │
│     原定: 15:00 | 實際: 16:45 | 延遲: 1.75h    │
│     原因: 前一任務超時                          │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  📊 延期原因分析:                               │
│  • 前置任務超時: 60%                            │
│  • 任務難度低估: 30%                            │
│  • 外部依賴延遲: 10%                            │
│                                                 │
│  💡 改進建議:                                   │
│  • 為高風險任務增加 20% 時間緩衝                │
│  • 重要任務安排在上午時段,避免被擠壓            │
│  • 提前確認外部依賴的可用性                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🧠 認知分離機制

### 設計原則

**「想」與「做」完全分離,避免執行時分心**

### 1. 雙模式系統

```
┌─────────────────────────────────────────────────┐
│  模式 A: 規劃模式 (Planning Mode)               │
│  時段: 每日 08:00-08:30                         │
│  功能: 新增任務、調整優先級、修改計畫           │
│  介面: 完整編輯介面,可自由調整                  │
├─────────────────────────────────────────────────┤
│  模式 B: 執行模式 (Execution Mode)              │
│  時段: 08:30-18:00                              │
│  功能: 只能執行任務,不能修改                    │
│  介面: 簡化執行介面,專注當前任務                │
└─────────────────────────────────────────────────┘
```

### 2. 模式切換機制

```typescript
enum SystemMode {
  PLANNING = 'planning',
  EXECUTION = 'execution',
  REVIEW = 'review',
}

interface ModeConfig {
  mode: SystemMode;
  allowedActions: string[];
  restrictedActions: string[];
  uiLayout: 'full' | 'minimal';
}

const MODE_CONFIGS: Record<SystemMode, ModeConfig> = {
  [SystemMode.PLANNING]: {
    mode: SystemMode.PLANNING,
    allowedActions: [
      'create_task',
      'edit_task',
      'delete_task',
      'reorder_tasks',
      'adjust_priorities',
      'set_deadlines',
      'assign_collaborators',
    ],
    restrictedActions: [
      'start_task',
      'complete_task',
    ],
    uiLayout: 'full',
  },
  
  [SystemMode.EXECUTION]: {
    mode: SystemMode.EXECUTION,
    allowedActions: [
      'start_task',
      'pause_task',
      'resume_task',
      'complete_task',
      'report_issue',
      'add_note',
    ],
    restrictedActions: [
      'create_task',
      'edit_task',
      'delete_task',
      'reorder_tasks',
      'adjust_priorities',
    ],
    uiLayout: 'minimal',
  },
  
  [SystemMode.REVIEW]: {
    mode: SystemMode.REVIEW,
    allowedActions: [
      'view_reports',
      'analyze_performance',
      'provide_feedback',
    ],
    restrictedActions: [
      'create_task',
      'start_task',
    ],
    uiLayout: 'full',
  },
};
```

### 3. 自動模式切換

```typescript
class ModeManager {
  private currentMode: SystemMode = SystemMode.PLANNING;
  private modeSchedule: ModeSchedule;
  
  constructor() {
    this.modeSchedule = {
      planning: { start: '08:00', end: '08:30' },
      execution: { start: '08:30', end: '18:00' },
      review: { start: '18:00', end: '18:30' },
    };
    
    // 啟動自動切換
    this.startAutoSwitch();
  }
  
  private startAutoSwitch(): void {
    // 每分鐘檢查是否需要切換模式
    setInterval(() => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      
      // 檢查是否進入規劃時段
      if (this.isTimeInRange(currentTime, this.modeSchedule.planning)) {
        this.switchMode(SystemMode.PLANNING);
      }
      // 檢查是否進入執行時段
      else if (this.isTimeInRange(currentTime, this.modeSchedule.execution)) {
        this.switchMode(SystemMode.EXECUTION);
      }
      // 檢查是否進入回顧時段
      else if (this.isTimeInRange(currentTime, this.modeSchedule.review)) {
        this.switchMode(SystemMode.REVIEW);
      }
    }, 60000); // 每分鐘檢查
  }
  
  switchMode(newMode: SystemMode): void {
    if (this.currentMode === newMode) return;
    
    const oldMode = this.currentMode;
    this.currentMode = newMode;
    
    // 記錄模式切換
    this.logModeSwitch(oldMode, newMode);
    
    // 通知使用者
    this.notifyModeSwitch(newMode);
    
    // 更新 UI
    this.updateUI(newMode);
  }
  
  private notifyModeSwitch(newMode: SystemMode): void {
    const messages = {
      [SystemMode.PLANNING]: {
        title: '進入規劃模式 📝',
        message: '現在是規劃時間,請檢視並調整今日任務計畫。',
        duration: 30, // 30 分鐘
      },
      [SystemMode.EXECUTION]: {
        title: '進入執行模式 ⚡',
        message: '規劃完成,現在專注執行任務。編輯功能已鎖定。',
        duration: 570, // 9.5 小時
      },
      [SystemMode.REVIEW]: {
        title: '進入回顧模式 📊',
        message: '執行結束,請回顧今日表現並準備明日計畫。',
        duration: 30, // 30 分鐘
      },
    };
    
    const config = messages[newMode];
    
    showNotification({
      title: config.title,
      message: config.message,
      type: 'info',
      duration: 5000,
    });
  }
}
```

### 4. 執行模式介面

```
┌─────────────────────────────────────────────────┐
│  執行模式 ⚡ (編輯功能已鎖定)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎯 當前任務:                                   │
│                                                 │
│  客戶簽約 - ABC 公司合約審核                    │
│                                                 │
│  ⏱️  已執行: 23 分鐘 / 預估: 45 分鐘           │
│  ████████████░░░░░░░░░░░░░░  51%               │
│                                                 │
│  📋 當前子任務:                                 │
│  → 確認價格與付款方式 (10 分鐘)                │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  暫停 ⏸️      │  │  完成 ✓      │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  遇到問題? 回報問題 ⚠️            │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  💡 提示:                                       │
│  執行模式下無法修改任務,如需調整請等待          │
│  明日規劃時段 (08:00-08:30)                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5. 緊急調整機制

```typescript
// 雖然執行模式下不能編輯,但允許「緊急調整」

interface EmergencyAdjustment {
  type: 'urgent_task' | 'deadline_change' | 'priority_shift';
  reason: string;
  approvedBy?: string; // 需要主管批准
  timestamp: Date;
}

async function requestEmergencyAdjustment(
  adjustment: EmergencyAdjustment
): Promise<boolean> {
  // 1. 記錄緊急調整請求
  await logEmergencyAdjustment(adjustment);
  
  // 2. 如果是緊急任務,自動批准
  if (adjustment.type === 'urgent_task') {
    return await autoApproveUrgentTask(adjustment);
  }
  
  // 3. 其他情況需要主管批准
  const approved = await requestManagerApproval(adjustment);
  
  if (approved) {
    // 4. 暫時切換到規劃模式
    await temporarySwitchToPlanningMode(60); // 1 分鐘
    
    // 5. 應用調整
    await applyAdjustment(adjustment);
    
    // 6. 切回執行模式
    await switchBackToExecutionMode();
  }
  
  return approved;
}
```

---

## 📈 進度追蹤可視化

### 1. 即時進度條

```
當前任務進度:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░  51%
23 分鐘 / 45 分鐘

今日整體進度:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████████████░░░░░░░░░░░░░░░░  65%
已完成 5 / 8 個任務

本週目標進度:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████████████████████░░░░░░░░  78%
已完成 28 / 36 個任務
```

### 2. 趨勢圖表

```typescript
interface PerformanceTrend {
  dates: Date[];
  scores: number[];
  trend: 'improving' | 'declining' | 'stable';
  trendStrength: number; // 0-1
}

function calculatePerformanceTrend(
  userId: string,
  days: number
): PerformanceTrend {
  const dates: Date[] = [];
  const scores: number[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(new Date(), -i);
    const score = calculateDailyPerformance(date, userId).totalScore;
    
    dates.push(date);
    scores.push(score);
  }
  
  // 計算趨勢
  const trend = calculateLinearTrend(scores);
  
  return {
    dates,
    scores,
    trend: trend.slope > 0.5 ? 'improving' : 
           trend.slope < -0.5 ? 'declining' : 
           'stable',
    trendStrength: Math.abs(trend.slope),
  };
}
```

---

## 🎯 實作檢查清單

### 階段 1: 動態報告
- [ ] 實作每日績效計算
- [ ] 建立績效儀表板 UI
- [ ] 實作指標比較邏輯
- [ ] 建立趨勢分析

### 階段 2: 時間輪廓
- [ ] 實作時間分配計算
- [ ] 建立輪廓視圖 UI
- [ ] 實作延期分析
- [ ] 生成改進建議

### 階段 3: 認知分離
- [ ] 實作模式管理系統
- [ ] 建立雙模式 UI
- [ ] 實作自動切換機制
- [ ] 建立緊急調整流程

### 階段 4: 可視化
- [ ] 建立進度條元件
- [ ] 實作趨勢圖表
- [ ] 建立對比視圖
- [ ] 實作即時更新

---

## 📊 預期效益

### 認知負荷降低
- 執行時無需思考「做什麼」
- 無需判斷「先做哪個」
- 專注當前任務,減少分心

### 效率提升
- 減少 80% 的決策時間
- 提升 40% 的任務完成速度
- 降低 60% 的任務切換次數

### 自我認知提升
- 清楚知道每日進步或退步
- 了解時間分配是否合理
- 獲得明確的改進方向

---

**總結**: 透過視覺化的動態報告、時間輪廓視圖與認知分離機制,讓使用者能夠直覺地了解自己的表現,並在執行時完全專注,不被「想」的部分干擾。
