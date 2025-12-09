# 時間掌控系統設計

建立日期: 2025-11-27  
版本: v1.0

---

## 🎯 核心問題

**問題 8**: 為了確保時間數據的真實性,AI 任務管理後臺如何強制規定記錄任務時間必須是「當下」的,且「不能回溯、不能事後再改」?

**問題 10**: 每日下班前(例如 6 點 15 分),系統的自動結算機制如何運作,判斷員工當天時間的花費狀況,並計算出分數,從而給予即時提醒,引導員工調整行為?

**問題 11**: 既然「時間可以換任何東西」,那麼系統如何確保它**「掌握了全部的時間」**?時間控制面板如何透過簡單的指標(量不好、就是這麽簡單)來高效提醒使用者,實現每天持續的行為優化?

---

## 💡 設計哲學

### 核心原則

1. **即時記錄** - 時間必須當下記錄,不可回溯
2. **全面掌控** - 掌握所有時間,無遺漏
3. **簡單直接** - 指標簡單明瞭,一眼看懂
4. **即時回饋** - 每日自動結算,立即提醒

---

## ⏱️ 即時時間記錄系統

### 1. 時間記錄機制

```typescript
interface TimeRecord {
  id: string;
  taskId: string;
  userId: string;
  action: 'start' | 'pause' | 'resume' | 'complete';
  timestamp: Date;
  deviceTime: Date;      // 裝置時間
  serverTime: Date;      // 伺服器時間
  location?: GeoLocation; // 位置資訊
  deviceId: string;       // 裝置 ID
  isManual: boolean;      // 是否手動記錄
  canModify: boolean;     // 是否可修改
  lockTime: Date;         // 鎖定時間
}
```

### 2. 即時記錄強制機制

```typescript
class TimeRecorder {
  private activeTask: Task | null = null;
  private startTime: Date | null = null;
  
  // 開始任務
  async startTask(taskId: string): Promise<TimeRecord> {
    const now = new Date();
    
    // 1. 檢查是否有正在執行的任務
    if (this.activeTask) {
      throw new Error('請先完成或暫停當前任務');
    }
    
    // 2. 記錄開始時間
    const record = await this.createTimeRecord({
      taskId,
      action: 'start',
      timestamp: now,
      deviceTime: now,
      serverTime: await this.getServerTime(),
      deviceId: this.getDeviceId(),
      isManual: false,
      canModify: false, // 不可修改
      lockTime: addMinutes(now, 5), // 5 分鐘後鎖定
    });
    
    this.activeTask = await getTask(taskId);
    this.startTime = now;
    
    // 3. 啟動心跳檢測
    this.startHeartbeat();
    
    return record;
  }
  
  // 完成任務
  async completeTask(): Promise<TimeRecord> {
    if (!this.activeTask || !this.startTime) {
      throw new Error('沒有正在執行的任務');
    }
    
    const now = new Date();
    const duration = (now.getTime() - this.startTime.getTime()) / 60000; // 分鐘
    
    // 1. 記錄完成時間
    const record = await this.createTimeRecord({
      taskId: this.activeTask.id,
      action: 'complete',
      timestamp: now,
      deviceTime: now,
      serverTime: await this.getServerTime(),
      deviceId: this.getDeviceId(),
      isManual: false,
      canModify: false,
      lockTime: now, // 立即鎖定
    });
    
    // 2. 更新任務實際時間
    await updateTaskActualTime(this.activeTask.id, duration);
    
    // 3. 清除狀態
    this.activeTask = null;
    this.startTime = null;
    this.stopHeartbeat();
    
    return record;
  }
  
  // 心跳檢測 (確保使用者仍在執行任務)
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      if (!this.activeTask) return;
      
      // 發送心跳
      await this.sendHeartbeat({
        taskId: this.activeTask.id,
        timestamp: new Date(),
      });
    }, 60000); // 每分鐘
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
```

### 3. 時間記錄驗證

