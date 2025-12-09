// 測試日常任務分類器
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

function isDailyTask(taskTitle, taskDescription = '') {
  const lowerTitle = taskTitle.toLowerCase();
  const lowerDescription = taskDescription.toLowerCase();
  
  for (const keyword of DAILY_TASK_KEYWORDS) {
    if (lowerTitle.includes(keyword.toLowerCase()) || 
        lowerDescription.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

// 測試案例
const testCases = [
  { title: '每日郵件處理', expected: true },
  { title: '團隊會議記錄整理', expected: true },
  { title: '產品需求分析', expected: false },
  { title: '客戶訪談', expected: false },
  { title: '日常溝通', expected: true },
  { title: '回覆郵件', expected: true },
  { title: '文件整理', expected: true },
];

console.log('測試日常任務分類器:\n');
testCases.forEach(({ title, expected }) => {
  const result = isDailyTask(title);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} "${title}" -> ${result} (預期: ${expected})`);
});
