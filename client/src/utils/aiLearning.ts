import { TaskPriority } from "@/types/task";

/**
 * AI 學習記錄介面
 */
export interface AILearningRecord {
  id: string;
  timestamp: string;
  taskDescription: string;
  
  // AI 原始預填結果
  aiPrediction: {
    level: 1 | 2 | 3 | 4;
    priority: TaskPriority;
    assigneeId: string;
    collaboratorIds: string[];
  };
  
  // 使用者最終選擇
  userChoice: {
    level: 1 | 2 | 3 | 4;
    priority: TaskPriority;
    assigneeId: string;
    collaboratorIds: string[];
  };
  
  // 是否有修改
  modifications: {
    levelChanged: boolean;
    priorityChanged: boolean;
    assigneeChanged: boolean;
    collaboratorsChanged: boolean;
  };
}

/**
 * AI 準確度統計
 */
export interface AIAccuracyStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
  levelAccuracy: number;
  priorityAccuracy: number;
  assigneeAccuracy: number;
}

const STORAGE_KEY = 'ai_learning_records';
const STATS_KEY = 'ai_accuracy_stats';

/**
 * 儲存 AI 學習記錄
 */
export function saveAILearningRecord(record: AILearningRecord): void {
  try {
    const records = getAILearningRecords();
    records.push(record);
    
    // 只保留最近 100 筆記錄
    const recentRecords = records.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentRecords));
    
    // 更新統計資料
    updateAccuracyStats(recentRecords);
  } catch (error) {
    console.error('Failed to save AI learning record:', error);
  }
}

/**
 * 獲取所有 AI 學習記錄
 */
export function getAILearningRecords(): AILearningRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get AI learning records:', error);
    return [];
  }
}

/**
 * 更新準確度統計
 */
function updateAccuracyStats(records: AILearningRecord[]): void {
  if (records.length === 0) {
    return;
  }
  
  let levelCorrect = 0;
  let priorityCorrect = 0;
  let assigneeCorrect = 0;
  
  records.forEach(record => {
    if (!record.modifications.levelChanged) levelCorrect++;
    if (!record.modifications.priorityChanged) priorityCorrect++;
    if (!record.modifications.assigneeChanged) assigneeCorrect++;
  });
  
  const total = records.length;
  const stats: AIAccuracyStats = {
    totalPredictions: total,
    correctPredictions: Math.round((levelCorrect + priorityCorrect + assigneeCorrect) / 3),
    accuracyRate: Math.round(((levelCorrect + priorityCorrect + assigneeCorrect) / (total * 3)) * 100),
    levelAccuracy: Math.round((levelCorrect / total) * 100),
    priorityAccuracy: Math.round((priorityCorrect / total) * 100),
    assigneeAccuracy: Math.round((assigneeCorrect / total) * 100),
  };
  
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * 獲取準確度統計
 */
export function getAccuracyStats(): AIAccuracyStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : {
      totalPredictions: 0,
      correctPredictions: 0,
      accuracyRate: 0,
      levelAccuracy: 0,
      priorityAccuracy: 0,
      assigneeAccuracy: 0,
    };
  } catch (error) {
    console.error('Failed to get accuracy stats:', error);
    return {
      totalPredictions: 0,
      correctPredictions: 0,
      accuracyRate: 0,
      levelAccuracy: 0,
      priorityAccuracy: 0,
      assigneeAccuracy: 0,
    };
  }
}

/**
 * 根據歷史記錄優化 AI 預測
 */
export function optimizeAIPrediction(
  taskDescription: string,
  initialPrediction: {
    level: 1 | 2 | 3 | 4;
    priority: TaskPriority;
    assigneeId: string;
  }
): {
  level: 1 | 2 | 3 | 4;
  priority: TaskPriority;
  assigneeId: string;
} {
  const records = getAILearningRecords();
  
  // 尋找相似的任務描述
  const similarRecords = records.filter(record => {
    const similarity = calculateSimilarity(taskDescription, record.taskDescription);
    return similarity > 0.5; // 相似度超過 50%
  });
  
  if (similarRecords.length === 0) {
    return initialPrediction;
  }
  
  // 使用最近的相似記錄來優化預測
  const mostRecent = similarRecords[similarRecords.length - 1];
  
  return {
    level: mostRecent.modifications.levelChanged 
      ? mostRecent.userChoice.level 
      : initialPrediction.level,
    priority: mostRecent.modifications.priorityChanged 
      ? mostRecent.userChoice.priority 
      : initialPrediction.priority,
    assigneeId: mostRecent.modifications.assigneeChanged 
      ? mostRecent.userChoice.assigneeId 
      : initialPrediction.assigneeId,
  };
}

/**
 * 計算兩個字串的相似度（簡單版本）
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return commonWords.length / totalWords;
}