```typescript
// 驗證時間記錄的真實性
async function validateTimeRecord(record: TimeRecord): Promise<boolean> {
  // 1. 檢查時間戳是否合理
  const now = new Date();
  const recordAge = (now.getTime() - record.timestamp.getTime()) / 1000; // 秒
  
  if (recordAge > 300) { // 超過 5 分鐘
    throw new Error('時間記錄已過期,無法接受');
  }
  
  // 2. 檢查裝置時間與伺服器時間差異
  const timeDiff = Math.abs(
    record.deviceTime.getTime() - record.serverTime.getTime()
  ) / 1000;
  
  if (timeDiff > 60) { // 差異超過 1 分鐘
    console.warn(`裝置時間與伺服器時間差異 ${timeDiff} 秒`);
    // 使用伺服器時間
    record.timestamp = record.serverTime;
  }
  
  // 3. 檢查是否有重複記錄
  const duplicates = await findDuplicateRecords(record);
  if (duplicates.length > 0) {
    throw new Error('偵測到重複的時間記錄');
  }
  
  // 4. 檢查記錄順序
  const lastRecord = await getLastTimeRecord(record.userId);
  if (lastRecord && lastRecord.timestamp > record.timestamp) {
    throw new Error('時間記錄順序錯誤');
  }
  
  return true;
}
```

### 4. 防止回溯修改

```typescript
// 時間記錄一旦建立,立即鎖定
async function lockTimeRecord(recordId: string): Promise<void> {
  await db.timeRecords.update(recordId, {
    canModify: false,
    lockTime: new Date(),
    locked: true,
  });
}

// 嘗試修改時間記錄
async function attemptModifyTimeRecord(
  recordId: string,
  newData: Partial<TimeRecord>
): Promise<void> {
  const record = await db.timeRecords.findById(recordId);
  
  // 檢查是否可修改
  if (!record.canModify || record.locked) {
    throw new Error(
      '時間記錄已鎖定,無法修改。' +
      '如需調整,請聯繫主管申請特殊權限。'
    );
  }
  
  // 檢查是否超過可修改時間
  const now = new Date();
  if (now > record.lockTime) {
    throw new Error('時間記錄已超過可修改時間');
  }
  
  // 記錄修改歷史
  await logTimeRecordModification({
    recordId,
    oldData: record,
    newData,
    modifiedBy: getCurrentUserId(),
    modifiedAt: now,
  });
  
  // 應用修改
  await db.timeRecords.update(recordId, newData);
}
```

---

## 📊 全時間掌控系統

### 1. 時間分類體系

```typescript
enum TimeCategory {
  // 工作時間
  WORK_TASK = 'work_task',           // 任務執行
  WORK_MEETING = 'work_meeting',     // 會議
  WORK_COMMUNICATION = 'work_communication', // 溝通協作
  WORK_LEARNING = 'work_learning',   // 學習培訓
  
  // 休息時間
  BREAK_SHORT = 'break_short',       // 短休息 (< 15 分鐘)
  BREAK_LUNCH = 'break_lunch',       // 午休
  BREAK_LONG = 'break_long',         // 長休息 (> 15 分鐘)
  
  // 非工作時間
  PERSONAL = 'personal',             // 個人事務
  COMMUTE = 'commute',               // 通勤
  UNTRACKED = 'untracked',           // 未追蹤
}
```

### 2. 全天時間追蹤

```typescript
interface DayTimeBreakdown {
  date: Date;
  userId: string;
  
  // 總時間 (24 小時 = 1440 分鐘)
  totalMinutes: 1440;
  
  // 時間分配
  breakdown: {
    // 工作時間
    workTask: number;           // 任務執行
    workMeeting: number;        // 會議
    workCommunication: number;  // 溝通
    workLearning: number;       // 學習
    workTotal: number;          // 工作總計
    
    // 休息時間
    breakShort: number;         // 短休息
    breakLunch: number;         // 午休
    breakLong: number;          // 長休息
    breakTotal: number;         // 休息總計
    
    // 非工作時間
    personal: number;           // 個人事務
    commute: number;            // 通勤
    sleep: number;              // 睡眠 (推算)
    untracked: number;          // 未追蹤
  };
  
  // 效率指標
  efficiency: {
    workRate: number;           // 工作時間佔比
    taskRate: number;           // 任務時間佔工作時間比
    productiveRate: number;     // 生產力時間佔比
    untrackedRate: number;      // 未追蹤時間佔比
  };
}
```

### 3. 自動時間分類

