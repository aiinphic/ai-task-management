/**
 * 進階任務分級器 - 基於陳宗賢老師理論
 * 
 * 根據陳宗賢老師的觀點，任務的重要性必須基於：
 * 1. 金額貢獻度（營收、利潤、成本節省）
 * 2. 數值/數量貢獻度（產出數量、人效）
 * 3. 時間/時效性（截止時間、工時預估、延誤後果）
 */

import { QuantitativeMetrics } from "@/types/task";

/**
 * 從量化貢獻度中提取數值
 */
function extractNumericValue(input: string): number {
  // 移除空白和逗號
  const cleaned = input.replace(/\s+/g, '').replace(/,/g, '');
  
  // 匹配數字（包含小數點）
  const match = cleaned.match(/(\d+\.?\d*)/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  
  // 處理單位轉換
  if (cleaned.includes('萬') || cleaned.includes('万')) {
    return value * 10000;
  } else if (cleaned.includes('億') || cleaned.includes('亿')) {
    return value * 100000000;
  } else if (cleaned.includes('千') || cleaned.includes('仟')) {
    return value * 1000;
  } else if (cleaned.includes('百')) {
    return value * 100;
  }
  
  return value;
}

/**
 * 計算金額貢獻度分數（0-100）
 */
function calculateFinancialScore(metrics: QuantitativeMetrics | undefined): number {
  if (!metrics?.financial) return 0;
  
  const item = metrics.financial;
  const value = extractNumericValue(item.description);
  
  // 根據金額大小計算分數
  let score = 0;
  if (value >= 1000000) {
    // 100萬以上：90-100分
    score = Math.min(100, 90 + (value / 1000000) * 2);
  } else if (value >= 500000) {
    // 50萬-100萬：80-90分
    score = 80 + ((value - 500000) / 500000) * 10;
  } else if (value >= 100000) {
    // 10萬-50萬：60-80分
    score = 60 + ((value - 100000) / 400000) * 20;
  } else if (value >= 50000) {
    // 5萬-10萬：40-60分
    score = 40 + ((value - 50000) / 50000) * 20;
  } else if (value >= 10000) {
    // 1萬-5萬：20-40分
    score = 20 + ((value - 10000) / 40000) * 20;
  } else if (value > 0) {
    // 1萬以下：10-20分
    score = 10 + (value / 10000) * 10;
  }
  
  // 根據類型調整權重
  if (item.type === 'revenue') {
    score *= 1.2; // 營收最重要
  } else if (item.type === 'cost_saving') {
    score *= 1.1; // 成本節省
  } else if (item.type === 'investment') {
    score *= 1.05; // 投資
  }
  
  return Math.min(100, score);
}

/**
 * 計算數量貢獻度分數（0-100）
 */
function calculateQuantityScore(metrics: QuantitativeMetrics | undefined): number {
  if (!metrics?.quantity) return 0;
  
  const item = metrics.quantity;
  const value = extractNumericValue(item.description);
  
  // 根據數量大小計算分數
  let score = 0;
  if (value >= 10000) {
    // 1萬以上：90-100分
    score = Math.min(100, 90 + (value / 10000) * 2);
  } else if (value >= 5000) {
    // 5千-1萬：80-90分
    score = 80 + ((value - 5000) / 5000) * 10;
  } else if (value >= 1000) {
    // 1千-5千：60-80分
    score = 60 + ((value - 1000) / 4000) * 20;
  } else if (value >= 500) {
    // 500-1千：40-60分
    score = 40 + ((value - 500) / 500) * 20;
  } else if (value >= 100) {
    // 100-500：20-40分
    score = 20 + ((value - 100) / 400) * 20;
  } else if (value > 0) {
    // 100以下：10-20分
    score = 10 + (value / 100) * 10;
  }
  
  // 根據類型調整權重
  if (item.type === 'customers') {
    score *= 1.2; // 客戶獲取最重要
  } else if (item.type === 'users') {
    score *= 1.15; // 用戶增長次之
  } else if (item.type === 'products') {
    score *= 1.1; // 產品產出
  }
  
  return Math.min(100, score);
}

/**
 * 計算時間貢獻度分數（0-100）
 */
function calculateTimeScore(metrics: QuantitativeMetrics | undefined): number {
  if (!metrics?.time) return 0;
  
  const item = metrics.time;
  const value = extractNumericValue(item.description);
  
  // 根據時間大小計算分數（假設單位是小時）
  let score = 0;
  if (value >= 100) {
    // 100小時以上：90-100分
    score = Math.min(100, 90 + (value / 100) * 2);
  } else if (value >= 50) {
    // 50-100小時：80-90分
    score = 80 + ((value - 50) / 50) * 10;
  } else if (value >= 20) {
    // 20-50小時：60-80分
    score = 60 + ((value - 20) / 30) * 20;
  } else if (value >= 10) {
    // 10-20小時：40-60分
    score = 40 + ((value - 10) / 10) * 20;
  } else if (value >= 5) {
    // 5-10小時：20-40分
    score = 20 + ((value - 5) / 5) * 20;
  } else if (value > 0) {
    // 5小時以下：10-20分
    score = 10 + (value / 5) * 10;
  }
  
  // 根據類型調整權重
  if (item.type === 'time_saving') {
    score *= 1.2; // 時間節省最重要
  } else if (item.type === 'process_optimization') {
    score *= 1.15; // 流程優化次之
  } else if (item.type === 'efficiency') {
    score *= 1.1; // 效率提升
  }
  
  return Math.min(100, score);
}

/**
 * 根據任務關鍵字計算分數（0-100）
 */
function calculateKeywordScore(title: string, description: string): number {
  const text = (title + ' ' + description).toLowerCase();
  
  // 1級關鍵字（破局|營收）
  const level1Keywords = [
    '營收', '业绩', '獲利', '利潤', '盈利', '收入', '銷售',
    '破局', '突破', '關鍵', '核心', '戰略', '策略',
    '客戶', '市場', '競爭', '商機', '合約', '簽約'
  ];
  
  // 2級關鍵字（流量）
  const level2Keywords = [
    '流量', '用戶', '會員', '註冊', '活躍', '留存',
    '推廣', '行銷', '廣告', '宣傳', '曝光', '轉換'
  ];
  
  // 3級關鍵字（行政）
  const level3Keywords = [
    '行政', '文書', '報表', '統計', '整理', '歸檔',
    '會議', '記錄', '通知', '公告', '審核', '審批'
  ];
  
  // 日常關鍵字
  const dailyKeywords = [
    '日常', '例行', '定期', '每日', '每週', '每月',
    '維護', '檢查', '巡檢', '清潔', '整理'
  ];
  
  // 計算匹配分數
  let score = 50; // 基礎分數
  
  for (const keyword of level1Keywords) {
    if (text.includes(keyword)) {
      score += 10;
    }
  }
  
  for (const keyword of level2Keywords) {
    if (text.includes(keyword)) {
      score += 5;
    }
  }
  
  for (const keyword of level3Keywords) {
    if (text.includes(keyword)) {
      score -= 5;
    }
  }
  
  for (const keyword of dailyKeywords) {
    if (text.includes(keyword)) {
      score -= 10;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 進階任務分級 - 基於陳宗賢老師理論
 * 
 * @param title 任務標題
 * @param description 任務描述
 * @param quantitativeMetrics 量化貢獻度
 * @returns 任務層級（1-4）
 */
export function classifyTaskLevelAdvanced(
  title: string,
  description: string,
  quantitativeMetrics?: QuantitativeMetrics
): 1 | 2 | 3 | 4 {
  // 計算各維度分數
  const financialScore = calculateFinancialScore(quantitativeMetrics);
  const quantityScore = calculateQuantityScore(quantitativeMetrics);
  const timeScore = calculateTimeScore(quantitativeMetrics);
  const keywordScore = calculateKeywordScore(title, description);
  
  // 加權計算總分（根據陳宗賢老師理論的重要性排序）
  const totalScore = 
    financialScore * 0.4 +  // 金額貢獻度 40%
    quantityScore * 0.3 +    // 數量貢獻度 30%
    timeScore * 0.2 +        // 時間貢獻度 20%
    keywordScore * 0.1;      // 關鍵字 10%
  
  // 根據總分判斷層級
  if (totalScore >= 80) {
    return 1; // 1級|破局|營收
  } else if (totalScore >= 60) {
    return 2; // 2級|流量
  } else if (totalScore >= 40) {
    return 3; // 3級|行政
  } else {
    return 4; // 日常
  }
}

/**
 * 檢查任務的目標對齊性
 * 
 * 如果任務被標記為高重要性，但量化貢獻度很低，則返回警告訊息
 */
export function checkGoalAlignment(
  level: 1 | 2 | 3 | 4,
  quantitativeMetrics?: QuantitativeMetrics
): string | null {
  const financialScore = calculateFinancialScore(quantitativeMetrics);
  const quantityScore = calculateQuantityScore(quantitativeMetrics);
  const timeScore = calculateTimeScore(quantitativeMetrics);
  
  const avgScore = (financialScore + quantityScore + timeScore) / 3;
  
  // 高重要性但量化貢獻度低
  if (level === 1 && avgScore < 50) {
    return "⚠️ 此任務被標記為「1級|破局|營收」，但量化貢獻度較低。請確認是否需要調整層級或補充量化指標。";
  }
  
  // 低重要性但量化貢獻度高
  if ((level === 3 || level === 4) && avgScore > 70) {
    return "💡 此任務的量化貢獻度很高，建議提升為「1級|破局|營收」或「2級|流量」。";
  }
  
  // 1級任務缺少金額貢獻度
  if (level === 1 && financialScore === 0) {
    return "⚠️ 「1級|破局|營收」任務應該包含明確的金額貢獻度（營收、利潤或成本節省）。";
  }
  
  return null;
}
