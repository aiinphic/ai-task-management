/**
 * 模擬資料初始化工具
 * 用於開發環境自動建立過去5天的時間記錄模擬資料
 */

import { DailyTimeLog } from './timeTracking';

/**
 * 檢查是否需要初始化模擬資料
 */
export function shouldInitializeMockData(): boolean {
  // 檢查是否已經有模擬資料標記
  const mockDataFlag = localStorage.getItem('mockDataInitialized');
  if (mockDataFlag === 'true') {
    return false;
  }
  
  // 檢查是否已經有任何時間記錄
  const keys = Object.keys(localStorage).filter(k => k.startsWith('timeLog_'));
  return keys.length === 0;
}

/**
 * 初始化過去5天的模擬資料
 */
export function initializeMockData() {
  console.log('🔧 開始初始化模擬資料...');
  
  // 昨天 - D級 (42分)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const yesterdayLog: DailyTimeLog = {
    date: yesterdayStr,
    totalMinutes: 480,
    usedMinutes: 65,
    remainingMinutes: 415,
    isEnded: false,
    sessions: [
      {
        taskId: '1',
        taskTitle: 'UI 介面設計',
        taskLevel: 2,
        startTime: `${yesterdayStr}T03:35:31.681Z`,
        endTime: `${yesterdayStr}T03:50:31.681Z`,
        durationMinutes: 15,
        isManualEnd: true,
      },
      {
        taskId: '2',
        taskTitle: '團隊會議',
        taskLevel: 3,
        startTime: `${yesterdayStr}T03:55:31.681Z`,
        endTime: `${yesterdayStr}T04:15:31.681Z`,
        durationMinutes: 20,
        isManualEnd: true,
      },
      {
        taskId: '3',
        taskTitle: '回覆郵件',
        taskLevel: 4,
        startTime: `${yesterdayStr}T04:25:31.681Z`,
        endTime: `${yesterdayStr}T04:35:31.681Z`,
        durationMinutes: 10,
        isManualEnd: true,
      },
      {
        taskId: '4',
        taskTitle: '產品需求討論',
        taskLevel: 1,
        startTime: `${yesterdayStr}T04:45:31.681Z`,
        endTime: `${yesterdayStr}T05:05:31.681Z`,
        durationMinutes: 20,
        isManualEnd: true,
      },
    ],
  };
  
  // 前天 - C級 (68分)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
  
  const twoDaysAgoLog: DailyTimeLog = {
    date: twoDaysAgoStr,
    totalMinutes: 480,
    usedMinutes: 280,
    remainingMinutes: 200,
    isEnded: false,
    sessions: [
      {
        taskId: '5',
        taskTitle: '產品原型設計',
        taskLevel: 1,
        startTime: `${twoDaysAgoStr}T03:35:31.681Z`,
        endTime: `${twoDaysAgoStr}T05:05:31.681Z`,
        durationMinutes: 90,
        isManualEnd: true,
      },
      {
        taskId: '6',
        taskTitle: 'UI 組件優化',
        taskLevel: 2,
        startTime: `${twoDaysAgoStr}T05:15:31.681Z`,
        endTime: `${twoDaysAgoStr}T06:15:31.681Z`,
        durationMinutes: 60,
        isManualEnd: true,
      },
      {
        taskId: '7',
        taskTitle: '設計規範整理',
        taskLevel: 3,
        startTime: `${twoDaysAgoStr}T06:25:31.681Z`,
        endTime: `${twoDaysAgoStr}T07:15:31.681Z`,
        durationMinutes: 50,
        isManualEnd: true,
      },
      {
        taskId: '8',
        taskTitle: '日常雜務',
        taskLevel: 4,
        startTime: `${twoDaysAgoStr}T07:25:31.681Z`,
        endTime: `${twoDaysAgoStr}T08:05:31.681Z`,
        durationMinutes: 40,
        isManualEnd: true,
      },
      {
        taskId: '9',
        taskTitle: '團隊溝通',
        taskLevel: 3,
        startTime: `${twoDaysAgoStr}T08:15:31.681Z`,
        endTime: `${twoDaysAgoStr}T08:55:31.681Z`,
        durationMinutes: 40,
        isManualEnd: true,
      },
    ],
  };
  
  // 3天前 - B級 (75分)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
  
  const threeDaysAgoLog: DailyTimeLog = {
    date: threeDaysAgoStr,
    totalMinutes: 480,
    usedMinutes: 390,
    remainingMinutes: 90,
    isEnded: false,
    sessions: [
      {
        taskId: '10',
        taskTitle: '客戶需求訪談',
        taskLevel: 1,
        startTime: `${threeDaysAgoStr}T03:35:31.681Z`,
        endTime: `${threeDaysAgoStr}T05:35:31.681Z`,
        durationMinutes: 120,
        isManualEnd: true,
      },
      {
        taskId: '11',
        taskTitle: '產品介面設計',
        taskLevel: 1,
        startTime: `${threeDaysAgoStr}T05:45:31.681Z`,
        endTime: `${threeDaysAgoStr}T07:15:31.681Z`,
        durationMinutes: 90,
        isManualEnd: true,
      },
      {
        taskId: '12',
        taskTitle: '設計評審會議',
        taskLevel: 2,
        startTime: `${threeDaysAgoStr}T07:25:31.681Z`,
        endTime: `${threeDaysAgoStr}T08:25:31.681Z`,
        durationMinutes: 60,
        isManualEnd: true,
      },
      {
        taskId: '13',
        taskTitle: '團隊協作',
        taskLevel: 3,
        startTime: `${threeDaysAgoStr}T08:35:31.681Z`,
        endTime: `${threeDaysAgoStr}T09:35:31.681Z`,
        durationMinutes: 60,
        isManualEnd: true,
      },
      {
        taskId: '14',
        taskTitle: '文件整理',
        taskLevel: 4,
        startTime: `${threeDaysAgoStr}T09:45:31.681Z`,
        endTime: `${threeDaysAgoStr}T10:15:31.681Z`,
        durationMinutes: 30,
        isManualEnd: true,
      },
      {
        taskId: '15',
        taskTitle: '郵件處理',
        taskLevel: 4,
        startTime: `${threeDaysAgoStr}T10:25:31.681Z`,
        endTime: `${threeDaysAgoStr}T10:55:31.681Z`,
        durationMinutes: 30,
        isManualEnd: true,
      },
    ],
  };
  
  // 4天前 - A級 (85分)
  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  const fourDaysAgoStr = fourDaysAgo.toISOString().split('T')[0];
  
  const fourDaysAgoLog: DailyTimeLog = {
    date: fourDaysAgoStr,
    totalMinutes: 480,
    usedMinutes: 420,
    remainingMinutes: 60,
    isEnded: false,
    sessions: [
      {
        taskId: '16',
        taskTitle: '產品設計優化',
        taskLevel: 1,
        startTime: `${fourDaysAgoStr}T03:35:31.681Z`,
        endTime: `${fourDaysAgoStr}T06:35:31.681Z`,
        durationMinutes: 180,
        isManualEnd: true,
      },
      {
        taskId: '17',
        taskTitle: '使用者體驗研究',
        taskLevel: 1,
        startTime: `${fourDaysAgoStr}T06:45:31.681Z`,
        endTime: `${fourDaysAgoStr}T08:15:31.681Z`,
        durationMinutes: 90,
        isManualEnd: true,
      },
      {
        taskId: '18',
        taskTitle: '設計系統維護',
        taskLevel: 2,
        startTime: `${fourDaysAgoStr}T08:25:31.681Z`,
        endTime: `${fourDaysAgoStr}T09:25:31.681Z`,
        durationMinutes: 60,
        isManualEnd: true,
      },
      {
        taskId: '19',
        taskTitle: '團隊分享會',
        taskLevel: 3,
        startTime: `${fourDaysAgoStr}T09:35:31.681Z`,
        endTime: `${fourDaysAgoStr}T10:35:31.681Z`,
        durationMinutes: 60,
        isManualEnd: true,
      },
      {
        taskId: '20',
        taskTitle: '日常溝通',
        taskLevel: 4,
        startTime: `${fourDaysAgoStr}T10:45:31.681Z`,
        endTime: `${fourDaysAgoStr}T11:15:31.681Z`,
        durationMinutes: 30,
        isManualEnd: true,
      },
    ],
  };
  
  // 5天前 - S級 (92分)
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const fiveDaysAgoStr = fiveDaysAgo.toISOString().split('T')[0];
  
  const fiveDaysAgoLog: DailyTimeLog = {
    date: fiveDaysAgoStr,
    totalMinutes: 480,
    usedMinutes: 450,
    remainingMinutes: 30,
    isEnded: false,
    sessions: [
      {
        taskId: '21',
        taskTitle: '核心功能設計',
        taskLevel: 1,
        startTime: `${fiveDaysAgoStr}T03:35:31.681Z`,
        endTime: `${fiveDaysAgoStr}T07:35:31.681Z`,
        durationMinutes: 240,
        isManualEnd: true,
      },
      {
        taskId: '22',
        taskTitle: '產品原型迭代',
        taskLevel: 1,
        startTime: `${fiveDaysAgoStr}T07:45:31.681Z`,
        endTime: `${fiveDaysAgoStr}T09:45:31.681Z`,
        durationMinutes: 120,
        isManualEnd: true,
      },
      {
        taskId: '23',
        taskTitle: '設計評審',
        taskLevel: 2,
        startTime: `${fiveDaysAgoStr}T09:55:31.681Z`,
        endTime: `${fiveDaysAgoStr}T10:55:31.681Z`,
        durationMinutes: 60,
        isManualEnd: true,
      },
      {
        taskId: '24',
        taskTitle: '日常溝通',
        taskLevel: 4,
        startTime: `${fiveDaysAgoStr}T11:05:31.681Z`,
        endTime: `${fiveDaysAgoStr}T11:35:31.681Z`,
        durationMinutes: 30,
        isManualEnd: true,
      },
    ],
  };
  
  // 寫入 localStorage
  localStorage.setItem(`timeLog_${yesterdayStr}`, JSON.stringify(yesterdayLog));
  localStorage.setItem(`timeLog_${twoDaysAgoStr}`, JSON.stringify(twoDaysAgoLog));
  localStorage.setItem(`timeLog_${threeDaysAgoStr}`, JSON.stringify(threeDaysAgoLog));
  localStorage.setItem(`timeLog_${fourDaysAgoStr}`, JSON.stringify(fourDaysAgoLog));
  localStorage.setItem(`timeLog_${fiveDaysAgoStr}`, JSON.stringify(fiveDaysAgoLog));
  
  // 設定初始化標記
  localStorage.setItem('mockDataInitialized', 'true');
  
  console.log('✅ 模擬資料初始化完成!');
  console.log(`  - 昨天 (${yesterdayStr}): D級 42分`);
  console.log(`  - 前天 (${twoDaysAgoStr}): C級 68分`);
  console.log(`  - 3天前 (${threeDaysAgoStr}): B級 75分`);
  console.log(`  - 4天前 (${fourDaysAgoStr}): A級 85分`);
  console.log(`  - 5天前 (${fiveDaysAgoStr}): S級 92分`);
}

/**
 * 清除模擬資料
 */
export function clearMockData() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('timeLog_'));
  keys.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('mockDataInitialized');
  console.log('🗑️ 模擬資料已清除');
}
