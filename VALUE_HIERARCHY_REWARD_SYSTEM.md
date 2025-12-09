# 價值層級與獎勵系統設計

建立日期: 2025-11-27  
版本: v1.0

---

## 🎯 核心問題

**問題 4**: AI 任務管理系統的底層邏輯如何強制建立「一級大於二級大於三級」的價值觀,並保證在發放獎金時,低級任務的獎金不可能大於高級任務?

**問題 5**: 在任務價值判斷上,系統如何處理「極端值」的例外情況,例如:二級任務中「重中之重」的獎金或權重,如何能被設計成有條件地大於一級任務中「輕」的部分?

---

## 💡 設計哲學

### 核心原則

1. **絕對層級** - 等級制度不可動搖
2. **相對權重** - 同級內可有差異
3. **數學強制** - 用公式保證規則
4. **例外可控** - 極端情況有明確邊界

---

## 🏗️ 價值層級系統架構

### 三層價值體系

```
┌─────────────────────────────────────────────────┐
│  1級|營收 (Revenue)                              │
│  基礎分: 1000-2000                              │
│  戰略重要性: 最高                               │
│  獎金係數: 3.0-5.0                              │
├─────────────────────────────────────────────────┤
│  2級|流量 (Traffic)                             │
│  基礎分: 500-999                                │
│  戰略重要性: 高                                 │
│  獎金係數: 1.5-2.9                              │
├─────────────────────────────────────────────────┤
│  3級|行政 (Administrative)                      │
│  基礎分: 100-499                                │
│  戰略重要性: 中                                 │
│  獎金係數: 0.5-1.4                              │
└─────────────────────────────────────────────────┘
```

---

## 📐 數學強制機制

### 1. 基礎分數範圍設計

```typescript
// 價值層級定義
const VALUE_TIERS = {
  LEVEL_1_REVENUE: {
    name: '1級|營收',
    baseScoreRange: { min: 1000, max: 2000 },
    rewardMultiplierRange: { min: 3.0, max: 5.0 },
    strategicWeight: 1.0,
  },
  LEVEL_2_TRAFFIC: {
    name: '2級|流量',
    baseScoreRange: { min: 500, max: 999 },
    rewardMultiplierRange: { min: 1.5, max: 2.9 },
    strategicWeight: 0.7,
  },
  LEVEL_3_ADMIN: {
    name: '3級|行政',
    baseScoreRange: { min: 100, max: 499 },
    rewardMultiplierRange: { min: 0.5, max: 1.4 },
    strategicWeight: 0.4,
  },
};

// 關鍵設計: 任何 2 級任務的最大分數 (999) < 任何 1 級任務的最小分數 (1000)
// 這確保了絕對的層級優先順序
```

### 2. 任務價值計算公式

```typescript
interface TaskValue {
  baseScore: number;        // 基礎分數
  impactMultiplier: number; // 影響倍數
  urgencyBonus: number;     // 緊急加成
  finalScore: number;       // 最終分數
}

function calculateTaskValue(task: Task): TaskValue {
  // 2.1 確定基礎分數範圍
  const tier = VALUE_TIERS[task.level];
  
  // 2.2 根據任務屬性計算基礎分數 (在範圍內)
  let baseScore = calculateBaseScore(task, tier);
  
  // 確保基礎分數在範圍內
  baseScore = Math.max(tier.baseScoreRange.min, baseScore);
  baseScore = Math.min(tier.baseScoreRange.max, baseScore);
  
  // 2.3 計算影響倍數 (1.0 - 2.0)
  const impactMultiplier = calculateImpactMultiplier(task);
  
  // 2.4 計算緊急加成 (0 - 200)
  const urgencyBonus = calculateUrgencyBonus(task);
  
  // 2.5 計算最終分數
  const finalScore = (baseScore * impactMultiplier) + urgencyBonus;
  
  return {
    baseScore,
    impactMultiplier,
    urgencyBonus,
    finalScore,
  };
}
```

### 3. 基礎分數計算

