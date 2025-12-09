/**
 * 日常任務分類器
 * 根據任務的特徵自動判斷是否為「日常」任務
 */

/**
 * 日常任務關鍵字列表
 * 包含重複性、行政性、低價值的任務特徵
 */
const DAILY_TASK_KEYWORDS = [
  // 重複性任務
  '日常', '每日', '定期', '例行', '常規',
  
  // 行政性任務
  '郵件', 'email', '回覆', '回信', '信件',
  '文件', '整理', '歸檔', '備份',
  '會議', '開會', '討論', '溝通', '協調',
  '報告', '週報', '月報', '日報',
  
  // 低價值任務
  '雜務', '瑣事', '清潔', '整頓',
  '打掃', '維護', '檢查', '巡視',
  
  // 其他日常任務
  '簽到', '打卡', '考勤',
  '請假', '加班', '排班',
  '訂餐', '訂便當', '訂飲料',
];

/**
 * 判斷任務是否為日常任務
 * @param taskTitle 任務標題
 * @param taskDescription 任務描述(可選)
 * @returns 如果是日常任務返回 true,否則返回 false
 */
export function isDailyTask(taskTitle: string, taskDescription?: string): boolean {
  const lowerTitle = taskTitle.toLowerCase();
  const lowerDescription = taskDescription?.toLowerCase() || '';
  
  // 檢查標題或描述是否包含日常任務關鍵字
  for (const keyword of DAILY_TASK_KEYWORDS) {
    if (lowerTitle.includes(keyword.toLowerCase()) || 
        lowerDescription.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * 根據任務特徵自動判斷任務層級
 * @param taskTitle 任務標題
 * @param taskDescription 任務描述
 * @param aiPriority AI 分析的優先級 (high/medium/low)
 * @returns 任務層級 (LEVEL_1_REVENUE/LEVEL_2_TRAFFIC/LEVEL_3_ADMIN/LEVEL_4_DAILY)
 */
export function classifyTaskLevel(
  taskTitle: string,
  taskDescription: string,
  aiPriority: 'high' | 'medium' | 'low'
): 'LEVEL_1_REVENUE' | 'LEVEL_2_TRAFFIC' | 'LEVEL_3_ADMIN' | 'LEVEL_4_DAILY' {
  // 優先檢查是否為日常任務
  if (isDailyTask(taskTitle, taskDescription)) {
    return 'LEVEL_4_DAILY';
  }
  
  // 如果不是日常任務,根據 AI 優先級映射到對應層級
  const priorityToLevel = {
    high: 'LEVEL_1_REVENUE' as const,
    medium: 'LEVEL_2_TRAFFIC' as const,
    low: 'LEVEL_3_ADMIN' as const,
  };
  
  return priorityToLevel[aiPriority];
}