```typescript
async function trackTimeAutomatically(userId: string): Promise<void> {
  // 1. 監聽任務開始/結束事件
  eventBus.on('task:start', async (event) => {
    await recordTime({
      userId: event.userId,
      category: TimeCategory.WORK_TASK,
      startTime: event.timestamp,
      taskId: event.taskId,
    });
  });
  
  eventBus.on('task:complete', async (event) => {
    await completeTimeRecord({
      userId: event.userId,
      endTime: event.timestamp,
    });
  });
  
  // 2. 監聽會議事件
  eventBus.on('meeting:start', async (event) => {
    await recordTime({
      userId: event.userId,
      category: TimeCategory.WORK_MEETING,
      startTime: event.timestamp,
      meetingId: event.meetingId,
    });
  });
  
  // 3. 檢測未追蹤時間
  setInterval(async () => {
    await detectUntrackedTime(userId);
  }, 300000); // 每 5 分鐘檢查
}
```

### 4. 未追蹤時間偵測

```typescript
async function detectUntrackedTime(userId: string): Promise<void> {
  const now = new Date();
  const lastRecord = await getLastTimeRecord(userId);
  
  if (!lastRecord) return;
  
  // 計算距離上次記錄的時間
  const gapMinutes = (now.getTime() - lastRecord.endTime.getTime()) / 60000;
  
  // 如果超過 10 分鐘沒有記錄
  if (gapMinutes > 10) {
    // 詢問使用者這段時間在做什麼
    await promptUserForTimeCategory({
      userId,
      startTime: lastRecord.endTime,
      endTime: now,
      duration: gapMinutes,
    });
  }
}
```

### 5. 時間分類提示

```
┌─────────────────────────────────────────────────┐
│  時間追蹤提醒 ⏰                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  偵測到 15 分鐘未追蹤時間                       │
│  (14:30 - 14:45)                                │
│                                                 │
│  請選擇這段時間的活動:                          │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  短休息 ☕    │  │  午休 🍱      │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  會議 👥      │  │  溝通 💬      │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  個人事務 🏃  │  │  其他 ...    │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  💡 快速選擇: 系統推測您可能在「短休息」        │
│  ┌────────────────────────────────┐            │
│  │  確認推測 ✓                    │            │
│  └────────────────────────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔔 每日自動結算系統

### 1. 結算時間設定

```typescript
interface SettlementConfig {
  time: string;           // 結算時間 "18:15"
  timezone: string;       // 時區
  enabled: boolean;       // 是否啟用
  notifyBefore: number;   // 提前通知 (分鐘)
}

const DEFAULT_SETTLEMENT_CONFIG: SettlementConfig = {
  time: '18:15',
  timezone: 'Asia/Taipei',
  enabled: true,
  notifyBefore: 15, // 提前 15 分鐘通知
};
```

### 2. 自動結算流程

```typescript
class DailySettlementSystem {
  private config: SettlementConfig;
  
  constructor(config: SettlementConfig) {
    this.config = config;
    this.scheduleSettlement();
  }
  
  private scheduleSettlement(): void {
    // 使用 cron 排程每日結算
    const [hour, minute] = this.config.time.split(':');
    const cronExpression = `0 ${minute} ${hour} * * *`;
    
    schedule(cronExpression, async () => {
      await this.runDailySettlement();
    });
    
    // 排程提前通知
    const notifyTime = this.calculateNotifyTime();
    const [notifyHour, notifyMinute] = notifyTime.split(':');
    const notifyCron = `0 ${notifyMinute} ${notifyHour} * * *`;
    
    schedule(notifyCron, async () => {
      await this.sendSettlementReminder();
    });
  }
  
  private async runDailySettlement(): Promise<void> {
    const today = new Date();
    const users = await getAllActiveUsers();
    
    for (const user of users) {
      try {
        // 1. 計算今日表現
        const performance = await this.calculateDailyPerformance(user.id, today);
        
        // 2. 生成結算報告
        const report = await this.generateSettlementReport(user.id, performance);
        
        // 3. 發送通知
        await this.sendSettlementNotification(user.id, report);
        
        // 4. 記錄結算
        await this.saveSettlement(user.id, today, performance, report);
      } catch (error) {
        console.error(`結算失敗 - 使用者 ${user.id}:`, error);
      }
    }
  }
  