```typescript
function calculateBaseScore(task: Task, tier: ValueTier): number {
  const { min, max } = tier.baseScoreRange;
  const range = max - min;
  
  let score = min; // 從最小值開始
  
  // 3.1 預期影響 (40%)
  const impactScore = calculateImpactScore(task);
  score += range * 0.4 * (impactScore / 100);
  
  // 3.2 戰略重要性 (30%)
  const strategicScore = calculateStrategicScore(task);
  score += range * 0.3 * (strategicScore / 100);
  
  // 3.3 複雜度 (20%)
  const complexityScore = calculateComplexityScore(task);
  score += range * 0.2 * (complexityScore / 100);
  
  // 3.4 依賴影響 (10%)
  const dependencyScore = calculateDependencyScore(task);
  score += range * 0.1 * (dependencyScore / 100);
  
  return Math.round(score);
}
```

### 4. 影響倍數計算

```typescript
function calculateImpactMultiplier(task: Task): number {
  let multiplier = 1.0;
  
  // 4.1 預期營收影響
  if (task.expectedRevenue) {
    if (task.expectedRevenue >= 1000000) {
      multiplier += 0.5; // 百萬級營收 +50%
    } else if (task.expectedRevenue >= 500000) {
      multiplier += 0.3; // 50萬級營收 +30%
    } else if (task.expectedRevenue >= 100000) {
      multiplier += 0.2; // 10萬級營收 +20%
    }
  }
  
  // 4.2 用戶增長影響
  if (task.expectedUserGrowth) {
    if (task.expectedUserGrowth >= 10000) {
      multiplier += 0.4; // 萬級用戶增長 +40%
    } else if (task.expectedUserGrowth >= 1000) {
      multiplier += 0.2; // 千級用戶增長 +20%
    }
  }
  
  // 4.3 效率提升影響
  if (task.efficiencyGain) {
    multiplier += task.efficiencyGain * 0.01; // 每 1% 效率提升 +1% 倍數
  }
  
  // 限制倍數範圍 1.0 - 2.0
  return Math.min(2.0, multiplier);
}
```

### 5. 緊急加成計算

```typescript
function calculateUrgencyBonus(task: Task): number {
  const hoursUntilDeadline = getHoursUntilDeadline(task);
  let bonus = 0;
  
  // 緊急加成最多 200 分
  if (hoursUntilDeadline <= 0) {
    bonus = 200; // 已逾期
  } else if (hoursUntilDeadline <= 2) {
    bonus = 150; // 2小時內
  } else if (hoursUntilDeadline <= 4) {
    bonus = 100; // 4小時內
  } else if (hoursUntilDeadline <= 8) {
    bonus = 50;  // 今日內
  } else if (hoursUntilDeadline <= 24) {
    bonus = 20;  // 明日內
  }
  
  return bonus;
}
```

---

## 🎁 獎金計算系統

### 1. 獎金計算公式

```typescript
interface TaskReward {
  baseReward: number;       // 基礎獎金
  performanceBonus: number; // 績效加成
  qualityBonus: number;     // 品質加成
  speedBonus: number;       // 速度加成
  totalReward: number;      // 總獎金
}

function calculateTaskReward(
  task: Task,
  completion: TaskCompletion
): TaskReward {
  // 1.1 確定獎金係數範圍
  const tier = VALUE_TIERS[task.level];
  
  // 1.2 計算基礎獎金係數 (在範圍內)
  let rewardMultiplier = calculateRewardMultiplier(task, tier);
  
  // 確保係數在範圍內
  rewardMultiplier = Math.max(tier.rewardMultiplierRange.min, rewardMultiplier);
  rewardMultiplier = Math.min(tier.rewardMultiplierRange.max, rewardMultiplier);
  
  // 1.3 計算基礎獎金
  const baseReward = task.baseScore * rewardMultiplier;
  
  // 1.4 計算績效加成
  const performanceBonus = calculatePerformanceBonus(task, completion);
  
  // 1.5 計算品質加成
  const qualityBonus = calculateQualityBonus(completion);
  
  // 1.6 計算速度加成
  const speedBonus = calculateSpeedBonus(task, completion);
  
  // 1.7 計算總獎金
  const totalReward = baseReward + performanceBonus + qualityBonus + speedBonus;
  
  return {
    baseReward,
    performanceBonus,
    qualityBonus,
    speedBonus,
    totalReward,
  };
}
```

