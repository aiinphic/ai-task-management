// 在瀏覽器 console 執行此腳本來產生模擬資料

// 1. 清空舊資料
localStorage.removeItem('tasks');
localStorage.removeItem('timeRecords');

// 2. 產生正確的日期
const dates = [];
for (let i = 1; i <= 5; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  dates.push(date.toISOString().split('T')[0]);
}
console.log('產生的日期:', dates);

// 3. 產生時間記錄(只為王小明產生示例資料)
const timeRecords = [];
const levels = ['1級|營收', '2級|流量', '3級|行政', '日常'];
const tasks = ['客戶需求分析', '市場調查報告', '會議室預約管理', '郵件回覆'];

dates.forEach(date => {
  // 每天產生 2-3 筆記錄
  const recordCount = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < recordCount; i++) {
    timeRecords.push({
      memberId: 'wang',
      memberName: '王小明',
      department: '產品部',
      date: date,
      taskTitle: tasks[Math.floor(Math.random() * tasks.length)],
      taskLevel: levels[Math.floor(Math.random() * levels.length)],
      hours: (Math.random() * 3 + 0.5).toFixed(1)
    });
  }
});

// 4. 儲存到 localStorage
localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
console.log('✅ 已產生', timeRecords.length, '筆時間記錄');
console.log('時間記錄:', timeRecords);

// 5. 重新載入頁面
window.location.reload();