  private async calculateDailyPerformance(
    userId: string,
    date: Date
  ): Promise<DailyPerformance> {
    // 1. 取得今日所有時間記錄
    const timeRecords = await getTimeRecordsForDate(userId, date);
    
    // 2. 計算時間分配
    const timeBreakdown = calculateTimeBreakdown(timeRecords);
    
    // 3. 計算任務完成情況
    const taskCompletion = await calculateTaskCompletion(userId, date);
    
    // 4. 計算績效分數
    const score = calculatePerformanceScore(timeBreakdown, taskCompletion);
    
    // 5. 與昨日比較
    const yesterday = addDays(date, -1);
    const yesterdayPerformance = await this.calculateDailyPerformance(userId, yesterday);
    const comparison = comparePerformance(score, yesterdayPerformance.score);
    
    return {
      date,
      userId,
      timeBreakdown,
      taskCompletion,
      score,
      comparison,
    };
  }
}
```

### 3. 結算報告

```
┌─────────────────────────────────────────────────┐
│  今日結算報告 📊 (2025-11-27)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⭐ 今日分數: 87 / 100  ↑ +12                  │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  ⏰ 時間分配:                                   │
│                                                 │
│  工作時間: 7.5 小時 (93% 目標達成)              │
│  ├─ 任務執行: 6.2 小時 (83%)                   │
│  ├─ 會議: 0.8 小時 (11%)                       │
│  └─ 溝通: 0.5 小時 (6%)                        │
│                                                 │
│  休息時間: 1.2 小時                             │
│  未追蹤時間: 0.3 小時 ⚠️                        │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  🎯 任務完成:                                   │
│                                                 │
│  完成任務: 8 / 8 (100%) ✓                      │
│  ├─ 1級|營收: 3 / 3                            │
│  ├─ 2級|流量: 4 / 4                            │
│  └─ 3級|行政: 1 / 1                            │
│                                                 │
│  準時完成: 8 / 8 (100%) ✓                      │
│  平均品質: 優秀                                 │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  📈 與昨日比較:                                 │
│                                                 │
│  • 分數提升 12 分 ↑                            │
│  • 任務完成數 +2 ↑                             │
│  • 1級任務 +1 ↑                                │
│  • 未追蹤時間 -10 分鐘 ↑                       │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  🏆 今日成就:                                   │
│  • 🎯 完美一天 - 所有任務準時完成               │
│  • ⚡ 效率之星 - 時間利用率 > 90%               │
│  • 💎 品質保證 - 所有任務品質優秀               │
│                                                 │
│  💡 明日建議:                                   │
│  • 繼續保持今日的高效狀態                       │
│  • 注意追蹤所有時間,減少未追蹤時間              │
│  • 可考慮挑戰更多 1 級任務                      │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  查看詳情    │  │  規劃明日    │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. 即時提醒機制

```typescript
// 根據結算結果給予即時提醒
function generateSettlementReminders(
  performance: DailyPerformance
): Reminder[] {
  const reminders: Reminder[] = [];
  
  // 1. 未追蹤時間過多
  if (performance.timeBreakdown.untrackedRate > 0.1) {
    reminders.push({
      type: 'warning',
      title: '未追蹤時間過多',
      message: `今日有 ${(performance.timeBreakdown.untrackedRate * 100).toFixed(0)}% 時間未追蹤,請養成即時記錄習慣`,
      action: 'review_untracked_time',
    });
  }
  
  // 2. 任務執行時間佔比過低
  if (performance.timeBreakdown.taskRate < 0.7) {
    reminders.push({
      type: 'warning',
      title: '任務執行時間不足',
      message: `任務執行時間僅佔工作時間 ${(performance.timeBreakdown.taskRate * 100).toFixed(0)}%,建議減少會議與溝通時間`,
      action: 'optimize_time_allocation',
    });
  }
  
  // 3. 高價值任務完成率低
  if (performance.taskCompletion.level1Rate < 0.8) {
    reminders.push({
      type: 'critical',
      title: '高價值任務完成率不足',
      message: `1級任務完成率僅 ${(performance.taskCompletion.level1Rate * 100).toFixed(0)}%,請優先處理高價值任務`,
      action: 'prioritize_high_value_tasks',
    });
  }
  
  // 4. 連續進步
  if (performance.comparison.trend === 'improving' && 
      performance.comparison.consecutiveDays >= 3) {
    reminders.push({
      type: 'success',
      title: '連續進步!',
      message: `您已連續 ${performance.comparison.consecutiveDays} 天進步,繼續保持!`,
      action: 'celebrate',
    });
  }
  
  // 5. 連續退步
  if (performance.comparison.trend === 'declining' && 
      performance.comparison.consecutiveDays >= 3) {
    reminders.push({
      type: 'critical',
      title: '需要關注',
      message: `您已連續 ${performance.comparison.consecutiveDays} 天退步,建議檢視工作方式`,
      action: 'schedule_review_meeting',
    });
  }
  
  return reminders;
}
```