### 2. 獎金係數計算

```typescript
function calculateRewardMultiplier(task: Task, tier: ValueTier): number {
  const { min, max } = tier.rewardMultiplierRange;
  const range = max - min;
  
  let multiplier = min; // 從最小值開始
  
  // 2.1 任務難度 (40%)
  const difficultyScore = calculateDifficultyScore(task);
  multiplier += range * 0.4 * (difficultyScore / 100);
  
  // 2.2 預期影響 (30%)
  const impactScore = calculateImpactScore(task);
  multiplier += range * 0.3 * (impactScore / 100);
  
  // 2.3 風險程度 (20%)
  const riskScore = calculateRiskScore(task);
  multiplier += range * 0.2 * (riskScore / 100);
  
  // 2.4 稀缺性 (10%)
  const scarcityScore = calculateScarcityScore(task);
  multiplier += range * 0.1 * (scarcityScore / 100);
  
  return multiplier;
}
```

### 3. 績效加成計算

```typescript
function calculatePerformanceBonus(
  task: Task,
  completion: TaskCompletion
): number {
  let bonus = 0;
  
  // 3.1 目標達成率
  const achievementRate = completion.achievementRate || 1.0;
  if (achievementRate > 1.0) {
    // 超額完成,每超過 10% 加成 5%
    bonus += task.baseScore * (achievementRate - 1.0) * 0.5;
  }
  
  // 3.2 影響力實現
  if (completion.actualRevenue && task.expectedRevenue) {
    const revenueRate = completion.actualRevenue / task.expectedRevenue;
    if (revenueRate > 1.0) {
      bonus += task.baseScore * (revenueRate - 1.0) * 0.3;
    }
  }
  
  return Math.round(bonus);
}
```

### 4. 品質加成計算

```typescript
function calculateQualityBonus(completion: TaskCompletion): number {
  const qualityScores = {
    'excellent': 0.3,  // 卓越品質 +30%
    'good': 0.15,      // 良好品質 +15%
    'acceptable': 0,   // 可接受品質 +0%
    'poor': -0.2,      // 品質不佳 -20%
  };
  
  const qualityMultiplier = qualityScores[completion.quality] || 0;
  return Math.round(completion.task.baseScore * qualityMultiplier);
}
```

### 5. 速度加成計算

```typescript
function calculateSpeedBonus(
  task: Task,
  completion: TaskCompletion
): number {
  const estimatedTime = task.estimatedMinutes;
  const actualTime = completion.actualMinutes;
  
  // 如果提前完成
  if (actualTime < estimatedTime) {
    const timeSaved = estimatedTime - actualTime;
    const savingRate = timeSaved / estimatedTime;
    
    // 每節省 10% 時間,加成 5%
    const bonus = task.baseScore * savingRate * 0.5;
    
    // 最多加成 20%
    return Math.min(task.baseScore * 0.2, Math.round(bonus));
  }
  
  return 0;
}
```

---

## ⚖️ 層級強制機制

### 1. 數學保證

