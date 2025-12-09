/**
 * 績效評級系統
 * 用於計算每日工作表現評分並分析不良原因
 */

import { DailyTimeLog, TimeSession } from './timeTracking';

/**
 * 評級等級（簡化為 3 個等級）
 */
export type RatingLevel = 'S' | 'B' | 'C';

/**
 * 評級資訊
 */
export interface RatingInfo {
  level: RatingLevel;
  score: number;
  color: string;
  label: string;
  icon: string;
}

/**
 * 評分詳細資訊
 */
export interface ScoreDetails {
  total: number;
  level1Percentage: number; // 1級任務時間佔比
  level2Percentage: number; // 2級任務時間佔比
  level3Percentage: number; // 3級任務時間佔比
  dailyPercentage: number; // 日常任務時間佔比
}

/**
 * 不良原因
 */
export interface PoorReason {
  type: 'level1_low' | 'level2_high' | 'level3_high' | 'daily_high';
  label: string;
  description: string;
  value: string;
}

/**
 * 每日績效評級
 */
export interface DailyPerformance {
  date: string;
  rating: RatingInfo;
  scoreDetails: ScoreDetails;
  poorReasons: PoorReason[];
  suggestion: string; // 建議文字
}

/**
 * 根據分數判定評級等級（3 個等級）
 */
export function getRatingLevel(score: number): RatingInfo {
  if (score >= 70) {
    return {
      level: 'S',
      score,
      color: 'from-yellow-400 to-amber-500',
      label: '優秀',
      icon: '🏆',
    };
  } else if (score >= 50) {
    return {
      level: 'B',
      score,
      color: 'from-blue-400 to-cyan-500',
      label: '普通',
      icon: '⭕',
    };
  } else {
    return {
      level: 'C',
      score,
      color: 'from-orange-400 to-amber-600',
      label: '待改進',
      icon: '⚠️',
    };
  }
}

/**
 * 計算每日評分
 * 新邏輯：總分 = 1級佔比 × 100 + 2級佔比 × 60 + 3級佔比 × 30 + 日常佔比 × 10
 * @param log 每日時間記錄
 * @returns 評分詳細資訊
 */
export function calculateDailyScore(log: DailyTimeLog): ScoreDetails {
  const { sessions, usedMinutes } = log;

  // 如果沒有任何記錄,返回0分
  if (sessions.length === 0 || usedMinutes === 0) {
    return {
      total: 0,
      level1Percentage: 0,
      level2Percentage: 0,
      level3Percentage: 0,
      dailyPercentage: 0,
    };
  }

  // 計算各級任務的時間
  const level1Minutes = sessions
    .filter((s) => s.taskLevel === 1)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const level2Minutes = sessions
    .filter((s) => s.taskLevel === 2)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const level3Minutes = sessions
    .filter((s) => s.taskLevel === 3)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const dailyMinutes = sessions
    .filter((s) => s.taskLevel === 4)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  // 計算佔比
  const level1Percentage = (level1Minutes / usedMinutes) * 100;
  const level2Percentage = (level2Minutes / usedMinutes) * 100;
  const level3Percentage = (level3Minutes / usedMinutes) * 100;
  const dailyPercentage = (dailyMinutes / usedMinutes) * 100;

  // 計算總分：1級 × 100 + 2級 × 60 + 3級 × 30 + 日常 × 10
  const total = Math.round(
    (level1Percentage / 100) * 100 +
    (level2Percentage / 100) * 60 +
    (level3Percentage / 100) * 30 +
    (dailyPercentage / 100) * 10
  );

  return {
    total,
    level1Percentage: Math.round(level1Percentage),
    level2Percentage: Math.round(level2Percentage),
    level3Percentage: Math.round(level3Percentage),
    dailyPercentage: Math.round(dailyPercentage),
  };
}

/**
 * 生成建議文字
 * @param scoreDetails 評分詳細資訊
 * @param rating 評級資訊
 * @returns 建議文字
 */
