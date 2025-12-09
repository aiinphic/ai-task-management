import { Task } from "@/types/task";
import { getSymbolById } from "@/data/taskSymbols";

/**
 * 符號權重對照表
 * 每個符號有固定的權重值(0-100)
 */
const SYMBOL_WEIGHTS: Record<string, number> = {
  // 一級|營收 (revenue)
  "client-contract": 100,    // 客戶簽約
  "direct-sales": 95,        // 直接銷售
  "business-meeting": 90,    // 商務洽談
  "revenue-analysis": 85,    // 營收分析
  "pricing-strategy": 80,    // 定價策略
  "client-visit": 75,        // 客戶拜訪
  "product-demo": 70,        // 產品展示
  "proposal-writing": 65,    // 提案撰寫
  "contract-review": 60,     // 合約審核
  "payment-collection": 55,  // 款項催收

  // 二級|流量 (traffic)
  "seo-optimization": 100,   // SEO 優化
  "social-media": 95,        // 社群經營
  "content-marketing": 90,   // 內容行銷
  "ad-campaign": 85,         // 廣告投放
  "data-analysis": 80,       // 數據分析
  "email-marketing": 75,     // 電子郵件行銷
  "influencer-collab": 70,   // 網紅合作
  "event-planning": 65,      // 活動企劃
  "brand-building": 60,      // 品牌建立
  "market-research": 55,     // 市場調查

  // 三級|行政 (admin)
  "compliance": 100,         // 法規遵循
  "team-management": 95,     // 團隊管理
  "process-optimization": 90,// 流程優化
  "document-filing": 85,     // 文件整理
  "admin-tasks": 80,         // 行政庶務
  "meeting-coordination": 75,// 會議協調
  "equipment-maintenance": 70,// 設備維護
  "office-supplies": 65,     // 辦公用品
  "weekly-report": 60,       // 週報審核
  "schedule-planning": 55,   // 行程規劃
};

/**
 * 計算截止日期緊急度分數 (0-100)
 * 權重: 40%
 */
function calculateDeadlineScore(deadline?: Date | string): number {
  if (!deadline) return 10; // 無截止日期給予最低分

  const now = new Date();
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffDays < 0) return 100; // 已逾期
  if (diffDays < 1) return 100; // 今日內到期
  if (diffDays < 2) return 80;  // 1-2 天內
  if (diffDays < 5) return 60;  // 3-5 天內
  if (diffDays < 7) return 40;  // 6-7 天內
  return 20; // 超過 1 週
}

/**
 * 計算預估工作量分數 (0-100)
 * 權重: 20%
 * 大型任務優先處理
 */
function calculateWorkloadScore(estimatedMinutes?: number): number {
  if (!estimatedMinutes) return 20;

  const hours = estimatedMinutes / 60;

  if (hours >= 8) return 100;  // 超過 8 小時
  if (hours >= 4) return 80;   // 4-8 小時
  if (hours >= 2) return 60;   // 2-4 小時
  if (hours >= 1) return 40;   // 1-2 小時
  return 20; // 少於 1 小時
}

/**
 * 計算任務建立時間分數 (0-100)
 * 權重: 20%
 * 長期未處理的任務優先
 */
function calculateAgeScore(createdAt?: Date | string): number {
  if (!createdAt) return 20;

  const now = new Date();
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const diffMs = now.getTime() - createdDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays >= 7) return 100;  // 超過 7 天
  if (diffDays >= 5) return 80;   // 5-7 天
  if (diffDays >= 3) return 60;   // 3-5 天
  if (diffDays >= 1) return 40;   // 1-3 天
  return 20; // 今日建立
}

/**
 * 獲取符號權重分數 (0-100)
 * 權重: 20%
 */
function getSymbolWeight(symbolId?: string): number {
  if (!symbolId) return 50; // 無符號給予中等分數
  return SYMBOL_WEIGHTS[symbolId] || 50;
}

/**
 * 計算任務優先級總分 (0-100)
 * 
 * 公式:
 * 總分 = (截止日期緊急度 × 0.4) + 
 *        (預估工作量 × 0.2) + 
 *        (任務建立時間 × 0.2) + 
 *        (符號權重 × 0.2)
 */
export function calculatePriorityScore(task: Task): number {
  const deadlineScore = calculateDeadlineScore(task.deadline);
  const workloadScore = calculateWorkloadScore(task.estimatedMinutes);
  const ageScore = calculateAgeScore(task.createdAt);
  const symbolScore = getSymbolWeight(task.symbolId);

  const totalScore = 
    deadlineScore * 0.4 +
    workloadScore * 0.2 +
    ageScore * 0.2 +
    symbolScore * 0.2;

  return Math.round(totalScore);
}

/**
 * 優先級等級定義
 */
export interface PriorityLevel {
  level: string;
  label: string;
  color: string;
  bgColor: string;
}

/**
 * 根據分數轉換為優先級等級
 */
export function getPriorityLevel(score: number): PriorityLevel {
  if (score >= 80) {
    return {
      level: 'P1',
      label: '極高',
      color: 'text-red-700',
      bgColor: 'bg-red-100 border-red-300',
    };
  }
  if (score >= 60) {
    return {
      level: 'P2',
      label: '高',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100 border-orange-300',
    };
  }
  if (score >= 40) {
    return {
      level: 'P3',
      label: '中',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100 border-yellow-300',
    };
  }
  if (score >= 20) {
    return {
      level: 'P4',
      label: '低',
      color: 'text-green-700',
      bgColor: 'bg-green-100 border-green-300',
    };
  }
  return {
    level: 'P5',
    label: '極低',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 border-gray-300',
  };
}

/**
 * 獲取優先級分數計算細節
 * 用於向使用者展示分數計算依據
 */
export function getPriorityScoreBreakdown(task: Task) {
  const deadlineScore = calculateDeadlineScore(task.deadline);
  const workloadScore = calculateWorkloadScore(task.estimatedMinutes);
  const ageScore = calculateAgeScore(task.createdAt);
  const symbolScore = getSymbolWeight(task.symbolId);

  return {
    deadline: {
      score: deadlineScore,
      weight: 0.4,
      contribution: deadlineScore * 0.4,
    },
    workload: {
      score: workloadScore,
      weight: 0.2,
      contribution: workloadScore * 0.2,
    },
    age: {
      score: ageScore,
      weight: 0.2,
      contribution: ageScore * 0.2,
    },
    symbol: {
      score: symbolScore,
      weight: 0.2,
      contribution: symbolScore * 0.2,
    },
    total: calculatePriorityScore(task),
  };
}

/**
 * 任務排序函數
 * 1. 先按任務分級排序 (一級 > 二級 > 三級)
 * 2. 同級任務按優先級分數排序
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder: Record<string, number> = {
    high: 1,   // 一級|營收
    medium: 2, // 二級|流量
    low: 3,    // 三級|行政
  };

  return [...tasks].sort((a, b) => {
    // 1. 先按任務分級排序
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // 2. 同級任務按優先級分數排序 (分數高的在前)
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    return scoreB - scoreA;
  });
}
