// 模擬資料產生腳本
// 用於產生所有部門人員的時間記錄和任務資料

const departments = [
  {
    id: 'product',
    name: '產品部',
    members: [
      { id: 'wang', name: '王小明', role: '產品經理' },
      { id: 'li', name: '李美華', role: '產品設計師' },
      { id: 'zhang', name: '張志強', role: '產品分析師' },
      { id: 'chen', name: '陳雅婷', role: 'UI/UX 設計師' },
      { id: 'lin', name: '林建宏', role: '產品專員' }
    ]
  },
  {
    id: 'accounting',
    name: '會計部',
    members: [
      { id: 'huang', name: '黃淑芬', role: '會計主管' },
      { id: 'wu', name: '吳俊傑', role: '會計師' },
      { id: 'liu', name: '劉佳玲', role: '出納' },
      { id: 'zheng', name: '鄭宇軒', role: '會計助理' }
    ]
  },
  {
    id: 'sales',
    name: '業務部',
    members: [
      { id: 'xie', name: '謝文傑', role: '業務經理' },
      { id: 'zhou', name: '周美玲', role: '業務專員' },
      { id: 'cai', name: '蔡宗翰', role: '業務代表' },
      { id: 'xu', name: '許雅雯', role: '客戶經理' },
      { id: 'yang', name: '楊承翰', role: '業務助理' },
      { id: 'lai', name: '賴怡君', role: '業務專員' }
    ]
  },
  {
    id: 'marketing',
    name: '行銷部',
    members: [
      { id: 'lin2', name: '林詩涵', role: '行銷經理' },
      { id: 'chen2', name: '陳冠宇', role: '數位行銷專員' },
      { id: 'zhang2', name: '張雅筑', role: '社群經營' },
      { id: 'liu2', name: '劉宇恩', role: 'SEO 專員' },
      { id: 'wang2', name: '王欣怡', role: '內容行銷' }
    ]
  },
  {
    id: 'admin',
    name: '行政部',
    members: [
      { id: 'xu2', name: '徐志明', role: '行政經理' },
      { id: 'su', name: '蘇雅婷', role: '人資專員' },
      { id: 'he', name: '何俊宏', role: '總務' }
    ]
  }
];

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

// 產生隨機日期(最近 5 天)
function getRecentDates() {
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// 產生隨機時間記錄
function generateTimeRecords() {
  const records = [];
  const dates = getRecentDates();
  
  departments.forEach(dept => {
    dept.members.forEach(member => {
      dates.forEach(date => {
        // 70% 機率有執行記錄
        if (Math.random() > 0.3) {
          const sessionCount = Math.floor(Math.random() * 4) + 1; // 1-4 個任務
          
          for (let i = 0; i < sessionCount; i++) {
            const level = taskLevels[Math.floor(Math.random() * taskLevels.length)];
            const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
            const durationMinutes = Math.floor(Math.random() * 180) + 30; // 30-210 分鐘
            
            records.push({
              memberId: member.id,
              memberName: member.name,
              department: dept.name,
              date: date,
              taskTitle: template.title,
              taskLevel: parseInt(level.value.split('_')[1]), // 1, 2, 3, 4
              durationMinutes: durationMinutes,
              startTime: `${8 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
            });
          }
        }
      });
    });
  });
  
  return records;
}

// 產生任務清單
function generateTasks() {
  const tasks = [];
  let taskId = 1;
  
  departments.forEach(dept => {
    dept.members.forEach(member => {
      // 每個人 2-4 個任務
      const taskCount = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < taskCount; i++) {
        const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
        const level = taskLevels.find(l => l.value === template.level);
        const status = Math.random() > 0.7 ? 'completed' : 'pending';
        
        // 產生子任務
        const subtasks = [];
        const subtaskCount = Math.floor(Math.random() * 3) + 2; // 2-4 個子任務
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
          assignee: member.name,
          assigneeId: member.id,
          department: dept.name,
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

// 產生並輸出資料
const timeRecords = generateTimeRecords();
const tasks = generateTasks();

console.log('=== 時間記錄資料 ===');
console.log(JSON.stringify(timeRecords, null, 2));
console.log('\n=== 任務清單資料 ===');
console.log(JSON.stringify(tasks, null, 2));

// 儲存到 localStorage 的格式
const localStorageData = {
  timeRecords: timeRecords,
  tasks: tasks,
  generatedAt: new Date().toISOString()
};

console.log('\n=== localStorage 資料 ===');
console.log(JSON.stringify(localStorageData, null, 2));
