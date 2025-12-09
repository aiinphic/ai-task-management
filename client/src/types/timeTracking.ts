/**
 * 時間追蹤系統 - 資料類型定義
 */

/**
 * 任務時間記錄
 */
export interface TaskTimeLog {
  id: string;
  taskId: string;
  subtaskId?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 分鐘
  status: 'pending' | 'in-progress' | 'paused' | 'completed';
  createdAt: Date;
}

/**
 * 時間統計 - 按分級
 */
export interface TimeStatsByPriority {
  level: 'revenue' | 'traffic' | 'admin';
  label: string; // "一級|營收", "二級|流量", "三級|行政"
  totalMinutes: number;
  totalHours: number;
  percentage: number;
  color: string; // 圖表顏色
}

/**
 * 時間統計 - 按部門
 */
export interface TimeStatsByDepartment {
  departmentId: string;
  departmentName: string;
  totalMinutes: number;
  totalHours: number;
  byPriority: {
    revenue: number;
    traffic: number;
    admin: number;
  };
}

/**
 * 時間統計 - 按使用者
 */
export interface TimeStatsByUser {
  userId: string;
  userName: string;
  totalMinutes: number;
  totalHours: number;
  taskCount: number;
}

/**
 * 時間統計 - 每日分布
 */
export interface DailyTimeDistribution {
  date: string; // YYYY-MM-DD
  revenue: number; // 分鐘
  traffic: number;
  admin: number;
  total: number;
}

/**
 * 時間統計 - 每週分布
 */
export interface WeeklyTimeDistribution {
  week: string; // YYYY-Www (例如: 2025-W48)
  revenue: number;
  traffic: number;
  admin: number;
  total: number;
}

/**
 * 時間統計 - 每月分布
 */
export interface MonthlyTimeDistribution {
  month: string; // YYYY-MM
  revenue: number;
  traffic: number;
  admin: number;
  total: number;
}

/**
 * 時間軸事件 (用於個人每日工作時間軸)
 */
export interface TimelineEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  priority: 'revenue' | 'traffic' | 'admin';
  startTime: Date;
  endTime: Date;
  duration: number; // 分鐘
  color: string;
}

/**
 * 整體時間統計摘要
 */
export interface TimeStatsSummary {
  totalMinutes: number;
  totalHours: number;
  taskCount: number;
  completedTaskCount: number;
  byPriority: TimeStatsByPriority[];
  byDepartment: TimeStatsByDepartment[];
  byUser: TimeStatsByUser[];
}
