import { mockUsers } from './client/src/data/mockDepartments';
import type { Task } from './client/src/types/task';

// 任務模板
const taskTemplates = {
  urgent: [
    { title: '客戶需求分析報告', keywords: ['客戶', '需求'] },
    { title: '產品上線前最終測試', keywords: ['測試', '上線'] },
    { title: '重要客戶簡報準備', keywords: ['客戶', '簡報'] },
    { title: '緊急 Bug 修復', keywords: ['Bug', '修復'] },
    { title: '季度業績報告撰寫', keywords: ['報告', '業績'] },
  ],
  today: [
    { title: '市場調查問卷設計', keywords: ['市場', '調查'] },
    { title: 'UI/UX 設計稿審核', keywords: ['設計', '審核'] },
    { title: '團隊會議簡報製作', keywords: ['會議', '簡報'] },
    { title: '產品功能需求文件', keywords: ['需求', '文件'] },
    { title: '競品分析報告', keywords: ['分析', '報告'] },
  ],
  week: [
    { title: '社群媒體內容規劃', keywords: ['社群', '規劃'] },
    { title: '產品路線圖更新', keywords: ['產品', '路線圖'] },
    { title: '使用者訪談記錄整理', keywords: ['訪談', '整理'] },
    { title: '技術文件撰寫', keywords: ['技術', '文件'] },
    { title: '專案進度追蹤表更新', keywords: ['專案', '追蹤'] },
  ],
  later: [
    { title: '郵件回覆與整理', keywords: ['郵件', '回覆'] },
    { title: '每日站會參與', keywords: ['站會'] },
    { title: '文件歸檔整理', keywords: ['文件', '歸檔'] },
    { title: '會議室預約管理', keywords: ['會議室', '預約'] },
    { title: '團隊知識庫維護', keywords: ['知識庫', '維護'] },
  ],
};

// 生成隨機日期
const getRandomDate = (daysOffset: number, range: number = 0) => {
  const today = new Date();
  const offset = daysOffset + Math.floor(Math.random() * range);
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

// 生成任務
const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  let taskId = 1;

  mockUsers.forEach((user) => {
    // 🔥 立即處理 (2-3 個任務)
    const urgentCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < urgentCount; i++) {
      const template = taskTemplates.urgent[Math.floor(Math.random() * taskTemplates.urgent.length)];
      tasks.push({
        id: `task-${taskId++}`,
        title: `${template.title} - ${user.name}`,
        description: `${user.name} 負責的 ${template.title}`,
        status: 'pending',
        priority: 'high',
        level: ['LEVEL_1_REVENUE', 'LEVEL_2_TRAFFIC'][Math.floor(Math.random() * 2)] as any,
        assignee: user,
        collaborators: [],
        deadline: Math.random() > 0.5 ? getRandomDate(-2, 2) : getRandomDate(0), // 已延遲或今日截止
        estimatedMinutes: 120 + Math.floor(Math.random() * 180),
        tags: template.keywords,
        subtasks: [
          { id: `sub-${taskId}-1`, title: '需求分析', completed: false },
          { id: `sub-${taskId}-2`, title: '設計規劃', completed: false },
          { id: `sub-${taskId}-3`, title: '實作開發', completed: false },
          { id: `sub-${taskId}-4`, title: '測試驗證', completed: false },
        ],
        createdAt: getRandomDate(-7),
        updatedAt: getRandomDate(-1),
      });
    }

    // ⚡ 今日建議完成 (2-3 個任務)
    const todayCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < todayCount; i++) {
      const template = taskTemplates.today[Math.floor(Math.random() * taskTemplates.today.length)];
      const collaborators = mockUsers.filter(u => u.id !== user.id).slice(0, Math.floor(Math.random() * 2) + 1);
      tasks.push({
        id: `task-${taskId++}`,
        title: `${template.title} - ${user.name}`,
        description: `${user.name} 負責的 ${template.title}`,
        status: 'pending',
        priority: 'medium',
        level: ['LEVEL_2_TRAFFIC', 'LEVEL_3_ADMIN'][Math.floor(Math.random() * 2)] as any,
        assignee: user,
        collaborators,
        deadline: getRandomDate(1, 2), // 明天或後天截止
        estimatedMinutes: 90 + Math.floor(Math.random() * 120),
        tags: template.keywords,
        subtasks: [
          { id: `sub-${taskId}-1`, title: '資料收集', completed: false },
          { id: `sub-${taskId}-2`, title: '分析整理', completed: false },
          { id: `sub-${taskId}-3`, title: '報告撰寫', completed: false },
        ],
        createdAt: getRandomDate(-5),
        updatedAt: getRandomDate(-1),
      });
    }

    // 🏛️ 本週安排 (2-4 個任務)
    const weekCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < weekCount; i++) {
      const template = taskTemplates.week[Math.floor(Math.random() * taskTemplates.week.length)];
      tasks.push({
        id: `task-${taskId++}`,
        title: `${template.title} - ${user.name}`,
        description: `${user.name} 負責的 ${template.title}`,
        status: 'pending',
        priority: 'medium',
        level: ['LEVEL_2_TRAFFIC', 'LEVEL_3_ADMIN'][Math.floor(Math.random() * 2)] as any,
        assignee: user,
        collaborators: [],
        deadline: getRandomDate(3, 4), // 本週內截止
        estimatedMinutes: 60 + Math.floor(Math.random() * 90),
        tags: template.keywords,
        subtasks: [
          { id: `sub-${taskId}-1`, title: '初步規劃', completed: false },
          { id: `sub-${taskId}-2`, title: '執行實作', completed: false },
        ],
        createdAt: getRandomDate(-3),
        updatedAt: getRandomDate(-1),
      });
    }

    // 💡 可延後處理 (2-3 個任務)
    const laterCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < laterCount; i++) {
      const template = taskTemplates.later[Math.floor(Math.random() * taskTemplates.later.length)];
      tasks.push({
        id: `task-${taskId++}`,
        title: `${template.title} - ${user.name}`,
        description: `${user.name} 負責的 ${template.title}`,
        status: 'pending',
        priority: 'low',
        level: 'LEVEL_4_DAILY' as any,
        assignee: user,
        collaborators: [],
        deadline: null, // 無截止日期
        estimatedMinutes: 30 + Math.floor(Math.random() * 60),
        tags: template.keywords,
        subtasks: [],
        createdAt: getRandomDate(-2),
        updatedAt: getRandomDate(-1),
      });
    }
  });

  return tasks;
};

// 生成並輸出
const tasks = generateTasks();
console.log(JSON.stringify(tasks, null, 2));