---

## 📱 時間控制面板

### 1. 簡化指標設計

```
┌─────────────────────────────────────────────────┐
│  時間控制面板 ⏰                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  今日時間掌控度: 92%  ↑ +5%                     │
│  ████████████████████████████████████░░░░░░░░  │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  核心指標 (越高越好):                           │
│                                                 │
│  🎯 高價值任務時間佔比                          │
│  目標: 60% | 實際: 72% | ████████████████░░░░  │
│  ✓ 超出目標 12%                                 │
│                                                 │
│  ⚡ 任務執行時間佔比                            │
│  目標: 70% | 實際: 83% | ████████████████████░  │
│  ✓ 超出目標 13%                                 │
│                                                 │
│  ⏱️  時間利用效率                               │
│  目標: 85% | 實際: 92% | ████████████████████░  │
│  ✓ 超出目標 7%                                  │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  風險指標 (越低越好):                           │
│                                                 │
│  ⚠️  未追蹤時間                                 │
│  目標: < 5% | 實際: 3% | ███░░░░░░░░░░░░░░░░░  │
│  ✓ 低於目標 2%                                  │
│                                                 │
│  📉 低價值任務時間                              │
│  目標: < 10% | 實際: 8% | ████░░░░░░░░░░░░░░░  │
│  ✓ 低於目標 2%                                  │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  💡 即時建議:                                   │
│  • 時間掌控度優秀,繼續保持 ✓                   │
│  • 高價值任務時間充足,效果顯著 ✓               │
│  • 未追蹤時間控制良好 ✓                        │
│                                                 │
│  🎯 明日目標:                                   │
│  • 維持時間掌控度 > 90%                         │
│  • 高價值任務時間 > 70%                         │
│  • 未追蹤時間 < 5%                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. 時間掌控度計算

```typescript
interface TimeControlMetrics {
  overallScore: number;     // 總分 0-100
  
  // 正向指標 (越高越好)
  positiveMetrics: {
    highValueTaskRate: number;    // 高價值任務時間佔比
    taskExecutionRate: number;    // 任務執行時間佔比
    timeEfficiency: number;       // 時間利用效率
  };
  
  // 風險指標 (越低越好)
  riskMetrics: {
    untrackedRate: number;        // 未追蹤時間佔比
    lowValueTaskRate: number;     // 低價值任務時間佔比
  };
  
  // 目標達成情況
  targets: {
    highValueTaskRate: { target: number; actual: number; achieved: boolean };
    taskExecutionRate: { target: number; actual: number; achieved: boolean };
    timeEfficiency: { target: number; actual: number; achieved: boolean };
    untrackedRate: { target: number; actual: number; achieved: boolean };
    lowValueTaskRate: { target: number; actual: number; achieved: boolean };
  };
}