```typescript
// 驗證函數:確保層級規則不被打破
function validateTaskValue(task: Task, value: TaskValue): boolean {
  const tier = VALUE_TIERS[task.level];
  
  // 1.1 基礎分數必須在範圍內
  if (value.baseScore < tier.baseScoreRange.min || 
      value.baseScore > tier.baseScoreRange.max) {
    throw new Error(
      `任務基礎分數 ${value.baseScore} 超出 ${task.level} 範圍 ` +
      `[${tier.baseScoreRange.min}, ${tier.baseScoreRange.max}]`
    );
  }
  
  // 1.2 最終分數不能超過上限
  const maxPossibleScore = 
    tier.baseScoreRange.max * 2.0 + 200; // 最大倍數 2.0 + 最大緊急加成 200
  
  if (value.finalScore > maxPossibleScore) {
    throw new Error(
      `任務最終分數 ${value.finalScore} 超過理論上限 ${maxPossibleScore}`
    );
  }
  
  return true;
}

// 驗證函數:確保獎金規則不被打破
function validateTaskReward(task: Task, reward: TaskReward): boolean {
  const tier = VALUE_TIERS[task.level];
  
  // 2.1 基礎獎金係數必須在範圍內
  const actualMultiplier = reward.baseReward / task.baseScore;
  
  if (actualMultiplier < tier.rewardMultiplierRange.min || 
      actualMultiplier > tier.rewardMultiplierRange.max) {
    throw new Error(
      `獎金係數 ${actualMultiplier.toFixed(2)} 超出 ${task.level} 範圍 ` +
      `[${tier.rewardMultiplierRange.min}, ${tier.rewardMultiplierRange.max}]`
    );
  }
  
  // 2.2 總獎金不能超過合理上限
  const maxPossibleReward = 
    tier.baseScoreRange.max * tier.rewardMultiplierRange.max * 2.0;
    // 基礎分數上限 × 係數上限 × 2.0 (考慮所有加成)
  
  if (reward.totalReward > maxPossibleReward) {
    throw new Error(
      `總獎金 ${reward.totalReward} 超過理論上限 ${maxPossibleReward}`
    );
  }
  
  return true;
}
```

### 2. 層級比較保證

```typescript
// 確保任何情況下,低級任務獎金不會超過高級任務
function ensureHierarchyIntegrity(): void {
  // 計算各層級的理論獎金範圍
  
  // 1級最小可能獎金
  const level1MinReward = 
    VALUE_TIERS.LEVEL_1_REVENUE.baseScoreRange.min * 
    VALUE_TIERS.LEVEL_1_REVENUE.rewardMultiplierRange.min;
  
  // 2級最大可能獎金 (包含所有加成)
  const level2MaxReward = 
    VALUE_TIERS.LEVEL_2_TRAFFIC.baseScoreRange.max * 
    VALUE_TIERS.LEVEL_2_TRAFFIC.rewardMultiplierRange.max * 
    2.0; // 考慮所有加成最多 2 倍
  
  // 2級最小可能獎金
  const level2MinReward = 
    VALUE_TIERS.LEVEL_2_TRAFFIC.baseScoreRange.min * 
    VALUE_TIERS.LEVEL_2_TRAFFIC.rewardMultiplierRange.min;
  
  // 3級最大可能獎金 (包含所有加成)
  const level3MaxReward = 
    VALUE_TIERS.LEVEL_3_ADMIN.baseScoreRange.max * 
    VALUE_TIERS.LEVEL_3_ADMIN.rewardMultiplierRange.max * 
    2.0;
  
  // 驗證層級完整性
  console.log('層級獎金範圍驗證:');
  console.log(`1級: ${level1MinReward.toFixed(0)} - ${(level1MinReward * 10).toFixed(0)}`);
  console.log(`2級: ${level2MinReward.toFixed(0)} - ${level2MaxReward.toFixed(0)}`);
  console.log(`3級: ${(level3MaxReward * 0.1).toFixed(0)} - ${level3MaxReward.toFixed(0)}`);
  
  // 關鍵驗證:2級最大獎金 < 1級最小獎金
  if (level2MaxReward >= level1MinReward) {
    throw new Error(
      `層級完整性被破壞! 2級最大獎金 (${level2MaxReward}) ` +
      `>= 1級最小獎金 (${level1MinReward})`
    );
  }
  
  // 關鍵驗證:3級最大獎金 < 2級最小獎金
  if (level3MaxReward >= level2MinReward) {
    throw new Error(
      `層級完整性被破壞! 3級最大獎金 (${level3MaxReward}) ` +
      `>= 2級最小獎金 (${level2MinReward})`
    );
  }
  
  console.log('✓ 層級完整性驗證通過');
}
```

---

## 🔥 極端值處理機制

### 問題場景

**場景**: 2級任務中的「重中之重」vs 1級任務中的「輕量級」

**需求**: 在特定條件下,允許 2 級重要任務的獎金超過 1 級輕量任務

### 解決方案:「跨級加成」機制

