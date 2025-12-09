/**
 * 時間統計工具函數
 */

import type { Task } from '@/types/task';
import type {
  TaskTimeLog,
  TimeStatsByPriority,
  TimeStatsByDepartment,
  DailyTimeDistribution,
  WeeklyTimeDistribution,
  MonthlyTimeDistribution,
  TimeStatsSummary,
} from '@/types/timeTracking';

/**
 * 計算任務的總投入時間(分鐘)
 */
export function calculateTaskDuration(task: Task): number {
  if (!task.subtasks) return 0;
  
  return task.subtasks.reduce((total, subtask) => {
    if (subtask.status === 'completed' && subtask.startTime && subtask.endTime) {
      const duration = Math.floor(
        (new Date(subtask.endTime).getTime() - new Date(subtask.startTime).getTime()) / 60000
      );
      return total + duration;
    }
    return total;
  }, 0);
}

/**
 * 計算按分級的時間統計
 */
export function calculateTimeByPriority(tasks: Task[]): TimeStatsByPriority[] {
  const stats = {
    revenue: { totalMinutes: 0, count: 0 },
    traffic: { totalMinutes: 0, count: 0 },
    admin: { totalMinutes: 0, count: 0 },
  };

  tasks.forEach((task) => {
    const duration = calculateTaskDuration(task);
    const priority = task.priority as 'revenue' | 'traffic' | 'admin';
    if (stats[priority]) {
      stats[priority].totalMinutes += duration;
      stats[priority].count++;
    }
  });

  const totalMinutes = stats.revenue.totalMinutes + stats.traffic.totalMinutes + stats.admin.totalMinutes;

  return [
    {
      level: 'revenue',
      label: '一級|營收',
      totalMinutes: stats.revenue.totalMinutes,
      totalHours: Math.round((stats.revenue.totalMinutes / 60) * 10) / 10,
      percentage: totalMinutes > 0 ? Math.round((stats.revenue.totalMinutes / totalMinutes) * 100) : 0,
      color: '#F59E0B', // 金色
    },
    {
      level: 'traffic',
      label: '二級|流量',
      totalMinutes: stats.traffic.totalMinutes,
      totalHours: Math.round((stats.traffic.totalMinutes / 60) * 10) / 10,
      percentage: totalMinutes > 0 ? Math.round((stats.traffic.totalMinutes / totalMinutes) * 100) : 0,
      color: '#3B82F6', // 藍色
    },
    {
      level: 'admin',
      label: '三級|行政',
      totalMinutes: stats.admin.totalMinutes,
      totalHours: Math.round((stats.admin.totalMinutes / 60) * 10) / 10,
      percentage: totalMinutes > 0 ? Math.round((stats.admin.totalMinutes / totalMinutes) * 100) : 0,
      color: '#6B7280', // 灰色
    },
  ];
}

/**
 * 計算按部門的時間統計
 */
export function calculateTimeByDepartment(tasks: Task[]): TimeStatsByDepartment[] {
  const deptStats: Record<string, TimeStatsByDepartment> = {};

  tasks.forEach((task) => {
    const duration = calculateTaskDuration(task);
    const deptId = task.assignee?.department || 'unknown';
    const deptName = task.assignee?.department || '未分配';

    if (!deptStats[deptId]) {
      deptStats[deptId] = {
        departmentId: deptId,
        departmentName: deptName,
        totalMinutes: 0,
        totalHours: 0,
        byPriority: {
          revenue: 0,
          traffic: 0,
          admin: 0,
        },
      };
    }

    deptStats[deptId].totalMinutes += duration;
    const priority = task.priority as 'revenue' | 'traffic' | 'admin';
    if (deptStats[deptId].byPriority[priority] !== undefined) {
      deptStats[deptId].byPriority[priority] += duration;
    }
  });

  return Object.values(deptStats).map((dept) => ({
    ...dept,
    totalHours: Math.round((dept.totalMinutes / 60) * 10) / 10,
  }));
}

/**
 * 計算每日時間分布
 */
export function calculateDailyTimeDistribution(tasks: Task[], days: number = 7): DailyTimeDistribution[] {
  const distribution: Record<string, DailyTimeDistribution> = {};

  // 初始化最近N天的數據
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    distribution[dateStr] = {
      date: dateStr,
      revenue: 0,
      traffic: 0,
      admin: 0,
      total: 0,
    };
  }

  // 統計每天的時間分布
  tasks.forEach((task) => {
    if (!task.subtasks) return;

    task.subtasks.forEach((subtask) => {
      if (subtask.status === 'completed' && subtask.startTime && subtask.endTime) {
        const dateStr = new Date(subtask.startTime).toISOString().split('T')[0];
        if (distribution[dateStr]) {
          const duration = Math.floor(
            (new Date(subtask.endTime).getTime() - new Date(subtask.startTime).getTime()) / 60000
          );
          const priority = task.priority as 'revenue' | 'traffic' | 'admin';
          if (distribution[dateStr][priority] !== undefined) {
            distribution[dateStr][priority] += duration;
            distribution[dateStr].total += duration;
          }
        }
      }
    });
  });

  return Object.values(distribution).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 格式化時間(分鐘 → 小時分鐘)
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * 格式化時間(僅小時,保留一位小數)
 */
export function formatHours(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}h`;
}

/**
 * 計算整體時間統計摘要
 */
export function calculateTimeStatsSummary(tasks: Task[]): TimeStatsSummary {
  const totalMinutes = tasks.reduce((total, task) => total + calculateTaskDuration(task), 0);
  const completedTaskCount = tasks.filter((task) => task.status === 'completed').length;

  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    taskCount: tasks.length,
    completedTaskCount,
    byPriority: calculateTimeByPriority(tasks),
    byDepartment: calculateTimeByDepartment(tasks),
    byUser: [], // TODO: 實作按使用者統計
  };
}