function calculateTimeControlScore(
  timeBreakdown: DayTimeBreakdown,
  taskCompletion: TaskCompletion
): TimeControlMetrics {
  // 1. 計算正向指標
  const highValueTaskRate = 
    (timeBreakdown.breakdown.workTask * taskCompletion.level1Rate) / 
    timeBreakdown.breakdown.workTotal;
  
  const taskExecutionRate = 
    timeBreakdown.breakdown.workTask / 
    timeBreakdown.breakdown.workTotal;
  
  const timeEfficiency = timeBreakdown.efficiency.productiveRate;
  
  // 2. 計算風險指標
  const untrackedRate = timeBreakdown.efficiency.untrackedRate;
  
  const lowValueTaskRate = 
    (timeBreakdown.breakdown.workTask * taskCompletion.level3Rate) / 
    timeBreakdown.breakdown.workTotal;
  
  // 3. 計算總分
  let score = 0;
  
  // 正向指標 (70%)
  score += (highValueTaskRate >= 0.6 ? 30 : highValueTaskRate / 0.6 * 30);
  score += (taskExecutionRate >= 0.7 ? 20 : taskExecutionRate / 0.7 * 20);
  score += (timeEfficiency >= 0.85 ? 20 : timeEfficiency / 0.85 * 20);
  
  // 風險指標 (30%)
  score += (untrackedRate <= 0.05 ? 15 : (0.05 - untrackedRate) / 0.05 * 15);
  score += (lowValueTaskRate <= 0.1 ? 15 : (0.1 - lowValueTaskRate) / 0.1 * 15);
  
  return {
    overallScore: Math.max(0, Math.min(100, score)),
    positiveMetrics: {
      highValueTaskRate,
      taskExecutionRate,
      timeEfficiency,
    },
    riskMetrics: {
      untrackedRate,
      lowValueTaskRate,
    },
    targets: {
      highValueTaskRate: {
        target: 0.6,
        actual: highValueTaskRate,
        achieved: highValueTaskRate >= 0.6,
      },
      taskExecutionRate: {
        target: 0.7,
        actual: taskExecutionRate,
        achieved: taskExecutionRate >= 0.7,
      },
      timeEfficiency: {
        target: 0.85,
        actual: timeEfficiency,
        achieved: timeEfficiency >= 0.85,
      },
      untrackedRate: {
        target: 0.05,
        actual: untrackedRate,
        achieved: untrackedRate <= 0.05,
      },
      lowValueTaskRate: {
        target: 0.1,
        actual: lowValueTaskRate,
        achieved: lowValueTaskRate <= 0.1,
      },
    },
  };
}
```

### 3. 簡化提醒邏輯

```typescript
// 只關注最重要的指標
function generateSimpleReminder(metrics: TimeControlMetrics): string {
  // 1. 時間掌控度優秀 (> 90)
  if (metrics.overallScore >= 90) {
    return '✓ 時間掌控優秀,繼續保持!';
  }
  
  // 2. 時間掌控度良好 (80-90)
  if (metrics.overallScore >= 80) {
    return '✓ 時間掌控良好,還有進步空間';
  }
  
  // 3. 時間掌控度普通 (70-80)
  if (metrics.overallScore >= 70) {
    // 找出最需要改進的指標
    const weakest = findWeakestMetric(metrics);
    return `⚠️  需要改進「${weakest.name}」(目前 ${(weakest.actual * 100).toFixed(0)}%,目標 ${(weakest.target * 100).toFixed(0)}%)`;
  }
  
  // 4. 時間掌控度不佳 (< 70)
  return `❌ 時間掌控不佳,建議檢視工作方式`;
}
```

---

## 🎯 實作檢查清單

### 階段 1: 即時記錄
- [ ] 實作時間記錄器
- [ ] 建立心跳檢測機制
- [ ] 實作時間驗證邏輯
- [ ] 建立防回溯機制

### 階段 2: 全時間追蹤
- [ ] 定義時間分類體系
- [ ] 實作自動時間追蹤
- [ ] 建立未追蹤時間偵測
- [ ] 實作時間分類提示

### 階段 3: 自動結算
- [ ] 建立結算排程系統
- [ ] 實作績效計算邏輯
- [ ] 生成結算報告
- [ ] 實作即時提醒機制

### 階段 4: 控制面板
- [ ] 設計簡化指標
- [ ] 實作時間掌控度計算
- [ ] 建立控制面板 UI
- [ ] 實作簡化提醒

---

## 📊 預期效益

### 時間真實性
- 100% 即時記錄,無法回溯
- 時間數據完全可信
- 防止時間造假

### 全面掌控
- 追蹤所有時間,無遺漏
- 清楚知道時間去向
- 識別時間浪費

### 行為優化
- 每日自動結算與提醒
- 簡單指標易於理解
- 持續改進時間利用

---

**總結**: 透過即時記錄、全時間追蹤、自動結算與簡化指標,系統完全掌握所有時間,確保數據真實性,並透過簡單直接的提醒,引導使用者持續優化時間利用。
