export type TaskPriority = "high" | "medium" | "low";
export type TaskDuration = "10min" | "1hour" | "1day";
export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskLevel = "LEVEL_1_REVENUE" | "LEVEL_2_TRAFFIC" | "LEVEL_3_ADMIN" | "LEVEL_4_DAILY";

export interface User {
  id: string;
  name: string;
  avatar?: string;
  department: string; // 所屬部門
  role?: string; // 職位
}

export interface Subtask {
  id: string;
  title: string;
  estimatedHours: number; // 預估時數
  estimatedTime: number; // 分鐘
  actualTime: number; // 分鐘
  status: 'pending' | 'in-progress' | 'completed';
  completed: boolean; // 是否完成
  startTime?: string;
  endTime?: string;
  actionLogs?: import('./actionLog').TaskActionLog[]; // 操作記錄
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string;
  subtask: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string; // 簡短直覺式標題
  description: string; // AI 分析的詳細描述
  priority: TaskPriority;
  duration: TaskDuration;
  status: TaskStatus;
  
  // 新增欄位
  assignee: User; // 負責人
  collaborators: User[]; // 協作單位
  aiAnalysis?: {
    progress: string; // AI 分析的進度說明
    missingItems: string[]; // 還缺什麼事項
  };
  
  // 時間追蹤
  startTime?: Date;
  endTime?: Date;
  completedAt?: Date; // 完成時間
  totalTimeSpent?: number; // 總投入時間(分鐘)
  
  // 所屬部門
  department: string;
  
  // 符號系統
  symbolId?: string; // 符號系統 ID
  level?: TaskLevel; // 任務層級 (1級|營收, 2級|流量, 3級|行政, 4級|日常)
  weight?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; // 權重等級
  
  // AI 生成內容
  aiGeneratedContent?: {
    direction: string;      // 任務方向
    outline: string[];      // 任務大綱(條列式)
    description: string;    // 文字敘述
  };
  
  // AI 分析增強欄位
  taskDirection?: string;    // 任務方向 (AI 判別)
  taskOutline?: string;      // 任務大綱 (AI 判別)
  aiSuggestions?: string;    // AI 執行建議 (檢視優化工具)
  scheduleGoal?: string;     // 時程目標
  
  // 優先級評分所需欄位
  deadline?: Date; // 截止日期
  estimatedMinutes?: number; // 預估時間(分鐘)
  createdAt?: Date; // 建立時間
  priorityScore?: number; // 優先級分數(0-100)
  
  // 時間軸分配(9:00-18:30)
  timeSlots?: TimeSlot[];
  
  // 子任務列表(卡片式追蹤)
  subtasks?: Subtask[];
  
  progress?: number;
  
  // 量化貢獻度 (陳宗賢老師理論)
  quantitativeMetrics?: QuantitativeMetrics;
}

/**
 * 量化貢獻度指標
 * 根據陳宗賢老師理論，拒絕抽象描述，強制量化輸入
 */
export interface QuantitativeMetrics {
  // 金額貢獻度
  financial?: {
    value: number;        // 數值（如 500000）
    unit: string;         // 單位（如「元」、「萬元」）
    type: 'revenue' | 'cost_saving' | 'investment';  // 類型：營收/成本節省/投資
    description: string;  // 描述（如「預計帶來 50 萬營收」）
  };
  
  // 數量貢獻度
  quantity?: {
    value: number;        // 數值（如 1000）
    unit: string;         // 單位（如「個新用戶」、「件客戶案件」）
    type: 'users' | 'customers' | 'products' | 'projects' | 'other';
    description: string;  // 描述（如「增加 1000 個新用戶」）
  };
  
  // 時間貢獻度
  time?: {
    value: number;        // 數值（如 10）
    unit: string;         // 單位（如「小時」、「天」）
    type: 'time_saving' | 'process_optimization' | 'efficiency';
    description: string;  // 描述（如「節省 10 小時工時」）
  };
}

export interface CreateTaskInput {
  textInput?: string;
  files?: File[];
  audioFiles?: File[];
  assigneeId: string;
  collaboratorIds: string[];
}
