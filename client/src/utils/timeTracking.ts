/**
 * 時間追蹤工具
 * 用於管理每日8小時工作時間的追蹤與記錄
 */

export interface TimeSession {
  taskId: string;
  taskTitle: string;
  taskLevel: number; // 1-5級: 1=1級營收, 2=2級流量, 3=3級行政, 4=日常, 5=無(未分類)
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  durationMinutes: number;
  isManualEnd: boolean; // true=手動結束, false=自動結束
}

export interface DailyTimeLog {
  date: string; // YYYY-MM-DD
  totalMinutes: number; // 總工作時間(預設480分鐘=8小時)
  usedMinutes: number; // 已使用時間
  remainingMinutes: number; // 剩餘時間
  sessions: TimeSession[]; // 時間記錄
  autoEndedAt?: string; // 自動結束時間(6:30 PM)
  isEnded: boolean; // 是否已結束當日記錄
}

/**
 * 取得今日日期字串 (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * 檢查是否已過下班時間 (6:30 PM)
 */
export function isPastEndTime(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // 18:30 = 6:30 PM
  return hours > 18 || (hours === 18 && minutes >= 30);
}

/**
 * 從 localStorage 讀取今日時間記錄
 */
export function getTodayTimeLog(): DailyTimeLog {
  const todayDate = getTodayDateString();
  const storageKey = `timeLog_${todayDate}`;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // 建立新的今日記錄
  return {
    date: todayDate,
    totalMinutes: 480, // 8小時
    usedMinutes: 0,
    remainingMinutes: 480,
    sessions: [],
    isEnded: false,
  };
}

/**
 * 儲存今日時間記錄到 localStorage
 */
export function saveTodayTimeLog(log: DailyTimeLog): void {
  const storageKey = `timeLog_${log.date}`;
  localStorage.setItem(storageKey, JSON.stringify(log));
}

/**
 * 開始新的時間記錄
 * @returns 如果成功開始,返回新的 session;如果已過下班時間或已結束,返回 null
 */
export function startTimeSession(taskId: string, taskTitle: string, taskLevel: number): TimeSession | null {
  const log = getTodayTimeLog();
  
  // 檢查是否已過下班時間
  if (isPastEndTime()) {
    return null;
  }
  
  // 檢查是否已結束當日記錄
  if (log.isEnded) {
    return null;
  }
  
  // 建立新的 session
  const session: TimeSession = {
    taskId,
    taskTitle,
    taskLevel,
    startTime: new Date().toISOString(),
    endTime: '', // 尚未結束
    durationMinutes: 0,
    isManualEnd: false,
  };
  
  return session;
}

/**
 * 計算工作時長(自動扣除午休時間 12:00-13:30)
 * @param startTime 開始時間
 * @param endTime 結束時間
 * @returns 實際工作時長(分鐘)
 */
function calculateWorkDuration(startTime: Date, endTime: Date): number {
  // 午休時間：12:00-13:30
  const lunchStart = new Date(startTime);
  lunchStart.setHours(12, 0, 0, 0);
  
  const lunchEnd = new Date(startTime);
  lunchEnd.setHours(13, 30, 0, 0);
  
  // 情境 1：跨午休時間(開始時間在午休前，結束時間在午休後)
  if (startTime < lunchStart && endTime > lunchEnd) {
    const beforeLunch = (lunchStart.getTime() - startTime.getTime()) / 60000;
    const afterLunch = (endTime.getTime() - lunchEnd.getTime()) / 60000;
    return Math.round(beforeLunch + afterLunch);
  }
  
  // 情境 2：在午休時間內開始(防呆處理，強制從 13:30 開始計算)
  if (startTime >= lunchStart && startTime < lunchEnd) {
    startTime = new Date(lunchEnd);
  }
  
  // 情境 3：在午休時間內結束(防呆處理，強制到 12:00 結束)
  if (endTime > lunchStart && endTime <= lunchEnd) {
    endTime = new Date(lunchStart);
  }
  
  // 正常計算工作時長
  const durationMs = endTime.getTime() - startTime.getTime();
  return Math.max(0, Math.round(durationMs / 60000));
}

/**
 * 結束時間記錄
 * @param session 要結束的 session
 * @param isManual 是否為手動結束(true=手動, false=自動)
 * @returns 更新後的 session
 */
export function endTimeSession(session: TimeSession, isManual: boolean = true): TimeSession {
  const endTime = new Date();
  const startTime = new Date(session.startTime);
  
  // 使用新的計算邏輯(自動扣除午休時間)
  const durationMinutes = calculateWorkDuration(startTime, endTime);
  
  const updatedSession: TimeSession = {
    ...session,
    endTime: endTime.toISOString(),
    durationMinutes,
    isManualEnd: isManual,
  };
  
  // 更新今日時間記錄
  const log = getTodayTimeLog();
  log.sessions.push(updatedSession);
  log.usedMinutes += durationMinutes;
  log.remainingMinutes = Math.max(0, log.totalMinutes - log.usedMinutes);
  
  // 如果是自動結束(6:30 PM),標記為已結束
  if (!isManual) {
    log.isEnded = true;
    log.autoEndedAt = endTime.toISOString();
  }
  
  saveTodayTimeLog(log);
  
  return updatedSession;
}

/**
 * 自動結束當日記錄(6:30 PM)
 * @param currentSession 當前正在執行的 session(如果有)
 */
export function autoEndDailyLog(currentSession?: TimeSession): void {
  const log = getTodayTimeLog();
  
  // 如果已經結束,不重複處理
  if (log.isEnded) {
    return;
  }
  
  // 如果有正在執行的 session,先結束它
  if (currentSession && !currentSession.endTime) {
    endTimeSession(currentSession, false);
  }
  
  // 標記為已結束
  log.isEnded = true;
  log.autoEndedAt = new Date().toISOString();
  saveTodayTimeLog(log);
}

/**
 * 格式化分鐘為時間字串 (例如: 125 → "2h 5m")
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * 格式化分鐘為小時字串 (例如: 125 → "2.1h")
 */
export function formatMinutesToHours(minutes: number): string {
  const hours = (minutes / 60).toFixed(1);
  return `${hours}h`;
}

/**
 * 取得今日各分級的時間佔比
 */
export function getTodayLevelStats(): { level: number; minutes: number; percentage: number }[] {
  const log = getTodayTimeLog();
  
  // 統計各分級的時間
  const levelMinutes: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  
  log.sessions.forEach((session) => {
    const level = session.taskLevel;
    if (level >= 1 && level <= 4) {
      levelMinutes[level] += session.durationMinutes;
    }
  });
  
  // 計算百分比
  const totalUsed = log.usedMinutes || 1; // 避免除以0
  
  return [
    { level: 1, minutes: levelMinutes[1], percentage: Math.round((levelMinutes[1] / totalUsed) * 100) },
    { level: 2, minutes: levelMinutes[2], percentage: Math.round((levelMinutes[2] / totalUsed) * 100) },
    { level: 3, minutes: levelMinutes[3], percentage: Math.round((levelMinutes[3] / totalUsed) * 100) },
    { level: 4, minutes: levelMinutes[4], percentage: Math.round((levelMinutes[4] / totalUsed) * 100) },
  ];
}
