// 模擬資料初始化工具
// 用於在開發環境中自動載入模擬資料

export function initMockData() {
  // 檢查是否已有資料
  const existingTasks = localStorage.getItem('tasks');
  const existingTimeRecords = localStorage.getItem('timeRecords');
  
  if (existingTasks && existingTimeRecords) {
    const tasks = JSON.parse(existingTasks);
    const timeRecords = JSON.parse(existingTimeRecords);
    
    if (tasks.length > 10 && timeRecords.length > 50) {
      console.log('✅ 已有模擬資料，跳過初始化');
      return;
    }
  }
  
  console.log('🔄 開始產生模擬資料...');
  
  // 產生模擬資料
  const mockData = generateMockData();
  
  // 儲存到 localStorage
  localStorage.setItem('timeRecords', JSON.stringify(mockData.timeRecords));
  localStorage.setItem('tasks', JSON.stringify(mockData.tasks));
  
  console.log('✅ 模擬資料已成功產生！');
  console.log(`- 時間記錄: ${mockData.timeRecords.length} 筆`);
  console.log(`- 任務清單: ${mockData.tasks.length} 個`);
}

import { mockUsers, mockDepartments } from '@/data/mockDepartments';

function generateMockData() {
  // 使用實際的 mockUsers 和 mockDepartments 資料
  const departments = mockDepartments.map(dept => ({
    id: dept.id,
    name: dept.name,
    members: mockUsers.filter(u => u.department === dept.name).map(u => ({
      id: u.id,
      name: u.name,
      role: u.role
    }))
  }));

  const taskLevels = [
    { value: 'LEVEL_1_REVENUE', label: '1級|營收', color: 'amber' },
    { value: 'LEVEL_2_TRAFFIC', label: '2級|流量', color: 'blue' },
    { value: 'LEVEL_3_ADMIN', label: '3級|行政', color: 'green' },
    { value: 'LEVEL_4_DAILY', label: '4級|日常', color: 'gray' }
  ];

  const taskTemplates = [
    { title: '準備季度報告', level: 'LEVEL_1_REVENUE', estimatedDays: 3 },
    { title: '客戶需求分析', level: 'LEVEL_1_REVENUE', estimatedDays: 2 },
    { title: '產品功能優化', level: 'LEVEL_2_TRAFFIC', estimatedDays: 5 },
    { title: 'UI/UX 設計改版', level: 'LEVEL_2_TRAFFIC', estimatedDays: 4 },
    { title: '市場調查報告', level: 'LEVEL_2_TRAFFIC', estimatedDays: 3 },
    { title: '社群媒體經營', level: 'LEVEL_2_TRAFFIC', estimatedDays: 2 },
    { title: '文件整理歸檔', level: 'LEVEL_3_ADMIN', estimatedDays: 1 },
    { title: '會議室預約管理', level: 'LEVEL_3_ADMIN', estimatedDays: 1 },
    { title: '每日站會', level: 'LEVEL_4_DAILY', estimatedDays: 1 },
    { title: '郵件回覆', level: 'LEVEL_4_DAILY', estimatedDays: 1 }
  ];

  function getRecentDates() {
    const dates = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  function generateTimeRecords() {
    const records: any[] = [];
    const dates = getRecentDates();
    
    departments.forEach(dept => {
      dept.members.forEach(member => {
        dates.forEach(date => {
          // 檢查是否為週末（週六、週日）
          const dateObj = new Date(date);
          const dayOfWeek = dateObj.getDay(); // 0 = 週日, 6 = 週六
          
          // 週末不產生任務記錄
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            return;
          }
          
          // 每個人每天都產生 2-4 筆記錄，確保每個人的資料都不同
          const sessionCount = Math.floor(Math.random() * 3) + 2; // 2-4 筆
          
          // 每天總時間不超過 8 小時（480 分鐘）
          const maxDailyMinutes = 480;
          const targetDailyMinutes = Math.floor(Math.random() * 180) + 300; // 300-480 分鐘 (5-8小時)
          let remainingMinutes = targetDailyMinutes;
          
          // 生成時間記錄，考慮午休時間 12:00-13:30
          const workPeriods = [
            { start: 9, end: 12 },    // 上午 9:00-12:00 (3小時)
            { start: 13.5, end: 18.5 } // 下午 13:30-18:30 (5小時)
          ];
          
          for (let i = 0; i < sessionCount; i++) {
            const level = taskLevels[Math.floor(Math.random() * taskLevels.length)];
            const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
            
            // 最後一筆記錄使用剩餘時間，其他記錄隨機分配
            let durationMinutes;
            if (i === sessionCount - 1) {
              durationMinutes = Math.max(30, remainingMinutes); // 至少 30 分鐘
            } else {
              const maxForThisSession = Math.min(180, Math.floor(remainingMinutes / (sessionCount - i)));
              durationMinutes = Math.floor(Math.random() * (maxForThisSession - 30)) + 30; // 30-maxForThisSession 分鐘
              remainingMinutes -= durationMinutes;
            }
            
            // 隨機選擇上午或下午時段
            const period = workPeriods[Math.floor(Math.random() * workPeriods.length)];
            const startHour = period.start + Math.random() * (period.end - period.start - durationMinutes / 60);
            const startHourInt = Math.floor(startHour);
            const startMinute = Math.floor((startHour - startHourInt) * 60);
            
            records.push({
              memberId: member.id,
              memberName: member.name,
              department: dept.name,
              date: date,
              taskTitle: template.title,
              taskLevel: parseInt(level.value.split('_')[1]),
              durationMinutes: durationMinutes,
              startTime: `${startHourInt.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
            });
          }
        });
      });
    });
    
    return records;
  }

  function generateTasks() {
    const tasks: any[] = [];
    let taskId = 1;
    
    departments.forEach(dept => {
      dept.members.forEach(member => {
        const taskCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < taskCount; i++) {
          const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
          const level = taskLevels.find(l => l.value === template.level)!;
          const status = Math.random() > 0.7 ? 'completed' : 'pending';
          
          const subtasks = [];
          const subtaskCount = Math.floor(Math.random() * 3) + 2;
          const subtaskTemplates = ['需求分析', '設計規劃', '開發實作', '測試驗證', '文件撰寫'];
          
          for (let j = 0; j < subtaskCount; j++) {
            subtasks.push({
              id: `subtask-${taskId}-${j}`,
              title: subtaskTemplates[j % subtaskTemplates.length],
              completed: status === 'completed' ? true : Math.random() > 0.5,
              estimatedHours: parseFloat((Math.random() * 2 + 0.5).toFixed(1))
            });
          }
          
          const totalEstimatedHours = subtasks.reduce((sum, st) => sum + st.estimatedHours, 0);
          
          tasks.push({
            id: `task-${taskId}`,
            title: `${template.title} - ${member.name}`,
            description: `${template.title}的詳細描述`,
            level: template.level,
            levelLabel: level.label,
            status: status,
            assignee: {
              id: member.id,
              name: member.name,
              department: dept.name,
              role: member.role
            },
            collaborators: [],
            estimatedDays: template.estimatedDays,
            estimatedHours: totalEstimatedHours,
            dueDate: new Date(Date.now() + template.estimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
            aiAnalysis: {
              direction: '這是一個中等優先級的任務,建議專注於核心目標的達成,確保每個步驟都能系統化執行。',
              outline: [
                '明確任務目標與成果標準',
                '評估所需資源與時間',
                '分階段執行並追蹤進度',
                '定期檢視與調整策略',
                '完成後進行總結與優化'
              ],
              suggestions: '建議採用漸進式方法,先完成核心功能,再逐步優化細節。建議每天投入 2-3 小時,保持穩定的執行節奏。',
              schedule: `預計 ${template.estimatedDays} 天內完成,建議每天檢視進度並適時調整執行計畫。`
            },
            subtasks: subtasks
          });
          
          taskId++;
        }
      });
    });
    
    return tasks;
  }

  return {
    timeRecords: generateTimeRecords(),
    tasks: generateTasks(),
    generatedAt: new Date().toISOString()
  };
}