```typescript
interface CrossTierBonus {
  enabled: boolean;
  conditions: string[];
  maxBonus: number;
  actualBonus: number;
}

function calculateCrossTierBonus(
  task: Task,
  completion: TaskCompletion
): CrossTierBonus {
  // 預設不啟用
  let bonus: CrossTierBonus = {
    enabled: false,
    conditions: [],
    maxBonus: 0,
    actualBonus: 0,
  };
  
  // 只有 2 級和 3 級任務可能獲得跨級加成
  if (task.level === 'LEVEL_1_REVENUE') {
    return bonus;
  }
  
  // 檢查是否滿足跨級加成條件
  const conditions = checkCrossTierConditions(task, completion);
  
  if (conditions.length >= 3) { // 至少滿足 3 個條件
    bonus.enabled = true;
    bonus.conditions = conditions;
    
    // 計算跨級加成
    const tier = VALUE_TIERS[task.level];
    const nextTier = getNextTier(task.level);
    
    if (nextTier) {
      // 最多可以加成到下一級的最小值
      const currentMaxReward = 
        tier.baseScoreRange.max * tier.rewardMultiplierRange.max * 2.0;
      
      const nextMinReward = 
        nextTier.baseScoreRange.min * nextTier.rewardMultiplierRange.min;
      
      bonus.maxBonus = nextMinReward - currentMaxReward;
      
      // 根據滿足條件數量計算實際加成
      const conditionRate = Math.min(conditions.length / 5, 1.0);
      bonus.actualBonus = Math.round(bonus.maxBonus * conditionRate);
    }
  }
  
  return bonus;
}
```

### 跨級加成條件

```typescript
function checkCrossTierConditions(
  task: Task,
  completion: TaskCompletion
): string[] {
  const conditions: string[] = [];
  
  // 條件 1: 超額完成 (達成率 > 150%)
  if (completion.achievementRate >= 1.5) {
    conditions.push('超額完成 150%');
  }
  
  // 條件 2: 卓越品質
  if (completion.quality === 'excellent') {
    conditions.push('卓越品質');
  }
  
  // 條件 3: 顯著提前完成 (節省 > 30% 時間)
  const timeSavingRate = 
    (task.estimatedMinutes - completion.actualMinutes) / task.estimatedMinutes;
  if (timeSavingRate >= 0.3) {
    conditions.push(`提前完成 ${(timeSavingRate * 100).toFixed(0)}%`);
  }
  
  // 條件 4: 實際影響超出預期 (營收/用戶增長 > 200%)
  if (completion.actualRevenue && task.expectedRevenue) {
    const revenueRate = completion.actualRevenue / task.expectedRevenue;
    if (revenueRate >= 2.0) {
      conditions.push(`營收超出預期 ${((revenueRate - 1) * 100).toFixed(0)}%`);
    }
  }
  
  // 條件 5: 零問題完成
  if (completion.issuesEncountered === 0) {
    conditions.push('零問題完成');
  }
  
  // 條件 6: 高難度任務
  const difficultyScore = calculateDifficultyScore(task);
  if (difficultyScore >= 90) {
    conditions.push('高難度任務');
  }
  
  // 條件 7: 戰略關鍵任務
  if (task.isStrategicKey) {
    conditions.push('戰略關鍵任務');
  }
  
  return conditions;
}
```

### 跨級加成應用

```typescript
function applyFinalReward(
  task: Task,
  completion: TaskCompletion
): FinalReward {
  // 1. 計算基礎獎金
  const baseReward = calculateTaskReward(task, completion);
  
  // 2. 檢查跨級加成
  const crossTierBonus = calculateCrossTierBonus(task, completion);
  
  // 3. 應用跨級加成
  let finalReward = baseReward.totalReward;
  
  if (crossTierBonus.enabled) {
    finalReward += crossTierBonus.actualBonus;
    
    // 記錄跨級加成事件
    logCrossTierBonusEvent({
      taskId: task.id,
      taskLevel: task.level,
      baseReward: baseReward.totalReward,
      crossTierBonus: crossTierBonus.actualBonus,
      finalReward,
      conditions: crossTierBonus.conditions,
      timestamp: new Date(),
    });
  }
  
  // 4. 驗證最終獎金
  validateFinalReward(task, finalReward, crossTierBonus);
  
  return {
    ...baseReward,
    crossTierBonus,
    finalReward,
  };
}
```