export function generateSuggestion(
  scoreDetails: ScoreDetails,
  rating: RatingInfo
): string {
  const { level1Percentage, level2Percentage, level3Percentage, dailyPercentage } = scoreDetails;

  // 優秀 (≥70分)
  if (rating.level === 'S') {
    if (level1Percentage >= 80) {
      return '繼續保持高比例的1級任務投入，這是最有價值的工作方式！';
    } else if (level1Percentage >= 60) {
      return '工作分配優秀！建議持續維持1級任務的高投入比例。';
    } else {
      return '表現良好！可以嘗試進一步提升1級任務的時間佔比。';
    }
  }

  // 普通 (50-69分)
  if (rating.level === 'B') {
    if (level1Percentage < 40) {
      return '建議增加1級任務時間投入，減少低價值任務的時間分配。';
    } else if (level2Percentage > 40) {
      return '2級任務佔比較高，建議優先處理1級任務以提升整體價值。';
    } else {
      return '工作分配尚可，建議調整任務優先順序，增加1級任務比例。';
    }
  }

  // 待改進 (<50分)
  if (level1Percentage < 30) {
    return '1級任務時間嚴重不足！建議大幅調整工作優先順序，專注於高價值任務。';
  } else if (dailyPercentage > 40) {
    return '日常任務佔比過高！建議減少例行性工作，增加1級任務投入。';
  } else {
    return '工作分配需要改進，建議重新規劃任務優先順序，聚焦於1級任務。';
  }
}

/**
 * 分析不良原因
 * @param log 每日時間記錄
 * @param scoreDetails 評分詳細資訊
 * @returns 不良原因列表
 */
export function analyzePoorReasons(
  log: DailyTimeLog,
  scoreDetails: ScoreDetails
): PoorReason[] {
  const reasons: PoorReason[] = [];
  const { level1Percentage, level2Percentage, level3Percentage, dailyPercentage } = scoreDetails;

  // 1. 1級任務時間佔比過低 (<40%)
  if (level1Percentage < 40) {
    reasons.push({
      type: 'level1_low',
      label: '1級任務時間不足',
      description: '1級任務時間佔比過低，建議提升至60%以上',
      value: `${level1Percentage}%`,
    });
  }

  // 2. 2級任務佔比過高 (>40%)
  if (level2Percentage > 40) {
    reasons.push({
      type: 'level2_high',
      label: '2級任務佔比過高',
      description: '2級任務時間過多，建議優先處理1級任務',
      value: `${level2Percentage}%`,
    });
  }

  // 3. 3級任務佔比過高 (>30%)
  if (level3Percentage > 30) {
    reasons.push({
      type: 'level3_high',
      label: '3級任務佔比過高',
      description: '3級任務時間過多，建議減少行政事務',
      value: `${level3Percentage}%`,
    });
  }

  // 4. 日常任務佔比過高 (>30%)
  if (dailyPercentage > 30) {
    reasons.push({
      type: 'daily_high',
      label: '日常任務佔比過高',
      description: '日常例行性任務時間過多，建議減少並聚焦高價值工作',
      value: `${dailyPercentage}%`,
    });
  }

  return reasons;
}

/**
 * 計算每日績效評級
 * @param log 每日時間記錄
 * @returns 每日績效評級
 */
export function calculateDailyPerformance(log: DailyTimeLog): DailyPerformance {
  const scoreDetails = calculateDailyScore(log);
  const rating = getRatingLevel(scoreDetails.total);
  const poorReasons = analyzePoorReasons(log, scoreDetails);
  const suggestion = generateSuggestion(scoreDetails, rating);

  return {
    date: log.date,
    rating,
    scoreDetails,
    poorReasons,
    suggestion,
  };
}

/**
 * 取得評級顏色類別
 */
export function getRatingColorClass(level: RatingLevel): string {
  switch (level) {
    case 'S':
      return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    case 'B':
      return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
    case 'C':
      return 'bg-gradient-to-r from-orange-400 to-amber-600 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
}

/**
 * 取得評級邊框顏色類別
 */
export function getRatingBorderClass(level: RatingLevel): string {
  switch (level) {
    case 'S':
      return 'border-yellow-400';
    case 'B':
      return 'border-blue-400';
    case 'C':
      return 'border-orange-400';
    default:
      return 'border-gray-400';
  }
}
