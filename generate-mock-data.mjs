/**
 * 為李美華產生過去5天的模擬時間記錄
 * 展示不同評級(S/A/B/C/D)和不良原因分析
 */

// 計算日期字串
function getDateString(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// 產生模擬資料
const mockData = [
  // 昨天 - D級 (51分) - 多個問題
  {
    date: getDateString(1),
    totalMinutes: 480,
    usedMinutes: 65,
    remainingMinutes: 415,
    isEnded: false,
    sessions: [
      {
        taskId: 1,
        taskTitle: 'UI 介面設計',
        taskLevel: 2,
        startTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 15 * 60000).toISOString(),
        durationMinutes: 15,
        endType: 'manual',
      },
      {
        taskId: 2,
        taskTitle: '團隊會議',
        taskLevel: 3,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 20 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 40 * 60000).toISOString(),
        durationMinutes: 20,
        endType: 'manual',
      },
      {
        taskId: 3,
        taskTitle: '回覆郵件',
        taskLevel: 4,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 50 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 60 * 60000).toISOString(),
        durationMinutes: 10,
        endType: 'manual',
      },
      {
        taskId: 4,
        taskTitle: '產品需求討論',
        taskLevel: 1,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 70 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 90 * 60000).toISOString(),
        durationMinutes: 20,
        endType: 'manual',
      },
    ],
  },
  
  // 前天 - C級 (68分) - 時間利用率低
  {
    date: getDateString(2),
    totalMinutes: 480,
    usedMinutes: 280,
    remainingMinutes: 200,
    isEnded: false,
    sessions: [
      {
        taskId: 5,
        taskTitle: '產品原型設計',
        taskLevel: 1,
        startTime: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 90 * 60000).toISOString(),
        durationMinutes: 90,
        endType: 'manual',
      },
      {
        taskId: 6,
        taskTitle: 'UI 組件優化',
        taskLevel: 2,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 100 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 160 * 60000).toISOString(),
        durationMinutes: 60,
        endType: 'manual',
      },
      {
        taskId: 7,
        taskTitle: '設計規範整理',
        taskLevel: 3,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 170 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 220 * 60000).toISOString(),
        durationMinutes: 50,
        endType: 'manual',
      },
      {
        taskId: 8,
        taskTitle: '日常雜務',
        taskLevel: 4,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 230 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 270 * 60000).toISOString(),
        durationMinutes: 40,
        endType: 'manual',
      },
    ],
  },
  
  // 3天前 - B級 (75分) - 1級任務時間略低
  {
    date: getDateString(3),
    totalMinutes: 480,
    usedMinutes: 390,
    remainingMinutes: 90,
    isEnded: false,
    sessions: [
      {
        taskId: 9,
        taskTitle: '客戶需求訪談',
        taskLevel: 1,
        startTime: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 120 * 60000).toISOString(),
        durationMinutes: 120,
        endType: 'manual',
      },
      {
        taskId: 10,
        taskTitle: '產品介面設計',
        taskLevel: 1,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 130 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 220 * 60000).toISOString(),
        durationMinutes: 90,
        endType: 'manual',
      },
      {
        taskId: 11,
        taskTitle: '設計評審會議',
        taskLevel: 2,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 230 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 290 * 60000).toISOString(),
        durationMinutes: 60,
        endType: 'manual',
      },
      {
        taskId: 12,
        taskTitle: '團隊協作',
        taskLevel: 3,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 300 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 360 * 60000).toISOString(),
        durationMinutes: 60,
        endType: 'manual',
      },
      {
        taskId: 13,
        taskTitle: '文件整理',
        taskLevel: 4,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 370 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).getTime() + 400 * 60000).toISOString(),
        durationMinutes: 30,
        endType: 'manual',
      },
    ],
  },
  
  // 4天前 - A級 (85分) - 表現良好
  {
    date: getDateString(4),
    totalMinutes: 480,
    usedMinutes: 420,
    remainingMinutes: 60,
    isEnded: false,
    sessions: [
      {
        taskId: 14,
        taskTitle: '產品設計優化',
        taskLevel: 1,
        startTime: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).getTime() + 180 * 60000).toISOString(),
        durationMinutes: 180,
        endType: 'manual',
      },
      {
        taskId: 15,
        taskTitle: '使用者體驗研究',
        taskLevel: 1,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).getTime() + 190 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).getTime() + 280 * 60000).toISOString(),
        durationMinutes: 90,
        endType: 'manual',
      },
      {
        taskId: 16,
        taskTitle: '設計系統維護',
        taskLevel: 2,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).getTime() + 290 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).getTime() + 350 * 60000).toISOString(),
        durationMinutes: 60,
        endType: 'manual',
      },
      {
        taskId: 17,
        taskTitle: '團隊分享會',
        taskLevel: 3,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).getTime() + 360 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 4)).getTime() + 420 * 60000).toISOString(),
        durationMinutes: 60,
        endType: 'manual',
      },
    ],
  },
  
  // 5天前 - S級 (92分) - 優秀表現
  {
    date: getDateString(5),
    totalMinutes: 480,
    usedMinutes: 450,
    remainingMinutes: 30,
    isEnded: false,
    sessions: [
      {
        taskId: 18,
        taskTitle: '核心功能設計',
        taskLevel: 1,
        startTime: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 240 * 60000).toISOString(),
        durationMinutes: 240,
        endType: 'manual',
      },
      {
        taskId: 19,
        taskTitle: '產品原型迭代',
        taskLevel: 1,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 250 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 370 * 60000).toISOString(),
        durationMinutes: 120,
        endType: 'manual',
      },
      {
        taskId: 20,
        taskTitle: '設計評審',
        taskLevel: 2,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 380 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 440 * 60000).toISOString(),
        durationMinutes: 60,
        endType: 'manual',
      },
      {
        taskId: 21,
        taskTitle: '日常溝通',
        taskLevel: 4,
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 450 * 60000).toISOString(),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 480 * 60000).toISOString(),
        durationMinutes: 30,
        endType: 'manual',
      },
    ],
  },
];

// 寫入 localStorage
mockData.forEach((data) => {
  const storageKey = `timeLog_${data.date}`;
  console.log(`Writing ${storageKey}...`);
  console.log(JSON.stringify(data, null, 2));
});

// 產生可在瀏覽器 console 執行的腳本
console.log('\n\n=== 在瀏覽器 Console 執行以下腳本 ===\n');
mockData.forEach((data) => {
  const storageKey = `timeLog_${data.date}`;
  console.log(`localStorage.setItem('${storageKey}', '${JSON.stringify(data)}');`);
});

console.log('\n=== 完成! ===');
