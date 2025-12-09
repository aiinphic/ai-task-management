import { Task } from '@/types/task';

/**
 * AI 優先處理清單的分類類型
 */
export type PriorityCategory = 
  | 'URGENT'           // 🔥 立即處理（主管今天會問）
  | 'TODAY'            // ⚡ 今日建議完成（有時間壓力）
  | 'THIS_WEEK'        // 📅 本週安排（重要但不緊急）
  | 'POSTPONABLE';     // 💡 可延後處理（例行性工作）

/**
 * 分類配置
 */
export const PRIORITY_CATEGORIES = {
  URGENT: {
    key: 'URGENT' as const,
    label: '🔥 立即處理',
    description: '主管今天會問',
    color: '#ef4444',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
  },
  TODAY: {
    key: 'TODAY' as const,
    label: '⚡ 今日建議完成',
    description: '有時間壓力',
    color: '#f59e0b',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
  },
  THIS_WEEK: {
    key: 'THIS_WEEK' as const,
    label: '📅 本週安排',
    description: '重要但不緊急',
    color: '#3b82f6',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
  POSTPONABLE: {
    key: 'POSTPONABLE' as const,
    label: '💡 可延後處理',
    description: '例行性工作',
    color: '#6b7280',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
  },
};

/**
 * 判斷任務是否已延遲
 */
function isTaskDelayed(task: Task): boolean {
  if (!task.deadline) return false;
  const deadline = new Date(task.deadline);
  const now = new Date();
  return deadline < now && task.status !== 'completed';
}

/**
 * 判斷任務是否今日截止
 */
function isTaskDueToday(task: Task): boolean {
  if (!task.deadline) return false;
  const deadline = new Date(task.deadline);
  const today = new Date();
  return (
    deadline.getFullYear() === today.getFullYear() &&
    deadline.getMonth() === today.getMonth() &&
    deadline.getDate() === today.getDate()
  );
}

/**
 * 判斷任務是否明天截止
 */
function isTaskDueTomorrow(task: Task): boolean {
  if (!task.deadline) return false;
  const deadline = new Date(task.deadline);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    deadline.getFullYear() === tomorrow.getFullYear() &&
    deadline.getMonth() === tomorrow.getMonth() &&
    deadline.getDate() === tomorrow.getDate()
  );
}

/**
 * 判斷任務是否本週截止
 */
function isTaskDueThisWeek(task: Task): boolean {
  if (!task.deadline) return false;
  const deadline = new Date(task.deadline);
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // 本週日
  return deadline <= endOfWeek && deadline > today;
}

/**
 * 判斷任務是否影響客戶
 */
function isCustomerFacing(task: Task): boolean {
  const keywords = ['客戶', '需求', '分析', '報告', '提案', '簡報'];
  return keywords.some(keyword => task.title.includes(keyword));
}

/**
 * 判斷任務是否需要跨部門協作
 */
function requiresCollaboration(task: Task): boolean {
  return (task.collaborators?.length || 0) > 0;
}

/**
 * 判斷任務是否為例行性工作
 */
function isRoutineTask(task: Task): boolean {
  const keywords = ['郵件', '回覆', '整理', '歸檔', '站會', '日報', '週報'];
  return keywords.some(keyword => task.title.includes(keyword));
}

/**
 * AI 自動判斷任務的優先級分類
 * 
 * 判斷邏輯（按優先順序）：
 * 1. 🔥 立即處理
 *    - 今日截止 OR 已延遲
 *    - 影響客戶的任務
 *    - 主管今天會追蹤的任務
 * 
 * 2. ⚡ 今日建議完成
 *    - 明天截止
 *    - 本週截止且需要協作
 * 
 * 3. 📅 本週安排
 *    - 本週內截止
 *    - 有明確截止日期但不緊急
 * 
 * 4. 💡 可延後處理
 *    - 無明確截止日期
 *    - 例行性工作
 */
export function categorizeTask(task: Task): PriorityCategory {
  // 1. 🔥 立即處理
  if (isTaskDelayed(task)) {
    return 'URGENT';
  }
  
  if (isTaskDueToday(task)) {
    return 'URGENT';
  }
  
  if (isCustomerFacing(task) && isTaskDueThisWeek(task)) {
    return 'URGENT';
  }
  
  // 2. ⚡ 今日建議完成
  if (isTaskDueTomorrow(task)) {
    return 'TODAY';
  }
  
  if (isTaskDueThisWeek(task) && requiresCollaboration(task)) {
    return 'TODAY';
  }
  
  // 3. 📅 本週安排
  if (isTaskDueThisWeek(task)) {
    return 'THIS_WEEK';
  }
  
  // 4. 💡 可延後處理
  if (isRoutineTask(task)) {
    return 'POSTPONABLE';
  }
  
  if (!task.deadline) {
    return 'POSTPONABLE';
  }
  
  // 預設：本週安排
  return 'THIS_WEEK';
}

/**
 * 計算任務的延遲天數
 */
export function getDelayDays(task: Task): number {
  if (!task.deadline) return 0;
  const deadline = new Date(task.deadline);
  const now = new Date();
  const diffTime = now.getTime() - deadline.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * 取得任務的標籤文字（用於顯示原因）
 */
export function getTaskReasonLabel(task: Task): string {
  if (isTaskDelayed(task)) {
    const days = getDelayDays(task);
    return `已延遲 ${days} 天`;
  }
  
  if (isTaskDueToday(task)) {
    return '今日截止';
  }
  
  if (isTaskDueTomorrow(task)) {
    return '明天截止';
  }
  
  if (isTaskDueThisWeek(task)) {
    return '本週截止';
  }
  
  if (isCustomerFacing(task)) {
    return '影響客戶';
  }
  
  if (requiresCollaboration(task)) {
    return '需要協作';
  }
  
  if (isRoutineTask(task)) {
    return '例行性工作';
  }
  
  return '無截止日期';
}
