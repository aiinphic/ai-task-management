/**
 * 任務操作記錄類型定義
 * 用於追蹤任務和子任務的所有操作(開始/暫停/繼續/完成)
 */

export type ActionType = 'start' | 'pause' | 'resume' | 'complete';

export interface TaskActionLog {
  id: string;
  timestamp: Date;
  action: ActionType;
  subtaskId?: string; // 如果是子任務操作,記錄子任務 ID
  note?: string; // 可選的備註
}

export interface TimeSegment {
  startTime: Date;
  endTime?: Date;
  duration: number; // 持續時間(毫秒)
}

/**
 * 計算實際投入時間(扣除暫停時間)
 */
export function calculateActualTime(logs: TaskActionLog[]): number {
  let totalTime = 0;
  let currentStartTime: Date | null = null;

  for (const log of logs) {
    if (log.action === 'start' || log.action === 'resume') {
      currentStartTime = log.timestamp;
    } else if (log.action === 'pause' || log.action === 'complete') {
      if (currentStartTime) {
        const duration = log.timestamp.getTime() - currentStartTime.getTime();
        totalTime += duration;
        currentStartTime = null;
      }
    }
  }

  return totalTime;
}

/**
 * 計算暫停次數
 */
export function calculatePauseCount(logs: TaskActionLog[]): number {
  return logs.filter(log => log.action === 'pause').length;
}

/**
 * 獲取時間區間列表
 */
export function getTimeSegments(logs: TaskActionLog[]): TimeSegment[] {
  const segments: TimeSegment[] = [];
  let currentStartTime: Date | null = null;

  for (const log of logs) {
    if (log.action === 'start' || log.action === 'resume') {
      currentStartTime = log.timestamp;
    } else if (log.action === 'pause' || log.action === 'complete') {
      if (currentStartTime) {
        const duration = log.timestamp.getTime() - currentStartTime.getTime();
        segments.push({
          startTime: currentStartTime,
          endTime: log.timestamp,
          duration,
        });
        currentStartTime = null;
      }
    }
  }

  return segments;
}

/**
 * 格式化時間(毫秒 → 小時:分鐘)
 */
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
