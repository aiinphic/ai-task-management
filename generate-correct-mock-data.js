// 產生正確日期的模擬資料

// 取得最近 5 天的日期(昨天到 5 天前)
function getRecentDates() {
  const dates = [];
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

console.log('正確的日期:', getRecentDates());

const mockData = require('./generate-mock-data-json.js');