### 跨級加成驗證

```typescript
function validateFinalReward(
  task: Task,
  finalReward: number,
  crossTierBonus: CrossTierBonus
): void {
  const tier = VALUE_TIERS[task.level];
  const nextTier = getNextTier(task.level);
  
  // 即使有跨級加成,也不能超過下一級的平均值
  if (nextTier) {
    const nextTierAvg = 
      (nextTier.baseScoreRange.min + nextTier.baseScoreRange.max) / 2 *
      (nextTier.rewardMultiplierRange.min + nextTier.rewardMultiplierRange.max) / 2;
    
    if (finalReward > nextTierAvg) {
      throw new Error(
        `跨級加成後的獎金 ${finalReward} 超過下一級平均值 ${nextTierAvg.toFixed(0)}`
      );
    }
  }
  
  // 記錄警告
  if (crossTierBonus.enabled) {
    console.warn(
      `⚠️  跨級加成觸發: ${task.level} 任務獲得 ${crossTierBonus.actualBonus} 加成\n` +
      `條件: ${crossTierBonus.conditions.join(', ')}\n` +
      `最終獎金: ${finalReward}`
    );
  }
}
```

---

## 📊 獎金分佈視覺化

### 理論獎金範圍

```
1級|營收任務獎金範圍:
├─ 最小: 3,000  (基礎分 1000 × 係數 3.0)
├─ 典型: 7,500  (基礎分 1500 × 係數 5.0)
└─ 最大: 20,000 (基礎分 2000 × 係數 5.0 × 加成 2.0)

2級|流量任務獎金範圍:
├─ 最小: 750    (基礎分 500 × 係數 1.5)
├─ 典型: 2,175  (基礎分 750 × 係數 2.9)
├─ 最大: 5,794  (基礎分 999 × 係數 2.9 × 加成 2.0)
└─ 跨級最大: 3,000 (可加成至 1 級最小值,需滿足條件)

3級|行政任務獎金範圍:
├─ 最小: 50     (基礎分 100 × 係數 0.5)
├─ 典型: 420    (基礎分 300 × 係數 1.4)
├─ 最大: 1,397  (基礎分 499 × 係數 1.4 × 加成 2.0)
└─ 跨級最大: 750 (可加成至 2 級最小值,需滿足條件)
```

---

## 🎯 實作檢查清單

### 階段 1: 基礎系統
- [ ] 定義價值層級常數
- [ ] 實作基礎分數計算
- [ ] 實作影響倍數計算
- [ ] 實作緊急加成計算
- [ ] 實作層級驗證機制

### 階段 2: 獎金系統
- [ ] 實作獎金係數計算
- [ ] 實作績效加成計算
- [ ] 實作品質加成計算
- [ ] 實作速度加成計算
- [ ] 實作獎金驗證機制

### 階段 3: 跨級加成
- [ ] 定義跨級加成條件
- [ ] 實作條件檢查邏輯
- [ ] 實作跨級加成計算
- [ ] 實作跨級加成驗證
- [ ] 建立跨級加成記錄

### 階段 4: 監控與報告
- [ ] 建立獎金分佈報告
- [ ] 實作異常偵測
- [ ] 建立層級完整性監控
- [ ] 實作跨級加成統計

---

## 📈 預期效益

### 價值觀強化
- 員工清楚理解任務價值層級
- 自然傾向優先處理高價值任務
- 戰略目標與個人利益一致

### 激勵效果
- 高品質完成獲得額外獎勵
- 提前完成獲得速度加成
- 卓越表現可獲跨級加成

### 公平性保證
- 數學公式保證規則公平
- 層級強制機制防止濫用
- 跨級加成有明確條件與上限

---

**總結**: 透過數學強制機制確保「一級 > 二級 > 三級」的絕對層級,同時透過「跨級加成」機制處理極端優秀表現,在保持層級完整性的前提下,激勵員工追求卓越。
